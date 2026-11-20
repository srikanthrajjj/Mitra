import {
  Bot,
  ClipboardList,
  Cog,
  FileText,
  Rocket,
  ShieldCheck,
  Sparkles,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { HERO_STATS, LIFECYCLE_STEPS } from '../landing/echelonLandingData';

export const TECH_HERO = {
  eyebrow: 'IlluminAIte Technology',
  title: 'The agentic engine behind every ServiceNow build.',
  subtitle:
    'IlluminAIte coordinates specialised AI agents that define, build, test, document and deploy on your ServiceNow instance, with a human checkpoint at every promotion.',
};

export interface TechStage {
  num: string;
  title: string;
  summary: string;
  detail: string;
  icon: LucideIcon;
  outputs: string[];
}

const STAGE_OUTPUTS: Record<string, string[]> = {
  Define: ['User stories', 'Acceptance criteria', 'Scope boundaries'],
  'Design & Develop': ['Tables and flows', 'Catalog items', 'Integrations'],
  Test: ['ATF suites', 'Flow validation', 'Scoped app checks'],
  Document: ['Training material', 'Release notes', 'Build documentation'],
  Deploy: ['Governed promotion', 'Update sets', 'Adoption monitoring'],
};

export const TECH_STAGES: TechStage[] = LIFECYCLE_STEPS.map((step) => ({
  num: step.num,
  title: step.title,
  summary: step.desc,
  detail: step.detail.replaceAll('Mitra', 'IlluminAIte'),
  icon: step.icon,
  outputs: STAGE_OUTPUTS[step.title] ?? [],
}));

export const TECH_STATS = HERO_STATS;

export const TECH_PILLARS: { title: string; desc: string; icon: LucideIcon }[] = [
  {
    title: 'Governed delivery',
    desc: 'Human checkpoints at every promote. Stories, flows and update sets stay auditable.',
    icon: ShieldCheck,
  },
  {
    title: 'Instance-aware AI',
    desc: 'IlluminAIte grounds builds in your ServiceNow patterns, CMDB and industry playbooks.',
    icon: Sparkles,
  },
  {
    title: 'Go-live packs',
    desc: 'Tests, docs and release notes ship with the build, not as an afterthought.',
    icon: Bot,
  },
];

const asset = (name: string) => `${import.meta.env.BASE_URL}tech/${name}`;

export interface TechCallout {
  /** Position over the screenshot, as a percentage of its width and height. */
  x: number;
  y: number;
  label: string;
  /** Where the label sits relative to the pin. */
  side?: 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right';
}

export interface TechFeature {
  id: string;
  kicker: string;
  title: string;
  desc: string;
  bullets: string[];
  image: string;
  imageLight: string;
  alt: string;
  windowTitle: string;
  callouts: TechCallout[];
}

/** Feature story. Each image is a real capture of the IlluminAIte workspace. */
export const TECH_FEATURES: TechFeature[] = [
  {
    id: 'start',
    kicker: '01 / Start',
    title: 'Start from a single sentence.',
    desc: 'Describe it, pick a template, import requirements or point at an app you already run.',
    bullets: ['Plain-language prompt', 'Industry templates', 'Existing apps'],
    image: asset('start.jpg'),
    imageLight: asset('start-light.jpg'),
    alt: 'Start screen with four ways to begin a ServiceNow solution',
    windowTitle: 'IlluminAIte · New solution',
    callouts: [
      { x: 83, y: 34, label: 'Four ways to begin', side: 'top-left' },
      { x: 70, y: 59, label: 'Or start from an example', side: 'bottom' },
      { x: 80, y: 85, label: 'Describe it in plain words', side: 'top-left' },
    ],
  },
  {
    id: 'discovery',
    kicker: '02 / Build',
    title: 'Discovery that drives the build.',
    desc: 'It plans its own to-dos, asks the next question and tracks five phases from Define to Deploy.',
    bullets: ['Live build plan', 'Phase-gated approvals', 'Guided next steps'],
    image: asset('chat-status.jpg'),
    imageLight: asset('chat-status-light.jpg'),
    alt: 'Chat with a generated to-do list and a five-phase status tracker',
    windowTitle: 'IlluminAIte · Discovery chat',
    callouts: [
      { x: 34, y: 36, label: 'A build plan that checks itself off', side: 'right' },
      { x: 88, y: 13, label: 'Five-phase tracker', side: 'top-left' },
      { x: 15, y: 73, label: 'Guided next steps', side: 'bottom' },
    ],
  },
  {
    id: 'artifacts',
    kicker: '03 / Deliver',
    title: 'Every artifact, generated.',
    desc: 'Requirements, data model, workflow, roles, scripts and tests, produced together and kept in sync.',
    bullets: ['Requirements and data model', 'Workflow and role matrix', 'Tests and checklist'],
    image: asset('chat-artifacts.jpg'),
    imageLight: asset('chat-artifacts-light.jpg'),
    alt: 'Artifacts panel listing requirements, data model, workflow, role matrix and scripts',
    windowTitle: 'IlluminAIte · Artifacts',
    callouts: [
      { x: 80, y: 9, label: 'Requirements document', side: 'left' },
      { x: 80, y: 31, label: 'Workflow diagram', side: 'left' },
      { x: 80, y: 53, label: 'Script library', side: 'left' },
    ],
  },
  {
    id: 'projects',
    kicker: '04 / Govern',
    title: 'One workspace for every project.',
    desc: 'Search, filter and track every solution by status. Reviewers always see the latest.',
    bullets: ['Status at a glance', 'Shared and organisational views', 'Searchable history'],
    image: asset('projects.jpg'),
    imageLight: asset('projects-light.jpg'),
    alt: 'Projects view with solution cards showing status and artifact counts',
    windowTitle: 'IlluminAIte · Projects',
    callouts: [
      { x: 84, y: 12.5, label: 'Search every project', side: 'bottom' },
      { x: 34, y: 18, label: 'Mine, shared, organisational', side: 'right' },
      { x: 20, y: 34, label: 'Status at a glance', side: 'bottom' },
    ],
  },
];

export const TECH_MARQUEE = [
  'User stories',
  'Flow Designer',
  'Catalog items',
  'ATF suites',
  'Update sets',
  'CMDB',
  'IntegrationHub',
  'Scoped apps',
  'SLA timers',
  'Release notes',
];
