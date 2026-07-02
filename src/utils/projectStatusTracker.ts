import {
  AdminChecklistItem,
  ArtifactStatus,
  BusinessOwnerSubmission,
  DeveloperComment,
  ProjectPhase,
  Solution,
  SolutionArtifact,
  StakeholderReview,
  UserRole,
  WorkflowSnapshot,
  WorkflowStep,
  WorkflowStepId,
  WorkflowStepStatus,
} from '../types';
import { ROLE_LABELS } from '../constants/role';
import { findSolutionArtifacts } from './projectWorkflow';
import { HR_TICKETING_SOLUTION_ID, inferReviewReviewerRole } from './approvalFlow';

const WORKFLOW_HANDOFF_KEY = 'mitra_workflow_handoff';

export interface WorkflowTrackerInput {
  solution: Solution | null;
  statusOverrides?: Record<string, ArtifactStatus>;
  dynamicArtifactsBySolution?: Record<string, SolutionArtifact[]>;
  solutions?: Solution[];
  stakeholderReviews?: StakeholderReview[];
  businessOwnerSubmissions?: BusinessOwnerSubmission[];
  adminChecklist?: AdminChecklistItem[];
  developerComments?: DeveloperComment[];
}

interface StepDefinition {
  id: WorkflowStepId;
  label: string;
  personaRole: UserRole;
  description: string;
  activeDescription: string;
}

export const WORKFLOW_STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: 'business_owner',
    label: 'Requirements & user stories',
    personaRole: 'business_owner',
    description: 'Upload requirements and formulate Agile-ready user stories.',
    activeDescription: 'Uploading requirements and drafting user stories',
  },
  {
    id: 'architect',
    label: 'Solution design & discovery',
    personaRole: 'architect',
    description: 'Requirements document, data model, workflows, and discovery.',
    activeDescription: 'Creating Requirements Document and next design steps',
  },
  {
    id: 'stakeholder',
    label: 'Review & approval',
    personaRole: 'stakeholder',
    description: 'Business stakeholder sign-off on scope and deliverables.',
    activeDescription: 'Reviewing artifacts and awaiting approval decisions',
  },
  {
    id: 'developer',
    label: 'Build & conflict resolution',
    personaRole: 'developer',
    description: 'Implementation, technical review, and conflict resolution.',
    activeDescription: 'Building update set and resolving implementation conflicts',
  },
  {
    id: 'admin_security',
    label: 'Configuration & gates',
    personaRole: 'admin',
    description: 'Platform configuration, security gates, and deployment readiness.',
    activeDescription: 'Completing admin checklist and security configuration gates',
  },
];

function artifactStatus(
  artifact: SolutionArtifact,
  overrides: Record<string, ArtifactStatus>,
): ArtifactStatus {
  return overrides[artifact.id] ?? artifact.status;
}

function readWorkflowHandoff(solutionId: string): boolean {
  try {
    const raw = localStorage.getItem(WORKFLOW_HANDOFF_KEY);
    if (!raw) return false;
    const map = JSON.parse(raw) as Record<string, boolean>;
    return Boolean(map[solutionId]);
  } catch {
    return false;
  }
}

export function persistWorkflowHandoff(solutionId: string): void {
  try {
    const raw = localStorage.getItem(WORKFLOW_HANDOFF_KEY);
    const map = (raw ? JSON.parse(raw) : {}) as Record<string, boolean>;
    map[solutionId] = true;
    localStorage.setItem(WORKFLOW_HANDOFF_KEY, JSON.stringify(map));
  } catch {
    /* ignore storage errors */
  }
}

function phaseToActiveStepIndex(phase: ProjectPhase): number {
  if (phase <= 2) return 1;
  if (phase === 3) return 2;
  if (phase <= 5) return 3;
  return 4;
}

function resolveActiveStepIndex(input: WorkflowTrackerInput, artifacts: SolutionArtifact[]): number {
  const {
    solution,
    statusOverrides = {},
    stakeholderReviews = [],
    businessOwnerSubmissions = [],
    adminChecklist = [],
    developerComments = [],
  } = input;

  if (!solution) return 0;

  const solutionId = solution.id;
  const getStatus = (a: SolutionArtifact) => artifactStatus(a, statusOverrides);

  if (solution.projectStatus === 'deployed') return 4;

  const scopedChecklist = adminChecklist.filter((c) => c.solutionId === solutionId);
  const checklistStarted = scopedChecklist.some((c) => c.completed);
  if (solution.projectStatus === 'ready_to_deploy' || checklistStarted) return 4;

  const scopedComments = developerComments.filter((c) => c.solutionId === solutionId);
  const unresolvedBlockers = scopedComments.filter((c) => !c.resolved && c.severity === 'blocker');
  const devArtifactTypes = new Set(['data_model', 'script_library']);
  const devArtifactsActive = artifacts.some(
    (a) =>
      devArtifactTypes.has(a.type) &&
      ['draft', 'pending', 'in_review'].includes(getStatus(a)),
  );
  const devReviewsPending = stakeholderReviews.some(
    (r) =>
      r.solutionId === solutionId &&
      r.status === 'awaiting' &&
      inferReviewReviewerRole(r) === 'developer',
  );
  if (unresolvedBlockers.length > 0 || devArtifactsActive || devReviewsPending) return 3;

  const stakeholderGateTypes = new Set([
    'requirements_doc',
    'executive_summary',
    'user_stories',
    'process_flow',
    'workflow',
  ]);
  const stakeholderArtifactsInReview = artifacts.some(
    (a) => stakeholderGateTypes.has(a.type) && getStatus(a) === 'in_review',
  );
  const stakeholderReviewsPending = stakeholderReviews.some(
    (r) =>
      r.solutionId === solutionId &&
      r.status === 'awaiting' &&
      ['stakeholder', 'sponsor'].includes(inferReviewReviewerRole(r)),
  );
  if (
    stakeholderArtifactsInReview ||
    stakeholderReviewsPending ||
    solution.projectStatus === 'in_review'
  ) {
    const phase = solution.phaseProgress?.currentPhase;
    if (phase != null && phase <= 2) {
      /* Phase 2 design reviews — architect still owns the thread */
    } else if (phase === 3 || stakeholderArtifactsInReview || stakeholderReviewsPending) {
      return 2;
    }
  }

  if (solution.phaseProgress?.currentPhase != null) {
    return phaseToActiveStepIndex(solution.phaseProgress.currentPhase);
  }

  const boHandoff =
    readWorkflowHandoff(solutionId) ||
    businessOwnerSubmissions.some((s) => s.status === 'submitted');
  const requirementsReady = artifacts.some(
    (a) => a.type === 'requirements_doc' && getStatus(a) !== 'not_started',
  );
  const requirementsApproved = artifacts.some(
    (a) => a.type === 'requirements_doc' && getStatus(a) === 'approved',
  );

  if (boHandoff || requirementsApproved || requirementsReady || solution.chatHistory.length > 0) {
    return 1;
  }

  return 0;
}

function isBusinessOwnerComplete(
  input: WorkflowTrackerInput,
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus>,
): boolean {
  const { solution, businessOwnerSubmissions = [] } = input;
  if (!solution) return false;

  if (
    readWorkflowHandoff(solution.id) ||
    businessOwnerSubmissions.some((s) => s.status === 'submitted')
  ) {
    return true;
  }

  return artifacts.some(
    (a) =>
      a.type === 'requirements_doc' &&
      ['approved', 'in_review', 'draft', 'pending'].includes(
        statusOverrides[a.id] ?? a.status,
      ),
  );
}

function stepStatusForIndex(
  index: number,
  activeIndex: number,
  blocked: boolean,
): WorkflowStepStatus {
  if (index < activeIndex) return 'complete';
  if (index > activeIndex) return 'pending';
  return blocked ? 'blocked' : 'active';
}

function buildHeadline(steps: WorkflowStep[]): string {
  const active = steps.find((s) => s.status === 'active' || s.status === 'blocked');
  if (!active) {
    const allComplete = steps.every((s) => s.status === 'complete');
    return allComplete ? 'Workflow complete — ready for production' : 'Project workflow';
  }
  const persona = ROLE_LABELS[active.personaRole];
  const prefix = active.status === 'blocked' ? 'Blocked at' : 'At';
  return `${prefix} ${persona} — ${active.activeDescription}`;
}

/**
 * Compute persona-connected workflow steps for the project status stepper.
 */
export function computeWorkflowSnapshot(input: WorkflowTrackerInput): WorkflowSnapshot | null {
  const { solution, statusOverrides = {}, dynamicArtifactsBySolution = {}, solutions = [] } =
    input;
  if (!solution) return null;

  const artifacts = findSolutionArtifacts(
    solution.id,
    statusOverrides,
    dynamicArtifactsBySolution,
    solutions,
  );

  const activeIndex = resolveActiveStepIndex(input, artifacts);
  const activeStepId = WORKFLOW_STEP_DEFINITIONS[activeIndex]?.id ?? 'business_owner';
  const boComplete = isBusinessOwnerComplete(input, artifacts, statusOverrides);

  const scopedComments = (input.developerComments ?? []).filter(
    (c) => c.solutionId === solution.id,
  );
  const hasDevBlockers = scopedComments.some((c) => !c.resolved && c.severity === 'blocker');
  const blocked = activeIndex === 3 && hasDevBlockers;

  const steps: WorkflowStep[] = WORKFLOW_STEP_DEFINITIONS.map((def, index) => {
    let status = stepStatusForIndex(index, activeIndex, blocked && index === activeIndex);

    if (def.id === 'business_owner' && boComplete && index <= activeIndex) {
      status = index < activeIndex ? 'complete' : status === 'active' ? 'active' : 'complete';
      if (index === 0 && activeIndex > 0) status = 'complete';
    }

    if (solution.projectStatus === 'deployed') {
      status = 'complete';
    }

    return {
      id: def.id,
      label: def.label,
      personaRole: def.personaRole,
      description: def.description,
      activeDescription: def.activeDescription,
      status,
    };
  });

  return {
    steps,
    activeStepId,
    headline: buildHeadline(steps),
  };
}

/** Demo seed: HR Ticketing starts at Architect with phase 2 progress */
export function seedHrTicketingWorkflowProgress(
  solutions: Solution[],
): Solution[] {
  return solutions.map((sol) => {
    if (sol.id !== HR_TICKETING_SOLUTION_ID) return sol;
    if (sol.phaseProgress) return sol;
    return {
      ...sol,
      projectStatus: sol.projectStatus ?? 'building',
      phaseProgress: {
        solutionId: HR_TICKETING_SOLUTION_ID,
        currentPhase: 2,
        questionIndex: 0,
        artifactsGenerated: ['hr-req', 'hr-data'],
        phaseStartedAt: new Date().toISOString(),
      },
    };
  });
}
