import {
  AlertOctagon,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Info,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Announcement, AnnouncementType } from '../types';
import {
  ANNOUNCEMENT_LEVEL_LABEL,
  formatAnnouncementTime,
  formatAnnouncementTimestamp,
  toAnnouncementLevel,
  toAnnouncementType,
} from '../utils/announcements';
import './announcement-bar.css';

const DISMISSED_KEY = 'mitra_announcements_dismissed';

/** Ids the user has closed. Kept per announcement so a new one still shows. */
export function readDismissedAnnouncements(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function persistDismissedAnnouncement(id: string): void {
  try {
    const next = Array.from(new Set([...readDismissedAnnouncements(), id]));
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
  } catch {
    /* ignore storage errors */
  }
}

const TYPE_ICON: Record<AnnouncementType, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  critical: AlertOctagon,
};

interface AnnouncementBarProps {
  announcement: Announcement;
  now?: Date;
  onDismiss?: () => void;
}

export function AnnouncementBar({ announcement, now = new Date(), onDismiss }: AnnouncementBarProps) {
  const type = toAnnouncementType(announcement.type);
  const level = toAnnouncementLevel(announcement.level);
  const Icon = TYPE_ICON[type];
  const relativeTime = formatAnnouncementTime(announcement.createdAt, now);
  const exactTime = formatAnnouncementTimestamp(announcement.createdAt);

  return (
    <aside role="status" aria-label="Product announcement" className="w-full">
      <div
        className={cn(
          'mitra-announcement-bar',
          `mitra-announcement-bar--${type}`,
          'flex w-full items-start gap-3 p-3 text-foreground sm:items-center sm:gap-4 sm:p-4',
        )}
      >
        <span className="mitra-announcement-bar__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1 font-sans">
          <h2 className="text-[13px] font-semibold leading-5 text-foreground sm:text-sm">
            {announcement.label}
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground sm:text-[13px]">
            {announcement.shortDescription}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] leading-4 text-muted-foreground sm:text-[11px]">
            <Building2 className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>{ANNOUNCEMENT_LEVEL_LABEL[level]}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={announcement.createdAt} title={exactTime}>{relativeTime}</time>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss announcement"
            className="mitra-announcement-bar__close -mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md sm:mt-0"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </aside>
  );
}

export default AnnouncementBar;
