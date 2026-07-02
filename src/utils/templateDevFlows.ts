import { SERVICE_TEMPLATES } from '../data/templates';
import { ServiceTemplate, TableField, ServiceNowTable } from '../types';
import { SolutionBlueprint } from '../types';
import { enrichBlueprintStudio } from './studioHelpers';

export interface TemplateDevStep {
  text: string;
  choices?: string[];
  isTriage?: boolean;
  buildStage?: SolutionBlueprint['buildStage'];
  status?: SolutionBlueprint['status'];
  architectureSteps?: string[];
  discoveredRequirements?: string[];
  tables?: import('../types').ServiceNowTable[];
  clientScripts?: SolutionBlueprint['clientScripts'];
  businessRules?: SolutionBlueprint['businessRules'];
}

export interface TemplatePackConfig {
  id: string;
  label: string;
  tableName: string;
  tableLabel: string;
  extendsTable: string;
  fields: TableField[];
  clientScriptName: string;
  clientScript: string;
  businessRuleName: string;
  businessRule: string;
}

export const TEMPLATE_PACKS: Record<string, TemplatePackConfig> = {
  regulated: {
    id: 'regulated',
    label: 'Regulated case handler',
    tableName: 'u_regulated_case',
    tableLabel: 'Regulated Case',
    extendsTable: 'task',
    fields: [
      { name: 'u_case_ref', type: 'String', label: 'Case Reference', mandatory: true },
      { name: 'u_audit_required', type: 'True/False', label: 'SOX Audit Required' },
      { name: 'u_regulator_id', type: 'String', label: 'Regulator ID' },
      { name: 'u_risk_rating', type: 'Choice', label: 'Risk Rating' },
    ],
    clientScriptName: 'Audit Flag on Load',
    clientScript: `function onLoad() {\n  if (g_form.getValue('u_audit_required') === 'true') {\n    g_form.showFieldMsg('u_regulator_id', 'SOX audit trail active on this case.', 'warning');\n  }\n}`,
    businessRuleName: 'Route to Compliance COE',
    businessRule: `(function executeRule(current, previous) {\n  if (current.u_risk_rating == 'high') {\n    current.assignment_group.setDisplayValue('Compliance Review Team');\n    current.priority = 2;\n  }\n})(current, previous);`,
  },
  employee_portal: {
    id: 'employee_portal',
    label: 'Employee service portal',
    tableName: 'u_employee_service_case',
    tableLabel: 'Employee Service Case',
    extendsTable: 'sn_hr_core_case',
    fields: [
      { name: 'u_hr_topic', type: 'Choice', label: 'HR Topic', mandatory: true },
      { name: 'u_confidential', type: 'True/False', label: 'Confidential' },
      { name: 'u_employee_ref', type: 'Reference', label: 'Employee', reference: 'sys_user' },
    ],
    clientScriptName: 'HR Confidential Warning',
    clientScript: `function onLoad() {\n  if (g_form.getValue('u_confidential') === 'true') {\n    g_form.showFieldMsg('short_description', 'Confidential HR case.', 'warning');\n  }\n}`,
    businessRuleName: 'HR Topic Auto-Route',
    businessRule: `(function executeRule(current, previous) {\n  var topic = current.u_hr_topic;\n  if (topic == 'benefits') current.assignment_group.setDisplayValue('HR Benefits');\n  else if (topic == 'payroll') current.assignment_group.setDisplayValue('HR Payroll');\n})(current, previous);`,
  },
  asset_ops: {
    id: 'asset_ops',
    label: 'Asset & operations',
    tableName: 'u_asset_work_order',
    tableLabel: 'Asset Work Order',
    extendsTable: 'task',
    fields: [
      { name: 'u_asset_tag', type: 'String', label: 'Asset Tag', mandatory: true },
      { name: 'u_site_location', type: 'String', label: 'Site Location' },
      { name: 'u_safety_flag', type: 'True/False', label: 'Safety Critical' },
      { name: 'u_downtime_hours', type: 'Integer', label: 'Downtime Hours' },
    ],
    clientScriptName: 'Safety Critical Alert',
    clientScript: `function onLoad() {\n  if (g_form.getValue('u_safety_flag') === 'true') {\n    g_form.addErrorMessage('Safety-critical asset — escalate if unresolved in 4h.');\n  }\n}`,
    businessRuleName: 'Priority on Safety Flag',
    businessRule: `(function executeRule(current, previous) {\n  if (current.u_safety_flag == true) {\n    current.priority = 1;\n    current.assignment_group.setDisplayValue('Operations Emergency');\n  }\n})(current, previous);`,
  },
};

function formatFieldsTable(fields: TableField[]): string {
  const rows = fields.map(
    (f) => `| ${f.name} | ${f.type} | ${f.label}${f.mandatory ? ' *' : ''} |`,
  );
  return `| Field | Type | Label |\n|-------|------|-------|\n${rows.join('\n')}`;
}

function tableForPack(pack: TemplatePackConfig): ServiceNowTable {
  return {
    name: pack.tableName,
    label: pack.tableLabel,
    extendsTable: pack.extendsTable,
    fields: pack.fields,
  };
}

export function extractIndustry(messages: string[]): string {
  const text = messages.join(' ').toLowerCase();
  if (/healthcare|hipaa|patient/.test(text)) return 'Healthcare';
  if (/telecom|subscriber|network/.test(text)) return 'Telecom';
  if (/manufacturing|factory|production/.test(text)) return 'Manufacturing';
  if (/banking|finra|sox/.test(text)) return 'Banking';
  return 'Banking';
}

export function extractTemplatePack(messages: string[]): TemplatePackConfig {
  const text = messages.join(' ').toLowerCase();
  if (/employee service|hr case|portal/.test(text)) return TEMPLATE_PACKS.employee_portal;
  if (/asset|operation|work order/.test(text)) return TEMPLATE_PACKS.asset_ops;
  if (/regulated|compliance|audit|sox/.test(text)) return TEMPLATE_PACKS.regulated;
  return TEMPLATE_PACKS.regulated;
}

export function findCatalogTemplate(solutionName: string): ServiceTemplate | undefined {
  const norm = solutionName.toLowerCase().trim();
  return SERVICE_TEMPLATES.find((t) => {
    const title = t.title.toLowerCase();
    return norm === title || title.includes(norm) || norm.includes(title);
  });
}

export function buildIndustryTemplateSteps(messages: string[]): TemplateDevStep[] {
  const industry = extractIndustry(messages);
  const pack = extractTemplatePack(messages);
  const table = tableForPack(pack);

  return [
    {
      text: `## Step 1 of 6 — Industry context

I'll map ServiceNow solution patterns to **${industry}** — tables, compliance fields, and catalog items.

Which industry are you building for?`,
      choices: ['Banking', 'Healthcare', 'Telecom', 'Manufacturing'],
      isTriage: true,
      buildStage: 'scope',
      status: 'discovering',
    },
    {
      text: `## Step 2 of 6 — Pick a template

For **${industry}**, these scoped app templates fit best:

| Template | Extends | Focus |
|----------|---------|-------|
| Regulated case handler | \`task\` | SOX / audit trail |
| Employee service portal | \`sn_hr_core_case\` | HR privacy |
| Asset & operations | \`task\` | Uptime / safety SLAs |

Which template should we build from?`,
      choices: ['Regulated case handler', 'Employee service portal', 'Asset & operations'],
      isTriage: true,
      buildStage: 'tables',
      status: 'discovering',
    },
    {
      text: `## Step 3 of 6 — Template instantiated

Loaded **${pack.label}** for **${industry}**. Scoped app shell and starter table are ready:

**Table:** \`${pack.tableName}\` extending \`${pack.extendsTable}\`

${formatFieldsTable(pack.fields)}

Next we'll wire the form layout and application menu.`,
      choices: ['Configure form layout', 'Add application module', 'Continue to scripts'],
      isTriage: true,
      buildStage: 'forms',
      status: 'designing',
      tables: [table],
      discoveredRequirements: [`${industry} ${pack.label}`, 'Template dictionary fields'],
      architectureSteps: [`Create ${pack.tableName}`, 'Scoped application record'],
    },
    {
      text: `## Step 4 of 6 — Form & application menu

**Form sections** for \`${pack.tableName}\`:
1. **Overview** — reference, category, short description
2. **Details** — industry-specific fields from the template
3. **Resolution** — assignment group, work notes, close code

**Application menu** — module linked to \`${pack.tableName}\` with roles \`x_${pack.id}.user\` and \`x_${pack.id}.admin\`.`,
      choices: ['Add client script', 'Add business rule', 'Define ACLs'],
      isTriage: true,
      buildStage: 'forms',
      status: 'designing',
      tables: [table],
    },
    {
      text: `## Step 5 of 6 — Client script

Deployed **${pack.clientScriptName}** on \`${pack.tableName}\`:

\`\`\`javascript
${pack.clientScript}
\`\`\`

Validate on a new record in dev — the form should show the expected message when conditions match.`,
      choices: ['Add business rule', 'Configure SLAs', 'Review update set'],
      isTriage: true,
      buildStage: 'scripts',
      status: 'designing',
      tables: [table],
      clientScripts: [
        {
          name: pack.clientScriptName,
          table: pack.tableName,
          type: 'onLoad',
          description: `Template client script for ${pack.label}.`,
          script: pack.clientScript,
        },
      ],
    },
    {
      text: `## Step 6 of 6 — Business rule & go-live

**${pack.businessRuleName}** (before insert) on \`${pack.tableName}\`:

\`\`\`javascript
${pack.businessRule}
\`\`\`

**Update set checklist**
- Scoped app + module
- Table \`${pack.tableName}\` and dictionary
- Client script + business rule
- ACLs for ${industry} roles

**${pack.label}** is ready to test in your dev instance.`,
      choices: ['Add SLA definitions', 'Export dictionary XML', 'Start another template'],
      isTriage: false,
      buildStage: 'update_set',
      status: 'completed',
      tables: [table],
      clientScripts: [
        {
          name: pack.clientScriptName,
          table: pack.tableName,
          type: 'onLoad',
          description: `Template client script for ${pack.label}.`,
          script: pack.clientScript,
        },
      ],
      businessRules: [
        {
          name: pack.businessRuleName,
          table: pack.tableName,
          when: 'before',
          insert: true,
          update: false,
          description: `Template routing rule for ${pack.label}.`,
          script: pack.businessRule,
        },
      ],
    },
  ];
}

export function buildCatalogTemplateDevSteps(template: ServiceTemplate): TemplateDevStep[] {
  const tableName = `u_${template.id.replace(/-/g, '_')}_record`;
  const clientScript = `function onLoad() {\n  g_form.setMandatory('u_priority_tag', true);\n  g_form.addInfoMessage("${template.title} — template record ready.");\n}`;
  const businessRule = `(function executeRule(current, previous) {\n  current.short_description = "[${template.category}] " + (current.short_description || "${template.title}");\n  if (!current.assignment_group.nil()) return;\n  current.assignment_group.setDisplayValue('${template.category} Team');\n})(current, previous);`;

  const fields: TableField[] = [
    { name: 'u_priority_tag', type: 'Choice', label: 'Priority', mandatory: true },
    { name: 'u_operator', type: 'Reference', label: 'Assigned Agent', reference: 'sys_user' },
    { name: 'u_program_ref', type: 'String', label: `${template.category} Reference` },
  ];

  const table: ServiceNowTable = {
    name: tableName,
    label: template.title,
    extendsTable: 'task',
    fields,
  };

  return [
    {
      text: `## Step 1 of 5 — Extend the data model

Building from **${template.title}** (${template.tablesCount} tables in template pack).

Extending \`${tableName}\`:

${formatFieldsTable(fields)}

I'll add any programme-specific fields you need next.`,
      choices: ['Add custom fields', 'Configure related lists', 'Continue to forms'],
      isTriage: true,
      buildStage: 'tables',
      status: 'designing',
      tables: [table],
    },
    {
      text: `## Step 2 of 5 — Form layout & roles

**Form** — three sections: Request details, ${template.category} data, Resolution.

**Roles** — \`x_${template.id.replace(/-/g, '_')}.user\` (create/read) and \`.admin\` (full).

**List view** — priority, assigned agent, state, updated.`,
      choices: ['Add client script', 'Add business rule', 'Set up catalog item'],
      isTriage: true,
      buildStage: 'forms',
      status: 'designing',
      tables: [table],
    },
    {
      text: `## Step 3 of 5 — Client script

\`\`\`javascript
${clientScript}
\`\`\`

Script sets mandatory fields and shows a template-ready banner on new records.`,
      choices: ['Add business rule', 'Add UI policy', 'Test in dev'],
      isTriage: true,
      buildStage: 'scripts',
      status: 'designing',
      tables: [table],
      clientScripts: [
        {
          name: 'Template Form Init',
          table: tableName,
          type: 'onLoad',
          description: `Initialization for ${template.title}.`,
          script: clientScript,
        },
      ],
    },
    {
      text: `## Step 4 of 5 — Business rule

**Before insert** on \`${tableName}\`:

\`\`\`javascript
${businessRule}
\`\`\`

Routes unassigned records to the **${template.category} Team** and prefixes the short description.`,
      choices: ['Configure SLAs', 'Add notifications', 'Package update set'],
      isTriage: true,
      buildStage: 'rules',
      status: 'generating',
      tables: [table],
      clientScripts: [
        {
          name: 'Template Form Init',
          table: tableName,
          type: 'onLoad',
          description: `Initialization for ${template.title}.`,
          script: clientScript,
        },
      ],
      businessRules: [
        {
          name: 'Template Auto-Assign',
          table: tableName,
          when: 'before',
          insert: true,
          update: false,
          description: `Auto-assignment for ${template.title}.`,
          script: businessRule,
        },
      ],
    },
    {
      text: `## Step 5 of 5 — Template build complete

**${template.title}** is coded and ready for dev testing.

**Delivered**
- Table \`${tableName}\` + dictionary
- Form layout & module
- Client script + business rule
- Role definitions stub

Capture in an update set, then promote to test. Tags: ${template.tags.slice(0, 3).join(', ')}.`,
      choices: ['Add another script', 'Generate XML export', 'Configure workflow'],
      isTriage: false,
      buildStage: 'update_set',
      status: 'completed',
      tables: [table],
      clientScripts: [
        {
          name: 'Template Form Init',
          table: tableName,
          type: 'onLoad',
          description: `Initialization for ${template.title}.`,
          script: clientScript,
        },
      ],
      businessRules: [
        {
          name: 'Template Auto-Assign',
          table: tableName,
          when: 'before',
          insert: true,
          update: false,
          description: `Auto-assignment for ${template.title}.`,
          script: businessRule,
        },
      ],
    },
  ];
}

export function catalogTemplateBlueprint(template: ServiceTemplate) {
  const tableName = `u_${template.id.replace(/-/g, '_')}_record`;
  return enrichBlueprintStudio({
    id: `bp-tpl-${template.id}`,
    title: template.title,
    description: template.description,
    status: 'designing',
    buildStage: 'tables',
    discoveredRequirements: [`Develop from template: ${template.title}`],
    architectureSteps: ['Load template', 'Extend data model', 'Add scripts'],
    tables: [
      {
        name: tableName,
        label: template.title,
        extendsTable: 'task',
        fields: [
          { name: 'u_priority_tag', type: 'Choice', label: 'Priority' },
          { name: 'u_operator', type: 'Reference', label: 'Assigned Agent', reference: 'sys_user' },
        ],
      },
    ],
  });
}
