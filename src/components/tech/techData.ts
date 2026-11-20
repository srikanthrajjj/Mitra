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
    'Mitra coordinates specialised AI agents that define, build, test, document and deploy on your ServiceNow instance, with a human checkpoint at every promotion.',
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
  detail: step.detail,
  icon: step.icon,
  outputs: STAGE_OUTPUTS[step.title] ?? [],
}));

export const TECH_STATS = HERO_STATS;

export const ARCH_NODES = [
  { id: 'define', label: 'Requirements agent', icon: ClipboardList },
  { id: 'build', label: 'Build agent', icon: Cog },
  { id: 'test', label: 'Test agent', icon: Workflow },
  { id: 'docs', label: 'Documentation agent', icon: FileText },
  { id: 'deploy', label: 'Deployment agent', icon: Rocket },
] as const;

export const TECH_PILLARS: { title: string; desc: string; icon: LucideIcon }[] = [
  {
    title: 'Governed delivery',
    desc: 'Human checkpoints at every promote. Stories, flows and update sets stay auditable.',
    icon: ShieldCheck,
  },
  {
    title: 'Instance-aware AI',
    desc: 'Mitra grounds builds in your ServiceNow patterns, CMDB and industry playbooks.',
    icon: Sparkles,
  },
  {
    title: 'Go-live packs',
    desc: 'Tests, docs and release notes ship with the build, not as an afterthought.',
    icon: Bot,
  },
];

const asset = (name: string) => `${import.meta.env.BASE_URL}tech/${name}`;

export interface TechFeature {
  id: string;
  kicker: string;
  title: string;
  desc: string;
  bullets: string[];
  image: string;
  alt: string;
  url: string;
}

/** Feature rows. Each image is a real capture of the Mitra workspace. */
export const TECH_FEATURES: TechFeature[] = [
  {
    id: 'start',
    kicker: '01 / Start',
    title: 'Start from a single sentence.',
    desc: 'Describe a solution, pick an industry template, import requirements, or analyse an app you already have. Mitra takes it from there.',
    bullets: ['New application', 'Industry templates', 'Requirements to solution', 'Analyse an existing app'],
    image: asset('start.jpg'),
    alt: 'Mitra start screen with four ways to begin a ServiceNow solution',
    url: 'Mitra · New solution',
  },
  {
    id: 'discovery',
    kicker: '02 / Build',
    title: 'Discovery that drives the build.',
    desc: 'Mitra plans its own to-dos, asks the next discovery question, and tracks the work through five phases from Define to Deploy.',
    bullets: ['Live build plan', 'Phase-gated approvals', 'Five-stage tracker'],
    image: asset('chat-status.jpg'),
    alt: 'Mitra chat with a generated to-do list and a five-phase status tracker',
    url: 'Mitra · Discovery chat',
  },
  {
    id: 'artifacts',
    kicker: '03 / Deliver',
    title: 'Every artifact, generated.',
    desc: 'Requirements, data model, workflow, role matrix, scripts, tests and a deployment checklist are produced together and stay in sync.',
    bullets: ['Requirements document', 'Data model and workflow', 'Role matrix and scripts', 'Test script and checklist'],
    image: asset('chat-artifacts.jpg'),
    alt: 'Mitra artifacts panel listing requirements, data model, workflow, role matrix and scripts',
    url: 'Mitra · Artifacts',
  },
  {
    id: 'projects',
    kicker: '04 / Govern',
    title: 'One workspace for every project.',
    desc: 'Search, filter and track every solution by status, with shared and organisation views so reviewers always see the latest.',
    bullets: ['Status at a glance', 'Shared and organisational views', 'Searchable history'],
    image: asset('projects.jpg'),
    alt: 'Mitra projects view with solution cards showing status and artifact counts',
    url: 'Mitra · Projects',
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
