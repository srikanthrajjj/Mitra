import { Upload, FileStack, Bell, ChevronRight } from 'lucide-react';
import { BusinessOwnerSubmission } from '../types';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/lib/utils';

interface BusinessOwnerSidebarProps {
  submissions: BusinessOwnerSubmission[];
  selectedSubmissionId?: string | null;
  onNewUpload: () => void;
  onSelectSubmission?: (submission: BusinessOwnerSubmission) => void;
}

function SubmissionCard({
  submission,
  isSelected,
  onSelect,
}: {
  submission: BusinessOwnerSubmission;
  isSelected: boolean;
  onSelect?: (submission: BusinessOwnerSubmission) => void;
}) {
  const storyCount = submission.userStories.length;
  const hasFlow = Boolean(submission.processFlow);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(submission)}
      className={cn(
        'stakeholder-review-card group w-full text-left',
        submission.status === 'draft'
          ? 'stakeholder-review-card--pending'
          : 'stakeholder-review-card--done',
        isSelected && 'stakeholder-review-card--selected',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <FileStack className="h-3 w-3 shrink-0 text-primary/80" />
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {submission.status === 'draft' ? 'Draft submission' : 'Submitted'}
            </span>
          </div>
          <p className="text-[13px] font-semibold leading-snug text-foreground">
            {submission.title}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {storyCount > 0
              ? `${storyCount} user stor${storyCount === 1 ? 'y' : 'ies'}`
              : 'Requirements uploaded'}
            {hasFlow ? ' · Process flow attached' : ''}
          </p>
        </div>
        <ChevronRight className="mt-4 h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
      </div>
      <span className="mt-2.5 inline-flex items-center rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        Draft
      </span>
    </button>
  );
}

export function BusinessOwnerSidebar({
  submissions,
  selectedSubmissionId = null,
  onNewUpload,
  onSelectSubmission,
}: BusinessOwnerSidebarProps) {
  return (
    <div className="stakeholder-sidebar flex h-full flex-col px-3 py-4">
      <div className="mb-4 px-1">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Business Owner
        </h2>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          Upload requirements and let Mitra formulate Agile-ready user stories.
        </p>
      </div>

      <Button
        variant="outline"
        className="mb-4 h-10 min-h-[40px] w-full gap-2 border-primary/20 text-[12px] hover:bg-primary/5"
        onClick={onNewUpload}
      >
        <Upload className="h-4 w-4 text-primary/80" />
        Upload requirements
      </Button>

      <div className="flex-1 space-y-5 overflow-y-auto">
        {submissions.length > 0 ? (
          <section className="space-y-2">
            <p className="px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/55">
              My submissions
            </p>
            {submissions.map((submission) => (
              <div key={submission.id}>
                <SubmissionCard
                  submission={submission}
                  isSelected={selectedSubmissionId === submission.id}
                  onSelect={onSelectSubmission}
                />
              </div>
            ))}
          </section>
        ) : (
          <p className="px-1 text-[12px] text-muted-foreground">
            No submissions yet. Upload a requirements document to get started.
          </p>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-sidebar-border/50 bg-sidebar-accent/20 p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <Bell className="h-3 w-3 text-muted-foreground" />
          <p className="text-[10px] font-medium text-muted-foreground">Notifications</p>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          You&apos;ll be notified when the architect picks up your submission.
        </p>
      </div>
    </div>
  );
}
