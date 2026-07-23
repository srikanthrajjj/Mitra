import {
  ClipboardList,
  Cog,
  Box,
  Bot,
  FileText,
  RefreshCw,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
  Workflow,
} from 'lucide-react';
import { ECOSYSTEM_MODULES } from './ecosystem/ecosystemLayout';

export interface NavLink {
  label: string;
  href?: string;
  accent?: boolean;
  children?: { label: string; href: string }[];
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '#home', accent: true },
  { label: 'About Us', href: '#about' },
  { label: 'AI Solutions and Industries', href: '#platform' },
  { label: 'Mitra AI', href: '#demo' },
  {
    label: 'Get Inspired',
    children: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'What We Do', href: '#platform' },
      { label: 'ServiceNow Ecosystem', href: '#ecosystem' },
    ],
  },
  { label: 'Contact Us', href: '#contact' },
];

export const HERO = {
  title: 'AI-Powered ServiceNow Implementations, Industry Specific Outcomes.',
  subtitle:
    'IlluminAIte offers AI agents that design, develop, test and deploy ServiceNow as per best practices and deliver industry specific outcomes.',
  primaryCta: 'Try IlluminAIte',
  secondaryCta: 'Book A Demo',
};

export const HERO_STATS = [
  {
    target: 10,
    suffix: '×',
    label: 'Faster Go-Live',
    desc: 'Implementations move from workshop to live in weeks, not months.',
  },
  {
    target: 65,
    suffix: '%',
    label: 'Lower Delivery Costs',
    desc: 'No retainers, no overruns, and no hidden surprises.',
  },
  {
    target: 60,
    suffix: '%',
    label: 'Fewer Errors',
    desc: 'AI automation ensures accuracy across implementations.',
  },
];

export const LIFECYCLE_SECTION = {
  eyebrow: 'How IlluminAIte Works',
  title: 'From Creating User Stories to Go-Live Ready, in Minutes',
  subtitle:
    'Deliver the complete ServiceNow implementation lifecycle with AI, designed for your industry.',
};

export const LIFECYCLE_STEPS = [
  {
    num: '01',
    title: 'Define',
    desc: 'Capture structured requirements',
    detail:
      'AI captures workshop conversations and converts them into build-ready user stories, acceptance criteria, and scope boundaries.',
    icon: ClipboardList,
  },
  {
    num: '02',
    title: 'Design & Develop',
    desc: 'Configure & build on platform',
    detail:
      'Mitra configures tables, flows, catalog items, and integrations on ServiceNow — aligned to your standards and industry patterns.',
    icon: Cog,
  },
  {
    num: '03',
    title: 'Test',
    desc: 'Validate with integrated testing',
    detail:
      'Automated Test Framework coverage validates catalog items, flows, and scoped apps before anything reaches production.',
    icon: Workflow,
  },
  {
    num: '04',
    title: 'Document',
    desc: 'Auto-generate training materials',
    detail:
      'Documentation and training materials are generated alongside the build — always aligned to what was actually deployed.',
    icon: FileText,
  },
  {
    num: '05',
    title: 'Deploy',
    desc: 'Deploy with confidence and monitor adoption',
    detail:
      'Promote update sets through governed environments, monitor adoption, and keep improving with AI-driven recommendations.',
    icon: Rocket,
  },
];

export const PLATFORM_SECTION = {
  eyebrow: 'What We Do',
  title: 'Enterprise ServiceNow, end to end.',
  subtitle: 'From AI-powered configuration to continuous platform intelligence.',
};

export interface WhatWeDoItem {
  title: string;
  desc: string;
}

export interface WhatWeDoBlock {
  id: string;
  icon: LucideIcon;
  navLabel: string;
  title: string;
  subtitle: string;
  items: WhatWeDoItem[];
}

export const WHAT_WE_DO_BLOCKS: WhatWeDoBlock[] = [
  {
    id: 'configure',
    icon: Sparkles,
    navLabel: 'Configure',
    title: 'Configure ServiceNow with AI',
    subtitle: 'Deliver outcomes in days—not months. Start using what you’ve paid for.',
    items: [
      {
        title: 'User Story Generation',
        desc: 'AI turns workshop conversations into build-ready requirements.',
      },
      {
        title: 'New Module Implementation',
        desc: 'Any licensed module configured, tested, and live in days.',
      },
      {
        title: 'Build Service Requests & Catalogs',
        desc: 'Catalog items, fulfillment flows, approvals, and ATF coverage—in days.',
      },
      {
        title: 'Integration Development',
        desc: 'IntegrationHub and Flow Designer connections built, tested, and delivered.',
      },
    ],
  },
  {
    id: 'manage',
    icon: Settings,
    navLabel: 'Manage',
    title: 'Manage your ServiceNow Platform',
    subtitle: 'Keep your platform running. Without the overhead.',
    items: [
      {
        title: 'Platform Administration',
        desc: 'Access requests, group management, and configuration changes—handled proactively.',
      },
      {
        title: 'Health Monitoring & Maintenance',
        desc: 'Instance health checks, patch management, and performance optimisation.',
      },
      {
        title: 'Release & Change Management',
        desc: 'Sprint deployments, update set promotion, and change coordination.',
      },
      {
        title: 'Proactive Issue Resolution',
        desc: 'Problems identified and resolved before they affect operations.',
      },
      {
        title: 'Optimization Roadmaps',
        desc: 'Regular platform reviews with AI-driven recommendations.',
      },
    ],
  },
  {
    id: 'modernize',
    icon: RefreshCw,
    navLabel: 'Modernize',
    title: 'Modernize & Stay Current',
    subtitle: 'Continuous improvements and new features—in days, not quarters.',
    items: [
      {
        title: 'Legacy Workflow Migration',
        desc: 'Outdated workflows rebuilt in Flow Designer—faster and upgrade-ready.',
      },
      {
        title: 'Catalog Modernization',
        desc: 'Stale catalog items and flows redesigned for current requirements.',
      },
      {
        title: 'Integration Modernization',
        desc: 'Custom scripts replaced with IntegrationHub spokes and connectors.',
      },
      {
        title: 'Technical Debt Clearance',
        desc: 'Dead rules, orphaned scripts, and deprecated APIs identified and removed.',
      },
      {
        title: 'Upgrade Readiness',
        desc: 'Instances assessed and prepared for upgrades with zero disruption.',
      },
    ],
  },
  {
    id: 'govern',
    icon: ShieldCheck,
    navLabel: 'Govern',
    title: 'Govern & Optimize',
    subtitle: 'Govern every change. Optimize every workflow.',
    items: [
      {
        title: 'Update Set Review',
        desc: 'Every configuration change reviewed against governance before promotion.',
      },
      {
        title: 'Automated Test Framework',
        desc: 'ATF coverage for catalog items, flows, and scoped applications.',
      },
      {
        title: 'Instance Health Analysis',
        desc: 'Full scans across performance, customisation depth, and upgrade readiness.',
      },
      {
        title: 'Change Advisory Support',
        desc: 'Documentation and evidence packs prepared for CAB review.',
      },
      {
        title: 'Compliance Alignment',
        desc: 'Configurations reviewed against your security and compliance requirements.',
      },
    ],
  },
  {
    id: 'agentic',
    icon: Bot,
    navLabel: 'Agentic AI',
    title: 'Tailor-made Agentic AI Solutions',
    subtitle: 'When “out of the box” isn’t enough.',
    items: [
      {
        title: 'Bespoke Workflow Development',
        desc: 'Workflows designed around your processes—not generic templates.',
      },
      {
        title: 'Industry-Specific Integrations',
        desc: 'Connections to the systems your industry depends on.',
      },
      {
        title: 'AI Agent Development',
        desc: 'Agents trained on your operational data, built natively on ServiceNow.',
      },
      {
        title: 'Extended Product Configuration',
        desc: 'IlluminAIte sector products extended to match your requirements.',
      },
      {
        title: 'Complex Data Migrations',
        desc: 'Legacy data migrated with full validation, mapping, and reconciliation.',
      },
    ],
  },
];

export interface PlatformPillar {
  id: string;
  icon: LucideIcon;
  shortLabel: string;
  title: string;
  desc: string;
  items: string[];
}

export const PLATFORM_PILLARS: PlatformPillar[] = [
  {
    id: 'manage',
    icon: Settings,
    shortLabel: 'Manage',
    title: 'Manage your ServiceNow Platform',
    desc: 'Keep your platform running. Without the overhead.',
    items: [
      'Platform Administration: Access requests, group management, and configuration changes handled proactively',
      'Health Monitoring & Maintenance: Continuous instance health checks, patch management, and performance optimisation',
      'Release & Change Management: Sprint deployments, update set promotion, change documentation and coordination',
      'Proactive Issue Resolution: Problems identified and resolved before they affect operations',
      'Optimization Roadmaps: Regular platform reviews with AI-driven recommendations for continuous improvement',
    ],
  },
  {
    id: 'modernize',
    icon: RefreshCw,
    shortLabel: 'Modernize',
    title: 'Modernize & Stay Current',
    desc: 'Implement continuous improvements, new enhancements and features in days.',
    items: [
      'Legacy Workflow Migration: Outdated workflows rebuilt in Flow Designer, faster, more maintainable, and upgrade-ready',
      'Catalog Modernization: Stale catalog items and fulfillment flows redesigned for current business requirements',
      'Integration Modernization: Custom scripts replaced with IntegrationHub spokes and standard connectors',
      'Technical Debt Clearance: Dead business rules, orphaned scripts, and deprecated APIs identified and removed',
      'Upgrade Readiness: Instance assessed and prepared for ServiceNow version upgrades with zero disruption',
    ],
  },
  {
    id: 'govern',
    icon: ShieldCheck,
    shortLabel: 'Govern',
    title: 'Govern & Optimize',
    desc: 'Govern every change. Optimize every workflow.',
    items: [
      'Update Set Review: Every configuration change reviewed against governance standards before environment promotion',
      'Automated Test Framework: ATF coverage built for catalog items, flows, and scoped applications',
      'Instance Health Analysis: Full platform scan across performance, customisation depth, and upgrade readiness',
      'Change Advisory Support: Documentation and evidence packs prepared for change advisory board review',
      'Compliance Alignment: Platform configurations reviewed against your organisation\'s security and compliance requirements',
    ],
  },
  {
    id: 'agentic',
    icon: Box,
    shortLabel: 'Agentic AI',
    title: 'Tailor-made Agentic AI Solutions',
    desc: 'When "out of the box" isn\'t enough.',
    items: [
      'Bespoke Workflow Development: Workflows designed around your specific processes',
      'Industry-Specific Integrations: Connections to the systems your industry depends on',
      'AI Agent Development: New AI agents trained on your operational data, built natively on ServiceNow',
      'Extended Product Configuration: IlluminAIte\'s sector products extended and configured to match your exact requirements',
      'Complex Data Migrations: Legacy data migrated into ServiceNow with full validation, mapping, and reconciliation',
    ],
  },
];

export const CAPABILITIES_SECTION = {
  title: 'Configure ServiceNow with AI',
  subtitle:
    'Stop waiting for months for implementations, deliver outcomes in days and start using what you\'ve paid for.',
};

export const CAPABILITIES = [
  {
    title: 'User Story Generation',
    desc: 'AI captures your workshop conversations and converts them into build-ready requirements automatically',
  },
  {
    title: 'New Module Implementation',
    desc: 'Any licensed ServiceNow module, fully configured, tested, and live in days',
  },
  {
    title: 'Build Service Requests & Catalogs',
    desc: 'New catalog items with fulfillment flows, approvals, and ATF coverage included in days',
  },
  {
    title: 'Integration Development',
    desc: 'IntegrationHub and Flow Designer connections built, tested, and delivered',
  },
];

export const ECOSYSTEM_SECTION = {
  eyebrow: 'ServiceNow Ecosystem',
  headline: 'The intelligence layer for your entire ServiceNow estate.',
  subtitle:
    'IlluminAIte is the intelligence layer connecting the entire ServiceNow ecosystem.',
};

export type { EcosystemModuleConfig as EcosystemModule } from './ecosystem/ecosystemLayout';
export { ECOSYSTEM_MODULES } from './ecosystem/ecosystemLayout';

/** @deprecated Use ECOSYSTEM_MODULES */
export const LANDSCAPE_SECTION = ECOSYSTEM_SECTION;
/** @deprecated Use ECOSYSTEM_MODULES from ecosystem/ecosystemLayout */
export const LANDSCAPE_MODULES = ECOSYSTEM_MODULES.map((m) => ({
  name: m.name,
  desc: m.capabilities.join(' · '),
}));

export const AI_AGENTS_SECTION = {
  title: 'AI Agents',
  subtitle: 'Intelligent agents working inside your ServiceNow instance. Around the clock.',
};

export const AI_AGENT_FEATURES = [
  {
    title: 'Workflow Automation',
    desc: 'Self-optimising workflows that handle repetitive processes without manual triggers or oversight',
  },
  {
    title: 'Predictive Insights',
    desc: 'Surface issues, trends, and anomalies before they become operational problems',
  },
  {
    title: 'Smart Recommendations',
    desc: 'Context-aware suggestions delivered to the right person at the right stage of a workflow',
  },
  {
    title: 'Natural Language Interface',
    desc: 'Query your ServiceNow data and trigger workflows in plain language — no technical expertise required',
  },
  {
    title: 'Cross-module Intelligence',
    desc: 'AI agents working across ITSM, HRSD, CSM, and sector-specific modules simultaneously',
  },
];

export const INDUSTRY_SECTION = {
  title: 'Industry Solutions',
  subtitle: 'Everything above – pre-built for your sector.',
  closing:
    'Generic ServiceNow implementations deliver a platform. IlluminAIte\'s industry solutions deliver outcomes your sector recognises.',
};

export const INDUSTRY_SOLUTIONS = [
  {
    id: 'nonprofit',
    name: 'Non-Profit',
    products: 'NPSM · VolunteerPro · Fundeavor · Grantly · Impactify · NCDM · UnAll',
    desc: 'Your team focused on mission, not administration. Cases resolved faster, volunteers deployed efficiently, grant reporting automated.',
  },
  {
    id: 'public',
    name: 'Public Sector',
    products: 'CityCloud · Grantly · UnAll',
    desc: 'Government-grade services without government-grade timelines. Citizen requests resolved faster, grant compliance automated, services connected.',
  },
  {
    id: 'enterprise',
    name: 'CPG & Enterprise',
    products: 'NavAI · ITSM · HRSD · FSM · CSM · GRC',
    desc: 'ServiceNow moving at the pace your business operates. Product launches coordinated faster, IT operations at full capacity.',
  },
];

export const DEMO_SECTION = {
  title: 'See Mitra in action',
  subtitle:
    'IlluminAIte agents like Mitra design, develop, test, and deploy ServiceNow — from workshop conversations to production-ready outcomes.',
  primaryCta: 'Try IlluminAIte',
};

export const READY_CTA_SECTION = {
  eyebrow: 'Take the next step',
  titleLead: 'Ready to see',
  titleAccent: 'in action?',
  subtitle:
    'Connect Mitra to your instance and watch intent become stories, flows, tests, and deployment-ready delivery — with your team in control.',
  primaryCta: 'Try IlluminAIte',
  secondaryCta: 'Get a demo',
};

export const CAPABILITY_TAGS = LANDSCAPE_MODULES.map((m) => m.name);

export const SECURITY_SECTION = {
  eyebrow: 'Security & compliance',
  title: 'GDPR Compliant',
  subtitle:
    'Enterprise-grade security and compliance built in — so your ServiceNow data stays protected while AI accelerates delivery.',
};

export const SECURITY_ITEMS = [
  'GDPR Compliant',
  'Instance-scoped agent context',
  'Role-based access & audit trails',
  'Encrypted credentials & secrets vault',
  'Enterprise SSO ready',
  'Governance-aligned change controls',
];

export const FOOTER = {
  tagline:
    'IlluminAIte offers AI agents that design, develop, test and deploy ServiceNow as per best practices and deliver industry specific outcomes.',
};
