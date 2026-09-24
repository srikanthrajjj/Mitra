import { useMemo } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Info,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Announcement, AnnouncementType } from '../../../../types';
import {
  ANNOUNCEMENT_LEVEL_LABEL,
  ANNOUNCEMENT_TYPE_LABEL,
  formatAnnouncementExpiry,
  formatAnnouncementTime,
  formatAnnouncementTimestamp,
  groupAnnouncements,
  toAnnouncementLevel,
  toAnnouncementType,
  visibleAnnouncements,
} from '../../../../utils/announcements';
import './announcements.css';

const TYPE_ICON: Record<AnnouncementType, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  critical: AlertOctagon,
};

interface AnnouncementRowProps {
  announcement: Announcement;
  now: Date;
  onOpen?: (announcement: Announcement) => void;
}

/**
 * One row of the feed: label, a two-line summary and the meta line. The full description is
 * deliberately not shown here — a row carrying a redirectPath is itself the link to the detail.
 */
function AnnouncementRow({ announcement, now, onOpen }: AnnouncementRowProps) {
  const type = toAnnouncementType(announcement.type);
  const level = toAnnouncementLevel(announcement.level);
  const Icon = TYPE_ICON[type];

  const isUnread = !announcement.isRead;
  const expiry = formatAnnouncementExpiry(announcement, now);
  const relative = formatAnnouncementTime(announcement.createdAt, now);
  const exact = formatAnnouncementTimestamp(announcement.createdAt);
  const redirectPath = announcement.redirectPath?.trim();

  const body = (
    <>
      <span className={cn('mitra-announcement__icon', `mitra-announcement__icon--${type}`)}>
        <Icon aria-hidden="true" />
      </span>

      <span className="mitra-announcement__body">
        <span className="mitra-announcement__head">
          <span className="mitra-announcement__label">{announcement.label}</span>
          {isUnread && <span className="mitra-announcement__dot" aria-hidden="true" />}
          {redirectPath && <ArrowUpRight className="mitra-announcement__go" aria-hidden="true" />}
        </span>

        <span className="mitra-announcement__summary">{announcement.shortDescription}</span>

        <span className="mitra-announcement__meta">
          <span className="mitra-announcement__chip">{ANNOUNCEMENT_LEVEL_LABEL[level]}</span>
          <span className="mitra-announcement__sep" aria-hidden="true">
            ·
          </span>
          <span title={exact}>{relative}</span>
          {expiry && (
            <>
              <span className="mitra-announcement__sep" aria-hidden="true">
                ·
              </span>
              <span className="mitra-announcement__expiry">{expiry}</span>
            </>
          )}
          <span className="sr-only">
            {ANNOUNCEMENT_TYPE_LABEL[type]}
            {isUnread ? ', unread' : ''}
            {exact ? `, posted ${exact}` : ''}
          </span>
        </span>
      </span>
    </>
  );

  return (
    <li>
      {redirectPath ? (
        <a
          href={redirectPath}
          className={cn('mitra-announcement', isUnread && 'mitra-announcement--unread')}
          onClick={(event) => {
            if (!onOpen) return;
            event.preventDefault();
            onOpen(announcement);
          }}
        >
          {body}
        </a>
      ) : (
        <div
          className={cn(
            'mitra-announcement',
            'mitra-announcement--static',
            isUnread && 'mitra-announcement--unread',
          )}
        >
          {body}
        </div>
      )}
    </li>
  );
}

function AnnouncementSkeleton() {
  return (
    <div className="mitra-announcements__skeleton" aria-hidden="true">
      <span className="mitra-announcements__skeleton-icon" />
      <span className="mitra-announcements__skeleton-body">
        <span className="mitra-announcements__skeleton-line mitra-announcements__skeleton-line--title" />
        <span className="mitra-announcements__skeleton-line" />
        <span className="mitra-announcements__skeleton-line mitra-announcements__skeleton-line--meta" />
      </span>
    </div>
  );
}

export interface AnnouncementListProps {
  announcements: Announcement[];
  isLoading?: boolean;
  error?: string | null;
  /** Called instead of following redirectPath, so the host can route in-app. */
  onOpen?: (announcement: Announcement) => void;
  /** Day headings (Today / Yesterday / Earlier). Off for short embedded lists. */
  grouped?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
  /** Pin "now" so relative stamps stay stable in tests and previews. */
  now?: Date;
  className?: string;
}

/**
 * The announcements feed itself — read-only. Inactive and expired TTL announcements are dropped,
 * the rest read newest first. Wrap it in AnnouncementsPanel for header and filter chrome.
 */
export function AnnouncementList({
  announcements,
  isLoading = false,
  error = null,
  onOpen,
  grouped = true,
  emptyTitle = 'No announcements',
  emptyHint = "You're all caught up — new announcements will appear here.",
  now,
  className,
}: AnnouncementListProps) {
  const reference = useMemo(() => now ?? new Date(), [now]);

  const feed = useMemo(
    () => visibleAnnouncements(announcements, reference),
    [announcements, reference],
  );
  const groups = useMemo(
    () => (grouped ? groupAnnouncements(feed, reference) : [{ id: 'all', label: '', items: feed }]),
    [feed, grouped, reference],
  );

  if (isLoading) {
    return (
      <div className={className} aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading announcements</span>
        <AnnouncementSkeleton />
        <AnnouncementSkeleton />
        <AnnouncementSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('mitra-announcements__state', className)} role="alert">
        <AlertTriangle aria-hidden="true" />
        <p className="mitra-announcements__state-title">Announcements unavailable</p>
        <p className="mitra-announcements__state-hint">{error}</p>
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className={cn('mitra-announcements__state', className)}>
        <Megaphone aria-hidden="true" />
        <p className="mitra-announcements__state-title">{emptyTitle}</p>
        <p className="mitra-announcements__state-hint">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {groups.map((group) => (
        <section key={group.id} aria-label={group.label || 'Announcements'}>
          {group.label && <h3 className="mitra-announcements__group-label">{group.label}</h3>}
          <ul className="mitra-announcements__list">
            {group.items.map((announcement) => (
              <AnnouncementRow
                key={announcement._id}
                announcement={announcement}
                now={reference}
                onOpen={onOpen}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default AnnouncementList;
