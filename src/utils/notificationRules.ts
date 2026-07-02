import { GateApprover } from '../types';
import { getApproverRoleLabel } from './phaseEngine';

export type NotificationEvent =
  | {
      type: 'artifact_generated';
      artifactName: string;
      artifactId: string;
      reviewerPersona: GateApprover;
      solutionTitle: string;
    }
  | {
      type: 'approval_received';
      artifactName: string;
      solutionTitle: string;
      approverLabel?: string;
    }
  | {
      type: 'changes_requested';
      artifactName: string;
      solutionTitle: string;
      comment?: string;
    }
  | {
      type: 'all_gates_green';
      solutionTitle: string;
    }
  | {
      type: 'compliance_rejection';
      artifactName: string;
      solutionTitle: string;
      justification: string;
    }
  | {
      type: 'share_routed';
      artifactName: string;
      solutionTitle: string;
      personaLabel: string;
      permission: string;
    }
  | {
      type: 'stakeholder_arrival';
      artifactName: string;
      solutionTitle: string;
      acceptanceCriteriaSummary: string;
      timelineHint: string;
      approversSummary?: string;
    };

export interface NotificationDispatch {
  pushNotification: (text: string) => void;
  showCenterToast: (message: string, title?: string) => void;
}

function reviewerLabel(persona: GateApprover): string {
  return getApproverRoleLabel(persona);
}

export function buildNotificationCopy(event: NotificationEvent): {
  toastTitle?: string;
  toastMessage: string;
  notification: string;
} {
  switch (event.type) {
    case 'artifact_generated':
      return {
        toastTitle: 'Artifact ready for review',
        toastMessage: `${event.artifactName} generated — ${reviewerLabel(event.reviewerPersona)} notified.`,
        notification: `${event.artifactName} ready — ${reviewerLabel(event.reviewerPersona)} assigned to review`,
      };
    case 'approval_received':
      return {
        toastTitle: 'Approval received',
        toastMessage: `${event.approverLabel ?? 'Reviewer'} approved ${event.artifactName}.`,
        notification: `${event.artifactName} approved${event.approverLabel ? ` by ${event.approverLabel}` : ''} — Architect notified`,
      };
    case 'changes_requested':
      return {
        toastTitle: 'Changes requested',
        toastMessage: event.comment
          ? `Changes on ${event.artifactName}: ${event.comment}`
          : `Changes requested on ${event.artifactName}.`,
        notification: `Changes requested on ${event.artifactName}${event.comment ? ` — ${event.comment}` : ''}`,
      };
    case 'all_gates_green':
      return {
        toastTitle: 'Ready to deploy',
        toastMessage: `${event.solutionTitle}: all gates green — Admin notified.`,
        notification: `${event.solutionTitle}: all approvals complete — ready to deploy (Admin notified)`,
      };
    case 'compliance_rejection':
      return {
        toastTitle: 'Compliance rejection',
        toastMessage: `${event.artifactName} rejected — progress blocked until resolved.`,
        notification: `Compliance rejection on ${event.artifactName}: ${event.justification}`,
      };
    case 'share_routed':
      return {
        toastTitle: `Shared with ${event.personaLabel}`,
        toastMessage: `${event.artifactName} routed for ${event.permission} review.`,
        notification: `${event.artifactName} shared with ${event.personaLabel} (${event.permission})`,
      };
    case 'stakeholder_arrival':
      return {
        toastTitle: 'Requirements awaiting your review',
        toastMessage: [
          `**${event.artifactName}** for ${event.solutionTitle} needs your approval.`,
          '',
          `**Acceptance criteria:** ${event.acceptanceCriteriaSummary}`,
          '',
          event.approversSummary ? `**Approvers:** ${event.approversSummary}` : '',
          event.approversSummary ? '' : '',
          event.timelineHint,
        ]
          .filter(Boolean)
          .join('\n'),
        notification: `${event.artifactName} pending review — ${event.acceptanceCriteriaSummary.slice(0, 80)}`,
      };
  }
}

export function dispatchNotificationEvent(
  event: NotificationEvent,
  dispatch: NotificationDispatch,
): void {
  const copy = buildNotificationCopy(event);
  dispatch.showCenterToast(copy.toastMessage, copy.toastTitle);
  dispatch.pushNotification(copy.notification);
}

export function dispatchNotificationEvents(
  events: NotificationEvent[] | undefined,
  dispatch: NotificationDispatch,
): void {
  if (!events?.length) return;
  for (const event of events) {
    dispatchNotificationEvent(event, dispatch);
  }
}

export function artifactGeneratedEvent(
  artifactName: string,
  artifactId: string,
  reviewerPersona: GateApprover,
  solutionTitle: string,
): NotificationEvent {
  return { type: 'artifact_generated', artifactName, artifactId, reviewerPersona, solutionTitle };
}

export function approvalReceivedEvent(
  artifactName: string,
  solutionTitle: string,
  approverLabel?: string,
): NotificationEvent {
  return { type: 'approval_received', artifactName, solutionTitle, approverLabel };
}

export function changesRequestedEvent(
  artifactName: string,
  solutionTitle: string,
  comment?: string,
): NotificationEvent {
  return { type: 'changes_requested', artifactName, solutionTitle, comment };
}

export function allGatesGreenEvent(solutionTitle: string): NotificationEvent {
  return { type: 'all_gates_green', solutionTitle };
}

export function complianceRejectionEvent(
  artifactName: string,
  solutionTitle: string,
  justification: string,
): NotificationEvent {
  return { type: 'compliance_rejection', artifactName, solutionTitle, justification };
}

export function stakeholderArrivalEvent(params: {
  artifactName: string;
  solutionTitle: string;
  acceptanceCriteriaSummary: string;
  timelineHint?: string;
  approversSummary?: string;
}): NotificationEvent {
  return {
    type: 'stakeholder_arrival',
    artifactName: params.artifactName,
    solutionTitle: params.solutionTitle,
    acceptanceCriteriaSummary: params.acceptanceCriteriaSummary,
    timelineHint:
      params.timelineHint ??
      'Review & approve to unlock Solution Design (data model, workflow, role matrix).',
    approversSummary: params.approversSummary,
  };
}

