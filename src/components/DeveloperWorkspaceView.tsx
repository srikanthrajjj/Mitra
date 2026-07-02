import { useState, type ReactElement } from 'react';
import {
  AlertTriangle, Check, ChevronRight, Code2, Download, Eye, Flag, FolderTree, MessageSquare,
} from 'lucide-react';
import { ArtifactStatus, DeveloperComment, DeveloperCommentSeverity, SolutionArtifact } from '../types';
import { findArtifactWithStatuses, getSolutionTitle } from '../data/solutionArtifacts';
import { ARTIFACT_TECH_SECTIONS, DEVELOPER_FILE_TREE } from '../data/personaFlows';
import { ArtifactFormatBadge, ArtifactTypeIcon, DevWorkspaceStatusChip } from '../utils/artifactDisplay';
import {
  DEV_STATUS_CONFIG,
  getArtifactRepositoryPath,
  getDevWorkspaceStatus,
  getDeveloperBreadcrumb,
  getSolutionScope,
} from '../utils/artifactFiling';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/lib/utils';

interface DeveloperWorkspaceViewProps {
  solutionId: string;
  artifactIds: string[];
  statusOverrides: Record<string, ArtifactStatus>;
  comments: DeveloperComment[];
  onAddComment: (params: {
    artifactId: string;
    section: string;
    text: string;
    lineRef?: string;
    severity?: DeveloperCommentSeverity;
  }) => void;
  onResolveComment: (commentId: string) => void;
}

const SEVERITY_CONFIG: Record<
  DeveloperCommentSeverity,
  { label: string; className: string }
> = {
  blocker: { label: 'Blocker', className: 'border-rose-500/40 bg-rose-500/10 text-rose-400' },
  major: { label: 'Major', className: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  minor: { label: 'Minor', className: 'border-sky-500/40 bg-sky-500/10 text-sky-400' },
};

export function DeveloperWorkspaceView({
  solutionId,
  artifactIds,
  statusOverrides,
  comments,
  onAddComment,
  onResolveComment,
}: DeveloperWorkspaceViewProps) {
  const [selectedId, setSelectedId] = useState(artifactIds[0] ?? '');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Data Model': true,
    'Script Includes': true,
    Flows: true,
  });
  const [flagSection, setFlagSection] = useState<{ label: string; lineRef: string } | null>(null);
  const [flagText, setFlagText] = useState('');
  const [flagSeverity, setFlagSeverity] = useState<DeveloperCommentSeverity>('major');
  const [showSource, setShowSource] = useState(true);

  const artifacts = artifactIds
    .map((id) => findArtifactWithStatuses(id, statusOverrides))
    .filter(Boolean) as SolutionArtifact[];

  const selected = artifacts.find((a) => a.id === selectedId) ?? artifacts[0];
  const sections = selected ? (ARTIFACT_TECH_SECTIONS[selected.id] ?? []) : [];
  const artifactComments = comments.filter((c) => c.artifactId === selected?.id && !c.resolved);
  const openConflictCount = comments.filter((c) => !c.resolved).length;
  const fileTree = DEVELOPER_FILE_TREE[solutionId] ?? [];
  const solutionTitle = getSolutionTitle(solutionId);
  const scope = getSolutionScope(solutionId);

  const selectedCategory =
    fileTree.find((g) => g.artifactIds.includes(selected?.id ?? ''))?.category ?? 'Artifacts';

  const handleFlag = () => {
    if (!selected || !flagSection || !flagText.trim()) return;
    onAddComment({
      artifactId: selected.id,
      section: flagSection.label,
      lineRef: flagSection.lineRef,
      severity: flagSeverity,
      text: flagText.trim(),
    });
    setFlagText('');
    setFlagSection(null);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      {/* File tree sidebar */}
      <aside className="w-full shrink-0 border-b border-border/50 bg-sidebar/20 lg:w-[280px] lg:border-b-0 lg:border-r">
        <div className="border-b border-border/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Scoped application
            </p>
          </div>
          <p className="mt-1 truncate font-mono text-[11px] text-foreground">x_mitra_{scope}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{solutionTitle}</p>
          {openConflictCount > 0 && (
            <Badge
              variant="outline"
              className="mt-2 border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-400"
            >
              {openConflictCount} open conflict{openConflictCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="max-h-[240px] overflow-y-auto p-2 lg:max-h-none lg:flex-1">
          {fileTree.map(({ category, artifactIds: ids }) => {
            const categoryArtifacts = ids
              .map((id) => artifacts.find((a) => a.id === id))
              .filter(Boolean) as SolutionArtifact[];
            if (categoryArtifacts.length === 0) return null;
            const isExpanded = expandedCategories[category] !== false;

            return (
              <div key={category} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] font-medium text-muted-foreground hover:bg-muted/30"
                >
                  <ChevronRight
                    className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-90')}
                  />
                  {category}
                </button>
                {isExpanded && (
                  <div className="ml-2 space-y-0.5 border-l border-border/40 pl-2">
                    {categoryArtifacts.map((a) => {
                      const hasConflict = comments.some((c) => c.artifactId === a.id && !c.resolved);
                      const devStatus = getDevWorkspaceStatus(a, comments);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelectedId(a.id)}
                          className={cn(
                            'flex w-full flex-col gap-0.5 rounded-md px-2 py-1.5 text-left transition-colors',
                            selected?.id === a.id
                              ? 'bg-primary/10 text-foreground'
                              : 'text-muted-foreground hover:bg-muted/30',
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            <ArtifactTypeIcon type={a.type} className="h-3 w-3 shrink-0" />
                            <span className="truncate text-[11px] font-medium">{a.name}</span>
                            {hasConflict && (
                              <AlertTriangle className="ml-auto h-3 w-3 shrink-0 text-amber-400" />
                            )}
                          </span>
                          <span className="truncate pl-[18px] font-mono text-[9px] text-muted-foreground/70">
                            {a.filingName}
                          </span>
                          <span className="pl-[18px]">
                            <span
                              className={cn(
                                'inline-flex rounded border px-1 py-0 text-[8px] font-semibold uppercase',
                                DEV_STATUS_CONFIG[devStatus].className,
                              )}
                            >
                              {DEV_STATUS_CONFIG[devStatus].label}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="hidden border-t border-border/40 px-3 py-2 lg:block">
          <p className="text-[10px] leading-relaxed text-muted-foreground/70">
            Read-only technical view. Flag conflicts on line anchors — architect notified via SN update.
          </p>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {selected && (
          <>
            {/* Breadcrumb + header */}
            <div className="shrink-0 border-b border-border/40 px-6 py-4">
              <nav className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                {getDeveloperBreadcrumb(solutionTitle, selectedCategory, selected.filingName)
                  .split(' / ')
                  .map((part, i, arr) => (
                    <span key={part} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
                      <span
                        className={cn(
                          i === arr.length - 1 ? 'font-mono text-foreground' : '',
                        )}
                      >
                        {part}
                      </span>
                    </span>
                  ))}
              </nav>
              <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-lg font-semibold text-foreground">{selected.name}</h1>
                    <DevWorkspaceStatusChip artifact={selected} comments={comments} />
                    <ArtifactFormatBadge format={selected.artifactFormat} />
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {getArtifactRepositoryPath(selected)}
                  </p>
                  {selected.version && (
                    <p className="text-[10px] text-muted-foreground/70">
                      v{selected.version}
                      {selected.updatedBy && ` · last updated by ${selected.updatedBy}`}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-[11px]"
                    onClick={() => setShowSource((v) => !v)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {showSource ? 'Hide source' : 'View source'}
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]">
                    <Download className="h-3.5 w-3.5" />
                    Export {selected.artifactFormat}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-4xl space-y-6">
                {/* Source viewer with line refs */}
                {showSource && (
                  <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/10">
                    <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-mono text-[11px] text-foreground">{selected.filingName}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{sections.length} sections</span>
                    </div>
                    <div className="divide-y divide-border/30">
                      {sections.map((section) => {
                        const sectionComments = artifactComments.filter(
                          (c) => c.section === section.label || c.lineRef === section.lineRef,
                        );
                        const hasConflict = sectionComments.length > 0;

                        return (
                          <div
                            key={section.lineRef}
                            className={cn(
                              'group relative',
                              hasConflict && 'bg-amber-500/[0.04]',
                            )}
                          >
                            <div className="flex">
                              <div className="w-12 shrink-0 select-none border-r border-border/30 bg-muted/15 py-2.5 text-right font-mono text-[10px] text-muted-foreground/60">
                                {section.lineRef}
                              </div>
                              <div className="min-w-0 flex-1 px-3 py-2.5">
                                <p className="text-[11px] font-medium text-foreground/90">{section.label}</p>
                                <pre className="mt-1 overflow-x-auto font-mono text-[10px] leading-relaxed text-muted-foreground">
                                  {section.content}
                                </pre>
                              </div>
                              <div className="flex shrink-0 items-start gap-1 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  type="button"
                                  title="Flag conflict"
                                  className="rounded border border-amber-500/30 bg-background p-1 text-amber-500 hover:bg-amber-500/10"
                                  onClick={() =>
                                    setFlagSection({ label: section.label, lineRef: section.lineRef })
                                  }
                                >
                                  <Flag className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  title="Add inline comment"
                                  className="rounded border border-border/50 bg-background p-1 text-muted-foreground hover:bg-muted/50"
                                  onClick={() =>
                                    setFlagSection({ label: section.label, lineRef: section.lineRef })
                                  }
                                >
                                  <MessageSquare className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            {hasConflict && (
                              <div className="border-t border-amber-500/20 bg-amber-500/[0.03] px-3 py-2 pl-[60px]">
                                {sectionComments.map((c) => (
                                  <div key={c.id}>
                                    <ConflictRow
                                      comment={c}
                                      onResolve={() => onResolveComment(c.id)}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Flag conflict form */}
                {flagSection && (
                  <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Flag conflict — {flagSection.lineRef} · {flagSection.label}
                    </p>
                    <div className="mt-2 flex gap-2">
                      {(['blocker', 'major', 'minor'] as const).map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setFlagSeverity(sev)}
                          className={cn(
                            'rounded border px-2 py-0.5 text-[10px] font-semibold uppercase transition-colors',
                            flagSeverity === sev
                              ? SEVERITY_CONFIG[sev].className
                              : 'border-border/50 text-muted-foreground hover:bg-muted/30',
                          )}
                        >
                          {SEVERITY_CONFIG[sev].label}
                        </button>
                      ))}
                    </div>
                    <Input
                      className="mt-2"
                      value={flagText}
                      onChange={(e) => setFlagText(e.target.value)}
                      placeholder="Describe the conflict with the spec…"
                    />
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={handleFlag} disabled={!flagText.trim()}>
                        Send to architect
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setFlagSection(null);
                          setFlagText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* All open conflicts for this artifact */}
                {artifactComments.length > 0 && !showSource && (
                  <div className="rounded-lg border border-border/60 p-4">
                    <p className="text-xs font-medium text-muted-foreground">Open dev review items</p>
                    <ul className="mt-3 space-y-3">
                      {artifactComments.map((c) => (
                        <li key={c.id}>
                          <ConflictRow comment={c} onResolve={() => onResolveComment(c.id)} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ConflictRow({
  comment,
  onResolve,
}: {
  comment: DeveloperComment;
  onResolve: () => void;
}): ReactElement {
  const severity = comment.severity ?? 'major';
  const sevCfg = SEVERITY_CONFIG[severity];

  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {comment.lineRef && (
            <span className="font-mono text-[10px] text-muted-foreground">{comment.lineRef}</span>
          )}
          <span
            className={cn(
              'inline-flex rounded border px-1.5 py-0 text-[9px] font-semibold uppercase',
              sevCfg.className,
            )}
          >
            {sevCfg.label}
          </span>
          <span className="text-[10px] text-muted-foreground">{comment.author}</span>
        </div>
        <p className="mt-1 text-[12px] text-foreground">
          <span className="font-medium">{comment.section}:</span> {comment.text}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 shrink-0 gap-1 text-[10px] text-emerald-500 hover:text-emerald-400"
        onClick={onResolve}
      >
        <Check className="h-3 w-3" />
        Resolve
      </Button>
    </div>
  );
}
