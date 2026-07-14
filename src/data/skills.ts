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

export type SkillCategory = 'Design' | 'Development' | 'Documentation' | 'Testing';

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  icon: LucideIcon;
  whatItHelpsWith: string;
  examplePrompt: string;
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
  },
  {
    id: 'generate-brd',
    name: 'Generate BRD',
    description: 'Draft a Business Requirements Document from project scope.',
    category: 'Documentation',
    icon: BookOpen,
    whatItHelpsWith: 'Producing a structured BRD with executive summary, stakeholder analysis, functional/non-functional requirements, and success metrics.',
    examplePrompt: 'Generate a BRD for an employee onboarding automation system that integrates with HRSD.',
  },
  {
    id: 'design-workflow',
    name: 'Design Workflow',
    description: 'Map out approval and automation workflows visually.',
    category: 'Design',
    icon: Workflow,
    whatItHelpsWith: 'Designing multi-step approval workflows with conditional routing, SLA timers, and escalation paths for ServiceNow Flow Designer.',
    examplePrompt: 'Design an approval workflow for purchase requests over $5,000 with VP escalation.',
  },
  {
    id: 'solution-architecture',
    name: 'Solution Architecture',
    description: 'Blueprint the technical architecture for a ServiceNow solution.',
    category: 'Design',
    icon: Layers,
    whatItHelpsWith: 'Creating comprehensive solution architecture documents covering modules, integrations, data models, and implementation phases.',
    examplePrompt: 'Design the solution architecture for an IT asset management system using SAM Pro.',
  },
  {
    id: 'ui-review',
    name: 'UI Review',
    description: 'Review UI/UX patterns and suggest improvements.',
    category: 'Design',
    icon: Eye,
    whatItHelpsWith: 'Analyzing portal pages, form layouts, and workspace configurations for usability, accessibility, and design consistency.',
    examplePrompt: 'Review the service portal catalog item page and suggest UX improvements.',
  },
  {
    id: 'create-test-cases',
    name: 'Create Test Cases',
    description: 'Generate ATF test cases and validation scripts.',
    category: 'Testing',
    icon: TestTube,
    whatItHelpsWith: 'Creating automated test suites using ServiceNow ATF with step-by-step instructions, expected results, and data setup.',
    examplePrompt: 'Create test cases for the incident creation form including field validation and assignment rules.',
  },
  {
    id: 'api-specification',
    name: 'API Specification',
    description: 'Define REST API specs for integrations and spoke actions.',
    category: 'Development',
    icon: Code2,
    whatItHelpsWith: 'Drafting OpenAPI specs, request/response schemas, authentication profiles, and error handling patterns for IntegrationHub.',
    examplePrompt: 'Define a REST API specification for a employee lookup endpoint with pagination.',
  },
  {
    id: 'stakeholder-summary',
    name: 'Stakeholder Summary',
    description: 'Create executive summaries for stakeholder reviews.',
    category: 'Documentation',
    icon: Users,
    whatItHelpsWith: 'Preparing concise status reports, risk summaries, and progress updates tailored for different stakeholder personas.',
    examplePrompt: 'Create a stakeholder summary for the Phase 1 discovery completion of the HR onboarding project.',
  },
  {
    id: 'release-notes',
    name: 'Release Notes',
    description: 'Draft release notes for upcoming deployments.',
    category: 'Documentation',
    icon: Rocket,
    whatItHelpsWith: 'Generating structured release notes with feature highlights, breaking changes, migration steps, and rollback instructions.',
    examplePrompt: 'Draft release notes for the v2.3 update that adds SSO support and deprecates the legacy login.',
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    description: 'Identify and evaluate project risks with mitigation plans.',
    category: 'Design',
    icon: ShieldAlert,
    whatItHelpsWith: 'Conducting structured risk assessments with probability/impact scoring, mitigation strategies, and contingency plans.',
    examplePrompt: 'Perform a risk assessment for migrating the legacy ITSM instance to the new platform.',
  },
];
