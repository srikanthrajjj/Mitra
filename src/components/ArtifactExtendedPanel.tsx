import { Share2 } from 'lucide-react';
import { RequirementsDocument, SolutionArtifact } from '../types';
import { getSolutionTitle } from '../data/solutionArtifacts';
import {
  ArtifactFormatBadge,
  ArtifactStatusLabel,
  ArtifactTypeIcon,
  BuildStageLabel,
  ConflictBadge,
} from '../utils/artifactDisplay';
import { getArtifactRepositoryPath } from '../utils/artifactFiling';
import { getArtifactPreviewContent } from '../utils/artifactPreviews';
import { RequirementsDocumentEditor } from './RequirementsDocumentEditor';
import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
import { cn } from '@/lib/utils';

interface ArtifactExtendedPanelProps {
  artifact: SolutionArtifact;
  compact?: boolean;
  hasConflict?: boolean;
  requirementsDocument?: RequirementsDocument;
  onUpdateRequirementsSection?: (sectionId: string, body: string) => void;
  onShare?: (artifact: SolutionArtifact) => void;
}

function PreviewBody({
  artifact,
  requirementsDocument,
}: {
  artifact: SolutionArtifact;
  requirementsDocument?: RequirementsDocument;
}) {
  const preview = getArtifactPreviewContent(artifact, requirementsDocument);

  if (preview.kind === 'html') {
    return (
      <div
        className="overflow-hidden rounded-lg border border-border/50 bg-muted/20 text-foreground/90"
        dangerouslySetInnerHTML={{ __html: preview.content }}
      />
    );
  }

  if (preview.kind === 'code') {
    return (
      <pre className="max-h-36 overflow-auto rounded-lg border border-border/50 bg-muted/30 p-2.5 text-[10px] leading-relaxed font-mono text-muted-foreground">
        {preview.content}
      </pre>
    );
  }

  if (preview.kind === 'download') {
    return (
      <p className="rounded-lg border border-dashed border-border/50 bg-muted/20 px-4 py-5 text-center text-[10px] leading-relaxed text-muted-foreground whitespace-pre-line">
        {preview.content}
      </p>
    );
  }

  return (
    <p className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 text-[10px] leading-relaxed text-muted-foreground whitespace-pre-line">
      {preview.content}
    </p>
  );
}

export function ArtifactExtendedPanel({
  artifact,
  compact = false,
  hasConflict = false,
  requirementsDocument,
  onUpdateRequirementsSection,
  onShare,
}: ArtifactExtendedPanelProps) {
  const solutionTitle = getSolutionTitle(artifact.solutionId);
  const canShare = artifact.status !== 'in_review' && artifact.status !== 'approved';
  const repoPath = getArtifactRepositoryPath(artifact);
  const showReqEditor = artifact.type === 'requirements_doc' && requirementsDocument;

  return (
    <div className={cn('min-w-0 space-y-3', compact ? 'pt-2 pr-0.5' : 'pr-1')}>
      {!compact && (
        <>
          <div>
            <p className="text-xs text-muted-foreground">{solutionTitle}</p>
            <div className="mt-2 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30">
                <ArtifactTypeIcon type={artifact.type} className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <h2 className="text-base font-semibold tracking-tight">{artifact.name}</h2>
                <p className="font-mono text-[11px] text-muted-foreground">{artifact.filingName}</p>
                <p className="truncate font-mono text-[10px] text-muted-foreground/60" title={repoPath}>
                  {repoPath}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <ArtifactFormatBadge format={artifact.artifactFormat} />
                  <BuildStageLabel stage={artifact.buildStage} />
                  <ArtifactStatusLabel status={artifact.status} />
                  {hasConflict && <ConflictBadge />}
                  {artifact.version && (
                    <span className="text-[10px] text-muted-foreground/60">v{artifact.version}</span>
                  )}
                </div>
                {artifact.updatedBy && (
                  <p className="text-[10px] text-muted-foreground/55">
                    Last updated by {artifact.updatedBy}
                  </p>
                )}
              </div>
            </div>
          </div>
          <Separator />
        </>
      )}

      <div className="space-y-1.5">
        {!compact && <p className="text-[11px] font-medium text-foreground/80">Preview</p>}
        {showReqEditor ? (
          <RequirementsDocumentEditor
            document={requirementsDocument!}
            compact={compact}
            onUpdateSection={onUpdateRequirementsSection}
          />
        ) : (
          <PreviewBody artifact={artifact} requirementsDocument={requirementsDocument} />
        )}
      </div>

      {onShare && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 justify-start gap-1.5 text-[10px]"
          disabled={!canShare}
          onClick={() => onShare(artifact)}
        >
          <Share2 className="h-3 w-3" />
          Share
        </Button>
      )}
    </div>
  );
}
