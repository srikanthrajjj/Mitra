import {
  ArtifactFormat,
  ArtifactStatus,
  ArtifactType,
  ChatMessage,
  PhaseArtifactDefinition,
  PhaseGate,
  PhaseProgress,
  ProjectPhase,
  SolutionArtifact,
  StudioBuildStage,
  UserRole,
} from '../types';
import { buildRequirementsSections, sectionsToMarkdown } from './requirementsDocument';

export const PHASE_NAMES: Record<ProjectPhase, string> = {
  1: 'Discovery',
  2: 'Solution Design',
  3: 'Stakeholder Review',
  4: 'Vendor/RFP',
  5: 'Build',
  6: 'UAT',
  7: 'Deploy',
};

export type GateApprover = PhaseGate['approver'];

/** Architect cold-start opening — shown in chat UI before first user message. */
export const ARCHITECT_OPENING_QUESTION =
  'What are you building and who is it for?';

export interface PhaseQuestion {
  id: string;
  /** Single question — never combine multiple asks in one turn */
  text: string;
}

export interface PhaseDefinition {
  phase: ProjectPhase;
  name: string;
  questions: PhaseQuestion[];
  artifacts: PhaseArtifactDefinition[];
  studioStages: StudioBuildStage[];
}

/** Mitra 7-phase lifecycle — Discovery through Deploy. */
export const PHASE_DEFINITIONS: PhaseDefinition[] = [
  {
    phase: 1,
    name: 'Discovery',
    studioStages: ['scope'],
    questions: [
      {
        id: 'd-today',
        text: 'What happens today when this problem occurs — walk me through what someone actually does manually right now.',
      },
      {
        id: 'd-workflow-context',
        text: 'Who is involved in this workflow, and are there any approval rules, integrations, or compliance boundaries I should know?',
      },
    ],
    artifacts: [
      {
        type: 'requirements_doc',
        name: 'Requirements Document',
        filingNameSuffix: 'requirements_v1.doc',
        artifactFormat: 'DOC',
        buildStage: 'scope',
        gate: { approver: 'stakeholder', label: 'Business Stakeholder approval' },
        schemaFields: [
          'project_name_and_objective',
          'functional_requirements (numbered)',
          'non_functional_requirements',
          'out_of_scope',
          'success_metrics',
          'key_stakeholders',
          'open_questions',
        ],
      },
    ],
  },
  {
    phase: 2,
    name: 'Solution Design',
    studioStages: ['tables', 'forms', 'scripts'],
    questions: [
      { id: 's-scope', text: 'What is the application scope — which modules or features must be in the first release?' },
      { id: 's-tables', text: 'Should we extend existing ServiceNow tables or create new scoped tables?' },
      { id: 's-roles', text: 'How many distinct user roles or personas will interact with this application?' },
      { id: 's-integrations', text: 'What integrations are required (HR systems, identity, email, external APIs)?' },
      { id: 's-sla', text: 'What SLAs, uptime targets, or performance expectations apply?' },
    ],
    artifacts: [
      {
        type: 'data_model',
        name: 'Data Model',
        filingNameSuffix: 'data_model.xml',
        artifactFormat: 'XML',
        buildStage: 'tables',
        gate: { approver: 'developer', label: 'Developer validation' },
        schemaFields: ['tables', 'fields', 'references', 'extends', 'indexes'],
      },
      {
        type: 'workflow',
        name: 'Workflow Diagram',
        filingNameSuffix: 'workflow_intake.json',
        artifactFormat: 'JSON',
        buildStage: 'forms',
        gate: { approver: 'stakeholder', label: 'Business Stakeholder approval' },
        schemaFields: ['stages', 'transitions', 'assignment_rules', 'notifications'],
      },
      {
        type: 'role_matrix',
        name: 'Role Matrix',
        filingNameSuffix: 'acl_role_matrix.xml',
        artifactFormat: 'XML',
        buildStage: 'forms',
        gate: { approver: 'security', label: 'Security Officer approval' },
        schemaFields: ['roles', 'acl_rules', 'field_level_security', 'confidentiality'],
      },
      {
        type: 'script_library',
        name: 'Script Library',
        filingNameSuffix: 'script_library.js',
        artifactFormat: 'JSON',
        buildStage: 'scripts',
        gate: { approver: 'developer', label: 'Developer validation' },
        schemaFields: ['client_scripts', 'business_rules', 'script_includes'],
      },
    ],
  },
  {
    phase: 3,
    name: 'Stakeholder Review',
    studioStages: ['rules'],
    questions: [
      { id: 'r-concerns', text: 'Are there any business concerns or constraints not yet captured in the design artifacts?' },
      { id: 'r-timeline', text: 'What is your target go-live timeline, and are there hard deadlines I should plan around?' },
    ],
    artifacts: [
      {
        type: 'executive_summary',
        name: 'Executive Summary',
        filingNameSuffix: 'executive_summary.doc',
        artifactFormat: 'WORD',
        buildStage: 'rules',
        gate: { approver: 'sponsor', label: 'Project Sponsor approval' },
        schemaFields: [
          'plain_language_summary',
          'workflow_overview',
          'timeline',
          'investment',
          'outcomes',
          'risks',
        ],
      },
    ],
  },
  {
    phase: 4,
    name: 'Vendor/RFP',
    studioStages: ['update_set'],
    questions: [
      { id: 'v-vendors', text: 'Which vendors or SI partners are in scope for this RFP?' },
      { id: 'v-timeline', text: 'What is the RFP response deadline and expected award date?' },
      { id: 'v-budget', text: 'What budget range or pricing model should the RFP communicate?' },
    ],
    artifacts: [
      {
        type: 'rfp_package',
        name: 'RFP Package',
        filingNameSuffix: 'rfp_package.doc',
        artifactFormat: 'DOC',
        buildStage: 'update_set',
        gate: { approver: 'architect', label: 'Architect confirms RFP sent', exportOnly: true },
        schemaFields: [
          'scope_of_work',
          'deliverables',
          'timeline',
          'evaluation_criteria',
          'vendor_requirements',
          'pricing_template',
        ],
      },
    ],
  },
  {
    phase: 5,
    name: 'Build',
    studioStages: ['scripts', 'update_set'],
    questions: [
      { id: 'b-instance', text: 'Which ServiceNow instance and scoped application name should we target for the build?' },
      { id: 'b-updateset', text: 'What update set naming convention should we use for this release?' },
      { id: 'b-deps', text: 'Are there prerequisite plugins, store apps, or dependencies the build must account for?' },
    ],
    artifacts: [
      {
        type: 'test_script',
        name: 'Test Script',
        filingNameSuffix: 'test_script.doc',
        artifactFormat: 'DOC',
        buildStage: 'update_set',
        gate: { approver: 'qa', label: 'QA Owner or Stakeholder approval' },
        schemaFields: [
          'test_scenarios',
          'acceptance_criteria',
          'test_data',
          'execution_steps',
          'sign_off_matrix',
        ],
      },
    ],
  },
  {
    phase: 6,
    name: 'UAT',
    studioStages: ['update_set'],
    questions: [
      { id: 't-uat-owner', text: 'Who will perform UAT, and what is the planned test window?' },
      { id: 't-scenarios', text: 'Which critical business scenarios must pass before you sign off on release?' },
    ],
    artifacts: [],
  },
  {
    phase: 7,
    name: 'Deploy',
    studioStages: ['published'],
    questions: [
      { id: 'p-env', text: 'Which target environment and deployment window should we schedule?' },
      { id: 'p-rollback', text: 'What are the rollback criteria if deployment validation fails?' },
    ],
    artifacts: [
      {
        type: 'deployment_checklist',
        name: 'Deployment Checklist',
        filingNameSuffix: 'deployment_checklist.doc',
        artifactFormat: 'DOC',
        buildStage: 'published',
        gate: { approver: 'admin', label: 'Admin — all steps complete' },
        schemaFields: [
          'pre_deploy_checks',
          'deployment_steps',
          'rollback_plan',
          'post_deploy_validation',
          'admin_sign_off',
        ],
      },
    ],
  },
];

export function getPhaseDefinition(phase: ProjectPhase): PhaseDefinition {
  return PHASE_DEFINITIONS.find((p) => p.phase === phase) ?? PHASE_DEFINITIONS[0];
}

export function getPhaseLabel(phase: ProjectPhase): string {
  return `Phase ${phase} — ${PHASE_NAMES[phase]}`;
}

export function getApproverRoleLabel(approver: GateApprover): string {
  switch (approver) {
    case 'stakeholder':
      return 'Business Stakeholder';
    case 'developer':
      return 'Developer';
    case 'security':
      return 'Security Officer';
    case 'admin':
      return 'Platform Administrator';
    case 'sponsor':
      return 'Project Sponsor';
    case 'qa':
      return 'QA Owner';
    case 'architect':
      return 'Architect';
    default:
      return 'Reviewer';
  }
}

export function artifactEffectiveStatus(
  artifactId: string,
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus> = {},
): ArtifactStatus {
  const artifact = artifacts.find((a) => a.id === artifactId);
  if (!artifact) return 'not_started';
  return statusOverrides[artifactId] ?? artifact.status;
}

export function resolveArtifactId(
  solutionId: string,
  type: ArtifactType,
  artifacts: SolutionArtifact[],
): string {
  const found = artifacts.find((a) => a.type === type && a.solutionId === solutionId);
  if (found) return found.id;
  return `${solutionId}-${artifactTypeSuffix(type)}`;
}

export function getPhaseArtifactIds(
  phase: ProjectPhase,
  solutionId: string,
  artifacts: SolutionArtifact[] = [],
): string[] {
  const def = getPhaseDefinition(phase);
  return def.artifacts.map((a) => resolveArtifactId(solutionId, a.type, artifacts));
}

function artifactTypeSuffix(type: ArtifactType): string {
  const map: Partial<Record<ArtifactType, string>> = {
    requirements_doc: 'req',
    data_model: 'data',
    workflow: 'flow',
    role_matrix: 'roles',
    script_library: 'scripts',
    executive_summary: 'summary',
    rfp_package: 'rfp',
    test_script: 'test',
    deployment_checklist: 'deploy',
  };
  return map[type] ?? type.replace(/_/g, '-');
}

function phase4GateComplete(phaseProgress: PhaseProgress | undefined): boolean {
  return phaseProgress?.rfpExportConfirmed === true;
}

function phase6GateComplete(
  solutionId: string,
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus>,
  phaseProgress: PhaseProgress | undefined,
): boolean {
  if (phaseProgress?.uatSignOffComplete === true) return true;
  const testScriptId = resolveArtifactId(solutionId, 'test_script', artifacts);
  return artifactEffectiveStatus(testScriptId, artifacts, statusOverrides) === 'approved';
}

export function canAdvancePhase(
  phase: ProjectPhase,
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus>,
  phaseProgress?: PhaseProgress,
): boolean {
  const def = getPhaseDefinition(phase);
  const solutionId = artifacts[0]?.solutionId ?? phaseProgress?.solutionId ?? '';

  if (phaseProgress && phaseProgress.currentPhase === phase) {
    if (phaseProgress.questionIndex < def.questions.length) return false;
  }

  if (phase === 4) {
    const rfpId = resolveArtifactId(solutionId, 'rfp_package', artifacts);
    const generated =
      phaseProgress?.artifactsGenerated.includes(rfpId) ||
      artifacts.some((a) => a.id === rfpId && a.status !== 'not_started');
    return generated && phase4GateComplete(phaseProgress);
  }

  if (phase === 6) {
    return phase6GateComplete(solutionId, artifacts, statusOverrides, phaseProgress);
  }

  if (def.artifacts.length === 0) return true;

  return def.artifacts.every((artDef) => {
    const id = resolveArtifactId(solutionId, artDef.type, artifacts);
    const generated =
      phaseProgress?.artifactsGenerated.includes(id) ||
      artifacts.some((a) => a.id === id && a.status !== 'not_started');
    if (!generated) return false;
    return artifactEffectiveStatus(id, artifacts, statusOverrides) === 'approved';
  });
}

export function deriveCurrentPhase(
  phaseProgress: PhaseProgress | undefined,
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus>,
): ProjectPhase {
  const solutionId = phaseProgress?.solutionId ?? artifacts[0]?.solutionId ?? '';

  for (let p = 1; p <= 7; p++) {
    const phase = p as ProjectPhase;
    const complete = canAdvancePhase(phase, artifacts, statusOverrides, {
      ...(phaseProgress ?? createInitialPhaseProgress(solutionId)),
      currentPhase: phase,
    });
    if (!complete) return phase;
  }
  return 7;
}

export function getPendingGateArtifacts(
  phase: ProjectPhase,
  solutionId: string,
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus>,
  phaseProgress?: PhaseProgress,
): Array<{ artifactId: string; name: string; gate: PhaseGate; status: ArtifactStatus }> {
  if (phase === 4 && !phase4GateComplete(phaseProgress)) {
    const rfpId = resolveArtifactId(solutionId, 'rfp_package', artifacts);
    const status = artifactEffectiveStatus(rfpId, artifacts, statusOverrides);
    const generated =
      phaseProgress?.artifactsGenerated.includes(rfpId) ?? status !== 'not_started';
    if (generated) {
      return [
        {
          artifactId: rfpId,
          name: 'RFP Package',
          gate: { approver: 'architect', label: 'Architect confirms RFP sent', exportOnly: true },
          status: 'pending',
        },
      ];
    }
  }

  if (phase === 6 && !phase6GateComplete(solutionId, artifacts, statusOverrides, phaseProgress)) {
    const testScriptId = resolveArtifactId(solutionId, 'test_script', artifacts);
    return [
      {
        artifactId: testScriptId,
        name: 'Living Test Script',
        gate: { approver: 'stakeholder', label: 'Stakeholder UAT sign-off' },
        status: artifactEffectiveStatus(testScriptId, artifacts, statusOverrides),
      },
    ];
  }

  const def = getPhaseDefinition(phase);
  return def.artifacts
    .map((artDef) => {
      const artifactId = resolveArtifactId(solutionId, artDef.type, artifacts);
      const status = artifactEffectiveStatus(artifactId, artifacts, statusOverrides);
      const generated = phaseProgress?.artifactsGenerated.includes(artifactId) ?? status !== 'not_started';
      return { artifactId, name: artDef.name, gate: artDef.gate, status, generated };
    })
    .filter((a) => a.generated && a.status !== 'approved');
}

/** Phase 2 Solution Design topics — blocked during Phase 1 Discovery. */
export function isPhase2DesignTopic(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /data model|table design|schema|dictionary|field list|create table|scoped table|extends task|sn_hr_core/i.test(
      t,
    ) ||
    /acl|role matrix|access control|field.?level security/i.test(t) ||
    /workflow diagram|workflow design|flow designer|intake flow|process flow/i.test(t) ||
    /script library|client script|business rule|script include|onload|onchange/i.test(t) ||
    /form layout|ui policy|catalog item|integration design|api design/i.test(t) ||
    /architecture diagram|technical design|how will this work|how does this work|how should this work/i.test(
      t,
    ) ||
    /what tables|design the table|build the table|configure the form/i.test(t)
  );
}

export function isFuturePhaseTopic(text: string, currentPhase: ProjectPhase): boolean {
  const t = text.toLowerCase();
  if (currentPhase >= 7) return false;

  if (currentPhase === 1) {
    if (isPhase2DesignTopic(text)) return true;
    if (/deploy|uat|rfp|executive summary|vendor|procurement|test script|sponsor sign|update set/i.test(t)) {
      return true;
    }
    return false;
  }

  if (currentPhase < 7 && /deploy|production|go-live|promote to prod/i.test(t)) return true;
  if (currentPhase < 6 && /\buat|living test|acceptance test/i.test(t)) return true;
  if (currentPhase < 5 && /test script|qa sign|build config|update set/i.test(t)) return true;
  if (currentPhase < 4 && /rfp|vendor|procurement/i.test(t)) return true;
  if (currentPhase < 3 && /executive summary|sponsor sign/i.test(t)) return true;
  if (currentPhase < 2 && isPhase2DesignTopic(text)) return true;
  return false;
}

export function createInitialPhaseProgress(solutionId: string): PhaseProgress {
  return {
    solutionId,
    currentPhase: 1,
    questionIndex: 0,
    artifactsGenerated: [],
    phaseStartedAt: new Date().toISOString(),
  };
}

export function countUserTurnsInPhase(
  chatHistory: ChatMessage[],
  phaseProgress: PhaseProgress,
): number {
  return Math.max(0, phaseProgress.questionIndex);
}

export function buildRequirementsDocumentPreview(
  projectName: string,
  userMessages: string[],
): string {
  return sectionsToMarkdown(buildRequirementsSections(projectName, userMessages), projectName);
}

export function buildExecutiveSummaryPreview(projectName: string, userMessages: string[]): string {
  return [
    `**Executive Summary — ${projectName}**`,
    '',
    '**Scope:** Scoped ServiceNow application addressing the business problem identified in Discovery — designed for the personas and volume described.',
    '',
    '**Workflow (plain language):** Employees or agents submit requests through a guided form. The system routes work to the right team, tracks SLAs, and keeps confidential records restricted.',
    '',
    '**Timeline:** Go-live target based on stakeholder input — typically 6–8 weeks after design approval.',
    '',
    '**Outcomes:**',
    '• Self-service intake where applicable',
    '• Automated routing and SLA tracking',
    '• Role-based security aligned to business policy',
    '',
    '**Investment:** Scoped application + update set — no core ITSM changes required.',
    '',
    '**Risks:** Integration dependencies and UAT window must be confirmed before build.',
  ].join('\n');
}

export function buildRfpPackagePreview(projectName: string, userMessages: string[]): string {
  const vendors = userMessages[0] ?? 'TBD';
  const timeline = userMessages[1] ?? 'TBD';
  const budget = userMessages[2] ?? 'TBD';

  return [
    `# RFP Package — ${projectName}`,
    '',
    '## Scope of Work',
    `Scoped ServiceNow implementation for ${projectName} — design artifacts approved through Stakeholder Review.`,
    '',
    '## Deliverables',
    '• Scoped application build and configuration',
    '• Test script and UAT support',
    '• Deployment and knowledge transfer',
    '',
    '## Timeline',
    timeline,
    '',
    '## Evaluation Criteria',
    '• ServiceNow platform expertise',
    '• Similar HRSD / case management references',
    '• Fixed-price vs T&M proposal clarity',
    '',
    '## Vendor Requirements',
    vendors,
    '',
    '## Pricing Template',
    budget,
  ].join('\n');
}

export function buildTestScriptPreview(projectName: string, userMessages: string[]): string {
  return [
    `# Test Script — ${projectName}`,
    '',
    '## Test Scenarios',
    '1. End-to-end intake and routing',
    '2. Role-based access validation',
    '3. SLA and notification triggers',
    '4. Confidential record handling',
    '',
    '## Acceptance Criteria',
    '• All critical paths pass without blocker defects',
    '• Security ACLs match approved role matrix',
    '',
    '## Test Data',
    'Representative users per persona; sample cases for each workflow branch.',
    '',
    '## Execution Steps',
    'QA Owner executes scripted scenarios in sub-production instance.',
    '',
    '## Sign-off Matrix',
    '| Role | Sign-off |',
    '| QA Owner | Pending |',
    '| Stakeholder | Pending |',
  ].join('\n');
}

export function buildDeploymentChecklistPreview(projectName: string, userMessages: string[]): string {
  const env = userMessages[0] ?? 'Production';
  const rollback = userMessages[1] ?? 'Revert update set if validation fails within 2 hours';

  return [
    `# Deployment Checklist — ${projectName}`,
    '',
    '## Pre-deploy Checks',
    '☐ Update set complete and peer-reviewed',
    '☐ UAT sign-off recorded',
    '☐ Backup and rollback window confirmed',
    '',
    '## Deployment Steps',
    `1. Schedule window — ${env}`,
    '2. Import update set to target instance',
    '3. Validate scoped application menus and ACLs',
    '4. Smoke-test critical scenarios',
    '',
    '## Rollback Plan',
    rollback,
    '',
    '## Post-deploy Validation',
    '☐ Production smoke tests pass',
    '☐ Monitoring and support contacts notified',
    '',
    '## Admin Sign-off',
    '☐ All checklist steps complete — Platform Administrator approval required',
  ].join('\n');
}

export function personaDepthHint(role: UserRole | undefined, phase: ProjectPhase): string {
  if (!role || role === 'architect') return '';
  if (role === 'stakeholder' && phase <= 3) {
    return '_Reviewing in business terms — technical implementation details are in Phase 5+._';
  }
  if (role === 'developer' && phase >= 5) {
    return '_Build and test artifacts — validate scripts and update set before UAT._';
  }
  if (role === 'admin' && phase >= 7) {
    return '_Deployment checklist — confirm all steps complete before promote._';
  }
  return '';
}

export { artifactTypeSuffix };
