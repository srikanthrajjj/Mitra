import type { DevComponentEntry } from '../types';
import { AnnouncementsShowcase } from './AnnouncementsShowcase';

export const announcementsEntry: DevComponentEntry = {
  meta: {
    id: 'announcements',
    name: 'Announcements',
    description:
      'Read-only announcement feed — severity tone, scope chip, unread rail, day grouping and an optional link out.',
    tags: ['feed', 'announcements', 'notifications', 'list'],
  },
  Showcase: AnnouncementsShowcase,
};

export { AnnouncementsShowcase };
export { AnnouncementsPanel, type AnnouncementsPanelProps, type AnnouncementFilter } from './AnnouncementsPanel';
export { AnnouncementList, type AnnouncementListProps } from './AnnouncementList';
