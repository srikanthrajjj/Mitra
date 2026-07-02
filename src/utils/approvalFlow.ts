import {
  ArtifactType,
  GateApprover,
  SharePermission,
  SolutionArtifact,
  StakeholderReview,
  StakeholderReviewStatus,
  UserRole,
} from '../types';
import { ROLE_LABELS, ROLE_PROFILE_SUBTITLES } from '../constants/role';

/** User chose to route artifact for sign-off */
export function isSendForApprovalAction(text: string): boolean {
  return /send.*(?:stakeholder|sponsor|approval)|send for approval|share for approval|route.*approval|submit.*approval/i.test(
    text.trim(),
  );
}

export function isContinueBuildingAction(text: string): boolean {
  return /continue building|view artifact|add another reviewer/i.test(text.trim());
}

export const HR_TICKETING_SOLUTION_ID = 'hr-ticketing';
export const HR_SUMMARY_ARTIFACT_ID = 'hr-summary';
export const HR_SUMMARY_REVIEW_ID = 'rev-hr-summary';
export const HR_DEPLOYMENT_CHECKLIST_ARTIFACT_ID = 'hr-ticketing-deploy';

/** Gate approver per artifact type (phase gates) */
export const ARTIFACT_GATE_APPROVERS: Record<ArtifactType, GateApprover> = {
  requirements_doc: 'stakeholder',
  user_stories: 'stakeholder',
  process_flow: 'stakeholder',
  data_model: 'developer',
  workflow: 'stakeholder',
  role_matrix: 'security',
  script_library: 'developer',
  executive_summary: 'sponsor',
  rfp_package: 'architect',
  test_script: 'qa',
  deployment_checklist: 'admin',
};

/** Artifact types a signed-in persona may approve */
export const DEVELOPER_APPROVABLE_TYPES: ArtifactType[] = ['data_model', 'script_library'];

export function gateApproverToReviewerRole(approver: GateApprover): UserRole {
  switch (approver) {
    case 'stakeholder':
    case 'qa':
      return 'stakeholder';
    case 'developer':
      return 'developer';
    case 'security':
      return 'security';
    case 'sponsor':
      return 'sponsor';
    case 'admin':
      return 'admin';
    case 'architect':
      return 'architect';
    default:
      return 'stakeholder';
  }
}

export function getRequiredApprover(artifact: Pick<SolutionArtifact, 'type' | 'id'>): UserRole {
  return gateApproverToReviewerRole(ARTIFACT_GATE_APPROVERS[artifact.type] ?? 'stakeholder');
}

export function inferReviewReviewerRole(
  review: StakeholderReview,
  artifact?: Pick<SolutionArtifact, 'type' | 'id'> | null,
): UserRole {
  if (review.reviewerRole) return review.reviewerRole;
  if (artifact) return getRequiredApprover(artifact);
  return 'stakeholder';
}

export function canRoleApproveReview(
  role: UserRole,
  review: StakeholderReview,
  artifact?: Pick<SolutionArtifact, 'type' | 'id'> | null,
): boolean {
  if (role === 'architect') return false;
  const required = inferReviewReviewerRole(review, artifact);
  return role === required;
}

export function canRoleApproveArtifact(
  role: UserRole,
  artifact: Pick<SolutionArtifact, 'type' | 'id'>,
): boolean {
  if (role === 'architect') return false;
  return role === getRequiredApprover(artifact);
}

export function filterReviewsForRole(
  reviews: StakeholderReview[],
  role: UserRole,
  artifactLookup?: (artifactId: string) => SolutionArtifact | undefined,
): StakeholderReview[] {
  return reviews.filter((review) => {
    const artifact = artifactLookup?.(review.artifactId);
    return inferReviewReviewerRole(review, artifact) === role;
  });
}

export function getPersonaShareLabel(role: UserRole): string {
  return ROLE_PROFILE_SUBTITLES[role] ?? ROLE_LABELS[role];
}

export function getDefaultReviewerEmail(role: UserRole): string {
  switch (role) {
    case 'developer':
      return 'developer@company.com';
    case 'security':
      return 'security@company.com';
    case 'sponsor':
      return 'sponsor@company.com';
    case 'admin':
      return 'admin@company.com';
    case 'stakeholder':
    default:
      return 'stakeholder@company.com';
  }
}

export function getAssignmentGroup(role: UserRole): string {
  switch (role) {
    case 'developer':
      return 'ServiceNow Developers';
    case 'security':
      return 'Security & Compliance';
    case 'sponsor':
      return 'Project Sponsors';
    case 'admin':
      return 'Platform Administrators';
    case 'stakeholder':
    default:
      return 'Business Stakeholders';
  }
}

export function getApproverDisplayName(role: UserRole): string {
  switch (role) {
    case 'developer':
      return 'ServiceNow Developer';
    case 'security':
      return 'Security Officer';
    case 'sponsor':
      return 'Project Sponsor';
    case 'admin':
      return 'Platform Administrator';
    case 'stakeholder':
      return 'Business Stakeholder';
    default:
      return ROLE_LABELS[role];
  }
}

export function buildExecutiveSummary(process: string): string {
  return [
    `**Executive Summary — HR Ticketing System**`,
    '',
    `**Scope:** ${process} on the HRSD platform — employee requests routed to the right COE with SLAs and confidential-case handling.`,
    '',
    `**Timeline:** Q3 go-live · 6–8 weeks after business approval`,
    '',
    `**Outcomes:**`,
    `- Employee Center self-service intake`,
    `- COE assignment automation`,
    `- HR-scoped ACLs for confidential cases`,
    '',
    `**Investment:** Scoped application + Employee Center catalog item (no core ITSM changes)`,
  ].join('\n');
}

export function formatSnRecordUpdate(params: {
  table: string;
  record: string;
  fromState: string;
  toState: string;
  updatedBy: string;
  assignedTo?: string;
  assignmentGroup?: string;
  comments?: string;
  notifyPersona?: string;
}): string {
  const lines = [
    `## Record updated`,
    '',
    `| Field | Value |`,
    `|-------|-------|`,
    `| **Table** | \`${params.table}\` |`,
    `| **Record** | ${params.record} |`,
    `| **State** | ${params.fromState} → **${params.toState}** |`,
    `| **Updated by** | ${params.updatedBy} |`,
  ];
  if (params.assignmentGroup) lines.push(`| **Assignment group** | ${params.assignmentGroup} |`);
  if (params.assignedTo) lines.push(`| **Assigned to** | ${params.assignedTo} |`);
  if (params.comments) lines.push(`| **Comments** | ${params.comments} |`);
  const persona = params.notifyPersona ?? 'reviewer';
  lines.push(
    '',
    `Workflow **Mitra Artifact Approval** triggered. ${persona} notified via email and in-app review queue.`,
  );
  return lines.join('\n');
}

export function formatApprovalResponseUpdate(params: {
  record: string;
  outcome: 'approved' | 'changes_requested';
  reviewerRole: UserRole;
  comments?: string;
}): string {
  const state = params.outcome === 'approved' ? 'Approved' : 'Changes requested';
  return formatSnRecordUpdate({
    table: 'u_mitra_artifact_approval',
    record: params.record,
    fromState: 'In Review',
    toState: state,
    updatedBy: getApproverDisplayName(params.reviewerRole),
    comments:
      params.comments ??
      (params.outcome === 'approved'
        ? 'Approved as-is. Proceed to next phase.'
        : 'Please revise and resubmit.'),
  });
}

/** @deprecated use formatApprovalResponseUpdate */
export function formatStakeholderResponseUpdate(params: {
  record: string;
  outcome: 'approved' | 'changes_requested';
  stakeholderName: string;
  comments?: string;
}): string {
  return formatApprovalResponseUpdate({
    record: params.record,
    outcome: params.outcome,
    reviewerRole: 'stakeholder',
    comments: params.comments,
  });
}

export const AUTO_APPROVE_KEY = 'mitra_auto_approve';

export function readAutoApprove(): boolean {
  try {
    return localStorage.getItem(AUTO_APPROVE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function persistAutoApprove(value: boolean): void {
  try {
    localStorage.setItem(AUTO_APPROVE_KEY, String(value));
  } catch {
    /* ignore storage errors */
  }
}

export function relativeTimeLabel(): string {
  return 'Just now';
}

/** Display name from reviewer email for architect chat lines. */
export function recipientNameFromEmail(email: string): string {
  const local = (email.split('@')[0] ?? email).trim();
  if (!local) return 'reviewer';
  return local
    .replace(/[._-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export const DEMO_AUTO_APPROVE_MS = 30_000;

export function daysAgoLabel(days: number): string {
  return days === 0 ? 'Just now' : days === 1 ? '1d ago' : `${days}d ago`;
}

export function createShareReview(params: {
  artifactId: string;
  artifactName: string;
  solutionId: string;
  solutionTitle: string;
  summaryText?: string;
  guestSections?: import('../types').RequirementsSection[];
  email: string;
  permission: SharePermission;
  senderName: string;
  reviewerRole: UserRole;
}): StakeholderReview {
  const id = `rev-${params.artifactId}-${Date.now()}`;
  return {
    id,
    solutionId: params.solutionId,
    artifactId: params.artifactId,
    solutionTitle: params.solutionTitle,
    artifactName: params.artifactName,
    status: 'awaiting',
    summaryText: params.summaryText,
    guestSections: params.guestSections,
    sentAt: new Date().toISOString(),
    senderName: params.senderName,
    recipientEmail: params.email,
    permission: params.permission,
    reviewerRole: params.reviewerRole,
  };
}

export function formatShareSnUpdate(params: {
  artifactName: string;
  solutionTitle: string;
  email: string;
  permission: SharePermission;
  senderName: string;
  reviewerRole: UserRole;
}): string {
  return formatSnRecordUpdate({
    table: 'u_mitra_artifact_approval',
    record: `${params.artifactName} — ${params.solutionTitle}`,
    fromState: 'Draft',
    toState: 'In Review',
    updatedBy: params.senderName,
    assignedTo: params.email,
    assignmentGroup: getAssignmentGroup(params.reviewerRole),
    comments: `Shared with ${params.permission} permission. Guest link sent — no login required.`,
    notifyPersona: getPersonaShareLabel(params.reviewerRole),
  });
}

export function createPendingHrSummaryReview(summaryText: string): StakeholderReview {
  return {
    id: HR_SUMMARY_REVIEW_ID,
    solutionId: HR_TICKETING_SOLUTION_ID,
    artifactId: HR_SUMMARY_ARTIFACT_ID,
    solutionTitle: 'HR Ticketing System',
    artifactName: 'Executive Summary',
    status: 'awaiting',
    summaryText,
    sentAt: new Date().toISOString(),
    reviewerRole: 'sponsor',
  };
}

export function completeReview(
  review: StakeholderReview,
  status: Exclude<StakeholderReviewStatus, 'awaiting'>,
  comments?: string,
): StakeholderReview {
  const label =
    status === 'approved'
      ? `Approved ${relativeTimeLabel()}`
      : `Changes requested ${relativeTimeLabel()}`;
  return {
    ...review,
    status,
    completedLabel: label,
    stakeholderComments: comments,
  };
}

/** Completed reviews shown before architect sends HR summary */
export const INITIAL_STAKEHOLDER_REVIEWS: StakeholderReview[] = [
  {
    id: 'rev-hr-roles-security',
    solutionId: HR_TICKETING_SOLUTION_ID,
    artifactId: 'hr-roles',
    solutionTitle: 'HR Ticketing System',
    artifactName: 'Role & Permission Matrix',
    status: 'awaiting',
    summaryText:
      'ACL matrix for hr_agent, hr_manager, employee, and it_support — confidential case field restricted to HR roles.',
    sentAt: new Date().toISOString(),
    reviewerRole: 'security',
  },
  {
    id: 'rev-hr-summary-sponsor',
    solutionId: HR_TICKETING_SOLUTION_ID,
    artifactId: HR_SUMMARY_ARTIFACT_ID,
    solutionTitle: 'HR Ticketing System',
    artifactName: 'Executive Summary',
    status: 'awaiting',
    summaryText: buildExecutiveSummary('Employee Relations'),
    sentAt: new Date().toISOString(),
    reviewerRole: 'sponsor',
  },
  {
    id: 'rev-eo-flow',
    solutionId: 'employee-onboarding',
    artifactId: 'eo-req',
    solutionTitle: 'Employee Onboarding',
    artifactName: 'Workflow Diagram',
    status: 'approved',
    completedLabel: 'Approved 2d ago',
    reviewerRole: 'stakeholder',
  },
  {
    id: 'rev-vm-roles',
    solutionId: 'vendor-management',
    artifactId: 'vm-req',
    solutionTitle: 'Vendor Management',
    artifactName: 'Role Matrix',
    status: 'changes_requested',
    completedLabel: 'Changes requested 5d ago',
    reviewerRole: 'security',
  },
];
