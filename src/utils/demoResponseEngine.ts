import { ChatMessage, SolutionBlueprint, TableField, ServiceNowTable, ArtifactStatus, SolutionArtifact, UserRole } from '../types';
import { enrichBlueprintStudio } from './studioHelpers';
import { usesPhaseEngine } from './dynamicSolutionArtifacts';
import { getPhaseEngineResponse, PhaseEngineContext } from './phaseResponseEngine';
import {
  buildCatalogTemplateDevSteps,
  buildIndustryTemplateSteps,
  extractIndustry,
  extractTemplatePack,
  findCatalogTemplate,
} from './templateDevFlows';
import {
  buildExecutiveSummary,
  formatSnRecordUpdate,
  formatStakeholderResponseUpdate,
  isSendForApprovalAction,
} from './approvalFlow';

import { NotificationEvent } from './notificationRules';

export interface DemoResponse {
  text: string;
  blueprint: SolutionBlueprint;
  choices?: string[];
  isTriage?: boolean;
  phaseProgress?: import('../types').PhaseProgress;
  generatedArtifactId?: string;
  artifactStatusUpdate?: { artifactId: string; status: import('../types').ArtifactStatus };
  requirementsDocumentUpdate?: import('../types').RequirementsDocument;
  notifications?: NotificationEvent[];
  /** Compliance / conflict — do not advance phase */
  blockPhase?: boolean;
}

type DemoScenario =
  | 'hrsd'
  | 'onboarding'
  | 'vendor'
  | 'asset'
  | 'industry'
  | 'import'
  | 'analyze'
  | 'generic';

interface DemoStep {
  text: string;
  choices?: string[];
  isTriage?: boolean;
  buildStage?: SolutionBlueprint['buildStage'];
  status?: SolutionBlueprint['status'];
  architectureSteps?: string[];
  discoveredRequirements?: string[];
  tables?: ServiceNowTable[];
  clientScripts?: SolutionBlueprint['clientScripts'];
  businessRules?: SolutionBlueprint['businessRules'];
}

const isGreeting = (s: string) =>
  /^(hi|hello|hey|greetings|hola|start|clear|init)\b/i.test(s.trim().toLowerCase());

function getUserMessages(chatHistory: ChatMessage[], currentPrompt: string): string[] {
  const msgs = chatHistory
    .filter((m) => m.sender === 'user')
    .map((m) => m.text.trim())
    .filter((t) => t && !isGreeting(t));

  const p = currentPrompt.trim();
  if (p && !isGreeting(p) && (msgs.length === 0 || msgs[msgs.length - 1].toLowerCase() !== p.toLowerCase())) {
    msgs.push(p);
  }
  return msgs;
}

function allUserText(messages: string[]): string {
  return messages.join(' ').toLowerCase();
}

function detectScenarioFromText(text: string): DemoScenario {
  const t = text.toLowerCase();

  if (/hrsd|hr service delivery|hr ticketing|hr case|hr app|hrs\b|create hr|build hr|human resource/.test(t)) {
    return 'hrsd';
  }
  if (/onboarding|new hire|employee onboarding/.test(t)) return 'onboarding';
  if (/vendor|supplier|procurement/.test(t)) return 'vendor';
  if (/asset track|itam|asset lifecycle|asset management/.test(t)) return 'asset';
  if (/template|industry|banking|healthcare|telecom|manufacturing/.test(t)) return 'industry';
  if (/brd|user stor|requirement|convert my|meeting notes|process document/.test(t)) return 'import';
  if (/analyz|existing application|recommend improvement|review my/.test(text)) return 'analyze';

  return 'generic';
}

/** Lock scenario from the opening question so later pill labels don't switch the flow. */
function getLockedScenario(userMessages: string[]): DemoScenario {
  if (userMessages.length === 0) return 'generic';
  const opening = userMessages[0];
  let scenario = detectScenarioFromText(opening);
  if (scenario !== 'generic') return scenario;

  for (let i = 1; i < userMessages.length; i++) {
    if (/start over|new topic|different app/i.test(userMessages[i])) {
      return detectScenarioFromText(userMessages[i]);
    }
  }
  return 'generic';
}

function countCompletedMitraTurns(chatHistory: ChatMessage[]): number {
  return chatHistory.filter((m) => m.sender === 'mitra' && m.text.trim().length > 0).length;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'custom';
}

function formatFieldsTable(fields: TableField[], limit = 6): string {
  const shown = fields.slice(0, limit);
  const rows = shown.map(
    (f) => `| ${f.name} | ${f.type} | ${f.label}${f.mandatory ? ' *' : ''} |`,
  );
  if (fields.length > limit) rows.push(`| +${fields.length - limit} more | — | — |`);
  return `| Field | Type | Label |\n|-------|------|-------|\n${rows.join('\n')}`;
}

export function extractHrsdProcessFromChat(
  chatHistory: ChatMessage[],
  currentPrompt = '',
): string {
  return extractHrsdProcess(getUserMessages(chatHistory, currentPrompt));
}

function extractHrsdProcess(messages: string[]): string {
  const text = allUserText(messages);
  if (/employee relation|relations|grievance/.test(text)) return 'Employee Relations';
  if (/payroll|compensation|wage/.test(text)) return 'Payroll & Compensation';
  if (/benefit|enrollment|insurance/.test(text)) return 'Benefits Administration';
  if (/onboarding|new hire/.test(text)) return 'Employee Onboarding';
  return 'Employee Onboarding';
}

function hrsdFields(process: string): TableField[] {
  const base: TableField[] = [
    { name: 'u_hr_profile', type: 'Reference', label: 'HR Profile', reference: 'sn_hr_core_profile', mandatory: true },
    { name: 'u_topic_category', type: 'Choice', label: 'HR Topic Category', mandatory: true },
    { name: 'u_confidential', type: 'True/False', label: 'Confidential Case', mandatory: false },
    { name: 'u_coe_group', type: 'Reference', label: 'Center of Excellence', reference: 'sys_user_group' },
  ];
  if (process === 'Employee Onboarding') {
    base.push(
      { name: 'u_start_date', type: 'Date', label: 'Start Date', mandatory: true },
      { name: 'u_hiring_manager', type: 'Reference', label: 'Hiring Manager', reference: 'sys_user' },
      { name: 'u_onboarding_stage', type: 'Choice', label: 'Onboarding Stage' },
    );
  } else if (process === 'Payroll & Compensation') {
    base.push(
      { name: 'u_pay_period', type: 'String', label: 'Pay Period' },
      { name: 'u_compensation_type', type: 'Choice', label: 'Compensation Type' },
    );
  } else if (process === 'Benefits Administration') {
    base.push(
      { name: 'u_benefit_plan', type: 'Choice', label: 'Benefit Plan' },
      { name: 'u_enrollment_window', type: 'Date', label: 'Enrollment Deadline' },
    );
  } else {
    base.push(
      { name: 'u_case_subtype', type: 'Choice', label: 'Case Subtype' },
      { name: 'u_escalation_level', type: 'Integer', label: 'Escalation Level' },
    );
  }
  return base;
}

function buildHrsdSteps(process: string, tableName: string, fields: TableField[]): DemoStep[] {
  return [
    {
      text: `## Step 1 of 6 — Define HRSD scope

You want to build an **HR Service Delivery (HRSD)** application. HRSD keeps employee cases on scoped HR tables — separate from ITSM — with COE routing, confidential handling, and Employee Center integration.

Before we create tables or forms, which HRSD process should this app support?`,
      choices: ['Employee Onboarding', 'Employee Relations', 'Payroll & Compensation', 'Benefits Administration'],
      isTriage: true,
      buildStage: 'scope',
      status: 'discovering',
      architectureSteps: ['Confirm HRSD process scope'],
      discoveredRequirements: ['Identify target HRSD process area'],
    },
    {
      text: `## Step 2 of 6 — Choose the case foundation

For **${process}**, HRSD cases should inherit HR platform behaviour — SLAs, activity streams, and HR-scoped ACLs.

| Foundation | Table | Best for |
|------------|-------|----------|
| HR Core Case | \`sn_hr_core_case\` | Production HRSD — recommended |
| Custom scoped | \`${tableName}\` | Unique workflow outside HR Core |
| Task extension | \`task\` child | Quick POC only |

Which foundation should we use?`,
      choices: ['HR Core Case (recommended)', 'Custom scoped table', 'Extend task (POC)'],
      isTriage: true,
      buildStage: 'tables',
      status: 'discovering',
      architectureSteps: ['Select case foundation', 'Plan table inheritance'],
      discoveredRequirements: [`Scope ${process} on HRSD platform`],
    },
    {
      text: `## Step 3 of 6 — Design the data model

Creating table **\`${tableName}\`** extending \`sn_hr_core_case\` with fields for **${process}**:

${formatFieldsTable(fields)}

These fields support COE routing, confidential flags, and Employee Center intake. Next we'll configure the form layout and assignment rules.`,
      choices: ['Configure form layout', 'Define COE routing', 'Add HR ACLs'],
      isTriage: true,
      buildStage: 'forms',
      status: 'designing',
      architectureSteps: [`Define ${tableName} dictionary`, 'Map HR profile reference'],
      discoveredRequirements: [`${process} field model`, 'HR confidential data handling'],
      tables: [
        {
          name: tableName,
          label: `HRSD ${process}`,
          extendsTable: 'sn_hr_core_case',
          fields,
        },
      ],
    },
    {
      text: `## Step 4 of 6 — Form layout & COE routing

**Form sections**
1. **Requester** — employee, HR profile, contact preference
2. **Case details** — topic category, confidential flag, description
3. **Resolution** — COE group, work notes, closure code

**Assignment routing**
- Default → HR Shared Services
- Category match → specialized COE (Payroll, Benefits, Relations)
- Confidential = true → restricted to \`sn_hr_core.case_writer\` role

**Portal**
- Employee Center catalog item maps to this case type
- Auto-populate \`u_hr_profile\` from logged-in employee`,
      choices: ['Add client scripts', 'Add business rules', 'Configure SLAs'],
      isTriage: true,
      buildStage: 'scripts',
      status: 'designing',
      architectureSteps: ['Form sections & related lists', 'COE assignment matrix'],
      tables: [
        {
          name: tableName,
          label: `HRSD ${process}`,
          extendsTable: 'sn_hr_core_case',
          fields,
        },
      ],
    },
    {
      text: `## Step 5 of 6 — Automation & go-live checklist

**Client script (onLoad)** — warn agents on confidential cases and lock HR profile for non-HR roles.

**Business rule (before insert)** — set assignment group from topic category and default priority.

\`\`\`javascript
function onLoad() {
  if (g_form.getValue('u_confidential') === 'true') {
    g_form.showFieldMsg('short_description', 'Confidential HR case — restricted access.', 'warning');
  }
}
\`\`\`

**Update set checklist**
- Scoped application record
- Table \`${tableName}\` + dictionary entries
- Form & list views
- ACLs for HR agents vs. managers
- Employee Center catalog item

Your **${process}** HRSD blueprint is ready for dev validation.`,
      choices: ['Add SLA definitions', 'Generate update set list', 'Add notification rules'],
      isTriage: false,
      buildStage: 'update_set',
      status: 'completed',
      architectureSteps: [
        `Table ${tableName}`,
        'Client script + business rule',
        'COE routing matrix',
        'Employee Center catalog link',
      ],
      discoveredRequirements: [
        `${process} HRSD workflow`,
        'Confidential case ACLs',
        'COE assignment automation',
      ],
      tables: [
        {
          name: tableName,
          label: `HRSD ${process}`,
          extendsTable: 'sn_hr_core_case',
          fields,
        },
      ],
      clientScripts: [
        {
          name: 'HRSD Confidential Case Warning',
          table: tableName,
          type: 'onLoad',
          description: 'Alerts agents when viewing a confidential HRSD case.',
          script: `function onLoad() {\n  if (g_form.getValue('u_confidential') === 'true') {\n    g_form.showFieldMsg('short_description', 'Confidential HR case — restricted access.', 'warning');\n  }\n  if (!g_user.hasRole('sn_hr_core.case_writer')) {\n    g_form.setReadOnly('u_hr_profile', true);\n  }\n}`,
        },
      ],
      businessRules: [
        {
          name: 'HRSD COE Auto-Route',
          table: tableName,
          when: 'before',
          insert: true,
          update: false,
          description: 'Routes new HRSD cases to the correct COE based on topic category.',
          script: `(function executeRule(current, previous) {\n  var category = current.u_topic_category;\n  if (category == 'payroll') {\n    current.assignment_group.setDisplayValue('HR Payroll COE');\n  } else if (category == 'benefits') {\n    current.assignment_group.setDisplayValue('HR Benefits COE');\n  } else {\n    current.assignment_group.setDisplayValue('HR Shared Services');\n  }\n  current.priority = 3;\n})(current, previous);`,
        },
      ],
    },
    {
      text: `## Step 6 of 6 — Executive summary for stakeholders

I've compiled a business-facing **Executive Summary** from your HRSD blueprint — written for reviewers, not developers.

${buildExecutiveSummary(process)}

| Artifact | State |
|----------|-------|
| Executive Summary | **Draft** |

Route this for stakeholder sign-off? Mitra will update the artifact record and notify your business reviewer — same flow as a ServiceNow approval request.`,
      choices: ['Send to stakeholder for approval', 'Edit summary first', 'Save as draft only'],
      isTriage: true,
      buildStage: 'published',
      status: 'completed',
      architectureSteps: [
        'Executive summary generated',
        'Awaiting stakeholder approval',
      ],
      discoveredRequirements: [
        `${process} HRSD workflow`,
        'Business sign-off on scope & timeline',
      ],
      tables: [
        {
          name: tableName,
          label: `HRSD ${process}`,
          extendsTable: 'sn_hr_core_case',
          fields,
        },
      ],
    },
  ];
}

function getScenarioSteps(scenario: DemoScenario, messages: string[]): DemoStep[] {
  const last = messages[messages.length - 1] || '';
  const topic = last.slice(0, 60);

  switch (scenario) {
    case 'hrsd': {
      const process = extractHrsdProcess(messages);
      const tableName = `u_hrsd_${slugify(process)}_case`;
      return buildHrsdSteps(process, tableName, hrsdFields(process));
    }
    case 'onboarding':
      return [
        {
          text: `**Step 1 of 4 — Onboarding scope**

We'll build an **employee onboarding** scoped app — new-hire tasks, provisioning checklists, and manager approvals on HRSD-aligned tables.

What is the primary onboarding trigger?`,
          choices: ['Offer accepted', 'Pre-boarding (before day 1)', 'Day-1 orientation', 'Full lifecycle (all phases)'],
          isTriage: true,
          buildStage: 'scope',
          status: 'discovering',
        },
        {
          text: `**Step 2 of 4 — Core table design**

Table **\`u_onboarding_case\`** extends \`sn_hr_core_case\`:

${formatFieldsTable([
  { name: 'u_candidate_name', type: 'String', label: 'Candidate Name', mandatory: true },
  { name: 'u_start_date', type: 'Date', label: 'Start Date', mandatory: true },
  { name: 'u_hiring_manager', type: 'Reference', label: 'Hiring Manager', reference: 'sys_user' },
  { name: 'u_onboarding_stage', type: 'Choice', label: 'Stage' },
  { name: 'u_provisioning_status', type: 'Choice', label: 'IT Provisioning Status' },
])}

Each stage can spawn child tasks for IT, Facilities, and HR.`,
          choices: ['Define onboarding stages', 'Add provisioning tasks', 'Configure manager approvals'],
          isTriage: true,
          buildStage: 'tables',
          status: 'designing',
          tables: [{
            name: 'u_onboarding_case',
            label: 'Onboarding Case',
            extendsTable: 'sn_hr_core_case',
            fields: [
              { name: 'u_candidate_name', type: 'String', label: 'Candidate Name', mandatory: true },
              { name: 'u_start_date', type: 'Date', label: 'Start Date', mandatory: true },
              { name: 'u_hiring_manager', type: 'Reference', label: 'Hiring Manager', reference: 'sys_user' },
              { name: 'u_onboarding_stage', type: 'Choice', label: 'Stage' },
            ],
          }],
        },
        {
          text: `**Step 3 of 4 — Workflow & automation**

**Stages:** Offer → Pre-boarding → Day 1 → 30/60/90-day check-ins

**Automation**
- Business rule creates IT + Facilities tasks when stage = Pre-boarding
- Client script shows progress bar on form
- Flow Designer can notify manager at each milestone`,
          choices: ['Add business rules', 'Add client scripts', 'Define notifications'],
          isTriage: true,
          buildStage: 'scripts',
          status: 'designing',
        },
        {
          text: `**Step 4 of 4 — Onboarding app ready**

Your onboarding application blueprint includes the case table, stage model, and automation stubs. Validate with a test hire in dev, then capture in an update set.

**Next:** connect Employee Center request → onboarding case creation.`,
          choices: ['Add SLA timers', 'Employee Center catalog item', 'Export update set checklist'],
          isTriage: false,
          buildStage: 'update_set',
          status: 'completed',
        },
      ];
    case 'vendor':
      return [
        {
          text: `**Step 1 of 4 — Vendor management scope**

We'll architect a **vendor management** scoped app — supplier onboarding, compliance docs, and contract lifecycle.

Which vendor workflow is the priority?`,
          choices: ['Vendor onboarding', 'Contract renewal', 'Compliance audit', 'Purchase order linkage'],
          isTriage: true,
          buildStage: 'scope',
          status: 'discovering',
        },
        {
          text: `**Step 2 of 4 — Vendor data model**

Table **\`u_vendor_case\`** extends \`task\`:

${formatFieldsTable([
  { name: 'u_vendor_name', type: 'String', label: 'Vendor Name', mandatory: true },
  { name: 'u_vendor_tier', type: 'Choice', label: 'Risk Tier' },
  { name: 'u_contract_expiry', type: 'Date', label: 'Contract Expiry' },
  { name: 'u_compliance_status', type: 'Choice', label: 'Compliance Status' },
])}`,
          choices: ['Add compliance fields', 'Define approval flow', 'Link to procurement'],
          isTriage: true,
          buildStage: 'tables',
          status: 'designing',
        },
        {
          text: `**Step 3 of 4 — Approvals & routing**

- Procurement submits vendor request
- Legal reviews compliance documents
- Finance approves payment terms
- Automated reminders 30 days before contract expiry`,
          choices: ['Configure approval rules', 'Add expiry notifications', 'Define vendor portal'],
          isTriage: true,
          buildStage: 'forms',
          status: 'designing',
        },
        {
          text: `**Step 4 of 4 — Vendor app blueprint complete**

Table, form layout, and routing rules are defined. Test with a sample vendor onboard in dev.`,
          choices: ['Add business rules', 'Add ACLs by vendor tier', 'Generate update set'],
          isTriage: false,
          buildStage: 'update_set',
          status: 'completed',
        },
      ];
    case 'industry':
      return buildIndustryTemplateSteps(messages) as DemoStep[];
    case 'import':
      return [
        {
          text: `**Step 1 of 4 — Requirements intake**

I'll convert your requirements into a ServiceNow solution blueprint — tables, workflows, and automation mapped from your source document.

What type of requirements are you importing?`,
          choices: ['BRD document', 'User stories', 'Process flow document', 'Meeting notes'],
          isTriage: true,
          buildStage: 'scope',
          status: 'discovering',
        },
        {
          text: `**Step 2 of 4 — Parsed requirements**

From your document I extracted these solution requirements:

1. Primary case/request object with assignment and SLA
2. Role-based access for agents vs. managers
3. At least one automated routing or validation rule
4. Employee or customer-facing catalog entry

Does this match your document, or should we adjust scope?`,
          choices: ['Looks correct — continue', 'Add more tables', 'Focus on automation only', 'Narrow to MVP'],
          isTriage: true,
          buildStage: 'tables',
          status: 'discovering',
        },
        {
          text: `**Step 3 of 4 — Blueprint from requirements**

**Proposed table:** \`u_req_case\` extending \`task\`

${formatFieldsTable([
  { name: 'u_req_id', type: 'String', label: 'Requirement ID', mandatory: true },
  { name: 'u_source_doc', type: 'String', label: 'Source Document' },
  { name: 'u_business_owner', type: 'Reference', label: 'Business Owner', reference: 'sys_user' },
  { name: 'u_priority', type: 'Choice', label: 'Priority' },
])}

Architecture steps are ordered for update-set capture.`,
          choices: ['Add workflow stages', 'Map to HRSD', 'Generate scripts'],
          isTriage: true,
          buildStage: 'forms',
          status: 'designing',
        },
        {
          text: `**Step 4 of 4 — Requirements → solution complete**

Your requirements are mapped to a scoped app blueprint with table dictionary, form sections, and automation placeholders. Attach the full document in a follow-up message to refine field-level detail.`,
          choices: ['Refine field list', 'Add integration points', 'Export architecture summary'],
          isTriage: false,
          buildStage: 'update_set',
          status: 'completed',
        },
      ];
    case 'analyze':
      return [
        {
          text: `**Step 1 of 3 — Application analysis**

I'll review your existing ServiceNow application and recommend improvements — data model, performance, security, and maintainability.

Which area should I analyze first?`,
          choices: ['Data model & tables', 'Client scripts & UI', 'Business rules & automation', 'Security & ACLs'],
          isTriage: true,
          buildStage: 'scope',
          status: 'discovering',
        },
        {
          text: `**Step 2 of 3 — Findings**

**Observations (demo analysis)**
- Custom fields on extended tables — good reuse of \`task\` SLAs
- Several client scripts overlap — candidate for consolidation
- ACLs may be wider than needed for confidential records
- Update sets not consistently scoped per release

**Risk:** hard-coded assignment groups in business rules reduce portability.`,
          choices: ['Show remediation plan', 'Prioritize quick wins', 'Deep dive on ACLs', 'Review scripting'],
          isTriage: true,
          buildStage: 'tables',
          status: 'designing',
        },
        {
          text: `**Step 3 of 3 — Recommendations**

**Recommended improvements**
1. Consolidate duplicate onLoad scripts into one scoped script include
2. Replace hard-coded groups with \`sys_user_group\` lookup by name
3. Add field-level ACLs on confidential flags
4. Split monolithic update sets by scoped app version

I can generate a remediation backlog as your next step.`,
          choices: ['Generate remediation backlog', 'Draft refactored script', 'ACL hardening plan'],
          isTriage: false,
          buildStage: 'update_set',
          status: 'completed',
        },
      ];
    default:
      return [
        {
          text: `**Step 1 of 4 — Solution intent**

I'll guide you step by step to build a scoped ServiceNow application — tables, forms, automation, and update-set-ready artifacts.

What type of application are you creating?`,
          choices: ['HRSD application', 'Employee onboarding', 'Vendor management', 'Custom case management'],
          isTriage: true,
          buildStage: 'scope',
          status: 'discovering',
        },
        {
          text: `**Step 2 of 4 — Platform engine**

For **${topic}**, choose the platform engine that anchors your build:

| Engine | Use when |
|--------|----------|
| HRSD | Employee HR cases & confidential data |
| CSM | Customer-facing case management |
| Custom scoped app | Isolated app outside standard plugins |`,
          choices: ['HRSD', 'CSM Case Management', 'Custom scoped app'],
          isTriage: true,
          buildStage: 'tables',
          status: 'discovering',
        },
        {
          text: `**Step 3 of 4 — Data model**

Creating starter table **\`u_${slugify(topic)}_case\`** extending \`task\` with reference ID, assignee, and category fields. We'll add sector-specific attributes in the next pass.`,
          choices: ['Add custom fields', 'Configure form', 'Set assignment rules'],
          isTriage: true,
          buildStage: 'forms',
          status: 'designing',
        },
        {
          text: `**Step 4 of 4 — Blueprint ready**

Scoped app scaffold is in place. Continue the conversation to add scripts, SLAs, or Employee Center integration.`,
          choices: ['Add client script', 'Add business rule', 'Configure SLAs'],
          isTriage: false,
          buildStage: 'update_set',
          status: 'completed',
        },
      ];
  }
}

function isHrsdApprovalContext(
  scenario: DemoScenario,
  messages: string[],
  chatHistory: ChatMessage[],
): boolean {
  if (scenario === 'hrsd') return true;
  if (messages.some((m) => detectScenarioFromText(m) === 'hrsd')) return true;
  return chatHistory.some(
    (m) =>
      m.sender === 'mitra' &&
      /step 6 of 6|executive summary for stakeholders|route this for stakeholder/i.test(m.text),
  );
}

function handleApprovalDraftActions(
  prompt: string,
  messages: string[],
  scenario: DemoScenario,
  chatHistory: ChatMessage[],
): DemoResponse | null {
  if (!/edit summary first|save as draft only/i.test(prompt.trim())) return null;
  if (!isHrsdApprovalContext(scenario, messages, chatHistory)) return null;

  const isEdit = /edit summary/i.test(prompt);
  const snText = formatSnRecordUpdate({
    table: 'u_mitra_artifact_approval',
    record: '`u_hrsd_executive_summary.doc` — HR Ticketing System',
    fromState: 'Draft',
    toState: 'Draft',
    updatedBy: 'Sumukh Sharma (Architect)',
    comments: isEdit
      ? 'Architect revising executive summary before stakeholder routing.'
      : 'Saved as draft — not routed for approval.',
  });

  return {
    text: `${snText}

${isEdit ? 'Tell me what to change in the summary — scope, timeline, or outcomes — and I will regenerate Step 6.' : 'The executive summary stays in **Draft**. When you are ready, choose **Send to stakeholder for approval** from Step 6.'}`,
    choices: isEdit
      ? ['Regenerate executive summary', 'Send to stakeholder for approval', 'Continue building']
      : ['Send to stakeholder for approval', 'Edit summary first', 'Continue building'],
    isTriage: false,
    blueprint: enrichBlueprintStudio({
      id: `bp-hrsd-draft-${Date.now()}`,
      title: 'HR Ticketing System',
      description: 'Executive summary draft',
      status: 'completed',
      buildStage: 'published',
      discoveredRequirements: ['Executive summary in draft'],
      architectureSteps: ['Executive summary draft'],
      tables: [],
    }),
  };
}

function handleApprovalFlow(
  prompt: string,
  messages: string[],
  scenario: DemoScenario,
  chatHistory: ChatMessage[],
): DemoResponse | null {
  if (!isSendForApprovalAction(prompt)) return null;
  if (!isHrsdApprovalContext(scenario, messages, chatHistory)) return null;

  const process = extractHrsdProcess(messages);
  const tableName = `u_hrsd_${slugify(process)}_case`;

  const snText = formatSnRecordUpdate({
    table: 'u_mitra_artifact_approval',
    record: '`u_hrsd_executive_summary.doc` — HR Ticketing System',
    fromState: 'Draft',
    toState: 'In Review',
    updatedBy: 'Sumukh Sharma (Architect)',
    assignmentGroup: 'Business Stakeholders',
    assignedTo: 'Stakeholder Review Queue',
    comments: 'Executive summary routed for business sign-off.',
  });

  return {
    text: `${snText}

**Artifact updated:** \`u_hrsd_executive_summary.doc\` is now **In Review** in My Solutions.

Your stakeholder will see a plain-language summary — no ServiceNow access required. Switch to **Stakeholder** role to preview their view, or wait for their response.`,
    choices: ['View Executive Summary artifact', 'Continue building', 'Switch to Stakeholder preview'],
    isTriage: false,
    blueprint: enrichBlueprintStudio({
      id: `bp-hrsd-approval-${Date.now()}`,
      title: `HRSD — ${process}`,
      description: 'Executive summary sent for stakeholder approval',
      status: 'completed',
      buildStage: 'published',
      discoveredRequirements: [`${process} business sign-off pending`],
      architectureSteps: ['Executive summary in review', 'Awaiting stakeholder response'],
      tables: [
        {
          name: tableName,
          label: `HRSD ${process}`,
          extendsTable: 'sn_hr_core_case',
          fields: hrsdFields(process),
        },
      ],
    }),
  };
}

function handleStakeholderOutcomeInChat(
  prompt: string,
  chatHistory: ChatMessage[],
): DemoResponse | null {
  const norm = prompt.toLowerCase();
  if (!/what did stakeholder|stakeholder respond|approval status|review status/i.test(norm)) return null;

  const lastSn = [...chatHistory].reverse().find((m) => m.snUpdate && m.sender === 'mitra');
  if (!lastSn) return null;

  return {
    text: `Here's the latest workflow activity on this solution:\n\n${lastSn.text}\n\nCheck **My Solutions → Executive Summary** for the current artifact state, or open **Notifications** for the full audit trail.`,
    choices: ['Open Executive Summary', 'Resend to stakeholder', 'Continue building'],
    isTriage: false,
    blueprint: enrichBlueprintStudio({
      id: `bp-status-${Date.now()}`,
      title: 'HR Ticketing System',
      description: 'Approval workflow status',
      status: 'completed',
      buildStage: 'published',
      discoveredRequirements: [],
      architectureSteps: ['Track stakeholder approval'],
      tables: [],
    }),
  };
}

function handleRefinement(
  prompt: string,
  solutionName: string,
  chatHistory: ChatMessage[],
  guidedStepCount: number,
): DemoResponse | null {
  const mitraTurns = countCompletedMitraTurns(chatHistory);
  if (mitraTurns < guidedStepCount) return null;

  const isCompletedWorkspace =
    solutionName !== 'New Custom Solution' &&
    solutionName !== 'Custom ServiceNow Workspace' &&
    solutionName !== 'Untitled' &&
    chatHistory.length > 2;

  if (!isCompletedWorkspace) return null;

  const norm = prompt.toLowerCase();
  const isScript = /client|script|validation|onload/.test(norm);
  const isRule = /business|rule|route|assign/.test(norm);
  const isSla = /sla|timer|escalat/.test(norm);
  const isXml = /xml|schema|dictionary/.test(norm);

  const tableName = solutionName.toLowerCase().includes('hr')
    ? 'u_hrsd_employee_onboarding_case'
    : 'u_custom_case';

  let text = '';
  let choices = ['Add Client Script', 'Add Business Rule', 'Configure SLAs'];

  if (isGreeting(prompt)) {
    text = `You're in the **${solutionName}** workspace. The scoped app has its core table, form layout, and baseline automation.\n\nTell me what to extend — scripts, routing rules, SLAs, or dictionary export.`;
  } else if (isScript) {
    text = `Added an **onLoad client script** on \`${tableName}\`. It warns agents on confidential records and locks sensitive fields for users without the HR case writer role.\n\nTest by opening a confidential case in dev.`;
    choices = ['Add Business Rule', 'Configure SLAs', 'Show XML schema'];
  } else if (isRule) {
    text = `Added a **before insert** business rule on \`${tableName}\`. It sets the assignment group from topic category so API and import paths get the same routing as the form.`;
    choices = ['Add Client Script', 'Configure SLAs', 'Show XML schema'];
  } else if (isSla) {
    text = `Configured **SLA definitions** — VIP cases target 24h resolution, standard cases 48h. Tie SLA tiers to your priority or category field on insert.`;
    choices = ['Add Client Script', 'Add Business Rule', 'Show XML schema'];
  } else if (isXml) {
    text = `Dictionary schema for \`${tableName}\` — capture these in an update set before promoting to test.`;
    choices = ['Add Client Script', 'Add Business Rule', 'Configure SLAs'];
  } else {
    return null;
  }

  return {
    text,
    isTriage: false,
    choices,
    blueprint: enrichBlueprintStudio({
      id: `bp-refine-${Date.now()}`,
      title: solutionName,
      description: `Refined blueprint for ${solutionName}`,
      status: 'completed',
      discoveredRequirements: ['Extend automation and compliance'],
      architectureSteps: ['Apply incremental blueprint changes'],
      tables: [
        {
          name: tableName,
          label: solutionName,
          extendsTable: 'sn_hr_core_case',
          fields: hrsdFields('Employee Onboarding'),
        },
      ],
    }),
  };
}

function stepToBlueprint(
  step: DemoStep,
  title: string,
  scenario: DemoScenario,
): SolutionBlueprint {
  return enrichBlueprintStudio({
    id: `bp-demo-${Date.now()}`,
    title,
    description: `Demo ${scenario} scenario — ${title}`,
    status: step.status || 'discovering',
    buildStage: step.buildStage,
    discoveredRequirements: step.discoveredRequirements || [],
    architectureSteps: step.architectureSteps || [],
    tables: step.tables || [],
    clientScripts: step.clientScripts,
    businessRules: step.businessRules,
  });
}

export function getDemoResponse(
  prompt: string,
  currentSolutionName: string,
  chatHistory: ChatMessage[],
  context?: {
    solutionId?: string;
    phaseProgress?: import('../types').PhaseProgress;
    artifacts?: SolutionArtifact[];
    statusOverrides?: Record<string, ArtifactStatus>;
    userRole?: UserRole;
    developerComments?: import('../types').DeveloperComment[];
    stakeholderReviews?: import('../types').StakeholderReview[];
    requirementsDocument?: import('../types').RequirementsDocument;
  },
): DemoResponse {
  const messages = getUserMessages(chatHistory, prompt);

  if ((context?.solutionId && usesPhaseEngine(context.solutionId)) || context?.phaseProgress) {
    const phaseCtx: PhaseEngineContext = {
      solutionId: context.solutionId,
      solutionName: currentSolutionName,
      phaseProgress: context.phaseProgress,
      artifacts: context.artifacts ?? [],
      statusOverrides: context.statusOverrides ?? {},
      userRole: context.userRole,
      developerComments: context.developerComments,
      stakeholderReviews: context.stakeholderReviews,
      requirementsDocument: context.requirementsDocument,
    };
    return getPhaseEngineResponse(prompt, chatHistory, phaseCtx);
  }

  if (messages.length === 0) {
    return {
      text: `I'll walk you through building a scoped ServiceNow application step by step — tables, forms, assignment rules, scripts, and update-set packaging.\n\nDescribe what you want to build (for example, an HRSD app), or pick a starter below.`,
      isTriage: true,
      choices: ['I want to create an HRSD app', 'Employee onboarding', 'Vendor management', 'Analyze existing app'],
      blueprint: enrichBlueprintStudio({
        id: `bp-demo-welcome-${Date.now()}`,
        title: 'ServiceNow Solution',
        description: 'Awaiting requirements',
        status: 'discovering',
        buildStage: 'scope',
        discoveredRequirements: [],
        architectureSteps: ['Gather solution intent'],
        tables: [],
      }),
    };
  }

  const catalogTemplate = findCatalogTemplate(currentSolutionName);
  if (catalogTemplate) {
    const catalogSteps = buildCatalogTemplateDevSteps(catalogTemplate);
    const mitraTurns = countCompletedMitraTurns(chatHistory);
    const stepIndex = Math.min(Math.max(0, mitraTurns - 1), catalogSteps.length - 1);
    const step = catalogSteps[stepIndex] as DemoStep;

    return {
      text: step.text,
      choices: step.choices,
      isTriage: step.isTriage,
      blueprint: stepToBlueprint(step, catalogTemplate.title, 'industry'),
    };
  }

  const scenario = getLockedScenario(messages);
  const steps = getScenarioSteps(scenario, messages);

  const approvalFlow = handleApprovalFlow(prompt, messages, scenario, chatHistory);
  if (approvalFlow) return approvalFlow;

  const draftAction = handleApprovalDraftActions(prompt, messages, scenario, chatHistory);
  if (draftAction) return draftAction;

  const stakeholderStatus = handleStakeholderOutcomeInChat(prompt, chatHistory);
  if (stakeholderStatus) return stakeholderStatus;

  const stepIndex = Math.min(countCompletedMitraTurns(chatHistory), steps.length - 1);
  const step = steps[stepIndex];

  const refinement = handleRefinement(prompt, currentSolutionName, chatHistory, steps.length);
  if (refinement) return refinement;

  const title =
    scenario === 'hrsd'
      ? `HRSD — ${extractHrsdProcess(messages)}`
      : scenario === 'industry'
        ? `${extractIndustry(messages)} — ${extractTemplatePack(messages).label}`
        : messages[0].slice(0, 72) + (messages[0].length > 72 ? '…' : '');

  return {
    text: step.text,
    choices: step.choices,
    isTriage: step.isTriage,
    blueprint: stepToBlueprint(step, title, scenario),
  };
}
