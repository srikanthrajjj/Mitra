import { Megaphone, X } from 'lucide-react';

const ANNOUNCEMENT_DISMISSED_KEY = 'mitra_announcement_dismissed_v2';

export function readAnnouncementDismissed(): boolean {
  try {
    return localStorage.getItem(ANNOUNCEMENT_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function persistAnnouncementDismissed(dismissed: boolean): void {
  try {
    localStorage.setItem(ANNOUNCEMENT_DISMISSED_KEY, String(dismissed));
  } catch {
    /* ignore storage errors */
  }
}

interface AnnouncementBarProps {
  onDismiss: () => void;
}

export function AnnouncementBar({ onDismiss }: AnnouncementBarProps) {
  return (
    <aside
      role="status"
      aria-label="Product announcement"
      className="relative z-20 shrink-0 px-3 pt-3 sm:px-4"
    >
      <div
        className="flex w-full items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)] sm:items-center sm:px-4"
      >
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-brand-green sm:mt-0">
          <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
        </span>

        <p className="min-w-0 flex-1 text-sm leading-5">
          <span className="mr-2 font-semibold text-brand-green">What’s new</span>
          <span className="text-muted-foreground">
            System Properties management and a redesigned Capabilities overview are now live in Mitra.
          </span>
        </p>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss announcement"
          className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

export default AnnouncementBar;
