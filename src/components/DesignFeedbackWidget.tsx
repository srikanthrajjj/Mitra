import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquarePlus, X, Sun, Moon, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResolvedTheme, Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  DesignFeedbackEntry,
  formatFeedbackDate,
  persistFeedbackEntry,
  readFeedbackEntries,
} from '../utils/designFeedbackStorage';
import { ROLE_LABELS } from '../constants/role';

type PanelMode = 'submit' | 'recent';

interface DesignFeedbackWidgetProps {
  theme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  activeTab?: string;
  userRole?: string;
  onSubmitted?: (message: string, title?: string) => void;
  onOpenDevSpecs?: () => void;
}

export function DesignFeedbackWidget({
  theme,
  setTheme,
  activeTab,
  userRole,
  onSubmitted,
  onOpenDevSpecs,
}: DesignFeedbackWidgetProps) {
  const [open, setOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('submit');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recentEntries, setRecentEntries] = useState<DesignFeedbackEntry[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDark = isDarkTheme(theme);
  const isAdmin = userRole === 'admin';

  const close = useCallback(() => {
    setOpen(false);
    setPanelMode('submit');
  }, []);

  const refreshRecentEntries = useCallback(() => {
    setRecentEntries(readFeedbackEntries());
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    if (panelMode === 'submit') {
      queueMicrotask(() => textareaRef.current?.focus());
    }
    if (panelMode === 'recent' && isAdmin) {
      refreshRecentEntries();
    }
  }, [open, panelMode, isAdmin, refreshRecentEntries]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    persistFeedbackEntry({
      id: `feedback-${Date.now()}`,
      text: trimmed,
      submittedAt: new Date().toISOString(),
      activeTab,
      userRole,
    });
    setText('');
    setOpen(false);
    setPanelMode('submit');
    onSubmitted?.('Thanks for your feedback', 'Feedback received');
    setSubmitting(false);
  };

  const openPanel = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && isAdmin) {
        refreshRecentEntries();
      }
      return next;
    });
  };

  return createPortal(
    <div
      ref={rootRef}
      className="fixed bottom-6 right-6 z-[9000] flex flex-col items-end gap-2"
      aria-live="polite"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            key="feedback-panel"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className={cn(
              'w-[min(100vw-3rem,360px)] rounded-2xl border p-4 shadow-xl',
              isDark
                ? 'glass-panel-dark border-border bg-card/95 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-md'
                : 'border-border bg-card shadow-[0_16px_48px_rgba(0,0,0,0.12)]',
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p
                  className={cn(
                    'text-sm font-semibold leading-snug',
                    isDark ? 'text-foreground' : 'text-foreground',
                  )}
                >
                  Design feedback
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {panelMode === 'recent' ? 'Submitted feedback from all roles.' : 'Help us improve this experience.'}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close feedback panel"
                onClick={close}
                className={cn(
                  'shrink-0 rounded-lg p-1 transition-colors',
                  isDark
                    ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-slate-700',
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isAdmin && (
              <div className="mb-3 flex gap-1 rounded-lg border border-border/60 p-0.5">
                <button
                  type="button"
                  onClick={() => setPanelMode('submit')}
                  className={cn(
                    'flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                    panelMode === 'submit'
                        ? isDark
                          ? 'bg-muted text-foreground'
                          : 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPanelMode('recent');
                      refreshRecentEntries();
                    }}
                    className={cn(
                      'flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                      panelMode === 'recent'
                        ? isDark
                          ? 'bg-muted text-foreground'
                          : 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  View recent
                </button>
              </div>
            )}

            {panelMode === 'recent' && isAdmin ? (
              <div className="max-h-[min(50vh,280px)] space-y-2 overflow-y-auto pr-0.5">
                {recentEntries.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">No feedback submitted yet.</p>
                ) : (
                  recentEntries.map((entry) => (
                    <article
                      key={entry.id}
                      className={cn(
                        'rounded-xl border px-3 py-2.5',
                        isDark ? 'border-border/60 bg-background/50' : 'border-border bg-muted',
                      )}
                    >
                      <p className="text-sm leading-relaxed text-foreground">{entry.text}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                        <span>{formatFeedbackDate(entry.submittedAt)}</span>
                        {entry.userRole && (
                          <>
                            <span aria-hidden>·</span>
                            <span>{ROLE_LABELS[entry.userRole as keyof typeof ROLE_LABELS] ?? entry.userRole}</span>
                          </>
                        )}
                        {entry.activeTab && (
                          <>
                            <span aria-hidden>·</span>
                            <span className="capitalize">{entry.activeTab.replace(/-/g, ' ')}</span>
                          </>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label htmlFor="design-feedback-text" className="sr-only">
                  What would you improve about this design?
                </label>
                <textarea
                  ref={textareaRef}
                  id="design-feedback-text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  rows={4}
                  placeholder="What would you improve about this design?"
                  className={cn(
                    'w-full resize-none rounded-xl border px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors',
                    'placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40',
                    isDark
                      ? 'border-border bg-background/80 text-foreground'
                      : 'border-border bg-muted text-foreground',
                  )}
                />

                <div className="mt-3 flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={close}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="cta" size="sm" disabled={!text.trim() || submitting}>
                    Submit
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {onOpenDevSpecs && (
        <button
          type="button"
          onClick={onOpenDevSpecs}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium shadow-lg transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 cursor-pointer',
            isDark
              ? 'border-border bg-card/90 text-foreground backdrop-blur-md hover:bg-muted/80'
              : 'border-border bg-card text-foreground hover:bg-accent',
          )}
        >
          <Code className="h-4 w-4 shrink-0 opacity-80" />
          <span>Dev Specs</span>
        </button>
      )}

      <button
        type="button"
        aria-expanded={open}
        aria-controls="design-feedback-text"
        onClick={openPanel}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium shadow-lg transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 cursor-pointer',
          isDark
            ? 'border-border bg-card/90 text-foreground backdrop-blur-md hover:bg-muted/80'
            : 'border-border bg-card text-foreground hover:bg-accent',
          open && 'ring-2 ring-ring/30',
        )}
      >
        <MessageSquarePlus className="h-4 w-4 shrink-0 opacity-80" />
        <span>Leave feedback</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title="Toggle theme"
        aria-label="Toggle theme"
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-lg transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 cursor-pointer',
          isDark
            ? 'border-border bg-card/90 text-foreground backdrop-blur-md hover:bg-muted/80'
            : 'border-border bg-card text-foreground hover:bg-accent',
        )}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>,
    document.body,
  );
}
