import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationBannerProps {
  isDark: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}

export function NotificationBanner({ isDark, onEnable, onDismiss }: NotificationBannerProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl px-3 py-2 mb-2 text-[12px] relative z-20',
        isDark
          ? 'bg-brand-green/10 border border-brand-green/20 text-foreground'
          : 'bg-brand-green/5 border border-brand-green/20 text-foreground',
      )}
    >
      <div className="flex items-center gap-2">
        <Bell className="h-3.5 w-3.5 text-brand-green" />
        <span>Get notified when Mitra completes your task.</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onEnable}
          className={cn(
            'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer',
            isDark
              ? 'bg-brand-green text-[#030d0a] hover:bg-brand-green-hover'
              : 'bg-brand-green text-[#030d0a] hover:bg-brand-green-hover',
          )}
        >
          Enable
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            'px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer',
            isDark
              ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          )}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
