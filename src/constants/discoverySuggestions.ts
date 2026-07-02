import { ChatMessage, PhaseProgress } from '../types';
import { ARCHITECT_OPENING_QUESTION } from '../utils/phaseEngine';

export const DISCOVERY_FIRST_QUESTION_TEXT = ARCHITECT_OPENING_QUESTION;

/** Architect discovery Q2 — manual process today. */
export const DISCOVERY_MANUAL_PROCESS_QUESTION_TEXT =
  'What happens today when this problem occurs — walk me through what someone actually does manually right now.';

/** @deprecated Use DISCOVERY_MANUAL_PROCESS_QUESTION_TEXT */
export const DISCOVERY_ACCEPTANCE_QUESTION_TEXT = DISCOVERY_MANUAL_PROCESS_QUESTION_TEXT;

/** Architect discovery Q3 — people, approvals, integrations, compliance. */
export const DISCOVERY_WORKFLOW_CONTEXT_QUESTION_TEXT =
  'Who is involved in this workflow, and are there any approval rules, integrations, or compliance boundaries I should know?';

/** @deprecated Merged into DISCOVERY_WORKFLOW_CONTEXT_QUESTION_TEXT */
export const DISCOVERY_STAKEHOLDERS_QUESTION_TEXT = DISCOVERY_WORKFLOW_CONTEXT_QUESTION_TEXT;

/** Opening + 2 follow-ups before Requirements Document generation. */
export const ARCHITECT_DISCOVERY_QUESTION_COUNT = 3;

export interface DiscoveryAppSuggestion {
  label: string;
  message: string;
}

export const DISCOVERY_APP_SUGGESTIONS: DiscoveryAppSuggestion[] = [
  {
    label: 'HR case management',
    message: 'An HR case management application for regional HR business partners and employees — structured intake, category-based routing, SLA tracking, and manager visibility. Scope is likely HR Service Delivery on ServiceNow with ties to employee records and knowledge articles.',
  },
  {
    label: 'Vendor onboarding',
    message: 'A vendor onboarding workflow for procurement, legal, and accounts payable — vetting new suppliers, collecting compliance documentation, and approving vendor master records before purchase orders are issued. Built on ServiceNow with Supplier Lifecycle Operations or custom scoped app.',
  },
  {
    label: 'Field service dispatch',
    message: 'A field service dispatch application for dispatch coordinators and mobile technicians — work order assignment, parts availability checks, travel routing, and on-site completion capture. Target platform is Field Service Management on ServiceNow with Customer Service Management handoffs.',
  },
  {
    label: 'Compliance audit workflow',
    message: 'A compliance audit workflow for internal audit teams and control owners — planning audit cycles, collecting evidence, tracking findings, assigning remediation owners, and reporting status to executives. ServiceNow GRC or Integrated Risk Management scope with document attachments and approval gates.',
  },
  {
    label: 'IT asset lifecycle',
    message: 'An IT asset lifecycle application for IT operations and end users — request, provision, move, refresh, and retire hardware assets with CMDB alignment and procurement integration. Scoped ServiceNow app extending asset and configuration management with self-service catalog entry points.',
  },
  {
    label: 'Grant disbursement tracking',
    message: 'A grant disbursement tracking application for program officers, finance controllers, and field implementers — intake of funding requests, milestone verification, multi-level approval, and payment release with audit trail. ServiceNow scoped app for a humanitarian or public-sector org with strict compliance boundaries.',
  },
];

export const DISCOVERY_SUGGESTIONS_VISIBLE_COUNT = 4;

export interface ArchitectColdStartLead {
  label: string;
  /** Short scope hint shown on the chip card */
  scope: string;
  /** Well-formed starter answer sent when the architect picks a lead */
  message: string;
}

/** One-line guidance under the opening question — architect cold start only. */
export const ARCHITECT_COLD_START_HINT =
  'Describe the business problem, who uses it, and any ServiceNow scope you already know.';

/** Architect cold-start lead options — ServiceNow-relevant, enterprise-ready scenarios. */
export const ARCHITECT_COLD_START_LEADS: ArchitectColdStartLead[] = [
  {
    label: 'HR case management',
    scope: 'HRSD · employee & HR partner intake',
    message:
      'An HR case management application for regional HR business partners and employees — structured intake, category-based routing, SLA tracking, and manager visibility. Scope is likely HR Service Delivery on ServiceNow with ties to employee records and knowledge articles.',
  },
  {
    label: 'Vendor onboarding',
    scope: 'Procurement · legal & supplier vetting',
    message:
      'A vendor onboarding workflow for procurement, legal, and accounts payable — vetting new suppliers, collecting compliance documentation, and approving vendor master records before purchase orders are issued. Built on ServiceNow with Supplier Lifecycle Operations or custom scoped app.',
  },
  {
    label: 'Field service dispatch',
    scope: 'FSM · coordinators & mobile technicians',
    message:
      'A field service dispatch application for dispatch coordinators and mobile technicians — work order assignment, parts availability checks, travel routing, and on-site completion capture. Target platform is Field Service Management on ServiceNow with Customer Service Management handoffs.',
  },
  {
    label: 'Compliance audit workflow',
    scope: 'GRC · audit cycles & remediation',
    message:
      'A compliance audit workflow for internal audit teams and control owners — planning audit cycles, collecting evidence, tracking findings, assigning remediation owners, and reporting status to executives. ServiceNow GRC or Integrated Risk Management scope with document attachments and approval gates.',
  },
  {
    label: 'IT asset lifecycle',
    scope: 'ITOM · request through retire',
    message:
      'An IT asset lifecycle application for IT operations and end users — request, provision, move, refresh, and retire hardware assets with CMDB alignment and procurement integration. Scoped ServiceNow app extending asset and configuration management with self-service catalog entry points.',
  },
  {
    label: 'Grant disbursement tracking',
    scope: 'Public sector · program officers & finance',
    message:
      'A grant disbursement tracking application for program officers, finance controllers, and field implementers — intake of funding requests, milestone verification, multi-level approval, and payment release with audit trail. ServiceNow scoped app for a humanitarian or public-sector org with strict compliance boundaries.',
  },
];

export function isDiscoveryFirstQuestionMessage(_text: string): boolean {
  return false;
}

/** Cold-start lead chips only before the first user message — not during Q2/Q3. */
export function shouldShowDiscoveryAppSuggestions(
  messages: ChatMessage[],
  phaseProgress: PhaseProgress | undefined,
  isGenerating: boolean,
): boolean {
  if (isGenerating) return false;
  if (messages.some((m) => m.sender === 'user')) return false;
  if (phaseProgress?.currentPhase !== 1) return false;
  return (phaseProgress.questionIndex ?? 0) === 0;
}
