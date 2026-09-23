import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { DevShowcaseShell } from '../../shared/DevShowcaseShell';
import { AnnouncementList } from './AnnouncementList';
import { AnnouncementsPanel } from './AnnouncementsPanel';
import { ANNOUNCEMENTS_CSS, ANNOUNCEMENTS_HTML, ANNOUNCEMENTS_REACT } from './snippets';
import { sampleAnnouncements } from '../../../../data/announcements';
import type { Theme } from '../../../../types';
import './announcements.css';

export function AnnouncementsShowcase({ theme }: { theme?: Theme }) {
  const now = useMemo(() => new Date(), []);
  const announcements = useMemo(() => sampleAnnouncements(now), [now]);

  return (
    <DevShowcaseShell
      title="Announcements"
      description="Read-only feed of announcements from the API: severity tone, scope, unread state, relative time and an optional link out. Inactive and expired TTL rows never reach the list."
      notes={
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-mono text-foreground">label</span> is the row title,{' '}
            <span className="font-mono text-foreground">shortDescription</span> the one-line summary, and{' '}
            <span className="font-mono text-foreground">description</span> the body revealed on expand.
          </li>
          <li>
            <span className="font-mono text-foreground">type</span> drives the icon and tone — info, success,
            warning, critical. Unknown values fall back to info rather than dropping the row.
          </li>
          <li>
            <span className="font-mono text-foreground">level</span> becomes the scope chip: Mitra, Organisation,
            or For you.
          </li>
          <li>
            <span className="font-mono text-foreground">isRead</span> false gives the row a green rail, a bolder
            label, a dot, and counts towards the "N new" badge.
          </li>
          <li>
            <span className="font-mono text-foreground">active</span> false and expired{' '}
            <span className="font-mono text-foreground">isTTL</span> rows are filtered out;{' '}
            <span className="font-mono text-foreground">expireAt</span> within a week shows as an expiry note.
          </li>
          <li>
            <span className="font-mono text-foreground">redirectPath</span> renders the Open link — pass{' '}
            <span className="font-mono text-foreground">onOpen</span> to route in-app instead of following the href.
          </li>
          {theme ? (
            <li>
              Current app theme: <span className="font-mono text-foreground">{theme}</span>. Portaled usage takes a{' '}
              <span className="font-mono text-foreground">theme</span> prop so tokens resolve correctly.
            </li>
          ) : null}
        </ul>
      }
      previews={[
        {
          label: 'Panel — grouped feed',
          content: (previewTheme) => (
            <AnnouncementsPanel
              announcements={announcements}
              theme={previewTheme}
              now={now}
              maxHeight={300}
              className="w-full max-w-[380px]"
            />
          ),
        },
        {
          label: 'Inline list — no chrome',
          content: (previewTheme) => (
            <div className={cn('mitra-announcements w-full max-w-[380px]', previewTheme)}>
              <AnnouncementList announcements={announcements.slice(0, 3)} grouped={false} now={now} />
            </div>
          ),
        },
        {
          label: 'Empty',
          content: (previewTheme) => (
            <AnnouncementsPanel
              announcements={[]}
              theme={previewTheme}
              now={now}
              className="w-full max-w-[380px]"
            />
          ),
        },
        {
          label: 'Loading',
          content: (previewTheme) => (
            <AnnouncementsPanel
              announcements={[]}
              theme={previewTheme}
              now={now}
              isLoading
              className="w-full max-w-[380px]"
            />
          ),
        },
      ]}
      snippets={{
        html: ANNOUNCEMENTS_HTML,
        css: ANNOUNCEMENTS_CSS,
        react: ANNOUNCEMENTS_REACT,
      }}
    />
  );
}

export default AnnouncementsShowcase;
