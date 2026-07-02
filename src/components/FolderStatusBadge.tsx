import { FolderStatus } from '../types';
import { FOLDER_STATUS_CONFIG } from '../utils/folderStatus';
import { cn } from '@/lib/utils';

const INLINE_DOT_CLASS: Record<FolderStatus, string> = {
  draft: 'border border-dashed border-muted-foreground/45 bg-transparent',
  in_review: 'bg-amber-400',
  accepted: 'bg-emerald-400',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-400',
  changes_requested: 'bg-orange-400',
};

const INLINE_TEXT_CLASS: Record<FolderStatus, string> = {
  draft: 'text-muted-foreground/80',
  in_review: 'text-amber-500/90',
  accepted: 'text-emerald-500/90',
  approved: 'text-emerald-500/90',
  rejected: 'text-red-400/90',
  changes_requested: 'text-orange-500/90',
};

export function FolderStatusBadge({
  status,
  isDark = true,
  className,
  size = 'sm',
  variant = 'pill',
}: {
  status: FolderStatus;
  isDark?: boolean;
  className?: string;
  size?: 'sm' | 'xs';
  variant?: 'pill' | 'inline';
}) {
  const cfg = FOLDER_STATUS_CONFIG[status];

  if (variant === 'inline') {
    return (
      <span
        className={cn('inline-flex items-center gap-1 shrink-0', className)}
        title={cfg.label}
      >
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full shrink-0',
            INLINE_DOT_CLASS[status],
            !isDark && status === 'in_review' && 'bg-amber-500',
          )}
        />
        <span className={cn('text-[10px] font-medium leading-none', INLINE_TEXT_CLASS[status])}>
          {cfg.shortLabel}
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border font-semibold uppercase tracking-wider',
        size === 'xs' ? 'px-1 py-px text-[7px]' : 'px-1.5 py-0.5 text-[8px]',
        isDark ? cfg.dark : cfg.light,
        className,
      )}
    >
      {cfg.shortLabel}
    </span>
  );
}
