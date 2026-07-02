import { SolutionWithArtifacts, getArtifactsWithStatuses } from '../data/solutionArtifacts';
import {
  AdminChecklistItem,
  ArtifactStatus,
  PhaseProgress,
  ProjectPhase,
  ProjectStatus,
  Solution,
  SolutionArtifact,
} from '../types';
import { deriveCurrentPhase, getPhaseLabel, PHASE_NAMES } from './phaseEngine';
import { syncPhaseAfterApproval } from './phaseResponseEngine';
import {
  getRequiredApprover,
  HR_DEPLOYMENT_CHECKLIST_ARTIFACT_ID,
  HR_TICKETING_SOLUTION_ID,
} from './approvalFlow';

export function deriveProjectStatus(
  solutionId: string,
  statusOverrides: Record<string, ArtifactStatus> = {},
): ProjectStatus {
  const all = getArtifactsWithStatuses(statusOverrides);
  const sol = all.find((s) => s.solutionId === solutionId);
  if (!sol) return 'building';

  const statuses = sol.artifacts.map((a) => a.status);
  if (statuses.every((s) => s === 'approved')) return 'ready_to_deploy';
  if (statuses.some((s) => s === 'in_review')) return 'in_review';
  return 'building';
}

export function syncSolutionProjectStatus(
  solutions: Solution[],
  statusOverrides: Record<string, ArtifactStatus>,
): Solution[] {
  return solutions.map((sol) => ({
    ...sol,
    projectStatus: sol.projectStatus === 'deployed'
      ? 'deployed'
      : deriveProjectStatus(sol.id, statusOverrides),
  }));
}

export function canCompleteChecklistItem(
  item: AdminChecklistItem,
  checklist: AdminChecklistItem[],
): { allowed: boolean; blockedBy?: string } {
  if (item.completed) return { allowed: false };
  for (const depId of item.dependsOn) {
    const dep = checklist.find((c) => c.id === depId);
    if (!dep?.completed) {
      return { allowed: false, blockedBy: dep?.label ?? depId };
    }
  }
  return { allowed: true };
}

export function isChecklistFullyComplete(checklist: AdminChecklistItem[]): boolean {
  return checklist.length > 0 && checklist.every((c) => c.completed);
}

export function buildGuestReviewUrl(reviewId: string): string {
  const base = window.location.pathname + window.location.search;
  return `${window.location.origin}${base}#guest-review=${reviewId}`;
}

export function parseGuestReviewFromHash(): string | null {
  const hash = window.location.hash.replace(/^#/, '');
  const match = hash.match(/^guest-review=(.+)$/);
  return match?.[1] ?? null;
}

export function findSolutionArtifacts(
  solutionId: string,
  statusOverrides: Record<string, ArtifactStatus>,
  dynamicBySolution: Record<string, import('../types').SolutionArtifact[]> = {},
  solutions: import('../types').Solution[] = [],
): SolutionArtifact[] {
  const sol = getArtifactsWithStatuses(statusOverrides, dynamicBySolution, solutions).find(
    (s) => s.solutionId === solutionId,
  );
  return sol?.artifacts ?? [];
}

export function getSolutionCurrentPhase(
  solution: Solution,
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus>,
): ProjectPhase {
  return deriveCurrentPhase(solution.phaseProgress, artifacts, statusOverrides);
}

export function formatPhaseBadge(phase: ProjectPhase): string {
  return getPhaseLabel(phase);
}

/** Resolve deployment checklist artifact id for a solution */
export function resolveDeploymentChecklistArtifactId(solutionId: string): string {
  return solutionId === HR_TICKETING_SOLUTION_ID
    ? HR_DEPLOYMENT_CHECKLIST_ARTIFACT_ID
    : `${solutionId}-deploy`;
}

/**
 * When admin completes all checklist steps, approve the deployment checklist artifact
 * and sync phase progress (phase 7 gate).
 */
export function buildAdminChecklistApprovalPatch(
  checklist: AdminChecklistItem[],
  solutionId: string,
): Record<string, ArtifactStatus> | null {
  const scoped = checklist.filter((c) => c.solutionId === solutionId);
  if (!isChecklistFullyComplete(scoped)) return null;
  return {
    [resolveDeploymentChecklistArtifactId(solutionId)]: 'approved',
  };
}

export function syncApprovalStatus(
  artifactId: string,
  outcome: 'approved' | 'changes_requested',
  statusOverrides: Record<string, ArtifactStatus>,
): Record<string, ArtifactStatus> {
  return {
    ...statusOverrides,
    [artifactId]: outcome === 'approved' ? 'approved' : 'draft',
  };
}

export function syncPhaseProgressAfterApproval(
  solution: Solution,
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus>,
  extra?: Partial<PhaseProgress>,
): PhaseProgress | undefined {
  if (!solution.phaseProgress) return undefined;
  const merged = extra
    ? { ...solution.phaseProgress, ...extra }
    : solution.phaseProgress;
  return syncPhaseAfterApproval(merged, artifacts, statusOverrides);
}

export { getRequiredApprover };
export { PHASE_NAMES };
export type { SolutionWithArtifacts };
