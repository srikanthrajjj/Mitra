import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Link2,
  List,
  MoreVertical,
  Pencil,
  SquareKanban,
  Trash2,
} from 'lucide-react';
import {
  deleteIssueRecord,
  fetchIssueRecords,
  saveIssueRecords,
  subscribeToIssueRecords,
  uploadScreenshot,
} from './uiIssueStore';

type IssueType = 'Improvement' | 'Bug' | 'Accessibility' | 'UI' | 'UX';

type IssueStatus = 'open' | 'review' | 'resolved';

type IssuePriority = 'critical' | 'high' | 'medium' | 'low';

type UiIssue = {
  id: string;
  name: string;
  type: IssueType;
  description: string;
  reference: string;
  image?: string | null;
  status: IssueStatus;
  priority?: IssuePriority | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
};

// Older saves used `resolved: boolean` (and earlier still, `title` / `status: 'Resolved'`).
type StoredIssue = Omit<Partial<UiIssue>, 'status'> & { title?: string; status?: string; resolved?: boolean };

type StatusAction = 'resolve' | 'approve';

type NamePromptTarget = { action: StatusAction; issueId: string } | { action: 'change' };

type ViewMode = 'list' | 'grid' | 'board';

type Screen = 'open' | 'review' | 'resolved';

const STORAGE_KEY = 'mitra-ui-audit-v1';
const NO_REFERENCE = 'No reference added';
const MAX_IMAGE_DIMENSION = 1280;
const USER_NAME_KEY = 'mitra-ui-audit-user';
const VIEW_MODE_KEY = 'mitra-ui-audit-view';
// Set once this browser's pre-sharing issues have been copied into the shared list.
const LOCAL_ISSUES_UPLOADED_KEY = 'mitra-ui-audit-shared-v1';
const EXAMPLE_ISSUE_PREFIX = 'issue-example-';

const emptyForm = {
  name: '',
  type: 'UI' as IssueType,
  description: '',
  reference: '',
  image: null as string | null,
};

function normalizeIssue(value: StoredIssue): UiIssue | null {
  const name = typeof value.name === 'string' ? value.name : value.title;
  const description = typeof value.description === 'string' ? value.description : '';

  if (!name || !description) {
    return null;
  }

  return {
    id: typeof value.id === 'string' ? value.id : `audit-${Date.now()}-${Math.random()}`,
    name,
    type: value.type === 'Improvement' || value.type === 'Bug' || value.type === 'Accessibility' || value.type === 'UI' || value.type === 'UX'
      ? value.type
      : (value.type as string | undefined) === 'Content' || (value.type as string | undefined) === 'Flow'
        ? 'Improvement'
        : 'UI',
    description,
    reference: typeof value.reference === 'string' && value.reference ? value.reference : NO_REFERENCE,
    image: typeof value.image === 'string' ? value.image : null,
    status:
      value.status === 'open' || value.status === 'review' || value.status === 'resolved'
        ? value.status
        : value.resolved === true || value.status === 'Resolved'
          ? 'resolved'
          : 'open',
    priority:
      value.priority === 'critical' || value.priority === 'high' || value.priority === 'medium' || value.priority === 'low'
        ? value.priority
        : null,
    resolvedBy: typeof value.resolvedBy === 'string' ? value.resolvedBy : null,
    resolvedAt: typeof value.resolvedAt === 'string' ? value.resolvedAt : null,
    approvedBy: typeof value.approvedBy === 'string' ? value.approvedBy : null,
    approvedAt: typeof value.approvedAt === 'string' ? value.approvedAt : null,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
  };
}

function sortIssues(list: UiIssue[]) {
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// The shared list is the source of truth; this browser cache only makes the first paint instant.
function readCachedIssues(): UiIssue[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? (JSON.parse(saved) as unknown) : null;
    if (!Array.isArray(parsed)) return [];
    return sortIssues(
      parsed
        .map((issue) => (issue && typeof issue === 'object' ? normalizeIssue(issue as StoredIssue) : null))
        .filter((issue): issue is UiIssue => issue !== null),
    );
  } catch {
    return [];
  }
}

function hasUploadedLocalIssues() {
  try {
    return localStorage.getItem(LOCAL_ISSUES_UPLOADED_KEY) === 'true';
  } catch {
    return true;
  }
}

function markLocalIssuesUploaded() {
  try {
    localStorage.setItem(LOCAL_ISSUES_UPLOADED_KEY, 'true');
  } catch {
    // Nothing else to do; the upload is idempotent.
  }
}

// Downscale so screenshots upload quickly and stay small; keeps the original if the browser can't decode it.
function downscaleImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(dataUrl);
        return;
      }
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

let localIssuesUpload: Promise<void> | null = null;

// Shared across overlapping loads (a remount or a focus event mid-upload) so screenshots upload once.
function uploadLocalIssuesOnce(cachedIssues: UiIssue[]): Promise<void> {
  if (hasUploadedLocalIssues()) return Promise.resolve();

  if (!localIssuesUpload) {
    localIssuesUpload = (async () => {
      const localIssues = cachedIssues.filter((issue) => !issue.id.startsWith(EXAMPLE_ISSUE_PREFIX));
      const prepared = await Promise.all(localIssues.map(withUploadedScreenshot));
      await saveIssueRecords(prepared, { onlyMissing: true });
      markLocalIssuesUploaded();
    })().finally(() => {
      localIssuesUpload = null;
    });
  }
  return localIssuesUpload;
}

async function withUploadedScreenshot(issue: UiIssue): Promise<UiIssue> {
  if (!issue.image?.startsWith('data:')) return issue;
  // Issues saved before resizing existed can hold full-size screenshots, so shrink them first.
  const image = await downscaleImage(issue.image);
  return { ...issue, image: await uploadScreenshot(issue.id, image) };
}

function getReferenceUrl(reference: string) {
  if (/^https?:\/\//i.test(reference)) return reference;
  if (/^www\./i.test(reference)) return `https://${reference}`;
  return null;
}

// The review and resolved screens live at #review / #resolved so back/refresh keep you in place.
function screenFromHash(): Screen {
  if (typeof window === 'undefined') return 'open';
  const hash = window.location.hash.replace('#', '');
  return hash === 'review' || hash === 'resolved' ? hash : 'open';
}

const referencePillClass =
  'inline-flex w-fit items-center rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-[#030d0a] hover:border-[#030d0a]/40';

const issueTypes: { value: IssueType; label: string }[] = [
  { value: 'Improvement', label: 'Improvement' },
  { value: 'Bug', label: 'Bug' },
  { value: 'Accessibility', label: 'Accessibility issue' },
  { value: 'UI', label: 'UI issue' },
  { value: 'UX', label: 'UX issue' },
];

const typeStyles: Record<IssueType, string> = {
  Improvement: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  Bug: 'bg-red-500/10 text-red-600 dark:text-red-300',
  Accessibility: 'bg-brand-green/10 text-brand-green',
  UI: 'bg-brand-green/10 text-brand-green',
  UX: 'bg-muted text-foreground',
};

const statusLabels: Record<IssueStatus, string> = {
  open: 'Open',
  review: 'Waiting for stakeholder review',
  resolved: 'Resolved',
};

// Ordered most to least severe. Colour is paired with the label so it never carries meaning alone.
const priorityOptions: { value: IssuePriority; label: string; dot: string; badge: string; stripe: string; column: string }[] = [
  { value: 'critical', label: 'Critical', dot: 'bg-red-600', badge: 'bg-red-500/10 text-red-700', stripe: 'border-l-red-600', column: 'border-t-red-600' },
  { value: 'high', label: 'High', dot: 'bg-orange-500', badge: 'bg-orange-500/10 text-orange-700', stripe: 'border-l-orange-500', column: 'border-t-orange-500' },
  { value: 'medium', label: 'Medium', dot: 'bg-amber-400', badge: 'bg-amber-400/15 text-amber-700', stripe: 'border-l-amber-400', column: 'border-t-amber-400' },
  { value: 'low', label: 'Low', dot: 'bg-sky-500', badge: 'bg-sky-500/10 text-sky-700', stripe: 'border-l-sky-500', column: 'border-t-sky-500' },
];

const statusStyles: Record<IssueStatus, string> = {
  open: 'bg-muted text-foreground',
  review: 'bg-yellow-500/10 text-yellow-700',
  resolved: 'bg-brand-green/10 text-brand-green',
};

const namePromptCopy: Record<NamePromptTarget['action'], { eyebrow: string; title: string; body: string; submit: string }> = {
  resolve: {
    eyebrow: 'Mark as resolved',
    title: "What's your name?",
    body: "It's added to issues you mark as resolved or approve. We'll remember it in this browser, so you're only asked once.",
    submit: 'Mark as resolved',
  },
  approve: {
    eyebrow: 'Stakeholder review',
    title: "What's your name?",
    body: "It's added to issues you mark as resolved or approve. We'll remember it in this browser, so you're only asked once.",
    submit: 'Approve',
  },
  change: {
    eyebrow: 'Your name',
    title: 'Change your name',
    body: 'Used for issues you mark as resolved or approve from now on.',
    submit: 'Save name',
  },
};

export function UiIssueTracker() {
  const [issues, setIssues] = useState<UiIssue[]>(readCachedIssues);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
  const [openMenuIssueId, setOpenMenuIssueId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'live' | 'offline'>('connecting');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // Writes for the same issue run one after another so a slow save can't overwrite a newer one.
  const writeQueues = useRef(new Map<string, Promise<void>>());
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [viewingIssueId, setViewingIssueId] = useState<string | null>(null);
  const viewingIssue = issues.find((issue) => issue.id === viewingIssueId) ?? null;
  const [userName, setUserName] = useState<string>(() => {
    try {
      return localStorage.getItem(USER_NAME_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [namePrompt, setNamePrompt] = useState<NamePromptTarget | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [screen, setScreen] = useState<Screen>(screenFromHash);
  const [notice, setNotice] = useState<string | null>(null);
  const [draggingIssueId, setDraggingIssueId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<IssuePriority | 'none' | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_KEY);
      return saved === 'grid' || saved === 'board' ? saved : 'list';
    } catch {
      return 'list';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_MODE_KEY, viewMode);
    } catch {
      // Layout preference only; ignore storage failures.
    }
  }, [viewMode]);

  useEffect(() => {
    const syncScreen = () => setScreen(screenFromHash());
    window.addEventListener('popstate', syncScreen);
    window.addEventListener('hashchange', syncScreen);
    return () => {
      window.removeEventListener('popstate', syncScreen);
      window.removeEventListener('hashchange', syncScreen);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    } catch {
      // Cache only; the shared list still has everything.
    }
  }, [issues]);

  useEffect(() => {
    let cancelled = false;
    // Captured before anything async so shared updates can't leak into the one-time upload.
    const cachedIssues = readCachedIssues();

    const loadSharedIssues = async () => {
      try {
        await uploadLocalIssuesOnce(cachedIssues);

        const records = await fetchIssueRecords();
        if (cancelled) return;
        setIssues(
          sortIssues(
            records
              .map((record) => normalizeIssue(record as StoredIssue))
              .filter((issue): issue is UiIssue => issue !== null),
          ),
        );
        setSyncStatus('live');
      } catch {
        if (!cancelled) setSyncStatus('offline');
      }
    };

    void loadSharedIssues();

    const unsubscribe = subscribeToIssueRecords({
      onSave: (record) => {
        const issue = normalizeIssue(record as StoredIssue);
        if (!issue) return;
        setIssues((current) => sortIssues([issue, ...current.filter((item) => item.id !== issue.id)]));
      },
      onDelete: (id) => setIssues((current) => current.filter((item) => item.id !== id)),
    });

    const handleFocus = () => {
      void loadSharedIssues();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const readImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const original = typeof reader.result === 'string' ? reader.result : null;
      if (!original) return;
      void downscaleImage(original).then((image) => setForm((current) => ({ ...current, image })));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) readImageFile(file);
  };

  const handleImagePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    // Pasting a link copied from a browser can also carry an image; let the text land in the field.
    const target = event.target;
    const isTextField =
      (target instanceof HTMLInputElement && target.type !== 'file') || target instanceof HTMLTextAreaElement;
    if (isTextField && event.clipboardData.getData('text/plain').trim()) return;

    const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith('image/'));
    const file = imageItem?.getAsFile();
    if (file) {
      event.preventDefault();
      readImageFile(file);
    }
  };

  const queueWrite = (issueId: string, write: () => Promise<void>, failureMessage: string) => {
    const previous = writeQueues.current.get(issueId) ?? Promise.resolve();
    const next = previous
      .then(write)
      .then(() => {
        setSyncStatus('live');
        setSyncError(null);
      })
      .catch(() => setSyncError(failureMessage));
    writeQueues.current.set(issueId, next);
  };

  const persistIssue = (issue: UiIssue) => {
    queueWrite(
      issue.id,
      () => saveIssueRecords([issue]),
      `Couldn't save "${issue.name}" to the shared list, so others won't see that change. Check your connection and try again.`,
    );
  };

  const handleSubmitIssue = async () => {
    const name = form.name.trim();
    const description = form.description.trim();
    const reference = form.reference.trim() || NO_REFERENCE;

    if (!name || !description) {
      setFormError('Add an issue name and a description to save.');
      return;
    }

    const existing = editingIssueId ? issues.find((issue) => issue.id === editingIssueId) : undefined;
    const id = existing?.id ?? `audit-${Date.now()}`;
    let image = form.image;

    if (image?.startsWith('data:')) {
      setIsSaving(true);
      try {
        image = await uploadScreenshot(id, image);
      } catch {
        setFormError("Couldn't upload the screenshot. Check your connection and try again.");
        return;
      } finally {
        setIsSaving(false);
      }
    }

    const nextIssue: UiIssue = existing
      ? { ...existing, name, type: form.type, description, reference, image }
      : { id, name, type: form.type, description, reference, image, status: 'open', createdAt: new Date().toISOString() };

    setIssues((current) => sortIssues([nextIssue, ...current.filter((issue) => issue.id !== nextIssue.id)]));
    persistIssue(nextIssue);
    setEditingIssueId(null);
    setForm(emptyForm);
    setFormError(null);
    setIsModalOpen(false);
  };

  const updateIssue = (issueId: string, changes: Partial<UiIssue>) => {
    const existing = issues.find((item) => item.id === issueId);
    if (!existing) return;

    const nextIssue = { ...existing, ...changes };
    setIssues((current) => current.map((item) => (item.id === issueId ? nextIssue : item)));
    persistIssue(nextIssue);
  };

  const openScreen = (next: Screen) => {
    setScreen(next);
    const url = next === 'open' ? `${window.location.pathname}${window.location.search}` : `#${next}`;
    window.history.pushState(null, '', url);
  };

  const applyStatusAction = (issueId: string, action: StatusAction, actor: string) => {
    const now = new Date().toISOString();
    const issueName = issues.find((item) => item.id === issueId)?.name ?? 'Issue';
    if (action === 'resolve') {
      updateIssue(issueId, { status: 'review', resolvedBy: actor, resolvedAt: now, approvedBy: null, approvedAt: null });
      setNotice(`"${issueName}" moved to Waiting for stakeholder review`);
    } else {
      updateIssue(issueId, { status: 'resolved', approvedBy: actor, approvedAt: now });
      setNotice(`"${issueName}" moved to Resolved`);
    }
  };

  // Only ask for a name the first time; after that reuse the one remembered in this browser.
  const requestStatusAction = (issue: UiIssue, action: StatusAction) => {
    if (userName) {
      applyStatusAction(issue.id, action, userName);
      return;
    }
    setNameDraft('');
    setNamePrompt({ action, issueId: issue.id });
  };

  const reopenIssue = (issue: UiIssue) => {
    updateIssue(issue.id, { status: 'open', resolvedBy: null, resolvedAt: null, approvedBy: null, approvedAt: null });
    setNotice(`"${issue.name}" moved back to Open issues`);
  };

  const handleSetPriority = (issue: UiIssue, priority: IssuePriority | null) => {
    setOpenMenuIssueId(null);
    if ((issue.priority ?? null) === priority) return;

    updateIssue(issue.id, { priority });
    const label = priorityOptions.find((option) => option.value === priority)?.label;
    setNotice(label ? `"${issue.name}" set to ${label} priority` : `Cleared the priority on "${issue.name}"`);
  };

  const getPriorityOption = (issue: UiIssue) => priorityOptions.find((option) => option.value === issue.priority);

  const renderPriorityBadge = (issue: UiIssue) => {
    const option = getPriorityOption(issue);
    if (!option) return null;

    return (
      <span
        title={`Priority: ${option.label}`}
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${option.badge}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${option.dot}`} aria-hidden="true" />
        {option.label}
      </span>
    );
  };

  const priorityStripeClass = (issue: UiIssue) => {
    const option = getPriorityOption(issue);
    return option ? `border-l-4 ${option.stripe}` : '';
  };

  const handleConfirmName = () => {
    const name = nameDraft.trim();
    if (!name || !namePrompt) return;

    try {
      localStorage.setItem(USER_NAME_KEY, name);
    } catch {
      // Storage unavailable; the name still applies for this visit.
    }
    setUserName(name);
    if (namePrompt.action !== 'change') applyStatusAction(namePrompt.issueId, namePrompt.action, name);
    setNamePrompt(null);
  };

  const renderReference = (issue: UiIssue) => {
    const referenceUrl = getReferenceUrl(issue.reference);

    if (referenceUrl) {
      return (
        <a href={referenceUrl} target="_blank" rel="noreferrer" className={referencePillClass}>
          View reference
        </a>
      );
    }
    if (issue.image) {
      return (
        <button type="button" onClick={() => setPreviewImage(issue.image ?? null)} className={referencePillClass}>
          View reference
        </button>
      );
    }
    if (issue.reference !== NO_REFERENCE) {
      return <span className={referencePillClass}>{issue.reference}</span>;
    }
    return <span className="text-muted-foreground">{NO_REFERENCE}</span>;
  };

  const handleEditIssue = (issue: UiIssue) => {
    setViewingIssueId(null);
    setEditingIssueId(issue.id);
    setFormError(null);
    setForm({
      name: issue.name,
      type: issue.type,
      description: issue.description,
      reference: issue.reference === NO_REFERENCE ? '' : issue.reference,
      image: issue.image ?? null,
    });
    setOpenMenuIssueId(null);
    setIsModalOpen(true);
  };

  const handleDeleteIssue = (issue: UiIssue) => {
    if (!window.confirm(`Delete "${issue.name}"?`)) return;
    setIssues((current) => current.filter((item) => item.id !== issue.id));
    queueWrite(
      issue.id,
      () => deleteIssueRecord(issue.id),
      `Couldn't delete "${issue.name}" from the shared list, so it may come back. Check your connection and try again.`,
    );
    setOpenMenuIssueId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIssueId(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const openIssues = issues.filter((issue) => issue.status === 'open');
  const reviewIssues = issues.filter((issue) => issue.status === 'review');
  const resolvedIssues = issues.filter((issue) => issue.status === 'resolved');

  const renderStatusControls = (issue: UiIssue, compact = false) => {
    const pillClass = compact
      ? 'inline-flex w-fit items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-[#030d0a] hover:border-[#030d0a]/40'
      : `${referencePillClass} gap-1.5`;

    if (issue.status === 'open') {
      return (
        <button type="button" onClick={() => requestStatusAction(issue, 'resolve')} className={pillClass}>
          <CheckCircle2 className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
          Mark as resolved
        </button>
      );
    }

    return (
      <>
        {issue.status === 'review' ? (
          <button
            type="button"
            onClick={() => requestStatusAction(issue, 'approve')}
            className={`inline-flex items-center rounded-full bg-brand-green font-semibold text-[#030d0a] hover:bg-brand-green-hover ${
              compact ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1.5 text-xs'
            }`}
          >
            Approve
          </button>
        ) : null}
        <button type="button" onClick={() => reopenIssue(issue)} className={pillClass}>
          Reopen
        </button>
      </>
    );
  };

  const renderIssueMenu = (issue: UiIssue, compact = false) => (
    <div className="relative ml-auto">
      <button
        type="button"
        aria-label={`Actions for ${issue.name}`}
        aria-expanded={openMenuIssueId === issue.id}
        onClick={() => setOpenMenuIssueId((current) => (current === issue.id ? null : issue.id))}
        className={
          compact
            ? 'rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
            : 'rounded-lg border border-border bg-muted p-2 text-muted-foreground hover:bg-background hover:text-foreground'
        }
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {openMenuIssueId === issue.id ? (
        <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-border bg-card p-1 shadow-lg">
          <button
            type="button"
            onClick={() => handleEditIssue(issue)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>

          <div className="my-1 border-t border-border" />
          <p className="px-3 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Priority</p>
          {priorityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={issue.priority === option.value}
              onClick={() => handleSetPriority(issue, option.value)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${option.dot}`} aria-hidden="true" />
              {option.label}
              {issue.priority === option.value ? <Check className="ml-auto h-3.5 w-3.5" aria-hidden="true" /> : null}
            </button>
          ))}
          {issue.priority ? (
            <button
              type="button"
              onClick={() => handleSetPriority(issue, null)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
            >
              <span className="h-2.5 w-2.5 rounded-full border border-border" aria-hidden="true" />
              Clear priority
            </button>
          ) : null}

          <div className="my-1 border-t border-border" />
          <button
            type="button"
            onClick={() => handleDeleteIssue(issue)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 dark:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );

  const renderIssueActions = (issue: UiIssue) => (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => {
          setOpenMenuIssueId(null);
          setViewingIssueId(issue.id);
        }}
        className={referencePillClass}
      >
        View issue
      </button>

      {renderStatusControls(issue)}
      {renderIssueMenu(issue)}
    </div>
  );

  const renderStatusStrip = (issue: UiIssue) => {
    if (issue.status === 'open') return null;

    return (
      <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {issue.status === 'review' ? (
            <Clock className="h-3.5 w-3.5 text-yellow-600" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-brand-green" />
          )}
          {issue.resolvedBy ? (
            <span>
              Marked resolved by <span className="font-semibold text-foreground">{issue.resolvedBy}</span>
            </span>
          ) : (
            <span>Resolved before names were tracked</span>
          )}
          {issue.resolvedAt ? <span>· {new Date(issue.resolvedAt).toLocaleString()}</span> : null}
          {issue.status === 'review' ? <span className="font-medium text-yellow-700">· Waiting for stakeholder review</span> : null}
        </div>

        {issue.status === 'resolved' && issue.approvedBy ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-brand-green" />
            <span>
              Approved by <span className="font-semibold text-foreground">{issue.approvedBy}</span>
            </span>
            {issue.approvedAt ? <span>· {new Date(issue.approvedAt).toLocaleString()}</span> : null}
          </div>
        ) : null}
      </div>
    );
  };

  const renderIssueRow = (issue: UiIssue) => (
    <div key={issue.id} className={`rounded-2xl border border-border bg-card p-4 shadow-sm ${priorityStripeClass(issue)}`}>
      <div className="grid gap-3 md:grid-cols-[1.2fr_0.7fr_1.3fr_0.8fr_auto] md:items-center">
        <div>
          <div className="flex items-center gap-3">
            {issue.image ? (
              <button
                type="button"
                aria-label={`View screenshot for ${issue.name}`}
                onClick={() => setPreviewImage(issue.image ?? null)}
                className="shrink-0"
              >
                <img src={issue.image} alt="" className="h-10 w-10 rounded-lg border border-border object-cover" />
              </button>
            ) : null}
            <div className="text-sm font-semibold text-foreground">{issue.name}</div>
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {new Date(issue.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex w-fit rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${typeStyles[issue.type]}`}>
            {issueTypes.find((type) => type.value === issue.type)?.label ?? issue.type}
          </span>
          {renderPriorityBadge(issue)}
        </div>

        <p className="text-sm leading-6 text-muted-foreground">{issue.description}</p>

        <div className="text-sm">{renderReference(issue)}</div>

        {renderIssueActions(issue)}
      </div>

      {renderStatusStrip(issue)}
    </div>
  );

  const renderIssueCard = (issue: UiIssue) => (
    <div key={issue.id} className={`flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm ${priorityStripeClass(issue)}`}>
      {issue.image ? (
        <button
          type="button"
          aria-label={`View screenshot for ${issue.name}`}
          onClick={() => setPreviewImage(issue.image ?? null)}
          className="mb-3 block"
        >
          <img src={issue.image} alt="" className="h-36 w-full rounded-xl border border-border bg-muted object-cover" />
        </button>
      ) : null}

      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex w-fit rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${typeStyles[issue.type]}`}>
            {issueTypes.find((type) => type.value === issue.type)?.label ?? issue.type}
          </span>
          {renderPriorityBadge(issue)}
        </div>
        <span className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          {new Date(issue.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-3 text-sm font-semibold text-foreground">{issue.name}</div>
      <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">{issue.description}</p>
      <div className="mt-3 text-sm">{renderReference(issue)}</div>

      <div className="mt-auto pt-4">{renderIssueActions(issue)}</div>
      {renderStatusStrip(issue)}
    </div>
  );

  const dropZoneProps = (target: IssuePriority | 'none') => ({
    onDragOver: (event: React.DragEvent<HTMLElement>) => {
      if (!draggingIssueId) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      if (dropTarget !== target) setDropTarget(target);
    },
    onDragLeave: (event: React.DragEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTarget(null);
    },
    onDrop: (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      const issueId = event.dataTransfer.getData('text/plain') || draggingIssueId;
      const issue = issues.find((item) => item.id === issueId);
      setDraggingIssueId(null);
      setDropTarget(null);
      if (issue) handleSetPriority(issue, target === 'none' ? null : target);
    },
  });

  // Compact, Trello-style card: clicking it opens the details popup, which holds the reference and description.
  const renderBoardCard = (issue: UiIssue) => {
    const openDetails = () => {
      setOpenMenuIssueId(null);
      setViewingIssueId(issue.id);
    };

    return (
      <div
        key={issue.id}
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData('text/plain', issue.id);
          event.dataTransfer.effectAllowed = 'move';
          setOpenMenuIssueId(null);
          setDraggingIssueId(issue.id);
        }}
        onDragEnd={() => {
          setDraggingIssueId(null);
          setDropTarget(null);
        }}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('button, a')) return;
          openDetails();
        }}
        className={`cursor-pointer rounded-lg bg-white p-2.5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md active:cursor-grabbing ${
          draggingIssueId === issue.id ? 'opacity-50' : ''
        }`}
      >
        {issue.image ? (
          <img src={issue.image} alt="" draggable={false} className="mb-2 h-24 w-full rounded-md bg-muted object-cover" />
        ) : null}

        <div className="flex items-start gap-2">
          <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${typeStyles[issue.type]}`}>
            {issueTypes.find((type) => type.value === issue.type)?.label ?? issue.type}
          </span>
          {renderIssueMenu(issue, true)}
        </div>

        <button
          type="button"
          onClick={openDetails}
          className="mt-1.5 block w-full text-left text-sm font-medium leading-snug text-foreground hover:underline"
        >
          {issue.name}
        </button>

        {issue.status !== 'open' ? (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            {issue.status === 'review' ? (
              <Clock className="h-3 w-3 shrink-0 text-yellow-600" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-3 w-3 shrink-0 text-brand-green" aria-hidden="true" />
            )}
            <span className="truncate">
              {issue.approvedBy
                ? `Approved by ${issue.approvedBy}`
                : issue.resolvedBy
                  ? `Marked resolved by ${issue.resolvedBy}`
                  : 'Resolved'}
            </span>
          </p>
        ) : null}

        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3" aria-hidden="true" />
            {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
          {issue.reference !== NO_REFERENCE ? (
            <span title="Has a reference">
              <Link2 className="h-3 w-3" aria-label="Has a reference" />
            </span>
          ) : null}
          <div className="ml-auto flex items-center gap-1">{renderStatusControls(issue, true)}</div>
        </div>
      </div>
    );
  };

  const renderBoardColumn = (column: {
    target: IssuePriority | 'none';
    title: string;
    ariaLabel: string;
    hint?: string;
    dotClass?: string;
    topBorderClass: string;
    issues: UiIssue[];
    emptyText: string;
  }) => (
    <section
      key={column.target}
      aria-label={column.ariaLabel}
      {...dropZoneProps(column.target)}
      className={`flex min-h-[12rem] flex-col rounded-xl border-t-4 p-2 transition ${column.topBorderClass} ${
        dropTarget === column.target ? 'bg-[#e4e6ea] ring-2 ring-[#030d0a]/30' : 'bg-[#f1f2f4]'
      }`}
    >
      <div className="mb-2 px-1 pt-1">
        <div className="flex items-center gap-2">
          {column.dotClass ? <span className={`h-2.5 w-2.5 rounded-full ${column.dotClass}`} aria-hidden="true" /> : null}
          <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {column.issues.length}
          </span>
        </div>
        {column.hint ? <p className="mt-1 text-xs text-muted-foreground">{column.hint}</p> : null}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {column.issues.length > 0 ? (
          column.issues.map((issue) => renderBoardCard(issue))
        ) : (
          <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-black/10 px-3 py-8 text-center text-xs text-muted-foreground">
            {column.emptyText}
          </p>
        )}
      </div>
    </section>
  );

  // Issues without a priority wait in the left column; dragging a card right sets its severity.
  // Dragging only works with a mouse, so ⋮ → Priority stays the way to do it on touch screens.
  const renderPriorityBoard = (items: UiIssue[], poolTitle: string) => (
    <div className="grid auto-cols-[minmax(16rem,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2">
      {renderBoardColumn({
        target: 'none',
        title: poolTitle,
        ariaLabel: `${poolTitle} without a priority`,
        hint: 'No priority yet. Drag right to set one.',
        topBorderClass: 'border-t-[#030d0a]',
        issues: items.filter((issue) => !getPriorityOption(issue)),
        emptyText: 'Every issue here has a priority',
      })}
      {priorityOptions.map((option) =>
        renderBoardColumn({
          target: option.value,
          title: option.label,
          ariaLabel: `${option.label} priority`,
          dotClass: option.dot,
          topBorderClass: option.column,
          issues: items.filter((issue) => issue.priority === option.value),
          emptyText: 'Drop issues here',
        }),
      )}
    </div>
  );

  const boardPoolTitles: Record<Screen, string> = {
    open: 'Open issues',
    review: 'Waiting for review',
    resolved: 'Resolved',
  };

  const screenSections: Record<Screen, { title: string; items: UiIssue[]; empty: string }> = {
    open: { title: 'Open issues', items: openIssues, empty: 'No open issues.' },
    review: { title: 'Waiting for stakeholder review', items: reviewIssues, empty: 'Nothing is waiting for review.' },
    resolved: { title: 'Resolved', items: resolvedIssues, empty: 'Nothing resolved yet.' },
  };
  const currentSection = screenSections[screen];

  const screenButtons = [
    { target: 'review', label: 'Waiting for review', count: reviewIssues.length, Icon: Clock },
    { target: 'resolved', label: 'Resolved', count: resolvedIssues.length, Icon: CheckCircle2 },
  ] as const;

  const stats = [
    { label: 'Total', value: issues.length },
    { label: 'Open', value: openIssues.length },
    { label: 'In review', value: reviewIssues.length },
    { label: 'Resolved', value: resolvedIssues.length },
  ];

  const activePrompt = namePrompt ? namePromptCopy[namePrompt.action] : null;

  return (
    <div className="light min-h-screen w-full bg-light-canvas px-4 py-8 text-foreground md:px-6">
      <div className="w-full">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            {screen !== 'open' ? (
              <button
                type="button"
                onClick={() => openScreen('open')}
                className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to open issues
              </button>
            ) : null}
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              UI audit
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{screen === 'open' ? 'Issue list' : currentSection.title}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {syncStatus === 'live'
                ? 'Shared with everyone who opens this page · updates live'
                : syncStatus === 'connecting'
                  ? 'Connecting to the shared list…'
                  : 'Offline copy'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {screenButtons.map(({ target, label, count, Icon }) => (
              <button
                key={target}
                type="button"
                aria-pressed={screen === target}
                onClick={() => openScreen(screen === target ? 'open' : target)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  screen === target
                    ? 'border-[#030d0a] bg-[#030d0a] text-white'
                    : 'border-border bg-card text-[#030d0a] hover:border-[#030d0a]/40'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    screen === target ? 'bg-white/15 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}

            <div role="group" aria-label="Issue layout" className="inline-flex rounded-xl border border-border bg-card p-1">
              {(
                [
                  { mode: 'list', label: 'List', Icon: List },
                  { mode: 'grid', label: 'Grid', Icon: LayoutGrid },
                  { mode: 'board', label: 'Board', Icon: SquareKanban },
                ] as const
              ).map(({ mode, label, Icon }) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={viewMode === mode}
                  onClick={() => setViewMode(mode)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    viewMode === mode ? 'bg-[#030d0a] text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingIssueId(null);
                setForm(emptyForm);
                setFormError(null);
                setIsModalOpen(true);
              }}
              className="rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-[#030d0a] transition hover:bg-brand-green-hover"
            >
              Log a new issue
            </button>
          </div>
        </div>

        {syncError || syncStatus === 'offline' ? (
          <div role="alert" className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {syncError ??
              "Can't reach the shared issue list, so this may be an old copy. Check your connection; it refreshes when you come back to this tab."}
          </div>
        ) : null}

        {screen === 'open' ? (
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
                <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        <section className="w-full">
          {screen === 'open' && viewMode !== 'board' ? (
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">{currentSection.title}</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {currentSection.items.length}
              </span>
            </div>
          ) : null}

          {currentSection.items.length > 0 ? (
            viewMode === 'board' ? (
              renderPriorityBoard(currentSection.items, boardPoolTitles[screen])
            ) : viewMode === 'grid' ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {currentSection.items.map(renderIssueCard)}
              </div>
            ) : (
              <div className="space-y-3">{currentSection.items.map(renderIssueRow)}</div>
            )
          ) : (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              {currentSection.empty}
            </p>
          )}
        </section>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-2xl md:p-6"
            onPaste={handleImagePaste}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {editingIssueId ? 'Edit issue' : 'New issue'}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-foreground">
                  {editingIssueId ? 'Edit issue' : 'Log a new issue'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl border border-border bg-muted px-3 py-2 text-sm text-foreground hover:bg-background"
              >
                Close
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-medium text-foreground md:col-span-2">
                Issue name
                <input
                  value={form.name}
                  onChange={(event) => {
                    setFormError(null);
                    setForm((current) => ({ ...current, name: event.target.value }));
                  }}
                  placeholder="Buttons misaligned on mobile"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-green"
                />
              </label>

              <fieldset className="md:col-span-2">
                <legend className="text-sm font-medium text-foreground">Category</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {issueTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      aria-pressed={form.type === type.value}
                      onClick={() => setForm((current) => ({ ...current, type: type.value }))}
                      className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                        form.type === type.value
                          ? `${typeStyles[type.value]} border-brand-green`
                          : 'border-border bg-muted text-muted-foreground hover:border-brand-green/50 hover:text-foreground'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block text-sm font-medium text-foreground">
                View reference <span className="font-normal text-muted-foreground">(optional)</span>
                <input
                  value={form.reference}
                  onChange={(event) => setForm((current) => ({ ...current, reference: event.target.value }))}
                  placeholder="https://example.com/page or ticket URL"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-green"
                />
              </label>

              <label className="block text-sm font-medium text-foreground md:col-span-2">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) => {
                    setFormError(null);
                    setForm((current) => ({ ...current, description: event.target.value }));
                  }}
                  rows={5}
                  placeholder="Describe the bug and expected behavior."
                  className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-green"
                />
              </label>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground">
                  Screenshot
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-2 block w-full rounded-xl border border-dashed border-border bg-background px-3 py-3 text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
                  />
                </label>
                <p className="mt-2 text-xs text-muted-foreground">Choose an image above, or paste an image while this form is open.</p>
                {form.image ? (
                  <img src={form.image} alt="Screenshot preview" className="mt-3 h-40 w-full rounded-xl border border-border object-contain bg-muted" />
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              {formError ? (
                <p role="alert" className="mr-auto text-sm text-red-600">
                  {formError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm font-medium text-foreground hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmitIssue()}
                disabled={isSaving}
                className="rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-[#030d0a] hover:bg-brand-green-hover disabled:cursor-wait disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : editingIssueId ? 'Save changes' : 'Save issue'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {viewingIssue ? (
        <div
          onClick={() => setViewingIssueId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            role="dialog"
            aria-label={`Issue details: ${viewingIssue.name}`}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-2xl md:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Issue details</p>
                <h3 className="mt-2 text-2xl font-semibold text-foreground">{viewingIssue.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingIssueId(null)}
                className="rounded-xl border border-border bg-muted px-3 py-2 text-sm text-foreground hover:bg-background"
              >
                Close
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex w-fit rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${typeStyles[viewingIssue.type]}`}>
                {issueTypes.find((type) => type.value === viewingIssue.type)?.label ?? viewingIssue.type}
              </span>
              <span className={`inline-flex w-fit rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${statusStyles[viewingIssue.status]}`}>
                {statusLabels[viewingIssue.status]}
              </span>
              {renderPriorityBadge(viewingIssue)}
              <span className="text-xs text-muted-foreground">
                Logged {new Date(viewingIssue.createdAt).toLocaleString()}
              </span>
            </div>

            {viewingIssue.status !== 'open' ? (
              <div className="mt-3 space-y-1 text-sm text-foreground">
                <p>
                  Marked resolved by <span className="font-semibold">{viewingIssue.resolvedBy ?? 'unknown'}</span>
                  {viewingIssue.resolvedAt ? ` on ${new Date(viewingIssue.resolvedAt).toLocaleString()}` : ''}
                </p>
                {viewingIssue.approvedBy ? (
                  <p>
                    Approved by <span className="font-semibold">{viewingIssue.approvedBy}</span>
                    {viewingIssue.approvedAt ? ` on ${new Date(viewingIssue.approvedAt).toLocaleString()}` : ''}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-5 space-y-5">
              <div>
                <p className="text-sm font-medium text-foreground">Description</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{viewingIssue.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">Reference</p>
                <div className="mt-2 text-sm">{renderReference(viewingIssue)}</div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">Screenshot</p>
                {viewingIssue.image ? (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(viewingIssue.image ?? null)}
                    className="mt-2 block w-full"
                  >
                    <img
                      src={viewingIssue.image}
                      alt={`Screenshot for ${viewingIssue.name}`}
                      className="max-h-72 w-full rounded-xl border border-border bg-muted object-contain"
                    />
                  </button>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No screenshot added</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <div className="mr-auto flex flex-wrap items-center gap-2">{renderStatusControls(viewingIssue)}</div>
              <button
                type="button"
                onClick={() => handleEditIssue(viewingIssue)}
                className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm font-medium text-foreground hover:bg-background"
              >
                Edit issue
              </button>
              <button
                type="button"
                onClick={() => setViewingIssueId(null)}
                className="rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-[#030d0a] hover:bg-brand-green-hover"
              >
                Done
              </button>
            </div>

            {userName ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Acting as <span className="font-semibold text-foreground">{userName}</span> ·{' '}
                <button
                  type="button"
                  onClick={() => {
                    setNameDraft(userName);
                    setNamePrompt({ action: 'change' });
                  }}
                  className="font-medium text-[#030d0a] underline underline-offset-2"
                >
                  Change name
                </button>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {previewImage ? (
        <div
          role="dialog"
          aria-label="Screenshot preview"
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
        >
          <div className="relative max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <img src={previewImage} alt="Screenshot reference" className="max-h-[85vh] w-auto rounded-2xl border border-border bg-card object-contain" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 rounded-xl border border-border bg-card px-3 py-2 text-sm text-[#030d0a] hover:bg-muted"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {namePrompt && activePrompt ? (
        <div
          onClick={() => setNamePrompt(null)}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
        >
          <form
            role="dialog"
            aria-label="Enter your name"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              handleConfirmName();
            }}
            className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-2xl md:p-6"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{activePrompt.eyebrow}</p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">{activePrompt.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{activePrompt.body}</p>
            <input
              autoFocus
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              placeholder="Your name"
              className="mt-4 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-green"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setNamePrompt(null)}
                className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm font-medium text-foreground hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!nameDraft.trim()}
                className="rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-[#030d0a] hover:bg-brand-green-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {activePrompt.submit}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {notice ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#030d0a] px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          {notice}
        </div>
      ) : null}
    </div>
  );
}
