import {
  FileText,
  BookOpen,
  Workflow,
  Layers,
  Eye,
  TestTube,
  Code2,
  Users,
  Rocket,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';
import { USER_DISPLAY_NAME } from '../constants/user';

export type SkillCategory = 'Design' | 'Development' | 'Documentation' | 'Testing';

export interface SkillParameter {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  defaultValue?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  icon: LucideIcon;
  whatItHelpsWith: string;
  examplePrompt: string;
  parameters: SkillParameter[];
  createdBy: string;
  instanceId?: string;
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  'Design',
  'Development',
  'Documentation',
  'Testing',
];

export const SKILLS: Skill[] = [
  {
    id: 'create-user-story',
    name: 'Create User Story',
    description: 'Generate well-structured user stories with acceptance criteria.',
    category: 'Documentation',
    icon: FileText,
    whatItHelpsWith: 'Quickly drafting user stories that follow INVEST criteria with clear acceptance criteria, definition of done, and story point estimates.',
    examplePrompt: 'Create a user story for a password reset flow that supports both email and SMS verification.',
    parameters: [
      { id: 'story-title', label: 'Story Title', type: 'text', placeholder: 'e.g. As a user, I want to reset my password', required: true },
      { id: 'acceptance-criteria', label: 'Acceptance Criteria', type: 'textarea', placeholder: 'List the acceptance criteria...', required: true },
      { id: 'story-points', label: 'Story Points', type: 'select', options: ['1', '2', '3', '5', '8', '13'], defaultValue: '3' },
      { id: 'priority', label: 'Priority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], defaultValue: 'Medium' },
    ],
    createdBy: USER_DISPLAY_NAME,
  },
  {
    id: 'generate-brd',
    name: 'Generate BRD',
    description: 'Draft a Business Requirements Document from project scope.',
    category: 'Documentation',
    icon: BookOpen,
    whatItHelpsWith: 'Producing a structured BRD with executive summary, stakeholder analysis, functional/non-functional requirements, and success metrics.',
    examplePrompt: 'Generate a BRD for an employee onboarding automation system that integrates with HRSD.',
    parameters: [
      { id: 'project-name', label: 'Project Name', type: 'text', placeholder: 'e.g. Employee Onboarding Automation', required: true },
      { id: 'scope', label: 'Project Scope', type: 'textarea', placeholder: 'Describe the project scope...', required: true },
      { id: 'stakeholders', label: 'Key Stakeholders', type: 'text', placeholder: 'e.g. HR Director, IT Manager', required: false },
      { id: 'timeline', label: 'Expected Timeline', type: 'select', options: ['1 month', '3 months', '6 months', '12 months'], defaultValue: '3 months' },
    ],
    createdBy: USER_DISPLAY_NAME,
  },
  {
    id: 'design-workflow',
    name: 'Design Workflow',
    description: 'Map out approval and automation workflows visually.',
    category: 'Design',
    icon: Workflow,
    whatItHelpsWith: 'Designing multi-step approval workflows with conditional routing, SLA timers, and escalation paths for ServiceNow Flow Designer.',
    examplePrompt: 'Design an approval workflow for purchase requests over $5,000 with VP escalation.',
    parameters: [
      { id: 'workflow-name', label: 'Workflow Name', type: 'text', placeholder: 'e.g. Purchase Approval Workflow', required: true },
      { id: 'trigger', label: 'Trigger Condition', type: 'text', placeholder: 'e.g. When purchase request > $5,000', required: true },
      { id: 'approvers', label: 'Approvers', type: 'textarea', placeholder: 'List approver roles...', required: true },
      { id: 'sla-hours', label: 'SLA (hours)', type: 'text', placeholder: 'e.g. 48', defaultValue: '48' },
    ],
    createdBy: USER_DISPLAY_NAME,
  },
  {
    id: 'solution-architecture',
    name: 'Solution Architecture',
    description: 'Blueprint the technical architecture for a ServiceNow solution.',
    category: 'Design',
    icon: Layers,
    whatItHelpsWith: 'Creating comprehensive solution architecture documents covering modules, integrations, data models, and implementation phases.',
    examplePrompt: 'Design the solution architecture for an IT asset management system using SAM Pro.',
    parameters: [
      { id: 'solution-name', label: 'Solution Name', type: 'text', placeholder: 'e.g. IT Asset Management', required: true },
      { id: 'modules', label: 'ServiceNow Modules', type: 'textarea', placeholder: 'e.g. SAM Pro, CMDB, Discovery', required: true },
      { id: 'integrations', label: 'External Integrations', type: 'textarea', placeholder: 'List integrations...' },
      { id: 'phase', label: 'Implementation Phase', type: 'select', options: ['Discovery', 'Design', 'Build', 'Test', 'Deploy'], defaultValue: 'Discovery' },
    ],
    createdBy: USER_DISPLAY_NAME,
  },
  {
    id: 'ui-review',
    name: 'UI Review',
    description: 'Review UI/UX patterns and suggest improvements.',
    category: 'Design',
    icon: Eye,
    whatItHelpsWith: 'Analyzing portal pages, form layouts, and workspace configurations for usability, accessibility, and design consistency.',
    examplePrompt: 'Review the service portal catalog item page and suggest UX improvements.',
    parameters: [
      { id: 'page-url', label: 'Page URL / Screen', type: 'text', placeholder: 'e.g. Service Portal Catalog Item', required: true },
      { id: 'focus-area', label: 'Focus Area', type: 'select', options: ['Usability', 'Accessibility', 'Performance', 'Visual Design', 'All'], defaultValue: 'All' },
      { id: 'notes', label: 'Additional Notes', type: 'textarea', placeholder: 'Any specific concerns...' },
    ],
    createdBy: USER_DISPLAY_NAME,
  },
  {
    id: 'create-test-cases',
    name: 'Create Test Cases',
    description: 'Generate ATF test cases and validation scripts.',
    category: 'Testing',
    icon: TestTube,
    whatItHelpsWith: 'Creating automated test suites using ServiceNow ATF with step-by-step instructions, expected results, and data setup.',
    examplePrompt: 'Create test cases for the incident creation form including field validation and assignment rules.',
    parameters: [
      { id: 'test-scope', label: 'Test Scope', type: 'text', placeholder: 'e.g. Incident Creation Form', required: true },
      { id: 'test-type', label: 'Test Type', type: 'select', options: ['Functional', 'Integration', 'Regression', 'Performance'], defaultValue: 'Functional' },
      { id: 'scenarios', label: 'Test Scenarios', type: 'textarea', placeholder: 'Describe key scenarios...', required: true },
      { id: 'env', label: 'Test Environment', type: 'select', options: ['Dev', 'Staging', 'QA', 'Production'], defaultValue: 'Dev' },
    ],
    createdBy: USER_DISPLAY_NAME,
  },
  {
    id: 'api-specification',
    name: 'API Specification',
    description: 'Define REST API specs for integrations and spoke actions.',
    category: 'Development',
    icon: Code2,
    whatItHelpsWith: 'Drafting OpenAPI specs, request/response schemas, authentication profiles, and error handling patterns for IntegrationHub.',
    examplePrompt: 'Define a REST API specification for a employee lookup endpoint with pagination.',
    parameters: [
      { id: 'api-name', label: 'API Name', type: 'text', placeholder: 'e.g. Employee Lookup API', required: true },
      { id: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], defaultValue: 'GET' },
      { id: 'auth', label: 'Authentication', type: 'select', options: ['OAuth 2.0', 'Basic Auth', 'API Key', 'None'], defaultValue: 'OAuth 2.0' },
      { id: 'schema', label: 'Request/Response Schema', type: 'textarea', placeholder: 'Describe the data model...' },
    ],
    createdBy: USER_DISPLAY_NAME,
  },
  {
    id: 'stakeholder-summary',
    name: 'Stakeholder Summary',
    description: 'Create executive summaries for stakeholder reviews.',
    category: 'Documentation',
    icon: Users,
    whatItHelpsWith: 'Preparing concise status reports, risk summaries, and progress updates tailored for different stakeholder personas.',
    examplePrompt: 'Create a stakeholder summary for the Phase 1 discovery completion of the HR onboarding project.',
    parameters: [
      { id: 'project', label: 'Project Name', type: 'text', placeholder: 'e.g. HR Onboarding Automation', required: true },
      { id: 'phase', label: 'Current Phase', type: 'select', options: ['Discovery', 'Design', 'Build', 'Test', 'Deploy', 'Post-Launch'], defaultValue: 'Discovery' },
      { id: 'audience', label: 'Audience', type: 'select', options: ['Executive', 'Technical', 'Mixed'], defaultValue: 'Mixed' },
      { id: 'highlights', label: 'Key Highlights', type: 'textarea', placeholder: 'Major achievements or milestones...' },
    ],
    createdBy: USER_DISPLAY_NAME,
  },
  {
    id: 'release-notes',
    name: 'Release Notes',
    description: 'Draft release notes for upcoming deployments.',
    category: 'Documentation',
    icon: Rocket,
    whatItHelpsWith: 'Generating structured release notes with feature highlights, breaking changes, migration steps, and rollback instructions.',
    examplePrompt: 'Draft release notes for the v2.3 update that adds SSO support and deprecates the legacy login.',
    parameters: [
      { id: 'version', label: 'Version', type: 'text', placeholder: 'e.g. v2.3', required: true },
      { id: 'features', label: 'New Features', type: 'textarea', placeholder: 'List new features...', required: true },
      { id: 'breaking', label: 'Breaking Changes', type: 'textarea', placeholder: 'List any breaking changes...' },
      { id: 'rollback', label: 'Rollback Steps', type: 'textarea', placeholder: 'Rollback instructions...' },
    ],
    createdBy: USER_DISPLAY_NAME,
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    description: 'Identify and evaluate project risks with mitigation plans.',
    category: 'Design',
    icon: ShieldAlert,
    whatItHelpsWith: 'Conducting structured risk assessments with probability/impact scoring, mitigation strategies, and contingency plans.',
    examplePrompt: 'Perform a risk assessment for migrating the legacy ITSM instance to the new platform.',
    parameters: [
      { id: 'project', label: 'Project Name', type: 'text', placeholder: 'e.g. ITSM Migration', required: true },
      { id: 'scope', label: 'Assessment Scope', type: 'textarea', placeholder: 'Define the scope...', required: true },
      { id: 'risk-level', label: 'Risk Tolerance', type: 'select', options: ['Conservative', 'Moderate', 'Aggressive'], defaultValue: 'Moderate' },
      { id: 'areas', label: 'Focus Areas', type: 'textarea', placeholder: 'e.g. Data migration, Integration, Security' },
    ],
    createdBy: USER_DISPLAY_NAME,
  },
];
