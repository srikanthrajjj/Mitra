import { CheckCircle2, ChevronRight, Clock, Mail, MessageSquare } from 'lucide-react';
import { StakeholderReview } from '../types';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/lib/utils';

interface StakeholderSidebarProps {
  reviews: StakeholderReview[];
  selectedReviewId?: string | null;
  onContactArchitect: () => void;
  onSelectReview?: (review: StakeholderReview) => void;
}

function reviewCardClass(isSelected: boolean, variant: 'pending' | 'done') {
  return cn(
    'stakeholder-review-card group w-full text-left',
    variant === 'pending' ? 'stakeholder-review-card--pending' : 'stakeholder-review-card--done',
    isSelected && 'stakeholder-review-card--selected',
  );
}

function PendingReviewCard({
  review,
  isSelected,
  onSelect,
}: {
  review: StakeholderReview;
  isSelected: boolean;
  onSelect?: (review: StakeholderReview) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(review)}
      className={reviewCardClass(isSelected, 'pending')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Your review
            </span>
          </div>
          <p className="text-[13px] font-semibold leading-snug text-foreground">
            {review.solutionTitle}
          </p>
          <p className="text-[11px] text-muted-foreground">{review.artifactName}</p>
        </div>
        <ChevronRight className="mt-4 h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
      </div>
      <span className="mt-2.5 inline-flex items-center rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground">
        Tap to review
      </span>
    </button>
  );
}

function CompletedReviewCard({
  review,
  isSelected,
  onSelect,
}: {
  review: StakeholderReview;
  isSelected: boolean;
  onSelect?: (review: StakeholderReview) => void;
}) {
  const isApproved = review.status === 'approved';
  const StatusIcon = isApproved ? CheckCircle2 : MessageSquare;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(review)}
      className={reviewCardClass(isSelected, 'done')}
    >
      <p className="text-[12px] font-medium text-sidebar-foreground/80 group-hover:text-foreground">
        {review.solutionTitle}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{review.artifactName}</p>
      <span
        className={cn(
          'mt-2 inline-flex items-center gap-1 text-[10px]',
          isApproved ? 'text-emerald-400/80' : 'text-muted-foreground',
        )}
      >
        <StatusIcon className="h-3 w-3 shrink-0" />
        {review.completedLabel ?? (isApproved ? 'Approved' : 'Changes requested')}
      </span>
    </button>
  );
}

export function StakeholderSidebar({
  reviews,
  selectedReviewId = null,
  onContactArchitect,
  onSelectReview,
}: StakeholderSidebarProps) {
  const pending = reviews.filter((r) => r.status === 'awaiting');
  const completed = reviews.filter((r) => r.status !== 'awaiting');

  return (
    <div className="stakeholder-sidebar flex h-full flex-col px-3 py-4">
      <div className="mb-4 px-1">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          My reviews
        </h2>
        {pending.length > 0 && (
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">{pending.length}</span>
            {' '}waiting on you — no technical setup needed.
          </p>
        )}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto">
        {pending.length > 0 && (
          <section className="space-y-2">
            {pending.map((review) => (
              <div key={review.id}>
                <PendingReviewCard
                  review={review}
                  isSelected={selectedReviewId === review.id}
                  onSelect={onSelectReview}
                />
              </div>
            ))}
          </section>
        )}

        {completed.length > 0 && (
          <section>
            <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/55">
              Completed
            </p>
            <div className="space-y-2">
              {completed.map((review) => (
                <div key={review.id}>
                  <CompletedReviewCard
                    review={review}
                    isSelected={selectedReviewId === review.id}
                    onSelect={onSelectReview}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-sidebar-border/50 bg-sidebar-accent/20 p-3">
        <p className="mb-2 text-[10px] text-muted-foreground">Questions about a review?</p>
        <Button
          variant="outline"
          className="h-10 min-h-[40px] w-full gap-2 border-primary/20 text-[12px] hover:bg-primary/5"
          onClick={onContactArchitect}
        >
          <Mail className="h-4 w-4 text-primary/80" />
          Message your architect
        </Button>
      </div>
    </div>
  );
}
