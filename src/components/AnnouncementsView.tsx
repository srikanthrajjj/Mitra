import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Building2, Clock, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Announcement, ResolvedTheme } from '../types';
import {
  ANNOUNCEMENT_LEVEL_LABEL,
  ANNOUNCEMENT_TYPE_LABEL,
  announcementParagraphs,
  announcementReadMinutes,
  formatAnnouncementDate,
  formatAnnouncementExpiry,
  formatAnnouncementTime,
  toAnnouncementLevel,
  toAnnouncementType,
  visibleAnnouncements,
} from '../utils/announcements';
import { AnnouncementCover } from './AnnouncementCover';
import './announcements-view.css';

interface AnnouncementsViewProps {
  theme: ResolvedTheme;
  announcements: Announcement[];
  /** Pin "now" so stamps match the rest of the app. */
  now?: Date;
  /** Deep link in: open straight to this announcement. */
  initialAnnouncementId?: string | null;
  /** Lets the host drop the deep link, so returning to the tab shows the index again. */
  onArticleClosed?: () => void;
}

/** Shared meta line: scope, when it was posted, how long it takes to read. */
function MetaLine({
  announcement,
  now,
  className,
}: {
  announcement: Announcement;
  now: Date;
  className?: string;
}) {
  const level = toAnnouncementLevel(announcement.level);
  const expiry = formatAnnouncementExpiry(announcement, now);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground',
        className,
      )}
    >
      <span className="inline-flex items-center gap-1">
        <Building2 className="h-3 w-3 shrink-0" aria-hidden />
        {ANNOUNCEMENT_LEVEL_LABEL[level]}
      </span>
      <span aria-hidden>·</span>
      <time dateTime={announcement.createdAt}>{formatAnnouncementTime(announcement.createdAt, now)}</time>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3 shrink-0" aria-hidden />
        {announcementReadMinutes(announcement)} min read
      </span>
      {expiry && (
        <>
          <span aria-hidden>·</span>
          <span style={{ color: 'var(--ann-ink)' }}>{expiry}</span>
        </>
      )}
    </div>
  );
}

function AnnouncementCard({
  announcement,
  now,
  onOpen,
  featured = false,
}: {
  announcement: Announcement;
  now: Date;
  onOpen: () => void;
  featured?: boolean;
}) {
  const type = toAnnouncementType(announcement.type);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn('mitra-ann', `mitra-ann--${type}`, 'mitra-ann__card')}
    >
      <AnnouncementCover
        announcement={announcement}
        glyph={featured ? '13rem' : '7rem'}
        className={cn('shrink-0 rounded-none border-0', featured ? 'h-44 sm:h-56' : 'h-28')}
      />

      <div className={cn('flex min-w-0 flex-1 flex-col gap-2', featured ? 'p-5' : 'p-4')}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mitra-ann__chip">{ANNOUNCEMENT_TYPE_LABEL[type]}</span>
          {!announcement.isRead && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-green">
              New
            </span>
          )}
        </div>

        <h3
          className={cn(
            'font-display font-semibold leading-snug text-foreground',
            featured ? 'text-xl sm:text-2xl' : 'text-[15px]',
          )}
        >
          {announcement.label}
        </h3>

        <p
          className={cn(
            'text-[13px] leading-relaxed text-muted-foreground',
            featured ? 'line-clamp-3' : 'line-clamp-2',
          )}
        >
          {announcement.shortDescription}
        </p>

        <MetaLine announcement={announcement} now={now} className="mt-auto pt-1" />
      </div>
    </button>
  );
}

function AnnouncementArticle({
  announcement,
  now,
  onBack,
}: {
  announcement: Announcement;
  now: Date;
  onBack: () => void;
}) {
  const type = toAnnouncementType(announcement.type);
  const paragraphs = announcementParagraphs(announcement);
  const redirectPath = announcement.redirectPath?.trim();

  return (
    <article className={cn('mitra-ann', `mitra-ann--${type}`, 'mx-auto w-full max-w-3xl')}>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 rounded-md text-[13px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        All announcements
      </button>

      <AnnouncementCover announcement={announcement} glyph="15rem" className="mb-7 h-48 sm:h-64" />

      <div className="flex flex-wrap items-center gap-2">
        <span className="mitra-ann__chip">{ANNOUNCEMENT_TYPE_LABEL[type]}</span>
        {!announcement.isRead && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-green">
            New
          </span>
        )}
      </div>

      <h1 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
        {announcement.label}
      </h1>

      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        {announcement.shortDescription}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
        {announcement.authorName && (
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold"
              style={{ background: 'var(--ann-tint)', color: 'var(--ann-ink)' }}
            >
              {announcement.authorName.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-[12px] leading-tight text-foreground">
              {announcement.authorName}
              {announcement.authorRole && (
                <span className="block text-[11px] text-muted-foreground">
                  {announcement.authorRole}
                </span>
              )}
            </span>
          </span>
        )}
        <span className="text-[11px] text-muted-foreground">
          {formatAnnouncementDate(announcement.createdAt)}
        </span>
      </div>

      <MetaLine announcement={announcement} now={now} className="mt-3" />

      <div className="mitra-ann__rule my-7" aria-hidden />

      <div className="mitra-ann__body">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
        ) : (
          <p>{announcement.shortDescription}</p>
        )}
      </div>

      {redirectPath && (
        <a href={redirectPath} className="mitra-ann__cta mt-7">
          Open in Mitra
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      )}
    </article>
  );
}

/**
 * The announcements reader: an index of covered cards, and a full article for any one of them.
 * Unlike the banner and the bell panel, nothing is filtered out by dismissal here — this is the
 * archive, so everything the API still considers live is readable.
 */
export default function AnnouncementsView({
  theme,
  announcements,
  now,
  initialAnnouncementId = null,
  onArticleClosed,
}: AnnouncementsViewProps) {
  void theme;
  const reference = useMemo(() => now ?? new Date(), [now]);
  const [openId, setOpenId] = useState<string | null>(initialAnnouncementId);

  const feed = useMemo(
    () => visibleAnnouncements(announcements, reference),
    [announcements, reference],
  );
  const open = feed.find((item) => item._id === openId) ?? null;

  const [featured, ...rest] = feed;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-transparent px-4 py-8 md:px-8 lg:px-12">
      {open ? (
        <AnnouncementArticle
          announcement={open}
          now={reference}
          onBack={() => {
            setOpenId(null);
            onArticleClosed?.();
          }}
        />
      ) : (
        <div className="mx-auto w-full max-w-5xl">
          <header className="mb-8">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Announcements
            </h1>
            <p className="mt-2 text-[14px] text-muted-foreground">
              Releases, incidents and maintenance for your Mitra workspace.
            </p>
          </header>

          {feed.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
              <Megaphone className="mb-3 h-8 w-8 text-muted-foreground/40" aria-hidden />
              <p className="text-sm font-medium text-foreground">No announcements yet</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                New announcements for your workspace will appear here.
              </p>
            </div>
          ) : (
            <>
              <AnnouncementCard
                announcement={featured}
                now={reference}
                featured
                onOpen={() => setOpenId(featured._id)}
              />

              {rest.length > 0 && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((announcement) => (
                    <AnnouncementCard
                      key={announcement._id}
                      announcement={announcement}
                      now={reference}
                      onOpen={() => setOpenId(announcement._id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
