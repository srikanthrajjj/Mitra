import announcementsCss from './announcements.css?raw';

export const ANNOUNCEMENTS_HTML = `<!-- Panel: header + read/unread filter + feed -->
<section class="mitra-announcements" aria-label="Announcements">
  <header class="mitra-announcements__header">
    <div class="mitra-announcements__heading">
      <svg class="mitra-announcements__header-icon" aria-hidden="true"><!-- megaphone --></svg>
      <h2 class="mitra-announcements__title">Announcements</h2>
      <span class="mitra-announcements__count">2 new</span>
    </div>
    <div class="mitra-announcements__filters" role="tablist" aria-label="Filter announcements">
      <button class="mitra-announcements__filter mitra-announcements__filter--active" role="tab" aria-selected="true">All</button>
      <button class="mitra-announcements__filter" role="tab" aria-selected="false">Unread</button>
    </div>
  </header>

  <div class="mitra-announcements__scroll">
    <h3 class="mitra-announcements__group-label">Today</h3>
    <ul class="mitra-announcements__list">
      <!-- Unread row with a redirectPath: the row itself is the link -->
      <li>
        <a class="mitra-announcement mitra-announcement--unread" href="/projects/asset-recovery/status">
          <span class="mitra-announcement__icon mitra-announcement__icon--critical">
            <svg aria-hidden="true"><!-- alert-octagon --></svg>
          </span>
          <span class="mitra-announcement__body">
            <span class="mitra-announcement__head">
              <span class="mitra-announcement__label">Production deploys paused</span>
              <span class="mitra-announcement__dot" aria-hidden="true"></span>
              <svg class="mitra-announcement__go" aria-hidden="true"><!-- arrow-up-right --></svg>
            </span>
            <span class="mitra-announcement__summary">Deploys to POC RAVI are on hold while a failed migration is cleared.</span>
            <span class="mitra-announcement__meta">
              <span class="mitra-announcement__chip">Organisation</span>
              <span class="mitra-announcement__sep" aria-hidden="true">·</span>
              <span title="23 Sep 2026, 09:12">35m ago</span>
            </span>
          </span>
        </a>
      </li>

      <!-- Read row, no redirectPath: not a link, so it does not invite a click -->
      <li>
        <div class="mitra-announcement mitra-announcement--static">
          <span class="mitra-announcement__icon mitra-announcement__icon--warning">
            <svg aria-hidden="true"><!-- alert-triangle --></svg>
          </span>
          <span class="mitra-announcement__body">
            <span class="mitra-announcement__head">
              <span class="mitra-announcement__label">Planned maintenance — Saturday 02:00 UTC</span>
            </span>
            <span class="mitra-announcement__summary">Mitra will be read-only for roughly 45 minutes during the upgrade.</span>
            <span class="mitra-announcement__meta">
              <span class="mitra-announcement__chip">Organisation</span>
              <span class="mitra-announcement__sep" aria-hidden="true">·</span>
              <span>4h ago</span>
              <span class="mitra-announcement__sep" aria-hidden="true">·</span>
              <span class="mitra-announcement__expiry">Expires in 2 days</span>
            </span>
          </span>
        </div>
      </li>
    </ul>
  </div>
</section>`;

export const ANNOUNCEMENTS_CSS = announcementsCss;

export const ANNOUNCEMENTS_REACT = `import { useEffect, useState } from 'react';
import { AnnouncementsPanel } from '@/src/components/dev/components/announcements';
import type { Announcement, AnnouncementsResponse, ResolvedTheme } from '@/src/types';

export function AnnouncementsDropdown({ theme }: { theme: ResolvedTheme }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/announcements')
      .then((response) => {
        if (!response.ok) throw new Error('Request failed');
        return response.json() as Promise<AnnouncementsResponse>;
      })
      .then((payload) => {
        if (!cancelled) setAnnouncements(payload.data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load announcements. Try again shortly.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AnnouncementsPanel
      announcements={announcements}
      theme={theme}
      isLoading={isLoading}
      error={error}
      maxHeight={380}
      className="w-[380px]"
      onOpen={(announcement) => navigate(announcement.redirectPath ?? '/')}
    />
  );
}

// Feed rules live in src/utils/announcements.ts and run inside the component:
//   active === false            -> hidden
//   isTTL && expireAt <= now    -> hidden
//   sorted by createdAt, newest first, grouped Today / Yesterday / Earlier
//   isRead === false            -> green rail, bold label, dot, and the "N new" count
// Rows show label + a two-line summary + meta only; description is not rendered here.`;
