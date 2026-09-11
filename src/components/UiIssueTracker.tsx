import React, { useEffect, useState } from 'react';
import { CheckCircle2, LayoutGrid, List, MoreVertical, Pencil, Trash2 } from 'lucide-react';

type IssueType = 'Improvement' | 'Bug' | 'Accessibility' | 'UI' | 'UX';

type UiIssue = {
  id: string;
  name: string;
  type: IssueType;
  description: string;
  reference: string;
  image?: string | null;
  resolved: boolean;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
};

type NamePromptTarget = { kind: 'issue'; issueId: string } | { kind: 'form' };

type ViewMode = 'list' | 'grid';

const STORAGE_KEY = 'mitra-ui-audit-v1';
const NO_REFERENCE = 'No reference added';
const MAX_IMAGE_DIMENSION = 1280;
const USER_NAME_KEY = 'mitra-ui-audit-user';
const VIEW_MODE_KEY = 'mitra-ui-audit-view';

const emptyForm = {
  name: '',
  type: 'UI' as IssueType,
  description: '',
  reference: '',
  image: null as string | null,
  resolved: false,
};

const defaultIssues: UiIssue[] = [
  {
    id: 'issue-example-1',
    name: 'Checkout spacing issue',
    type: 'UI',
    description: 'The CTA section feels too crowded on tablet layout and needs tighter spacing.',
    reference: 'https://example.com/checkout',
    image: null,
    resolved: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'issue-example-2',
    name: 'Dark mode contrast',
    type: 'UX',
    description: 'Primary action is hard to read on dark surfaces and needs stronger contrast.',
    reference: 'dark-mode-review',
    image: null,
    resolved: true,
    createdAt: new Date().toISOString(),
  },
];

function normalizeIssue(value: Partial<UiIssue> & { title?: string; status?: string; image?: string | null }): UiIssue | null {
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
      : value.type === 'Content' || value.type === 'Flow'
        ? 'Improvement'
        : 'UI',
    description,
    reference: typeof value.reference === 'string' && value.reference ? value.reference : NO_REFERENCE,
    image: typeof value.image === 'string' ? value.image : null,
    resolved: typeof value.resolved === 'boolean' ? value.resolved : value.status === 'Resolved',
    resolvedBy: typeof value.resolvedBy === 'string' ? value.resolvedBy : null,
    resolvedAt: typeof value.resolvedAt === 'string' ? value.resolvedAt : null,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
  };
}

function getReferenceUrl(reference: string) {
  if (/^https?:\/\//i.test(reference)) return reference;
  if (/^www\./i.test(reference)) return `https://${reference}`;
  return null;
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

export function UiIssueTracker() {
  const [issues, setIssues] = useState<UiIssue[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .map((issue) => (issue && typeof issue === 'object' ? normalizeIssue(issue as Partial<UiIssue> & { title?: string; status?: string; image?: string | null }) : null))
            .filter((issue): issue is UiIssue => issue !== null);
          if (normalized.length > 0) {
            return normalized;
          }
        }
      }
    } catch {
      // Ignore malformed data and use defaults.
    }
    return defaultIssues;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
  const [openMenuIssueId, setOpenMenuIssueId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
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
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      return localStorage.getItem(VIEW_MODE_KEY) === 'grid' ? 'grid' : 'list';
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
      setStorageError(null);
    } catch {
      // Usually a QuotaExceededError from large screenshots; keep the app running.
      setStorageError('Browser storage is full, so the latest changes will be lost on reload. Remove screenshots or delete old issues.');
    }
  }, [issues]);

  const readImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const original = typeof reader.result === 'string' ? reader.result : null;
      if (!original) return;

      // Downscale so screenshots don't blow through the ~5MB localStorage quota.
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const context = canvas.getContext('2d');
        if (!context) {
          setForm((current) => ({ ...current, image: original }));
          return;
        }
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        setForm((current) => ({ ...current, image: canvas.toDataURL('image/jpeg', 0.8) }));
      };
      img.onerror = () => setForm((current) => ({ ...current, image: original }));
      img.src = original;
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

  const resolutionFor = (existing: UiIssue | null, resolved: boolean) => {
    if (!resolved) return { resolved: false, resolvedBy: null, resolvedAt: null };
    if (existing?.resolved) {
      return { resolved: true, resolvedBy: existing.resolvedBy ?? null, resolvedAt: existing.resolvedAt ?? null };
    }
    return { resolved: true, resolvedBy: userName || null, resolvedAt: new Date().toISOString() };
  };

  const handleSubmitIssue = () => {
    const name = form.name.trim();
    const description = form.description.trim();
    const reference = form.reference.trim() || NO_REFERENCE;

    if (!name || !description) {
      setFormError('Add an issue name and a description to save.');
      return;
    }

    setIssues((current) => {
      if (editingIssueId) {
        return current.map((issue) =>
          issue.id === editingIssueId
            ? {
                ...issue,
                name,
                type: form.type,
                description,
                reference,
                image: form.image,
                ...resolutionFor(issue, form.resolved),
              }
            : issue,
        );
      }

      return [
        {
          id: `audit-${Date.now()}`,
          name,
          type: form.type,
          description,
          reference,
          image: form.image,
          ...resolutionFor(null, form.resolved),
          createdAt: new Date().toISOString(),
        },
        ...current,
      ];
    });
    setEditingIssueId(null);
    setForm(emptyForm);
    setFormError(null);
    setIsModalOpen(false);
  };

  const setIssueResolved = (issueId: string, resolved: boolean, resolver: string) => {
    setIssues((current) =>
      current.map((item) =>
        item.id === issueId
          ? {
              ...item,
              resolved,
              resolvedBy: resolved ? resolver : null,
              resolvedAt: resolved ? new Date().toISOString() : null,
            }
          : item,
      ),
    );
  };

  const toggleResolved = (issue: UiIssue) => {
    if (issue.resolved) {
      setIssueResolved(issue.id, false, '');
      return;
    }
    // Always confirm who is resolving; prefill with the last name used in this browser.
    setNameDraft(userName);
    setNamePrompt({ kind: 'issue', issueId: issue.id });
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
    if (namePrompt.kind === 'issue') setIssueResolved(namePrompt.issueId, true, name);
    if (namePrompt.kind === 'form') setForm((current) => ({ ...current, resolved: true }));
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
      resolved: issue.resolved,
    });
    setOpenMenuIssueId(null);
    setIsModalOpen(true);
  };

  const handleDeleteIssue = (issue: UiIssue) => {
    if (!window.confirm(`Delete "${issue.name}"?`)) return;
    setIssues((current) => current.filter((item) => item.id !== issue.id));
    setOpenMenuIssueId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIssueId(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const openIssues = issues.filter((issue) => !issue.resolved);
  const resolvedIssues = issues.filter((issue) => issue.resolved);

  const renderIssueActions = (issue: UiIssue, className = '') => (
    <div className={`flex items-center gap-3 ${className}`}>
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

      <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        <input
          type="checkbox"
          checked={issue.resolved}
          onChange={() => toggleResolved(issue)}
          className="h-4 w-4 rounded border-border text-brand-green focus:ring-brand-green"
        />
        Resolved
      </label>

      <div className="relative">
        <button
          type="button"
          aria-label={`Actions for ${issue.name}`}
          aria-expanded={openMenuIssueId === issue.id}
          onClick={() => setOpenMenuIssueId((current) => (current === issue.id ? null : issue.id))}
          className="rounded-lg border border-border bg-muted p-2 text-muted-foreground hover:bg-background hover:text-foreground"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {openMenuIssueId === issue.id ? (
          <div className="absolute right-0 top-full z-20 mt-2 w-36 rounded-xl border border-border bg-card p-1 shadow-lg">
            <button
              type="button"
              onClick={() => handleEditIssue(issue)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
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
    </div>
  );

  const renderResolvedStrip = (issue: UiIssue) =>
    issue.resolved ? (
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5 text-brand-green" />
        {issue.resolvedBy ? (
          <span>
            Resolved by <span className="font-semibold text-foreground">{issue.resolvedBy}</span>
          </span>
        ) : (
          <span>Resolved before names were tracked</span>
        )}
        {issue.resolvedAt ? <span>· {new Date(issue.resolvedAt).toLocaleString()}</span> : null}
      </div>
    ) : null;

  const renderIssueRow = (issue: UiIssue) => (
    <div key={issue.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
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

        <span className={`inline-flex w-fit rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${typeStyles[issue.type]}`}>
          {issueTypes.find((type) => type.value === issue.type)?.label ?? issue.type}
        </span>

        <p className="text-sm leading-6 text-muted-foreground">{issue.description}</p>

        <div className="text-sm">{renderReference(issue)}</div>

        {renderIssueActions(issue)}
      </div>

      {renderResolvedStrip(issue)}
    </div>
  );

  const renderIssueCard = (issue: UiIssue) => (
    <div key={issue.id} className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm">
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

      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex w-fit rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${typeStyles[issue.type]}`}>
          {issueTypes.find((type) => type.value === issue.type)?.label ?? issue.type}
        </span>
        <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          {new Date(issue.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-3 text-sm font-semibold text-foreground">{issue.name}</div>
      <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">{issue.description}</p>
      <div className="mt-3 text-sm">{renderReference(issue)}</div>

      <div className="mt-auto pt-4">{renderIssueActions(issue, 'flex-wrap justify-between')}</div>
      {renderResolvedStrip(issue)}
    </div>
  );

  const issueSections = [
    { key: 'open', title: 'Open issues', items: openIssues, empty: 'No open issues.' },
    { key: 'resolved', title: 'Resolved', items: resolvedIssues, empty: 'Nothing resolved yet.' },
  ];

  return (
    <div className="light min-h-screen w-full bg-light-canvas px-4 py-8 text-foreground md:px-6">
      <div className="w-full">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              UI audit
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Issue list</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div role="group" aria-label="Issue layout" className="inline-flex rounded-xl border border-border bg-card p-1">
              {(
                [
                  { mode: 'list', label: 'List', Icon: List },
                  { mode: 'grid', label: 'Grid', Icon: LayoutGrid },
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

        {storageError ? (
          <div role="alert" className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {storageError}
          </div>
        ) : null}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Total</p>
            <p className="mt-3 text-2xl font-semibold">{issues.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Open</p>
            <p className="mt-3 text-2xl font-semibold">{issues.filter((issue) => !issue.resolved).length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Resolved</p>
            <p className="mt-3 text-2xl font-semibold">{issues.filter((issue) => issue.resolved).length}</p>
          </div>
        </div>

        <div className="w-full space-y-8">
          {issueSections.map((section) => (
            <section key={section.key}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {section.items.length}
                </span>
              </div>

              {section.items.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {section.items.map(renderIssueCard)}
                  </div>
                ) : (
                  <div className="space-y-3">{section.items.map(renderIssueRow)}</div>
                )
              ) : (
                <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                  {section.empty}
                </p>
              )}
            </section>
          ))}
        </div>
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

              <label className="flex items-center gap-3 text-sm font-medium text-foreground md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.resolved}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setNameDraft(userName);
                      setNamePrompt({ kind: 'form' });
                      return;
                    }
                    setForm((current) => ({ ...current, resolved: event.target.checked }));
                  }}
                  className="h-4 w-4 rounded border-border text-brand-green focus:ring-brand-green"
                />
                Mark as resolved
              </label>
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
                onClick={handleSubmitIssue}
                className="rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-[#030d0a] hover:bg-brand-green-hover"
              >
                {editingIssueId ? 'Save changes' : 'Save issue'}
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
              <span
                className={`inline-flex w-fit rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${
                  viewingIssue.resolved ? 'bg-brand-green/10 text-brand-green' : 'bg-yellow-500/10 text-yellow-700'
                }`}
              >
                {viewingIssue.resolved ? 'Resolved' : 'Open'}
              </span>
              <span className="text-xs text-muted-foreground">
                Logged {new Date(viewingIssue.createdAt).toLocaleString()}
              </span>
            </div>

            {viewingIssue.resolved ? (
              <p className="mt-3 text-sm text-foreground">
                Resolved by <span className="font-semibold">{viewingIssue.resolvedBy ?? 'unknown'}</span>
                {viewingIssue.resolvedAt ? ` on ${new Date(viewingIssue.resolvedAt).toLocaleString()}` : ''}
              </p>
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
              <label className="mr-auto flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={viewingIssue.resolved}
                  onChange={() => toggleResolved(viewingIssue)}
                  className="h-4 w-4 rounded border-border text-brand-green focus:ring-brand-green"
                />
                Resolved
              </label>
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

      {namePrompt ? (
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
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Resolve issue</p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">Who is resolving this?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your name is saved on the issue. We'll remember it in this browser for next time.
            </p>
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
                Resolve
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
