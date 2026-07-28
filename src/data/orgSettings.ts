export type OrgUserStatus = 'active' | 'invited' | 'deactivated';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'Starter' | 'Team' | 'Enterprise';
  seats: number;
  seatsUsed: number;
  logoInitials: string;
  primaryColor: string;
  website: string;
  industry: string;
  createdAt: string;
}

export interface OrgUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  teamIds: string[];
  status: OrgUserStatus;
  lastActive: string;
  invitedBy?: string;
}

export interface OrgTeam {
  id: string;
  name: string;
  department: string;
  memberCount: number;
  leadName: string;
}

export interface OrgRole {
  id: string;
  name: string;
  description: string;
  isCustom: boolean;
  permissions: string[];
  userCount: number;
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export const ORG_PERMISSIONS = [
  { id: 'org.manage', label: 'Manage organization' },
  { id: 'billing.manage', label: 'Manage billing' },
  { id: 'users.invite', label: 'Invite users' },
  { id: 'users.edit', label: 'Edit users' },
  { id: 'users.deactivate', label: 'Deactivate users' },
  { id: 'roles.manage', label: 'Manage roles' },
  { id: 'teams.manage', label: 'Manage teams' },
  { id: 'skills.publish', label: 'Publish skills' },
  { id: 'artifacts.share', label: 'Share artifacts' },
  { id: 'audit.view', label: 'View audit log' },
] as const;

export const DEMO_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-acme',
    name: 'Acme Corp',
    slug: 'acme',
    plan: 'Enterprise',
    seats: 50,
    seatsUsed: 18,
    logoInitials: 'AC',
    primaryColor: 'brand-green',
    website: 'https://acme.example',
    industry: 'Financial Services',
    createdAt: '2025-11-12',
  },
  {
    id: 'org-northstar',
    name: 'Northstar Digital',
    slug: 'northstar',
    plan: 'Team',
    seats: 20,
    seatsUsed: 9,
    logoInitials: 'ND',
    primaryColor: 'brand-green',
    website: 'https://northstar.example',
    industry: 'Technology',
    createdAt: '2026-02-03',
  },
];

export const DEMO_ROLES: OrgRole[] = [
  {
    id: 'role-owner',
    name: 'Owner',
    description: 'Full control of organization, billing, and access.',
    isCustom: false,
    permissions: ORG_PERMISSIONS.map((p) => p.id),
    userCount: 1,
  },
  {
    id: 'role-admin',
    name: 'Admin',
    description: 'Manage users, teams, and roles. No billing changes.',
    isCustom: false,
    permissions: [
      'org.manage',
      'users.invite',
      'users.edit',
      'users.deactivate',
      'roles.manage',
      'teams.manage',
      'skills.publish',
      'artifacts.share',
      'audit.view',
    ],
    userCount: 3,
  },
  {
    id: 'role-member',
    name: 'Member',
    description: 'Use Mitra workspaces and share artifacts.',
    isCustom: false,
    permissions: ['skills.publish', 'artifacts.share'],
    userCount: 12,
  },
  {
    id: 'role-guest',
    name: 'Guest',
    description: 'Limited review access via invite links.',
    isCustom: false,
    permissions: ['artifacts.share'],
    userCount: 2,
  },
  {
    id: 'role-architect-lead',
    name: 'Architect Lead',
    description: 'Custom role for solution architects who publish skills.',
    isCustom: true,
    permissions: ['users.invite', 'teams.manage', 'skills.publish', 'artifacts.share', 'audit.view'],
    userCount: 2,
  },
];

export const DEMO_TEAMS: OrgTeam[] = [
  { id: 'team-plat', name: 'Platform', department: 'Engineering', memberCount: 6, leadName: 'Priya Shah' },
  { id: 'team-sn', name: 'ServiceNow Delivery', department: 'Consulting', memberCount: 8, leadName: 'Ravi Chaurasia' },
  { id: 'team-ops', name: 'IT Operations', department: 'Operations', memberCount: 4, leadName: 'James Ortiz' },
];

export const DEMO_USERS: OrgUser[] = [
  {
    id: 'u1',
    name: 'Ravi Chaurasia',
    email: 'ravi@acme.example',
    roleId: 'role-owner',
    teamIds: ['team-sn'],
    status: 'active',
    lastActive: 'Just now',
  },
  {
    id: 'u2',
    name: 'Priya Shah',
    email: 'priya@acme.example',
    roleId: 'role-admin',
    teamIds: ['team-plat'],
    status: 'active',
    lastActive: '2h ago',
  },
  {
    id: 'u3',
    name: 'James Ortiz',
    email: 'james@acme.example',
    roleId: 'role-architect-lead',
    teamIds: ['team-ops', 'team-sn'],
    status: 'active',
    lastActive: 'Yesterday',
  },
  {
    id: 'u4',
    name: 'Maya Chen',
    email: 'maya@acme.example',
    roleId: 'role-member',
    teamIds: ['team-plat'],
    status: 'invited',
    lastActive: '—',
    invitedBy: 'Ravi Chaurasia',
  },
  {
    id: 'u5',
    name: 'Alex Rivera',
    email: 'alex@acme.example',
    roleId: 'role-member',
    teamIds: ['team-sn'],
    status: 'deactivated',
    lastActive: '12 days ago',
  },
];

export const DEMO_ACCESS_POLICIES: AccessPolicy[] = [
  {
    id: 'pol-sso',
    name: 'Require SSO',
    description: 'Members must sign in through your identity provider.',
    enabled: true,
  },
  {
    id: 'pol-2fa',
    name: 'Require two-factor authentication',
    description: 'All active users must enable 2FA before accessing workspaces.',
    enabled: true,
  },
  {
    id: 'pol-domain',
    name: 'Restrict invites to company domain',
    description: 'Only emails ending in your verified domains can be invited.',
    enabled: false,
  },
  {
    id: 'pol-export',
    name: 'Restrict artifact exports',
    description: 'Only Admins and above can download or export artifacts.',
    enabled: false,
  },
];

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function roleLabel(roleId: string, roles: OrgRole[] = DEMO_ROLES): string {
  return roles.find((r) => r.id === roleId)?.name ?? 'Member';
}
