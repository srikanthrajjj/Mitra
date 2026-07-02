import type { LucideIcon } from 'lucide-react';
import {
  Calculator,
  Database,
  Headphones,
  LayoutGrid,
  MapPin,
  Scale,
  Shield,
  Sparkles,
  UserCircle,
  Users,
} from 'lucide-react';

export type OrbitRingId = 'outer' | 'inner';

/** Radius as a fraction of the orbit field's smaller dimension */
export const ORBIT_RING_CONFIG = {
  outer: { radiusRatio: 0.38, duration: 88, speed: 0.55 },
  inner: { radiusRatio: 0.25, duration: 62, speed: 0.7 },
} as const;

export interface EcosystemModuleConfig {
  id: string;
  name: string;
  icon: LucideIcon;
  capabilities: [string, string, string, string];
  ring: OrbitRingId;
  scale: number;
}

export const ECOSYSTEM_MODULES: EcosystemModuleConfig[] = [
  {
    id: 'itsm',
    name: 'ITSM',
    icon: Headphones,
    capabilities: ['Incident Automation', 'Smart Routing', 'SLA Optimization', 'Predictive Insights'],
    ring: 'outer',
    scale: 1.04,
  },
  {
    id: 'csm',
    name: 'CSM',
    icon: UserCircle,
    capabilities: ['Customer Journeys', 'Case Efficiency', 'Self-Service Experience', 'Proactive Support'],
    ring: 'outer',
    scale: 0.98,
  },
  {
    id: 'fsm',
    name: 'FSM',
    icon: MapPin,
    capabilities: ['Smart Dispatch', 'Technician Productivity', 'Scheduling Automation', 'Mobile Operations'],
    ring: 'outer',
    scale: 0.97,
  },
  {
    id: 'cmdb',
    name: 'CMDB',
    icon: Database,
    capabilities: ['Service Mapping', 'Asset Visibility', 'Dependency Insights', 'Infrastructure Health'],
    ring: 'outer',
    scale: 0.96,
  },
  {
    id: 'secops',
    name: 'SecOps',
    icon: Shield,
    capabilities: ['Threat Detection', 'Security Response', 'Risk Visibility', 'Incident Coordination'],
    ring: 'outer',
    scale: 0.94,
  },
  {
    id: 'now-assist',
    name: 'Now Assist',
    icon: Sparkles,
    capabilities: ['AI Assistance', 'Workflow Intelligence', 'Prompt Optimization', 'Productivity Boost'],
    ring: 'outer',
    scale: 0.92,
  },
  {
    id: 'hrsd',
    name: 'HRSD',
    icon: Users,
    capabilities: ['Employee Workflows', 'HR Automation', 'Digital Onboarding', 'Workplace Experience'],
    ring: 'inner',
    scale: 0.96,
  },
  {
    id: 'portal',
    name: 'Service Portal',
    icon: LayoutGrid,
    capabilities: ['Modern Experiences', 'Custom Widgets', 'Seamless Navigation', 'Unified Access'],
    ring: 'inner',
    scale: 1.02,
  },
  {
    id: 'grc',
    name: 'GRC / IRM',
    icon: Scale,
    capabilities: ['Governance Automation', 'Compliance Tracking', 'Risk Monitoring', 'Policy Operations'],
    ring: 'inner',
    scale: 0.95,
  },
  {
    id: 'fso',
    name: 'FSO',
    icon: Calculator,
    capabilities: ['Financial Operations', 'Workflow Automation', 'Case Management', 'Data Intelligence'],
    ring: 'inner',
    scale: 0.93,
  },
];

export function modulesForRing(ring: OrbitRingId): EcosystemModuleConfig[] {
  return ECOSYSTEM_MODULES.filter((m) => m.ring === ring);
}
