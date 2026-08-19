import { Megaphone, X } from 'lucide-react';

const ANNOUNCEMENT_DISMISSED_KEY = 'mitra_announcement_dismissed_v1';

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
    <div
      role="status"
      className="relative z-20 flex w-full shrink-0 items-center gap-3 bg-brand-green px-4 py-2 text-[#030d0a] sm:px-6"
    >
      <Megaphone className="h-4 w-4 shrink-0" />
      <p className="min-w-0 flex-1 truncate text-xs font-medium sm:text-sm">
        <span className="font-bold">New —</span> System Properties management and a redesigned Capabilities
        overview are now live in Mitra.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss announcement"
        className="shrink-0 rounded-md p-1 text-[#030d0a]/70 transition-colors hover:bg-[#030d0a]/10 hover:text-[#030d0a]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default AnnouncementBar;
