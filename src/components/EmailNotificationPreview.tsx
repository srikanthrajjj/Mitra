import { ExternalLink, Mail } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';

interface EmailNotificationPreviewProps {
  theme?: Theme;
  senderName: string;
  artifactName: string;
  recipientEmail: string;
  guestUrl: string;
  onReview?: () => void;
  compact?: boolean;
}

export function EmailNotificationPreview({
  theme = 'dark',
  senderName,
  artifactName,
  recipientEmail,
  guestUrl,
  onReview,
  compact = false,
}: EmailNotificationPreviewProps) {
  const isDark = isDarkTheme(theme);

  const handleReview = () => {
    if (onReview) {
      onReview();
      return;
    }
    window.open(guestUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={cn(
        'rounded-xl border',
        compact ? 'p-3' : 'p-4',
        isDark ? 'border-white/[0.08] bg-neutral-900/50' : 'border-border/60 bg-muted/20',
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            isDark ? 'bg-brand-green/15 text-brand-green' : 'bg-primary/10 text-primary',
          )}
        >
          <Mail className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('text-[11px] font-medium uppercase tracking-wide', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Email notification (simulated)
          </p>
          <p className={cn('truncate text-xs', isDark ? 'text-slate-300' : 'text-slate-700')}>
            To: {recipientEmail}
          </p>
        </div>
      </div>

      <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-200' : 'text-slate-800')}>
        <strong>{senderName}</strong> shared <strong>{artifactName}</strong> for your review.
      </p>
      <p className={cn('mt-2 text-xs', isDark ? 'text-slate-400' : 'text-slate-600')}>
        Open the link below to read, comment, and approve — no Mitra account required.
      </p>

      <button
        type="button"
        onClick={handleReview}
        className={cn(
          'mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition-all',
          isDark ? 'btn-dark-primary active:scale-[0.98]' : 'bg-primary text-primary-foreground hover:bg-primary/90',
        )}
      >
        Review
        <ExternalLink className="h-3.5 w-3.5 opacity-80" />
      </button>

      {!compact && (
        <p className={cn('mt-2 break-all text-[10px]', isDark ? 'text-slate-500' : 'text-slate-400')}>
          {guestUrl}
        </p>
      )}
    </div>
  );
}
