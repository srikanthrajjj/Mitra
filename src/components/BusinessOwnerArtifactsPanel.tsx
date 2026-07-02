import type { ReactNode } from 'react';
import { FileText, GitBranch, ListChecks, FileStack } from 'lucide-react';
import { BusinessOwnerSubmission } from '../types';
import { ArtifactStatusBadge } from '../utils/artifactDisplay';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface BusinessOwnerArtifactsPanelProps {
  submission: BusinessOwnerSubmission | null;
  className?: string;
}

function ArtifactRow({
  icon,
  name,
  detail,
  status,
}: {
  icon: ReactNode;
  name: string;
  detail?: string;
  status: 'draft' | 'in_review' | 'pending' | 'approved' | 'not_started';
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[12px] font-medium text-foreground">{name}</p>
            <ArtifactStatusBadge status={status} />
          </div>
          {detail && (
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{detail}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function BusinessOwnerArtifactsPanel({
  submission,
  className,
}: BusinessOwnerArtifactsPanelProps) {
  const storyCount = submission?.userStories.length ?? 0;

  return (
    <aside
      className={cn(
        'artifact-panel flex w-[280px] shrink-0 flex-col border-l border-border bg-background/50',
        className,
      )}
    >
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center gap-1.5">
          <FileStack className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="sn-section-header">Submission artifacts</p>
        </div>
        {submission && (
          <p className="mt-1 truncate text-[11px] text-muted-foreground">{submission.title}</p>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {!submission ? (
            <p className="px-1 py-4 text-center text-[11px] text-muted-foreground">
              Artifacts appear here after you upload or chat with Mitra.
            </p>
          ) : (
            <>
              {submission.requirements && (
                <ArtifactRow
                  icon={<FileText className="h-3.5 w-3.5" />}
                  name="Requirements Document"
                  detail={submission.requirements.fileName}
                  status="draft"
                />
              )}
              {storyCount > 0 && (
                <ArtifactRow
                  icon={<ListChecks className="h-3.5 w-3.5" />}
                  name="User Stories"
                  detail={`${storyCount} draft stor${storyCount === 1 ? 'y' : 'ies'} · Agile/Jira ready`}
                  status="draft"
                />
              )}
              {submission.processFlow ? (
                <ArtifactRow
                  icon={<GitBranch className="h-3.5 w-3.5" />}
                  name="Process Flow Diagram"
                  detail={submission.processFlow.name}
                  status="draft"
                />
              ) : storyCount > 0 ? (
                <ArtifactRow
                  icon={<GitBranch className="h-3.5 w-3.5" />}
                  name="Process Flow Diagram"
                  detail="Awaiting attachment"
                  status="not_started"
                />
              ) : null}
            </>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
