import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Announcement } from '../types';
import { countUnread, visibleAnnouncements } from '../utils/announcements';
import { AnnouncementsPanel } from './dev/components/announcements';

interface AnnouncementsBellProps {
  announcements: Announcement[];
  /** Pin "now" so relative stamps match the rest of the view. */
  now?: Date;
  onOpenAnnouncement?: (announcement: Announcement) => void;
  className?: string;
}

/**
 * Announcements entry point — bell with an unread count that opens the feed as a dropdown.
 * Deliberately not part of the left sidebar: it lives in the view that hosts it.
 */
export function AnnouncementsBell({
  announcements,
  now,
  onOpenAnnouncement,
  className,
}: AnnouncementsBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reference = useMemo(() => now ?? new Date(), [now]);
  const feed = useMemo(() => visibleAnnouncements(announcements, reference), [announcements, reference]);
  const unread = countUnread(feed);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={unread > 0 ? `Announcements, ${unread} unread` : 'Announcements'}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors',
          'hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          isOpen && 'bg-accent text-foreground',
        )}
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-border bg-brand-green/15 px-1 text-[10px] font-semibold leading-none text-brand-green"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Announcements"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[360px] max-w-[calc(100vw-2rem)] shadow-[0_12px_32px_rgba(0,0,0,0.24)] sm:w-[380px]"
        >
          <AnnouncementsPanel
            announcements={feed}
            maxHeight={340}
            now={reference}
            onOpen={(announcement) => {
              setIsOpen(false);
              onOpenAnnouncement?.(announcement);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default AnnouncementsBell;
