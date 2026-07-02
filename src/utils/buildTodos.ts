import type { MitraTodoItem } from '../types';

const BUILD_PATTERN =
  /\b(build|create|implement|design|develop|configure|set up|setup|make|generate|draft)\b/i;

function cloneTodos(items: MitraTodoItem[]): MitraTodoItem[] {
  return items.map((item) => ({ ...item }));
}

export const HR_BUILD_TODOS: MitraTodoItem[] = [
  { id: 't1', label: 'Parse HR onboarding scope and map HRSD modules', status: 'active' },
  { id: 't2', label: 'Draft user stories and catalog item structure', status: 'pending' },
  { id: 't3', label: 'Configure approval workflow and Flow Designer SLA timers', status: 'pending' },
  { id: 't4', label: 'Define table schema, forms, and assignment rules', status: 'pending' },
  { id: 't5', label: 'Generate ATF test suite and SLA dashboard widgets', status: 'pending' },
  { id: 't6', label: 'Package artifacts for stakeholder review', status: 'pending' },
];

const CATALOG_BUILD_TODOS: MitraTodoItem[] = [
  { id: 'c1', label: 'Capture catalog request requirements and fulfillment path', status: 'active' },
  { id: 'c2', label: 'Design catalog item, variables, and record producer', status: 'pending' },
  { id: 'c3', label: 'Build approval routing and assignment rules', status: 'pending' },
  { id: 'c4', label: 'Wire Flow Designer fulfillment and notifications', status: 'pending' },
  { id: 'c5', label: 'Generate ATF tests for submit and approval paths', status: 'pending' },
  { id: 'c6', label: 'Publish catalog item to production scope', status: 'pending' },
];

const INTEGRATION_BUILD_TODOS: MitraTodoItem[] = [
  { id: 'i1', label: 'Map source and target systems with IntegrationHub spoke', status: 'active' },
  { id: 'i2', label: 'Define REST inbound/outbound actions and auth profile', status: 'pending' },
  { id: 'i3', label: 'Build transform maps and error handling subflows', status: 'pending' },
  { id: 'i4', label: 'Configure MID Server connectivity and connection tests', status: 'pending' },
  { id: 'i5', label: 'Generate integration test payloads and ATF coverage', status: 'pending' },
  { id: 'i6', label: 'Document spoke operations for developer handoff', status: 'pending' },
];

const DEFAULT_BUILD_TODOS: MitraTodoItem[] = [
  { id: 'd1', label: 'Parse requirements and map ServiceNow modules', status: 'active' },
  { id: 'd2', label: 'Draft user stories and solution scope document', status: 'pending' },
  { id: 'd3', label: 'Design tables, forms, and data model', status: 'pending' },
  { id: 'd4', label: 'Configure workflows, catalog, and automations', status: 'pending' },
  { id: 'd5', label: 'Generate test scripts and validation suite', status: 'pending' },
  { id: 'd6', label: 'Package artifacts for stakeholder review', status: 'pending' },
];

export function isBuildRequest(text: string): boolean {
  const norm = text.toLowerCase().trim();
  if (!norm) return false;
  if (BUILD_PATTERN.test(norm)) return true;
  return /\b(tracker|catalog|workflow|module|portal|integration|onboarding)\b/i.test(norm);
}

export function buildTodosForRequest(text: string): { summary: string; items: MitraTodoItem[] } {
  const norm = text.toLowerCase();

  if (norm.includes('hr') || norm.includes('onboarding') || norm.includes('hrsd')) {
    return {
      summary:
        "I'll build your HR onboarding tracker: HRSD scope, catalog workflows, SLA timers, and stakeholder-ready artifacts.",
      items: cloneTodos(HR_BUILD_TODOS),
    };
  }

  if (norm.includes('catalog') || norm.includes('service request')) {
    return {
      summary:
        "I'll build your catalog item end-to-end: variables, approvals, Flow Designer fulfillment, and ATF coverage.",
      items: cloneTodos(CATALOG_BUILD_TODOS),
    };
  }

  if (
    norm.includes('integration') ||
    norm.includes('spoke') ||
    norm.includes('rest') ||
    norm.includes('mid server')
  ) {
    return {
      summary:
        "I'll build your IntegrationHub spoke: REST actions, transforms, MID connectivity, and integration tests.",
      items: cloneTodos(INTEGRATION_BUILD_TODOS),
    };
  }

  return {
    summary:
      "I'll build your ServiceNow solution: scope, artifacts, workflows, tests, and review-ready deliverables.",
    items: cloneTodos(DEFAULT_BUILD_TODOS),
  };
}

/** Pause while the animated todo list plays through (ms). */
export function todosPresentationDelay(itemCount: number, stepMs = 850): Promise<void> {
  const transitions = Math.max(0, itemCount - 1);
  const ms = Math.min(6000, 500 + transitions * stepMs);
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
