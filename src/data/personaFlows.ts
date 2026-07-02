import { AdminChecklistItem, DeveloperComment } from '../types';
import { HR_TICKETING_SOLUTION_ID } from '../utils/approvalFlow';

export const HR_DEPLOY_CHECKLIST: Omit<AdminChecklistItem, 'completed'>[] = [
  {
    id: 'chk-scope',
    solutionId: HR_TICKETING_SOLUTION_ID,
    label: 'Validate scoped application record',
    description: 'Confirm HRSD scoped app exists in dev with correct version and vendor.',
    dependsOn: [],
    order: 1,
  },
  {
    id: 'chk-tables',
    solutionId: HR_TICKETING_SOLUTION_ID,
    label: 'Promote table dictionary',
    description: 'Capture u_hrsd_* tables and dictionary entries in update set.',
    dependsOn: ['chk-scope'],
    order: 2,
  },
  {
    id: 'chk-acls',
    solutionId: HR_TICKETING_SOLUTION_ID,
    label: 'Verify HR ACLs & roles',
    description: 'Run ACL report — confidential case restrictions for non-HR roles.',
    dependsOn: ['chk-tables'],
    order: 3,
  },
  {
    id: 'chk-scripts',
    solutionId: HR_TICKETING_SOLUTION_ID,
    label: 'Smoke-test automation',
    description: 'Client script + COE routing business rule on test hire case.',
    dependsOn: ['chk-acls'],
    order: 4,
  },
  {
    id: 'chk-portal',
    solutionId: HR_TICKETING_SOLUTION_ID,
    label: 'Employee Center catalog item',
    description: 'Catalog item maps to HRSD case type with profile auto-populate.',
    dependsOn: ['chk-scripts'],
    order: 5,
  },
  {
    id: 'chk-uat',
    solutionId: HR_TICKETING_SOLUTION_ID,
    label: 'Business UAT sign-off',
    description: 'Stakeholder approval artifacts attached to change request.',
    dependsOn: ['chk-portal'],
    order: 6,
  },
];

export function seedChecklistForSolution(solutionId: string): AdminChecklistItem[] {
  if (solutionId !== HR_TICKETING_SOLUTION_ID) return [];
  return HR_DEPLOY_CHECKLIST.map((item) => ({ ...item, completed: false }));
}

export const INITIAL_DEVELOPER_COMMENTS: DeveloperComment[] = [
  {
    id: 'dev-c-seed-hr-data',
    artifactId: 'hr-data',
    solutionId: HR_TICKETING_SOLUTION_ID,
    section: 'Field: u_confidential (True/False)',
    lineRef: 'L24',
    severity: 'blocker',
    text: 'Dev instance uses u_is_confidential on sn_hr_core_case — confirm field map before promote.',
    author: 'ServiceNow Developer',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    resolved: false,
  },
  {
    id: 'dev-c-seed-hr-flow',
    artifactId: 'hr-flow',
    solutionId: HR_TICKETING_SOLUTION_ID,
    section: 'COE routing matrix by topic category',
    lineRef: '§routing',
    severity: 'major',
    text: 'Routing table missing "Benefits" COE — intake flow will default to General HR.',
    author: 'ServiceNow Developer',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    resolved: false,
  },
];

export const DEVELOPER_SHARED_ARTIFACT_IDS = ['hr-data', 'hr-scripts', 'hr-flow'];

/** Artifacts developer may technically approve (gate) */
export const DEVELOPER_APPROVABLE_ARTIFACT_IDS = ['hr-data', 'hr-scripts'];

/** Developer workspace file-tree categories scoped to shared artifacts */
export const DEVELOPER_FILE_TREE: Record<
  string,
  Array<{ category: string; artifactIds: string[] }>
> = {
  [HR_TICKETING_SOLUTION_ID]: [
    { category: 'Data Model', artifactIds: ['hr-data'] },
    { category: 'Script Includes', artifactIds: ['hr-scripts'] },
    { category: 'Flows', artifactIds: ['hr-flow'] },
  ],
};

export interface ArtifactTechSection {
  label: string;
  lineRef: string;
  content: string;
}

export const ARTIFACT_TECH_SECTIONS: Record<string, ArtifactTechSection[]> = {
  'hr-data': [
    {
      label: 'Table: u_hrsd_employee_onboarding_case',
      lineRef: 'L1',
      content: '<table name="u_hrsd_employee_onboarding_case" extends="sn_hr_core_case" />',
    },
    {
      label: 'Field: u_hr_profile (Reference → sn_hr_core_profile)',
      lineRef: 'L12',
      content: '<element name="u_hr_profile" type="reference" reference="sn_hr_core_profile" mandatory="true" />',
    },
    {
      label: 'Field: u_topic_category (Choice)',
      lineRef: 'L18',
      content: '<element name="u_topic_category" type="choice" choice_table="sys_choice" />',
    },
    {
      label: 'Field: u_confidential (True/False)',
      lineRef: 'L24',
      content: '<element name="u_confidential" type="boolean" default="false" />',
    },
    {
      label: 'COE assignment relationships',
      lineRef: 'L31',
      content: '<relationship table="sys_user_group" field="u_coe_group" />',
    },
  ],
  'hr-scripts': [
    {
      label: 'Client Script: HRSD Confidential Case Warning (onLoad)',
      lineRef: 'L1',
      content: 'function onLoad() { if (g_form.getValue(\'u_confidential\') === \'true\') { g_form.showFieldMsg(\'short_description\', \'Confidential HR case\', \'warning\'); } }',
    },
    {
      label: 'Business Rule: HRSD COE Auto-Route (before insert)',
      lineRef: 'L14',
      content: '(function executeRule(current, previous) { current.u_coe_group = HRSdRouting.getCOE(current.u_topic_category); })(current, previous);',
    },
    {
      label: 'SLA definitions — VIP 24h / Standard 48h',
      lineRef: 'L28',
      content: '<sla name="HRSD VIP Response" duration="24:00:00" condition="vip=true" />',
    },
  ],
  'hr-flow': [
    {
      label: 'Employee Center intake → HRSD case creation',
      lineRef: '§intake',
      content: '{ "trigger": "catalog.submit", "action": "create_hrsd_case", "table": "u_hrsd_employee_onboarding_case" }',
    },
    {
      label: 'COE routing matrix by topic category',
      lineRef: '§routing',
      content: '{ "Payroll": "grp_hr_payroll", "Benefits": "grp_hr_benefits", "Relations": "grp_hr_er" }',
    },
    {
      label: 'Confidential case escalation path',
      lineRef: '§escalation',
      content: '{ "when": "u_confidential=true", "notify": "hr_confidential_lead", "restrict_visibility": true }',
    },
  ],
};
