import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';

export interface CenterToastData {
  id: string;
  message: string;
  title?: string;
}

interface CenterToastProps {
  theme: Theme;
  toast: CenterToastData | null;
  onDismiss: () => void;
  durationMs?: number;
}

export function CenterToast({
  theme,
  toast,
  onDismiss,
  durationMs = 4200,
}: CenterToastProps) {
  const isDark = isDarkTheme(theme);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss, durationMs]);

  return createPortal(
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -6 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none"
        >
          <div
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-md transition-all duration-300',
              isDark
                ? 'bg-zinc-950/90 border-brand-green/25 shadow-[0_20px_50px_rgba(0,0,0,0.6)] shadow-brand-green/5'
                : 'bg-white/90 border-emerald-200 shadow-[0_20px_50px_rgba(50,215,75,0.06)]',
            )}
          >
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                isDark
                  ? 'border-emerald-500/25 bg-emerald-500/10'
                  : 'border-emerald-200 bg-emerald-50',
              )}
            >
              <CheckCircle2
                className={cn('h-4 w-4', isDark ? 'text-emerald-400' : 'text-emerald-600')}
              />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              {toast.title && (
                <p
                  className={cn(
                    'text-sm font-semibold leading-snug',
                    isDark ? 'text-foreground' : 'text-slate-900',
                  )}
                >
                  {toast.title}
                </p>
              )}
              <p
                className={cn(
                  'text-[13px] leading-relaxed',
                  toast.title ? 'mt-1' : '',
                  isDark ? 'text-muted-foreground' : 'text-slate-600',
                )}
              >
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={onDismiss}
              className={cn(
                'shrink-0 rounded-lg p-1 transition-colors',
                isDark
                  ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
