import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bug, LayoutGrid, Lightbulb, List, MessageCircle, Plus, Search } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { USER_DISPLAY_NAME } from '../constants/user';
import { cn } from '@/lib/utils';
import { Button } from '@/src/components/ui/button';
import {
  FEEDBACK_PRIORITIES,
  FEEDBACK_PRIORITY_LABELS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_TYPES,
  FeedbackEntry,
  FeedbackPriority,
  FeedbackStatus,
  FeedbackType,
  formatFeedbackDate,
  persistFeedbackEntry,
  readFeedbackEntries,
  sortFeedbackByPriority,
  updateFeedbackStatus,
} from '../data/feedback';

interface FeedbackViewProps {
  theme: Theme;
}

type TypeFilter = FeedbackType | 'all';
type PriorityFilter = FeedbackPriority | 'all';
type ViewMode = 'cards' | 'list';

function TypeIcon({ type, className }: { type: FeedbackType; className?: string }) {
  if (type === 'bug') return <Bug className={className} />;
  if (type === 'improvement') return <Lightbulb className={className} />;
  return <MessageCircle className={className} />;
}

function priorityChipClass(priority: FeedbackPriority): string {
  if (priority === 'critical') return 'border-border bg-muted text-foreground';
  if (priority === 'high') return 'border-border bg-brand-green/10 text-brand-green';
  return 'border-border bg-muted text-muted-foreground';
}

function statusChipClass(status: FeedbackStatus): string {
  if (status === 'resolved') return 'border-border bg-brand-green/10 text-brand-green';
  if (status === 'reviewing') return 'border-border bg-muted text-foreground';
  return 'border-border bg-muted text-muted-foreground';
}

function StatusSelect({
  entry,
  isDark,
  onChange,
}: {
  entry: FeedbackEntry;
  isDark: boolean;
  onChange: (id: string, status: FeedbackStatus) => void;
}) {
  return (
    <select
      value={entry.status}
      aria-label="Status"
      onChange={(e) => onChange(entry.id, e.target.value as FeedbackStatus)}
      className={cn(
        'rounded-lg border px-2 py-1.5 text-[11px] font-medium text-foreground outline-none',
        isDark ? 'border-mitra-border bg-mitra-input' : 'border-border bg-background',
      )}
    >
      {(Object.keys(FEEDBACK_STATUS_LABELS) as FeedbackStatus[]).map((s) => (
        <option key={s} value={s}>
          {FEEDBACK_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}

function EntryTags({ entry }: { entry: FeedbackEntry }) {
  const chipBase =
    'inline-flex items-center rounded-full border px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide leading-none';
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className={cn(chipBase, 'border-border bg-muted text-foreground')}>
        {FEEDBACK_TYPE_LABELS[entry.type]}
      </span>
      <span className={cn(chipBase, priorityChipClass(entry.priority))}>
        {FEEDBACK_PRIORITY_LABELS[entry.priority]}
      </span>
      <span className={cn(chipBase, statusChipClass(entry.status))}>
        {FEEDBACK_STATUS_LABELS[entry.status]}
      </span>
    </div>
  );
}

export default function FeedbackView({ theme }: FeedbackViewProps) {
  const isDark = isDarkTheme(theme);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [entries, setEntries] = useState<FeedbackEntry[]>(() => readFeedbackEntries());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [formOpen, setFormOpen] = useState(false);

  const [message, setMessage] = useState('');
  const [type, setType] = useState<FeedbackType>('bug');
  const [priority, setPriority] = useState<FeedbackPriority>('medium');
  const [submitError, setSubmitError] = useState('');

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setHasScrolled(scrollRef.current.scrollTop > 0);
    }
  }, []);

  useEffect(() => {
    if (!formOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFormOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [formOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = entries.filter((entry) => {
      if (typeFilter !== 'all' && entry.type !== typeFilter) return false;
      if (priorityFilter !== 'all' && entry.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        entry.message.toLowerCase().includes(q)
        || entry.submittedBy.toLowerCase().includes(q)
        || FEEDBACK_TYPE_LABELS[entry.type].toLowerCase().includes(q)
        || FEEDBACK_PRIORITY_LABELS[entry.priority].toLowerCase().includes(q)
      );
    });
    return sortFeedbackByPriority(list);
  }, [entries, search, typeFilter, priorityFilter]);

  const resetForm = () => {
    setMessage('');
    setType('bug');
    setPriority('medium');
    setSubmitError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setSubmitError('Describe the issue or idea before submitting.');
      return;
    }
    const entry: FeedbackEntry = {
      id: `fb-${Date.now()}`,
      message: trimmed,
      type,
      priority,
      status: 'open',
      submittedBy: USER_DISPLAY_NAME,
      submittedAt: new Date().toISOString(),
    };
    setEntries(persistFeedbackEntry(entry));
    resetForm();
    setFormOpen(false);
  };

  const handleStatusChange = (id: string, status: FeedbackStatus) => {
    setEntries(updateFeedbackStatus(id, status));
  };

  const filterPill = (active: boolean) =>
    cn(
      'shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
      active
        ? 'border-brand-green bg-brand-green/10 text-brand-green'
        : isDark
          ? 'border-mitra-border bg-mitra-surface text-muted-foreground hover:bg-accent hover:text-foreground'
          : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
    );

  const viewToggleBtn = (mode: ViewMode) =>
    cn(
      'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
      viewMode === mode
        ? 'border-brand-green bg-brand-green/10 text-brand-green'
        : isDark
          ? 'border-mitra-border text-muted-foreground hover:bg-accent hover:text-foreground'
          : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
    );

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <div className="shrink-0">
        <div className="px-4 pb-3 pt-6 md:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-2xl font-bold text-foreground">Feedback</h1>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={cn(
                      'h-8 w-44 rounded-lg border py-1.5 pl-8 pr-2.5 text-xs outline-none transition-colors sm:w-52',
                      isDark
                        ? 'border-mitra-border bg-mitra-input text-foreground placeholder:text-muted-foreground focus:border-brand-green/40'
                        : 'border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-brand-green/50',
                    )}
                  />
                </div>
                <div className="flex items-center gap-1" role="group" aria-label="View mode">
                  <button
                    type="button"
                    title="List view"
                    aria-pressed={viewMode === 'list'}
                    className={viewToggleBtn('list')}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Cards view"
                    aria-pressed={viewMode === 'cards'}
                    className={viewToggleBtn('cards')}
                    onClick={() => setViewMode('cards')}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Button
                  variant="cta"
                  size="sm"
                  onClick={() => {
                    resetForm();
                    setFormOpen(true);
                  }}
                  className="h-8 gap-1.5 text-xs shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Submit feedback
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              <button type="button" className={filterPill(typeFilter === 'all' && priorityFilter === 'all')} onClick={() => { setTypeFilter('all'); setPriorityFilter('all'); }}>
                All
              </button>
              {FEEDBACK_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={filterPill(typeFilter === t)}
                  onClick={() => setTypeFilter(typeFilter === t ? 'all' : t)}
                >
                  {FEEDBACK_TYPE_LABELS[t]}
                </button>
              ))}
              <span className="mx-0.5 h-4 w-px shrink-0 bg-border" aria-hidden />
              {FEEDBACK_PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={filterPill(priorityFilter === p)}
                  onClick={() => setPriorityFilter(priorityFilter === p ? 'all' : p)}
                >
                  {FEEDBACK_PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div
          className={cn(
            'border-b transition-opacity duration-200',
            hasScrolled ? 'border-border opacity-100' : 'border-transparent opacity-0',
          )}
        />
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-3 md:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          {filtered.length === 0 ? (
            <div
              className={cn(
                'rounded-2xl border px-6 py-12 text-center',
                isDark ? 'border-mitra-border bg-mitra-surface' : 'border-border bg-card',
              )}
            >
              <MessageCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No feedback matches</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try another filter, or submit a new bug or improvement.
              </p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((entry) => (
                <article
                  key={entry.id}
                  className={cn(
                    'flex flex-col rounded-2xl border p-4 transition-colors',
                    isDark
                      ? 'border-mitra-border bg-mitra-surface hover:bg-mitra-highlight'
                      : 'border-border bg-card hover:bg-accent/40',
                  )}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                        isDark ? 'border-mitra-border bg-muted' : 'border-border bg-muted',
                      )}
                    >
                      <TypeIcon type={entry.type} className="h-4 w-4 text-brand-green" />
                    </div>
                    <StatusSelect entry={entry} isDark={isDark} onChange={handleStatusChange} />
                  </div>
                  <EntryTags entry={entry} />
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-foreground line-clamp-4">
                    {entry.message}
                  </p>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    {entry.submittedBy} · {formatFeedbackDate(entry.submittedAt)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map((entry) => (
                <article
                  key={entry.id}
                  className={cn(
                    'sn-list-row flex items-start gap-3 rounded-xl border px-3.5 py-3.5 transition-colors',
                    isDark
                      ? 'border-mitra-border bg-mitra-surface hover:bg-mitra-highlight'
                      : 'border-border bg-card hover:bg-accent/40',
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
                      isDark ? 'border-mitra-border bg-muted' : 'border-border bg-muted',
                    )}
                  >
                    <TypeIcon type={entry.type} className="h-3.5 w-3.5 text-brand-green" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <EntryTags entry={entry} />
                    </div>
                    <p className="text-[13px] font-semibold leading-snug text-foreground line-clamp-2">
                      {entry.message}
                    </p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {entry.submittedBy} · {formatFeedbackDate(entry.submittedAt)}
                    </p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    <StatusSelect entry={entry} isDark={isDark} onChange={handleStatusChange} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close submit feedback dialog"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setFormOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-form-title"
            className={cn(
              'relative z-10 w-full max-w-lg rounded-2xl border p-5 shadow-lg',
              isDark ? 'border-mitra-border bg-mitra-surface' : 'border-border bg-card',
            )}
          >
            <h2 id="feedback-form-title" className="font-display text-lg font-semibold text-foreground">
              Submit feedback
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Tell us about a bug, improvement, or anything else we should know.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                  What type is this?
                </label>
                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={filterPill(type === t)}
                    >
                      {FEEDBACK_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                  How important is it?
                </label>
                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={filterPill(priority === p)}
                    >
                      {FEEDBACK_PRIORITY_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="feedback-message" className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                  Message
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (submitError) setSubmitError('');
                  }}
                  rows={5}
                  placeholder="Describe the issue or idea…"
                  className={cn(
                    'w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors',
                    isDark
                      ? 'border-mitra-border bg-mitra-input text-foreground placeholder:text-muted-foreground focus:border-brand-green/40'
                      : 'border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-brand-green/50',
                  )}
                />
                {submitError && (
                  <p className="mt-1.5 text-[11px] text-destructive">{submitError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="cta" size="sm">
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
