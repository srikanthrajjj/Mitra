import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { Announcement, ResolvedTheme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { AnnouncementsPanel } from './dev/components/announcements';

interface AnnouncementsModalProps {
  theme: ResolvedTheme;
  isOpen: boolean;
  onClose: () => void;
  /**
   * The whole feed, including announcements dismissed from the home banner. Closing the
   * banner means "not here, not now" — this is where they stay readable.
   */
  announcements: Announcement[];
  now?: Date;
  onOpenAnnouncement?: (announcement: Announcement) => void;
  /** Opens the full reader. The panel is the glance; the reader is the archive. */
  onSeeAll?: () => void;
}

export function AnnouncementsModal({
  theme,
  isOpen,
  onClose,
  announcements,
  now,
  onOpenAnnouncement,
  onSeeAll,
}: AnnouncementsModalProps) {
  const isDark = isDarkTheme(theme);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9500] bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Announcements"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={cn(
              'fixed left-1/2 top-1/2 z-[9600] w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2',
              isDark ? 'dark' : 'light',
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close announcements"
              className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <AnnouncementsPanel
              announcements={announcements}
              theme={theme}
              maxHeight="min(60vh, 460px)"
              now={now}
              /* isRead is server-owned and nothing writes it yet, so an Unread tab would lie. */
              showFilters={false}
              onOpen={(announcement) => {
                onClose();
                onOpenAnnouncement?.(announcement);
              }}
              className="shadow-2xl"
            />

            {onSeeAll && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSeeAll();
                }}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-[13px] font-medium text-foreground shadow-2xl transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                See all announcements
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default AnnouncementsModal;
