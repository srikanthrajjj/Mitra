import {
  AlertOctagon,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Info,
  type LucideIcon,
} from 'lucide-react';
import type { Announcement, AnnouncementType } from '../types';
import {
  ANNOUNCEMENT_LEVEL_LABEL,
  ANNOUNCEMENT_TYPE_LABEL,
  formatAnnouncementTime,
  formatAnnouncementTimestamp,
  toAnnouncementLevel,
  toAnnouncementType,
} from '../utils/announcements';

const TYPE_ICON: Record<AnnouncementType, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  critical: AlertOctagon,
};

interface AnnouncementBarProps {
  announcement: Announcement;
  now?: Date;
}

export function AnnouncementBar({ announcement, now = new Date() }: AnnouncementBarProps) {
  const type = toAnnouncementType(announcement.type);
  const level = toAnnouncementLevel(announcement.level);
  const Icon = TYPE_ICON[type];
  const relativeTime = formatAnnouncementTime(announcement.createdAt, now);
  const exactTime = formatAnnouncementTimestamp(announcement.createdAt);

  return (
    <aside
      role="status"
      aria-label="Product announcement"
      className="w-full"
    >
      <div
        className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-3 text-foreground shadow-[0_4px_10px_rgba(0,0,0,0.12)] sm:items-center sm:gap-4 sm:p-4"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-brand-green sm:h-12 sm:w-12">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1 font-sans">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex rounded-md bg-brand-green/10 px-2 py-0.5 text-[10px] font-semibold leading-4 text-brand-green">
              {ANNOUNCEMENT_TYPE_LABEL[type]}
            </span>
            <h2 className="text-[13px] font-semibold leading-5 text-foreground sm:text-sm">
              {announcement.label}
            </h2>
          </div>
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
      </div>
    </aside>
  );
}

export default AnnouncementBar;
