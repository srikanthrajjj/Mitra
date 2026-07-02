import { SharePermission, StakeholderReview } from '../types';
import { loadReviewById } from './personaStorage';

export type GuestCapabilities = {
  canRead: boolean;
  canComment: boolean;
  canApprove: boolean;
  canRequestChanges: boolean;
};

/** Resolve a review for guest entry — in-memory list first, then persisted token store. */
export function resolveGuestReview(
  reviewId: string,
  liveReviews: StakeholderReview[],
): StakeholderReview | null {
  const fromLive = liveReviews.find((r) => r.id === reviewId);
  if (fromLive) return fromLive;
  return loadReviewById(reviewId);
}

/** Guest token grants scoped access to a single review only (demo/simulated ACL). */
export function getGuestCapabilities(review: StakeholderReview): GuestCapabilities {
  const permission: SharePermission = review.permission ?? 'approve';
  const pending = review.status === 'awaiting';

  return {
    canRead: true,
    canComment: pending && (permission === 'comment' || permission === 'approve'),
    canApprove: pending && permission === 'approve',
    canRequestChanges: pending && permission === 'approve',
  };
}

export function guestPermissionLabel(permission: SharePermission = 'approve'): string {
  switch (permission) {
    case 'view':
      return 'View only';
    case 'comment':
      return 'Comment';
    case 'approve':
      return 'Approve or request changes';
  }
}
