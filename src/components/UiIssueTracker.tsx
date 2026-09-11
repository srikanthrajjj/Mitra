import React, { useEffect, useState } from 'react';

type IssueType = 'Improvement' | 'Bug' | 'Accessibility' | 'UI' | 'UX';

type UiIssue = {
  id: string;
  name: string;
  type: IssueType;
  description: string;
  reference: string;
  image?: string | null;
  resolved: boolean;
  createdAt: string;
};

const STORAGE_KEY = 'mitra-ui-audit-v1';

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
    reference: typeof value.reference === 'string' && value.reference ? value.reference : 'No reference added',
    image: typeof value.image === 'string' ? value.image : null,
    resolved: typeof value.resolved === 'boolean' ? value.resolved : value.status === 'Resolved',
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
  };
}

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
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  }, [issues]);

  const readImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const image = typeof reader.result === 'string' ? reader.result : null;
      setForm((current) => ({ ...current, image }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) readImageFile(file);
  };

  const handleImagePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith('image/'));
    const file = imageItem?.getAsFile();
    if (file) {
      event.preventDefault();
      readImageFile(file);
    }
  };

  const handleSubmitIssue = () => {
    const name = form.name.trim();
    const description = form.description.trim();
    const reference = form.reference.trim();

    if (!name || !description || !reference) {
      return;
    }

    const nextIssue: UiIssue = {
      id: `audit-${Date.now()}`,
      name,
      type: form.type,
      description,
      reference,
      image: form.image,
      resolved: form.resolved,
      createdAt: new Date().toISOString(),
    };

    setIssues((current) => [nextIssue, ...current]);
    setForm(emptyForm);
    setIsModalOpen(false);
  };

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

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-[#030d0a] transition hover:bg-brand-green-hover"
          >
            Log a new issue
          </button>
        </div>

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

        <div className="w-full">
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="grid gap-3 md:grid-cols-[1.2fr_0.7fr_1.3fr_0.8fr_auto] md:items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      {issue.image ? (
                        <img src={issue.image} alt="" className="h-10 w-10 rounded-lg border border-border object-cover" />
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

                  <div className="text-sm">
                    {issue.reference.startsWith('http') ? (
                      <a
                        href={issue.reference}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-brand-green hover:border-brand-green/40"
                      >
                        View ref
                      </a>
                    ) : (
                      <span className="text-muted-foreground">{issue.reference}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={issue.resolved}
                        onChange={() =>
                          setIssues((current) =>
                            current.map((item) =>
                              item.id === issue.id ? { ...item, resolved: !item.resolved } : item,
                            ),
                          )
                        }
                        className="h-4 w-4 rounded border-border text-brand-green focus:ring-brand-green"
                      />
                      Resolved
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-2xl rounded-3xl border border-border bg-card p-5 shadow-2xl md:p-6"
            onPaste={handleImagePaste}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">New issue</p>
                <h3 className="mt-2 text-2xl font-semibold text-foreground">Log a new issue</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
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
                View reference
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
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
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
                  onChange={(event) => setForm((current) => ({ ...current, resolved: event.target.checked }))}
                  className="h-4 w-4 rounded border-border text-brand-green focus:ring-brand-green"
                />
                Mark as resolved
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm font-medium text-foreground hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitIssue}
                className="rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-[#030d0a] hover:bg-brand-green-hover"
              >
                Save issue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
