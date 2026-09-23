import { useMemo, useState, type CSSProperties } from 'react';
import { Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Announcement, ResolvedTheme } from '../../../../types';
import { countUnread, visibleAnnouncements } from '../../../../utils/announcements';
import { portalThemeClass } from '../../../../utils/theme';
import { AnnouncementList } from './AnnouncementList';
import './announcements.css';

export type AnnouncementFilter = 'all' | 'unread';

const FILTERS: { id: AnnouncementFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
];

export interface AnnouncementsPanelProps {
  announcements: Announcement[];
  /**
   * Pass the resolved theme when the panel renders in a portal (dropdown, modal) so the tokens
   * resolve against it rather than whatever surface it lands on.
   */
  theme?: ResolvedTheme;
  isLoading?: boolean;
  error?: string | null;
  /** Called instead of following redirectPath, so the host can route in-app. */
  onOpen?: (announcement: Announcement) => void;
  title?: string;
  /** Read/unread segmented control in the header. */
  showFilters?: boolean;
  /** Caps the scroll region — a dropdown wants ~360–420px, a full page none. */
  maxHeight?: number | string;
  /** Pin "now" so relative stamps stay stable in tests and previews. */
  now?: Date;
  className?: string;
  style?: CSSProperties;
}

/**
 * Announcements panel — header, unread count, read/unread filter, and the feed. Read-only: the
 * user sees what was published, nothing here writes back.
 */
export function AnnouncementsPanel({
  announcements,
  theme,
  isLoading = false,
  error = null,
  onOpen,
  title = 'Announcements',
  showFilters = true,
  maxHeight,
  now,
  className,
  style,
}: AnnouncementsPanelProps) {
  const [filter, setFilter] = useState<AnnouncementFilter>('all');
  const reference = useMemo(() => now ?? new Date(), [now]);

  const feed = useMemo(
    () => visibleAnnouncements(announcements, reference),
    [announcements, reference],
  );
  const unread = countUnread(feed);
  const items = filter === 'unread' ? feed.filter((announcement) => !announcement.isRead) : feed;

  return (
    <section
      className={cn('mitra-announcements', theme && portalThemeClass(theme), className)}
      style={style}
      aria-label={title}
    >
      <header className="mitra-announcements__header">
        <div className="mitra-announcements__heading">
          <Megaphone className="mitra-announcements__header-icon" aria-hidden="true" />
          <h2 className="mitra-announcements__title">{title}</h2>
          {unread > 0 && !isLoading && !error && (
            <span className="mitra-announcements__count">{unread} new</span>
          )}
        </div>

        {showFilters && !error && (
          <div className="mitra-announcements__filters" role="tablist" aria-label="Filter announcements">
            {FILTERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filter === id}
                onClick={() => setFilter(id)}
                className={cn(
                  'mitra-announcements__filter',
                  filter === id && 'mitra-announcements__filter--active',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      <div
        className="mitra-announcements__scroll"
        style={maxHeight === undefined ? undefined : { maxHeight }}
      >
        <AnnouncementList
          announcements={items}
          isLoading={isLoading}
          error={error}
          onOpen={onOpen}
          now={reference}
          emptyTitle={filter === 'unread' ? 'Nothing unread' : 'No announcements'}
          emptyHint={
            filter === 'unread'
              ? 'Every announcement here has been read.'
              : "You're all caught up — new announcements will appear here."
          }
        />
      </div>
    </section>
  );
}

export default AnnouncementsPanel;
