import { useState } from 'react';
import { CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { RequirementsDocument, RequirementsSection, StakeholderReview, StakeholderSectionComment } from '../types';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { isRequirementsReview, resolveReviewSections } from '../utils/requirementsDocument';
import {
  RequirementsDocumentReader,
  RequirementsDocumentShell,
} from './RequirementsDocumentReader';
import { cn } from '@/lib/utils';

interface StakeholderReviewViewProps {
  review: StakeholderReview;
  requirementsDocument?: RequirementsDocument;
  onApprove?: (reviewId: string, comment?: string, sectionComments?: StakeholderSectionComment[]) => void;
  onRequestChanges?: (reviewId: string, comment?: string, sectionComments?: StakeholderSectionComment[]) => void;
}

export function StakeholderReviewView({
  review,
  requirementsDocument,
  onApprove,
  onRequestChanges,
}: StakeholderReviewViewProps) {
  const isPending = review.status === 'awaiting';
  const isApproved = review.status === 'approved';
  const isRequirementsDoc = isRequirementsReview(review);
  const sections = resolveReviewSections(review, requirementsDocument);

  const [sectionComment, setSectionComment] = useState('');
  const [commentPopoverSection, setCommentPopoverSection] = useState<RequirementsSection | null>(null);
  const [inlineComments, setInlineComments] = useState<StakeholderSectionComment[]>([]);

  const handleAddComment = () => {
    if (!sectionComment.trim() || !commentPopoverSection) return;
    setInlineComments((prev) => [
      ...prev,
      {
        sectionId: commentPopoverSection.id,
        sectionTitle: commentPopoverSection.title,
        text: sectionComment.trim(),
      },
    ]);
    setSectionComment('');
    setCommentPopoverSection(null);
  };

  const commentSummary = inlineComments
    .map((c) => `${c.sectionTitle}: ${c.text}`)
    .join('; ');

  if (isPending && isRequirementsDoc && sections.length > 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background lg:flex-row">
        <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10">
          <div className="mx-auto max-w-3xl">
            <div
              className={cn(
                'mb-8 flex items-center gap-3 rounded-xl border px-4 py-3',
                'border-border/60 bg-muted/20',
              )}
            >
              <Clock className="h-5 w-5 shrink-0 text-brand-green" />
              <div>
                <p className="text-sm font-medium text-foreground">Your input is needed</p>
                <p className="text-xs text-muted-foreground">
                  Read each section below, add comments if needed, then approve or request changes.
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{review.solutionTitle}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {review.artifactName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Plain-language view — technical terms simplified for business review.
            </p>

            <div className="mt-8">
              <RequirementsDocumentShell
                title={review.artifactName}
                subtitle="Structured requirements — sign off on scope before design begins."
              >
                <RequirementsDocumentReader
                  sections={sections}
                  canComment
                  inlineComments={inlineComments}
                  commentPopoverSection={commentPopoverSection}
                  sectionComment={sectionComment}
                  onOpenComment={(section) => {
                    setCommentPopoverSection(section);
                    setSectionComment('');
                  }}
                  onCloseComment={() => setCommentPopoverSection(null)}
                  onSectionCommentChange={setSectionComment}
                  onAddComment={handleAddComment}
                />
              </RequirementsDocumentShell>
            </div>
          </div>
        </main>

        <aside className="w-full shrink-0 border-t border-border/50 bg-muted/10 px-6 py-8 lg:w-[300px] lg:border-l lg:border-t-0">
          <div className="lg:sticky lg:top-8">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your decision</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Approve to unlock the design phase, or request changes on specific sections.
            </p>
            <div className="mt-6 space-y-3">
              <Button
                className="h-11 min-h-[44px] w-full text-sm font-semibold"
                onClick={() => onApprove?.(review.id, commentSummary || undefined, inlineComments)}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                className="h-11 min-h-[44px] w-full text-sm"
                onClick={() =>
                  onRequestChanges?.(
                    review.id,
                    commentSummary || 'Please revise flagged sections.',
                    inlineComments,
                  )
                }
              >
                Request changes
              </Button>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border px-4 py-3',
            isPending
              ? 'border-border/60 bg-muted/20'
              : isApproved
                ? 'border-emerald-500/20 bg-emerald-500/[0.05]'
                : 'border-border/60 bg-muted/20',
          )}
        >
          {isPending ? (
            <Clock className="h-5 w-5 shrink-0 text-brand-green" />
          ) : isApproved ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <MessageSquare className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {isPending
                ? 'Your input is needed'
                : isApproved
                  ? 'You approved this'
                  : 'You requested changes'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isPending
                ? 'Read the summary below, then approve or ask for changes.'
                : review.completedLabel}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">{review.solutionTitle}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{review.artifactName}</h1>
        </div>

        {isPending ? (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your architect prepared this summary so you can sign off without digging into technical
              details. Take a minute to read it — that&apos;s all that&apos;s needed right now.
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
              <Button className="h-10 min-h-[40px] min-w-[140px] text-sm" onClick={() => onApprove?.(review.id)}>
                Approve
              </Button>
              <Button
                variant="outline"
                className="h-10 min-h-[40px] min-w-[140px] text-sm"
                onClick={() => onRequestChanges?.(review.id)}
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
              {isRequirementsDoc && sections.length > 0 ? (
                <RequirementsDocumentShell title={review.artifactName}>
                  <RequirementsDocumentReader sections={sections} />
                </RequirementsDocumentShell>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {review.summaryText ?? 'No further action needed. Your architect has been notified.'}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
