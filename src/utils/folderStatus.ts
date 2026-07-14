import { ProjectFolder } from '../data/folders';
import {
  ArtifactStatus,
  FolderStatus,
  ProjectStatus,
  Solution,
  SolutionArtifact,
} from '../types';
import { getArtifactsWithStatuses } from '../data/solutionArtifacts';

export const FOLDER_STATUS_CONFIG: Record<
  FolderStatus,
  { label: string; shortLabel: string; dark: string; light: string; dashed?: boolean }
> = {
  draft: {
    label: 'Draft',
    shortLabel: 'Draft',
    dark: 'border-border/70 border-dashed bg-muted/20 text-foreground',
    light: 'border-border border-dashed bg-muted/30 text-foreground',
    dashed: true,
  },
  in_review: {
    label: 'In review',
    shortLabel: 'In Review',
    dark: 'border-amber-500/35 bg-amber-500/10 text-foreground',
    light: 'border-amber-600/30 bg-amber-50 text-foreground',
  },
  accepted: {
    label: 'Accepted',
    shortLabel: 'Accepted',
    dark: 'border-emerald-500/30 bg-emerald-500/10 text-foreground',
    light: 'border-emerald-600/25 bg-emerald-50 text-foreground',
  },
  approved: {
    label: 'Approved',
    shortLabel: 'Approved',
    dark: 'border-emerald-500/30 bg-emerald-500/10 text-foreground',
    light: 'border-emerald-600/25 bg-emerald-50 text-foreground',
  },
  rejected: {
    label: 'Rejected',
    shortLabel: 'Rejected',
    dark: 'border-red-500/35 bg-red-500/10 text-foreground',
    light: 'border-red-600/30 bg-red-50 text-foreground',
  },
  changes_requested: {
    label: 'Changes requested',
    shortLabel: 'Changes',
    dark: 'border-orange-500/35 bg-orange-500/10 text-foreground',
    light: 'border-orange-600/30 bg-orange-50 text-foreground',
  },
};

const PROJECT_STATUS_TO_FOLDER: Record<ProjectStatus, FolderStatus> = {
  building: 'draft',
  in_review: 'in_review',
  ready_to_deploy: 'accepted',
  deployed: 'approved',
};

function worstArtifactStatus(statuses: ArtifactStatus[]): FolderStatus | null {
  if (statuses.length === 0) return null;
  if (statuses.some((s) => s === 'in_review')) return 'in_review';
  if (statuses.some((s) => s === 'pending')) return 'in_review';
  if (statuses.every((s) => s === 'approved')) return 'accepted';
  if (statuses.some((s) => s === 'draft')) return 'draft';
  return 'draft';
}

export function deriveSolutionFolderStatus(
  solution: Solution,
  statusOverrides: Record<string, ArtifactStatus> = {},
  dynamicArtifactsBySolution: Record<string, SolutionArtifact[]> = {},
  allSolutions: Solution[] = [],
): FolderStatus {
  if (solution.projectStatus === 'deployed') return 'approved';
  if (solution.projectStatus) {
    return PROJECT_STATUS_TO_FOLDER[solution.projectStatus];
  }

  const row = getArtifactsWithStatuses(statusOverrides, dynamicArtifactsBySolution, allSolutions).find(
    (s) => s.solutionId === solution.id,
  );
  if (row && row.artifacts.length > 0) {
    const derived = worstArtifactStatus(row.artifacts.map((a) => a.status));
    if (derived) return derived;
  }

  if (solution.blueprint.status === 'completed') return 'accepted';
  if (solution.blueprint.status === 'discovering' || solution.blueprint.status === 'designing') {
    return 'in_review';
  }
  return 'draft';
}

export function deriveFolderStatus(
  folder: ProjectFolder,
  solutions: Solution[],
  statusOverrides: Record<string, ArtifactStatus> = {},
  dynamicArtifactsBySolution: Record<string, SolutionArtifact[]> = {},
): FolderStatus {
  if (folder.status) return folder.status;

  const folderSolutions = solutions.filter((s) => s.folderId === folder.id);
  if (folderSolutions.length === 0) return 'draft';

  const statuses = folderSolutions.map((sol) =>
    deriveSolutionFolderStatus(sol, statusOverrides, dynamicArtifactsBySolution, solutions),
  );

  if (statuses.some((s) => s === 'in_review')) return 'in_review';
  if (statuses.some((s) => s === 'changes_requested')) return 'changes_requested';
  if (statuses.some((s) => s === 'rejected')) return 'rejected';
  if (statuses.every((s) => s === 'accepted' || s === 'approved')) {
    return statuses.some((s) => s === 'approved') ? 'approved' : 'accepted';
  }
  if (statuses.some((s) => s === 'draft')) return 'draft';
  return 'draft';
}

const RECENCY_HINTS: Record<string, number> = {
  'Just now': 0,
  '2 hours ago': 1,
  '1 day ago': 2,
  '3 days ago': 3,
  '2 months ago': 90,
};

function recencyScore(sol: Solution): number {
  if (sol.active) return -10;
  if (sol.timeLabel && RECENCY_HINTS[sol.timeLabel] !== undefined) {
    return RECENCY_HINTS[sol.timeLabel];
  }
  if (sol.createdAt && RECENCY_HINTS[sol.createdAt] !== undefined) {
    return RECENCY_HINTS[sol.createdAt];
  }
  return 50;
}

export function getRecentSolutions(solutions: Solution[], limit = 5): Solution[] {
  return [...solutions]
    .sort((a, b) => recencyScore(a) - recencyScore(b))
    .slice(0, limit);
}

export function getScopedAppLabel(solution: Solution): string {
  return solution.blueprint.scopedApp?.name ?? solution.blueprint.title ?? solution.name;
}
