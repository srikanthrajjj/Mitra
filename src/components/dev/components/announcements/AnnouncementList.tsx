import { useId, useMemo, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Info,
  ChevronDown,
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
  isOpen: boolean;
  now: Date;
  onToggle: () => void;
  onOpen?: (announcement: Announcement) => void;
}

/**
 * One row of the feed. Collapsed it shows label + shortDescription; expanding reveals the full
 * description and, when the announcement carries a redirectPath, the link out to it.
 */
function AnnouncementRow({ announcement, isOpen, now, onToggle, onOpen }: AnnouncementRowProps) {
  const rowId = useId();
  const type = toAnnouncementType(announcement.type);
  const level = toAnnouncementLevel(announcement.level);
  const Icon = TYPE_ICON[type];

  const isUnread = !announcement.isRead;
  const expiry = formatAnnouncementExpiry(announcement, now);
  const relative = formatAnnouncementTime(announcement.createdAt, now);
  const exact = formatAnnouncementTimestamp(announcement.createdAt);
  const hasDetail = announcement.description.trim().length > 0;
  const redirectPath = announcement.redirectPath?.trim();

  return (
    <li>
      <button
        type="button"
        id={`${rowId}-trigger`}
        aria-expanded={isOpen}
        aria-controls={`${rowId}-panel`}
        onClick={onToggle}
        className={cn(
          'mitra-announcement',
          isUnread && 'mitra-announcement--unread',
          isOpen && 'mitra-announcement--open',
        )}
      >
        <span className={cn('mitra-announcement__icon', `mitra-announcement__icon--${type}`)}>
          <Icon aria-hidden="true" />
        </span>

        <span className="mitra-announcement__body">
          <span className="mitra-announcement__head">
            <span className="mitra-announcement__label">{announcement.label}</span>
            {isUnread && <span className="mitra-announcement__dot" aria-hidden="true" />}
            <ChevronDown className="mitra-announcement__chevron" aria-hidden="true" />
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
      </button>

      {isOpen && (
        <div
          id={`${rowId}-panel`}
          role="region"
          aria-labelledby={`${rowId}-trigger`}
          className={cn('mitra-announcement__panel', isUnread && 'mitra-announcement__panel--unread')}
        >
          {hasDetail && <p className="mitra-announcement__description">{announcement.description}</p>}
          {redirectPath && (
            <a
              href={redirectPath}
              className="mitra-announcement__link"
              onClick={(event) => {
                if (!onOpen) return;
                event.preventDefault();
                onOpen(announcement);
              }}
            >
              Open
              <ArrowUpRight aria-hidden="true" />
            </a>
          )}
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
  const [openId, setOpenId] = useState<string | null>(null);
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
                isOpen={openId === announcement._id}
                now={reference}
                onToggle={() => setOpenId((current) => (current === announcement._id ? null : announcement._id))}
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
