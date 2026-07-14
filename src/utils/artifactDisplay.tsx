import {
  FileText, Database, GitBranch, Shield, Code2, Package, AlertTriangle, ClipboardCheck, ListChecks, type LucideIcon,
} from 'lucide-react';
import { ArtifactFormat, ArtifactStatus, ArtifactType, DeveloperComment, ProjectPhase, SolutionArtifact, StudioBuildStage } from '../types';
import { STUDIO_STEPS } from './studioHelpers';
import { PHASE_NAMES } from './phaseEngine';
import { cn } from '@/lib/utils';
import {
  artifactHasOpenConflicts,
  DEV_STATUS_CONFIG,
  getDevWorkspaceStatus,
} from './artifactFiling';

export const ARTIFACT_LUCIDE: Record<ArtifactType, LucideIcon> = {
  requirements_doc: FileText,
  user_stories: ListChecks,
  process_flow: GitBranch,
  data_model: Database,
  workflow: GitBranch,
  role_matrix: Shield,
  script_library: Code2,
  executive_summary: FileText,
  rfp_package: Package,
  test_script: ClipboardCheck,
  deployment_checklist: ClipboardCheck,
};

export const ARTIFACT_STATUS: Record<
  ArtifactStatus,
  { label: string; shortLabel: string; dot: string }
> = {
  approved: { label: 'Approved', shortLabel: 'Approved', dot: 'bg-emerald-500/70' },
  in_review: { label: 'In review', shortLabel: 'Review', dot: 'bg-sky-400/70' },
  pending: { label: 'Pending', shortLabel: 'Pending', dot: 'bg-amber-400/70' },
  draft: { label: 'Draft', shortLabel: 'Draft', dot: 'bg-violet-400/50' },
  not_started: { label: 'Not started', shortLabel: '—', dot: 'bg-muted-foreground/25' },
};

/** @deprecated use ARTIFACT_LUCIDE + ArtifactTypeIcon */
export const ARTIFACT_ICONS: Record<ArtifactType, string> = {
  requirements_doc: '📄',
  user_stories: '📝',
  process_flow: '🔀',
  data_model: '📊',
  workflow: '🔀',
  role_matrix: '🔐',
  script_library: '</>',
  executive_summary: '📋',
  rfp_package: '📦',
  test_script: '✅',
  deployment_checklist: '🚀',
};

/** @deprecated use ARTIFACT_STATUS */
export const ARTIFACT_STATUS_CONFIG: Record<ArtifactStatus, { label: string; className: string }> = {
  approved: { label: 'Approved', className: '' },
  in_review: { label: 'In review', className: '' },
  pending: { label: 'Pending', className: '' },
  draft: { label: 'Draft', className: '' },
  not_started: { label: 'Not started', className: '' },
};

export function artifactStatusPrefix(_status: ArtifactStatus): string {
  return '';
}

export function ArtifactTypeIcon({
  type,
  className,
}: {
  type: ArtifactType;
  className?: string;
}) {
  const Icon = ARTIFACT_LUCIDE[type];
  return <Icon className={cn('h-3.5 w-3.5 shrink-0 stroke-[1.5]', className)} />;
}

export function ArtifactStatusLabel({
  status,
  compact = false,
  className,
}: {
  status: ArtifactStatus;
  compact?: boolean;
  className?: string;
}) {
  const cfg = ARTIFACT_STATUS[status];
  if (status === 'not_started' && compact) {
    return <span className={cn('text-[10px] text-muted-foreground/40', className)}>—</span>;
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 shrink-0', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      <span className="text-[10px] text-muted-foreground">{compact ? cfg.shortLabel : cfg.label}</span>
    </span>
  );
}

export function ArtifactFormatBadge({
  format,
  isDark = true,
  className,
}: {
  format: ArtifactFormat;
  isDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-1 py-px text-[8px] font-semibold uppercase tracking-wider',
        isDark
          ? 'border-border/70 bg-muted/30 text-muted-foreground'
          : 'border-border bg-muted/50 text-muted-foreground',
        className,
      )}
    >
      {format}
    </span>
  );
}

const STAGE_LABELS: Record<StudioBuildStage, string> = Object.fromEntries(
  STUDIO_STEPS.map((s) => [s.id, s.label]),
) as Record<StudioBuildStage, string>;

export function BuildStageLabel({
  stage,
  className,
}: {
  stage: StudioBuildStage;
  className?: string;
}) {
  return (
    <span className={cn('text-[10px] text-muted-foreground/70', className)}>
      {STAGE_LABELS[stage]}
    </span>
  );
}

export function BuildStageChip({
  stage,
  isDark = true,
  className,
}: {
  stage: StudioBuildStage;
  isDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-1 py-px text-[8px] font-medium text-muted-foreground/80',
        isDark ? 'border-border/60 bg-transparent' : 'border-border bg-muted/30',
        className,
      )}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}

export function PhaseChip({
  phase,
  isDark = true,
  className,
}: {
  phase: ProjectPhase;
  isDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-1 py-px text-[8px] font-medium text-muted-foreground/80',
        isDark ? 'border-border/60 bg-transparent' : 'border-border bg-muted/30',
        className,
      )}
    >
      P{phase} · {PHASE_NAMES[phase]}
    </span>
  );
}

const STATUS_PILL: Record<ArtifactStatus, { dark: string; light: string } | null> = {
  approved: {
    dark: 'border-emerald-500/30 bg-emerald-500/8 text-foreground',
    light: 'border-emerald-600/25 bg-emerald-50 text-foreground',
  },
  in_review: {
    dark: 'border-sky-500/30 bg-sky-500/8 text-foreground',
    light: 'border-sky-600/25 bg-sky-50 text-foreground',
  },
  pending: {
    dark: 'border-amber-500/30 bg-amber-500/8 text-foreground',
    light: 'border-amber-600/25 bg-amber-50 text-foreground',
  },
  draft: {
    dark: 'border-border/70 bg-muted/25 text-foreground',
    light: 'border-border bg-muted/40 text-foreground',
  },
  not_started: null,
};

export function ArtifactStatusBadge({
  status,
  isDark = true,
  className,
}: {
  status: ArtifactStatus;
  isDark?: boolean;
  className?: string;
}) {
  const palette = STATUS_PILL[status];
  if (!palette) return null;
  const cfg = ARTIFACT_STATUS[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-1 py-px text-[8px] font-semibold uppercase tracking-wider',
        isDark ? palette.dark : palette.light,
        className,
      )}
    >
      {cfg.shortLabel}
    </span>
  );
}

export function ConflictBadge({ isDark = true, className }: { isDark?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-sm border px-1 py-px text-[8px] font-semibold uppercase tracking-wider',
        isDark
          ? 'border-amber-500/35 bg-amber-500/8 text-foreground'
          : 'border-amber-600/30 bg-amber-50 text-foreground',
        className,
      )}
    >
      <AlertTriangle className="h-2 w-2" />
      Conflict
    </span>
  );
}

export function DevWorkspaceStatusChip({
  artifact,
  comments,
  className,
}: {
  artifact: SolutionArtifact;
  comments: DeveloperComment[];
  className?: string;
}) {
  const status = getDevWorkspaceStatus(artifact, comments);
  const cfg = DEV_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide',
        cfg.className,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}

export function hasArtifactConflict(
  artifactId: string,
  comments: DeveloperComment[],
): boolean {
  return artifactHasOpenConflicts(artifactId, comments);
}
