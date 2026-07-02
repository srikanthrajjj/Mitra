import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share2, X } from 'lucide-react';
import { RequirementsDocument, SolutionArtifact, Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import {
  ArtifactFormatBadge,
  ArtifactStatusBadge,
  ArtifactTypeIcon,
} from '../utils/artifactDisplay';
import {
  getArtifactDocumentSections,
  getArtifactPreviewContent,
  isPrintLikeFormat,
} from '../utils/artifactPreviews';
import { RequirementsDocumentReader } from './RequirementsDocumentReader';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/lib/utils';

interface ArtifactDocumentPreviewProps {
  artifact: SolutionArtifact;
  solutionTitle: string;
  requirementsDocument?: RequirementsDocument;
  theme?: Theme;
  className?: string;
  onShare?: (artifact: SolutionArtifact) => void;
}

function CodePreview({ content, language }: { content: string; language?: string }) {
  return (
    <div className="artifact-doc-preview-code">
      {language && (
        <div className="artifact-doc-preview-code__lang">{language.toUpperCase()}</div>
      )}
      <pre className="artifact-doc-preview-code__body">
        <code>{content}</code>
      </pre>
    </div>
  );
}

function TextDocumentBody({
  artifact,
  requirementsDocument,
  solutionTitle,
  variant,
}: {
  artifact: SolutionArtifact;
  requirementsDocument?: RequirementsDocument;
  solutionTitle: string;
  variant: 'doc' | 'pdf';
}) {
  const sections = getArtifactDocumentSections(artifact, requirementsDocument, solutionTitle);

  if (sections && sections.length > 0) {
    return (
      <RequirementsDocumentReader
        sections={sections}
        canComment={false}
      />
    );
  }

  const preview = getArtifactPreviewContent(artifact, requirementsDocument);

  if (preview.kind === 'html') {
    return (
      <div
        className="artifact-doc-preview-html"
        dangerouslySetInnerHTML={{ __html: preview.content }}
      />
    );
  }

  if (preview.kind === 'code') {
    return <CodePreview content={preview.content} language={preview.language} />;
  }

  return (
    <div className="artifact-doc-preview-prose">
      <p className="whitespace-pre-line">{preview.content}</p>
    </div>
  );
}

export function ArtifactDocumentPreview({
  artifact,
  solutionTitle,
  requirementsDocument,
  theme = 'dark',
  className,
  onShare,
}: ArtifactDocumentPreviewProps) {
  const isDark = isDarkTheme(theme);
  const isPdf = artifact.artifactFormat === 'PDF' || isPrintLikeFormat(artifact.artifactFormat) === 'pdf';
  const variant = isPdf ? 'pdf' : 'doc';
  const canShare =
    onShare &&
    (artifact.status === 'draft' || artifact.status === 'pending' || artifact.status === 'approved');

  return (
    <div className={cn('artifact-doc-preview-shell', className)}>
      <div
        className={cn(
          'artifact-doc-preview-paper',
          variant === 'pdf' ? 'artifact-doc-preview-paper--pdf' : 'artifact-doc-preview-paper--doc',
        )}
      >
        <header className="artifact-doc-preview-paper__header">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                isDark ? 'border-border/60 bg-muted/30' : 'border-border bg-muted/20',
              )}
            >
              <ArtifactTypeIcon type={artifact.type} className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="artifact-doc-preview-title">{artifact.name}</h1>
              <p className="artifact-doc-preview-subtitle">{solutionTitle}</p>
              <p className="artifact-doc-preview-filename">{artifact.filingName}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <ArtifactFormatBadge format={artifact.artifactFormat} isDark={isDark} />
                <ArtifactStatusBadge status={artifact.status} isDark={isDark} />
                {artifact.version && (
                  <span className="text-[10px] text-muted-foreground/70">v{artifact.version}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="artifact-doc-preview-paper__body">
          <TextDocumentBody
            artifact={artifact}
            requirementsDocument={requirementsDocument}
            solutionTitle={solutionTitle}
            variant={variant}
          />
        </div>

        {artifact.updatedBy && (
          <footer className="artifact-doc-preview-paper__footer">
            Last updated by {artifact.updatedBy}
            {artifact.updatedAt &&
              ` · ${new Date(artifact.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}`}
          </footer>
        )}
      </div>

      {onShare && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={!canShare}
            onClick={() => onShare(artifact)}
          >
            <Share2 className="h-3.5 w-3.5" />
            Share for approval
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
            <Download className="h-3.5 w-3.5" />
            Download {artifact.artifactFormat}
          </Button>
        </div>
      )}
    </div>
  );
}

interface ArtifactDocumentPreviewModalProps {
  isOpen: boolean;
  artifact: SolutionArtifact | null;
  solutionTitle: string;
  requirementsDocument?: RequirementsDocument;
  theme?: Theme;
  onClose: () => void;
  onShare?: (artifact: SolutionArtifact) => void;
}

export function ArtifactDocumentPreviewModal({
  isOpen,
  artifact,
  solutionTitle,
  requirementsDocument,
  theme = 'dark',
  onClose,
  onShare,
}: ArtifactDocumentPreviewModalProps) {
  const isDark = isDarkTheme(theme);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !artifact) return null;

  return createPortal(
    <div className={cn(theme, 'text-foreground')}>
      <div
        className="fixed inset-0 z-[9998] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${artifact.name}`}
      >
        <button
          type="button"
          aria-label="Close preview"
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Document preview
              </p>
              <p className="truncate text-sm font-medium text-foreground">{artifact.name}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label="Close"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-3xl">
              <ArtifactDocumentPreview
                artifact={artifact}
                solutionTitle={solutionTitle}
                requirementsDocument={requirementsDocument}
                theme={theme}
                onShare={onShare}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
