import { Briefcase, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { StakeholderReview } from '../types';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Separator } from '@/src/components/ui/separator';
import { cn } from '@/lib/utils';

interface SponsorReviewViewProps {
  review: StakeholderReview;
  onApprove?: (reviewId: string, comments?: string) => void;
  onRequestChanges?: (reviewId: string, comments?: string) => void;
}

export function SponsorReviewView({ review, onApprove, onRequestChanges }: SponsorReviewViewProps) {
  const isPending = review.status === 'awaiting';
  const isApproved = review.status === 'approved';

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border px-4 py-3',
            isPending
              ? 'border-amber-500/25 bg-amber-500/[0.07]'
              : isApproved
                ? 'border-emerald-500/20 bg-emerald-500/[0.05]'
                : 'border-border/60 bg-muted/20',
          )}
        >
          {isPending ? (
            <Briefcase className="h-5 w-5 shrink-0 text-amber-400" />
          ) : isApproved ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <MessageSquare className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {isPending
                ? 'Sponsor approval required'
                : isApproved
                  ? 'Executive summary approved'
                  : 'You requested changes'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isPending
                ? 'Business case sign-off — scope, timeline, and investment.'
                : review.completedLabel}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">{review.solutionTitle}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{review.artifactName}</h1>
        </div>

        <Separator />

        {isPending ? (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">
              As project sponsor, confirm the business case and authorize the architect to proceed
              to vendor/RFP and build phases.
            </p>

            <Card className="overflow-hidden border-border/60 shadow-none">
              <CardHeader className="border-b border-border/40 bg-muted/15 pb-4">
                <CardTitle className="text-base font-medium">Executive summary</CardTitle>
                <CardDescription className="text-xs">
                  {review.solutionTitle} — scope, timeline, and expected outcomes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-5 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {review.summaryText ?? (
                  <>
                    <p>
                      A unified HR service desk for employee requests — leave, payroll queries, and
                      policy questions — routed to the right team with clear SLAs.
                    </p>
                    <p>Target go-live: Q3. Estimated effort: 6–8 weeks after your approval to proceed.</p>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                className="h-10 min-h-[40px] min-w-[140px] text-sm"
                onClick={() => onApprove?.(review.id, 'Approved — proceed to RFP and build.')}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                className="h-10 min-h-[40px] min-w-[140px] text-sm"
                onClick={() =>
                  onRequestChanges?.(review.id, 'Please revise scope and timeline section.')
                }
              >
                Request changes
              </Button>
            </div>
          </>
        ) : (
          <Card className="border-border/60 shadow-none">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Review closed</CardTitle>
              <CardDescription>{review.completedLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No further action needed. Your architect has been notified.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
