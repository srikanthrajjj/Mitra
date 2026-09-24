import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Announcement, AnnouncementType } from '../types';
import { announcementVariant, toAnnouncementType } from '../utils/announcements';
import './announcements-view.css';

const TYPE_ICON: Record<AnnouncementType, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  critical: AlertOctagon,
};

/** Gradient angles, picked by the id hash so the same announcement always looks the same. */
const ANGLES = ['135deg', '215deg', '60deg', '310deg'];

interface AnnouncementCoverProps {
  announcement: Announcement;
  /** Glyph size; the watermark scales with it. */
  glyph?: string;
  className?: string;
}

/**
 * The cover for an announcement. Uses coverImage when the API supplies one, otherwise generates
 * a cover from the severity tone plus a per-id pattern — so every announcement has an identity
 * without needing an asset uploaded for it.
 */
export function AnnouncementCover({
  announcement,
  glyph = '9rem',
  className,
}: AnnouncementCoverProps) {
  const type = toAnnouncementType(announcement.type);
  const Icon = TYPE_ICON[type];
  const variant = announcementVariant(announcement);
  const cover = announcement.coverImage?.trim();

  return (
    <div
      className={cn('mitra-ann', `mitra-ann--${type}`, 'mitra-ann__cover', className)}
      style={{ ['--ann-cover-angle' as string]: ANGLES[variant] }}
    >
      {cover ? (
        <img
          src={cover}
          alt={announcement.coverAlt ?? ''}
          loading="lazy"
          className="mitra-ann__cover-img"
        />
      ) : (
        <>
          <span
            aria-hidden
            className={cn('mitra-ann__cover-pattern', `mitra-ann__cover-pattern--${variant}`)}
            style={{ color: 'var(--ann-ink)' }}
          />
          <Icon
            aria-hidden
            className="mitra-ann__cover-glyph"
            style={{ width: glyph, height: glyph }}
          />
        </>
      )}
    </div>
  );
}

export default AnnouncementCover;
