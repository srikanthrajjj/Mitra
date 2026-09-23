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
      <!-- Unread row, expanded -->
      <li>
        <button class="mitra-announcement mitra-announcement--unread mitra-announcement--open"
                type="button" aria-expanded="true" aria-controls="ann-1-panel" id="ann-1-trigger">
          <span class="mitra-announcement__icon mitra-announcement__icon--critical">
            <svg aria-hidden="true"><!-- alert-octagon --></svg>
          </span>
          <span class="mitra-announcement__body">
            <span class="mitra-announcement__head">
              <span class="mitra-announcement__label">Production deploys paused</span>
              <span class="mitra-announcement__dot" aria-hidden="true"></span>
              <svg class="mitra-announcement__chevron" aria-hidden="true"><!-- chevron-down --></svg>
            </span>
            <span class="mitra-announcement__summary">Deploys to POC RAVI are on hold while a failed migration is cleared.</span>
            <span class="mitra-announcement__meta">
              <span class="mitra-announcement__chip">Organisation</span>
              <span class="mitra-announcement__sep" aria-hidden="true">·</span>
              <span title="23 Sep 2026, 09:12">35m ago</span>
            </span>
          </span>
        </button>
        <div class="mitra-announcement__panel mitra-announcement__panel--unread"
             id="ann-1-panel" role="region" aria-labelledby="ann-1-trigger">
          <p class="mitra-announcement__description">A schema migration on the Asset Recovery tables failed partway through…</p>
          <a class="mitra-announcement__link" href="/projects/asset-recovery/status">
            Open <svg aria-hidden="true"><!-- arrow-up-right --></svg>
          </a>
        </div>
      </li>

      <!-- Read row, collapsed -->
      <li>
        <button class="mitra-announcement" type="button" aria-expanded="false" aria-controls="ann-2-panel" id="ann-2-trigger">
          <span class="mitra-announcement__icon mitra-announcement__icon--warning">
            <svg aria-hidden="true"><!-- alert-triangle --></svg>
          </span>
          <span class="mitra-announcement__body">
            <span class="mitra-announcement__head">
              <span class="mitra-announcement__label">Planned maintenance — Saturday 02:00 UTC</span>
              <svg class="mitra-announcement__chevron" aria-hidden="true"></svg>
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
        </button>
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
//   isRead === false            -> green rail, bold label, dot, and the "N new" count`;
