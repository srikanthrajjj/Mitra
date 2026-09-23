import type { Announcement, AnnouncementLevel, AnnouncementType } from '../types';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * The API is free to grow its vocabulary — anything the feed does not recognise reads as an
 * ordinary update rather than disappearing or rendering untoned.
 */
const TYPE_ALIASES: Record<string, AnnouncementType> = {
  info: 'info',
  information: 'info',
  update: 'info',
  release: 'info',
  announcement: 'info',
  success: 'success',
  completed: 'success',
  resolved: 'success',
  warning: 'warning',
  warn: 'warning',
  alert: 'warning',
  maintenance: 'warning',
  critical: 'critical',
  error: 'critical',
  incident: 'critical',
  outage: 'critical',
};

const LEVEL_ALIASES: Record<string, AnnouncementLevel> = {
  system: 'system',
  global: 'system',
  platform: 'system',
  org: 'org',
  organisation: 'org',
  organization: 'org',
  tenant: 'org',
  user: 'user',
  personal: 'user',
};

export function toAnnouncementType(value: string | undefined): AnnouncementType {
  return TYPE_ALIASES[(value ?? '').toLowerCase()] ?? 'info';
}

export function toAnnouncementLevel(value: string | undefined): AnnouncementLevel {
  return LEVEL_ALIASES[(value ?? '').toLowerCase()] ?? 'org';
}

/** Read out by screen readers on the severity icon, which is otherwise colour-only. */
export const ANNOUNCEMENT_TYPE_LABEL: Record<AnnouncementType, string> = {
  info: 'Update',
  success: 'Resolved',
  warning: 'Warning',
  critical: 'Critical',
};

/** Scope chip on each row — who the announcement was raised for. */
export const ANNOUNCEMENT_LEVEL_LABEL: Record<AnnouncementLevel, string> = {
  system: 'Mitra',
  org: 'Organisation',
  user: 'For you',
};

function parseTime(iso: string | undefined): number | null {
  if (!iso) return null;
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? null : time;
}

/** Has a TTL announcement passed its expireAt? Announcements without a TTL never expire. */
export function isAnnouncementExpired(announcement: Announcement, now: Date = new Date()): boolean {
  if (!announcement.isTTL) return false;
  const end = parseTime(announcement.expireAt);
  return end !== null && end <= now.getTime();
}

/** What the user should see: active, still live, newest first. */
export function visibleAnnouncements(
  announcements: Announcement[],
  now: Date = new Date(),
): Announcement[] {
  return announcements
    .filter((announcement) => announcement.active !== false && !isAnnouncementExpired(announcement, now))
    .sort((a, b) => (parseTime(b.createdAt) ?? 0) - (parseTime(a.createdAt) ?? 0));
}

export function countUnread(announcements: Announcement[]): number {
  return announcements.filter((announcement) => !announcement.isRead).length;
}

/** Short relative stamp for the row meta line: "Just now", "4h ago", "6d ago", then a date. */
export function formatAnnouncementTime(iso: string, now: Date = new Date()): string {
  const then = parseTime(iso);
  if (then === null) return '';

  const diff = now.getTime() - then;
  if (diff < MINUTE) return 'Just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;

  const date = new Date(then);
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/** Exact stamp, shown on hover/focus so the relative time is never the only source. */
export function formatAnnouncementTimestamp(iso: string): string {
  const then = parseTime(iso);
  if (then === null) return '';
  return new Date(then).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/** Expiry nudge — only for TTL announcements about to drop out of the feed. */
export function formatAnnouncementExpiry(
  announcement: Announcement,
  now: Date = new Date(),
): string | null {
  if (!announcement.isTTL) return null;

  const end = parseTime(announcement.expireAt);
  if (end === null) return null;

  const remaining = end - now.getTime();
  if (remaining <= 0) return 'Expired';
  if (remaining > 7 * DAY) return null;
  if (remaining < HOUR) return 'Expires within the hour';
  if (remaining < DAY) return `Expires in ${Math.floor(remaining / HOUR)}h`;

  const days = Math.round(remaining / DAY);
  return days <= 1 ? 'Expires tomorrow' : `Expires in ${days} days`;
}

export type AnnouncementGroupId = 'today' | 'yesterday' | 'week' | 'earlier';

export interface AnnouncementGroup {
  id: AnnouncementGroupId;
  label: string;
  items: Announcement[];
}

const GROUP_LABELS: Record<AnnouncementGroupId, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'Earlier this week',
  earlier: 'Earlier',
};

const GROUP_ORDER: AnnouncementGroupId[] = ['today', 'yesterday', 'week', 'earlier'];

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Buckets an already-sorted feed by recency, so a long list reads as a timeline instead of an
 * undifferentiated stack. Empty buckets are dropped.
 */
export function groupAnnouncements(
  announcements: Announcement[],
  now: Date = new Date(),
): AnnouncementGroup[] {
  const today = startOfDay(now);
  const yesterday = today - DAY;
  const weekStart = today - 6 * DAY;

  const buckets = new Map<AnnouncementGroupId, Announcement[]>();
  for (const announcement of announcements) {
    const created = parseTime(announcement.createdAt) ?? 0;
    const id: AnnouncementGroupId =
      created >= today ? 'today' : created >= yesterday ? 'yesterday' : created >= weekStart ? 'week' : 'earlier';
    const bucket = buckets.get(id);
    if (bucket) bucket.push(announcement);
    else buckets.set(id, [announcement]);
  }

  return GROUP_ORDER.filter((id) => buckets.has(id)).map((id) => ({
    id,
    label: GROUP_LABELS[id],
    items: buckets.get(id) ?? [],
  }));
}
