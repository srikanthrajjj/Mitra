import { useState } from 'react';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import { RequirementsSection, StakeholderReview, StakeholderSectionComment } from '../types';
import { Button } from '@/src/components/ui/button';
import { ARCHITECT_DISPLAY_NAME } from '../constants/role';
import { getGuestCapabilities } from '../utils/guestReviewAuth';
import { buildGuestReviewUrl } from '../utils/projectWorkflow';
import { isRequirementsReview, resolveReviewSections } from '../utils/requirementsDocument';
import {
  RequirementsDocumentReader,
  RequirementsDocumentShell,
} from './RequirementsDocumentReader';
import { cn } from '@/lib/utils';

interface GuestStakeholderViewProps {
  review: StakeholderReview;
  otherPendingReviews?: StakeholderReview[];
  onApprove: (reviewId: string, comment?: string, sectionComments?: StakeholderSectionComment[]) => void;
  onRequestChanges: (reviewId: string, comment?: string, sectionComments?: StakeholderSectionComment[]) => void;
}

export function GuestStakeholderView({
  review,
  otherPendingReviews = [],
  onApprove,
  onRequestChanges,
}: GuestStakeholderViewProps) {
  const senderName = review.senderName ?? ARCHITECT_DISPLAY_NAME;
  const capabilities = getGuestCapabilities(review);
  const alreadyCompleted = review.status !== 'awaiting';
  const isRequirementsDoc = isRequirementsReview(review);
  const sections = resolveReviewSections(review);

  const [sectionComment, setSectionComment] = useState('');
  const [commentPopoverSection, setCommentPopoverSection] = useState<RequirementsSection | null>(null);
  const [outcome, setOutcome] = useState<'approved' | 'changes_requested' | null>(null);
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

  if (outcome || alreadyCompleted) {
    const isApproved = outcome === 'approved' || review.status === 'approved';
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="max-w-lg text-center">
          <CheckCircle2 className={cn('mx-auto h-10 w-10', isApproved ? 'text-emerald-500' : 'text-muted-foreground')} />
          <h1 className="mt-4 text-xl font-semibold text-foreground">
            {isApproved ? 'Approved' : 'Changes requested'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isApproved
              ? `Approved. ${senderName} has been notified.`
              : `Your feedback was sent. ${senderName} has been notified.`}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">You can close this tab — no account required.</p>

          {otherPendingReviews.length > 0 && (
            <div className="mt-8 rounded-xl border border-border/60 bg-muted/10 p-4 text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Other items waiting on you
              </p>
              <ul className="mt-3 space-y-2">
                {otherPendingReviews.map((pending) => (
                  <li key={pending.id}>
                    <a
                      href={buildGuestReviewUrl(pending.id)}
                      className="block rounded-lg border border-border/50 px-3 py-2 text-sm transition-colors hover:bg-muted/30"
                    >
                      <span className="font-medium text-foreground">{pending.artifactName}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{pending.solutionTitle}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs text-muted-foreground">
            {senderName} shared <strong className="text-foreground">{review.artifactName}</strong> for your review
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {review.solutionTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Guest access — read{capabilities.canComment ? ', comment' : ''}
            {capabilities.canApprove ? ', approve or request changes' : ''}. No login required.
            {isRequirementsDoc && ' Plain-language view — technical terms simplified.'}
          </p>

          {isRequirementsDoc && sections.length > 0 ? (
            <div className="mt-10">
              <RequirementsDocumentShell
                title={review.artifactName}
                subtitle="Business-friendly summary — implementation details come in later phases."
              >
                <RequirementsDocumentReader
                  sections={sections}
                  canComment={capabilities.canComment}
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
          ) : (
            <article className="mt-10 rounded-xl border border-border/60 bg-card/30 p-6">
              <h2 className="text-base font-semibold text-foreground">{review.artifactName}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {review.summaryText ?? 'No summary provided.'}
              </p>
            </article>
          )}
        </div>
      </main>

      <aside className="w-full shrink-0 border-t border-border/50 bg-muted/10 px-6 py-8 lg:w-[320px] lg:border-l lg:border-t-0">
        <div className="lg:sticky lg:top-8">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your decision</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Read the document, add optional comments on sections, then choose an action.
          </p>

          {capabilities.canApprove ? (
            <div className="mt-6 space-y-3">
              <Button
                className="h-11 min-h-[44px] w-full text-sm font-semibold"
                onClick={() => {
                  onApprove(review.id, commentSummary || undefined, inlineComments);
                  setOutcome('approved');
                }}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                className="h-11 min-h-[44px] w-full text-sm"
                onClick={() => {
                  onRequestChanges(
                    review.id,
                    commentSummary || 'Please revise flagged sections.',
                    inlineComments,
                  );
                  setOutcome('changes_requested');
                }}
              >
                Request changes
              </Button>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-border/50 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
              {capabilities.canComment
                ? 'You can add section comments. Approval actions were not included in your guest link.'
                : 'View-only access — contact your architect if you need to approve or comment.'}
            </div>
          )}

          <p className="mt-5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <MessageSquare className="h-3 w-3 shrink-0" />
            Guest token · single artifact · no sign-in
          </p>
        </div>
      </aside>
    </div>
  );
}
