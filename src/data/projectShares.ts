import { ProjectCollaborator } from '../types';
import { HR_TICKETING_SOLUTION_ID } from '../utils/approvalFlow';
import { ARCHITECT_DISPLAY_NAME } from '../constants/role';

export const PROJECT_COLLABORATORS_STORAGE_KEY = 'mitra_project_collaborators';

export const SEED_PROJECT_COLLABORATORS: ProjectCollaborator[] = [
  {
    id: 'collab-hr-stakeholder',
    solutionId: HR_TICKETING_SOLUTION_ID,
    email: 'priya.nair@acme.com',
    name: 'Priya Nair',
    permission: 'view',
    invitedAt: '2026-06-12T10:00:00Z',
    invitedBy: ARCHITECT_DISPLAY_NAME,
    status: 'active',
  },
  {
    id: 'collab-hr-dev',
    solutionId: HR_TICKETING_SOLUTION_ID,
    email: 'marcus.chen@acme.com',
    name: 'Marcus Chen',
    permission: 'edit',
    invitedAt: '2026-06-11T14:30:00Z',
    invitedBy: ARCHITECT_DISPLAY_NAME,
    status: 'active',
  },
];

export function loadProjectCollaborators(): ProjectCollaborator[] {
  try {
    const stored = localStorage.getItem(PROJECT_COLLABORATORS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ProjectCollaborator[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore corrupt storage
  }
  return SEED_PROJECT_COLLABORATORS;
}

export function persistProjectCollaborators(collaborators: ProjectCollaborator[]): void {
  localStorage.setItem(PROJECT_COLLABORATORS_STORAGE_KEY, JSON.stringify(collaborators));
}

export function getCollaboratorsForSolution(
  collaborators: ProjectCollaborator[],
  solutionId: string,
): ProjectCollaborator[] {
  return collaborators.filter((c) => c.solutionId === solutionId);
}
