import { SolutionArtifact, StudioBuildStage } from '../types';
import { studioStepIndex } from './studioHelpers';

/** Scoped-app slug used in studio:// repository paths */
export const SOLUTION_SCOPE: Record<string, string> = {
  'hr-ticketing': 'hrsd_ticketing',
  'employee-onboarding': 'employee_onboarding',
  'vendor-management': 'vendor_management',
  'asset-tracking': 'asset_tracking',
};

export function getSolutionScope(solutionId: string): string {
  return SOLUTION_SCOPE[solutionId] ?? solutionId.replace(/-/g, '_');
}

export function getArtifactRepositoryPath(artifact: SolutionArtifact): string {
  const scope = getSolutionScope(artifact.solutionId);
  return `studio://${scope}/artifacts/${artifact.filingName}`;
}

export function getDeveloperBreadcrumb(
  solutionTitle: string,
  category: string,
  anchor?: string,
): string {
  const parts = [solutionTitle, category];
  if (anchor) parts.push(anchor);
  return parts.join(' / ');
}

const STAGE_ORDER: StudioBuildStage[] = [
  'scope',
  'tables',
  'forms',
  'scripts',
  'rules',
  'update_set',
  'published',
];

export function sortArtifactsByStage(artifacts: SolutionArtifact[]): SolutionArtifact[] {
  return [...artifacts].sort((a, b) => {
    const stageDiff = studioStepIndex(a.buildStage) - studioStepIndex(b.buildStage);
    if (stageDiff !== 0) return stageDiff;
    return a.filingName.localeCompare(b.filingName);
  });
}

export function artifactHasOpenConflicts(
  artifactId: string,
  comments: { artifactId: string; resolved: boolean }[],
): boolean {
  return comments.some((c) => c.artifactId === artifactId && !c.resolved);
}

export type DevWorkspaceStatus = 'draft' | 'in_review' | 'conflict' | 'ready_for_build';

export function getDevWorkspaceStatus(
  artifact: SolutionArtifact,
  comments: { artifactId: string; resolved: boolean }[],
): DevWorkspaceStatus {
  if (artifactHasOpenConflicts(artifact.id, comments)) return 'conflict';
  if (artifact.status === 'in_review') return 'in_review';
  if (artifact.status === 'approved' || artifact.status === 'pending') return 'ready_for_build';
  return 'draft';
}

export const DEV_STATUS_CONFIG: Record<
  DevWorkspaceStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'Draft',
    className: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  },
  in_review: {
    label: 'In Review',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
  },
  conflict: {
    label: 'Conflict',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  ready_for_build: {
    label: 'Ready for Build',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
};
