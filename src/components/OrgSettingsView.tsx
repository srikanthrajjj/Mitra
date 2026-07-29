import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Globe,
  KeyRound,
  Mail,
  Menu,
  Palette,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  UserCog,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';
import { Button } from '@/src/components/ui/button';
import { Switch } from '@/src/components/ui/switch';
import {
  DEMO_ACCESS_POLICIES,
  DEMO_ORGANIZATIONS,
  DEMO_ROLES,
  DEMO_TEAMS,
  DEMO_USERS,
  ORG_PERMISSIONS,
  initialsFromName,
  roleLabel,
  type AccessPolicy,
  type OrgRole,
  type OrgTeam,
  type OrgUser,
  type OrgUserStatus,
  type Organization,
} from '../data/orgSettings';

export type OrgSettingsSectionId =
  | 'organizations'
  | 'profile'
  | 'subdomain'
  | 'subscription'
  | 'payment'
  | 'directory'
  | 'invite'
  | 'onboard'
  | 'teams'
  | 'roles'
  | 'permissions'
  | 'policies';

interface NavItem {
  id: OrgSettingsSectionId;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Organization',
    items: [
      { id: 'organizations', label: 'Organizations', icon: Building2 },
      { id: 'profile', label: 'Profile & branding', icon: Palette },
      { id: 'subdomain', label: 'Custom subdomain', icon: Globe },
    ],
  },
  {
    label: 'Billing',
    items: [
      { id: 'subscription', label: 'Subscription', icon: CreditCard },
      { id: 'payment', label: 'Payment', icon: CreditCard },
    ],
  },
  {
    label: 'People',
    items: [
      { id: 'directory', label: 'User directory', icon: Users },
      { id: 'invite', label: 'Invite users', icon: Mail },
      { id: 'onboard', label: 'Onboard on behalf', icon: UserPlus },
    ],
  },
  {
    label: 'Teams',
    items: [{ id: 'teams', label: 'Teams & departments', icon: UserCog }],
  },
  {
    label: 'Access',
    items: [
      { id: 'roles', label: 'Roles', icon: KeyRound },
      { id: 'permissions', label: 'Permissions', icon: Shield },
      { id: 'policies', label: 'Access policies', icon: ShieldCheck },
    ],
  },
];

const SECTION_META: Record<OrgSettingsSectionId, { title: string; description: string }> = {
  organizations: {
    title: 'Create & manage organizations',
    description: 'Switch between orgs you own, or create a new workspace for another business unit.',
  },
  profile: {
    title: 'Organization profile & branding',
    description: 'Name, industry, and brand cues shown across invites and shared workspaces.',
  },
  subdomain: {
    title: 'Custom subdomain',
    description: 'Give your team a branded Mitra URL like company.mitra.ai.',
  },
  subscription: {
    title: 'Subscription & billing',
    description: 'Plan, seats, and renewal details for this organization.',
  },
  payment: {
    title: 'Payment management',
    description: 'Cards on file and invoice contacts for org billing.',
  },
  directory: {
    title: 'User directory',
    description: 'Edit, deactivate, or remove people in your organization.',
  },
  invite: {
    title: 'Invite users',
    description: 'Send invite emails with a role and optional team assignment.',
  },
  onboard: {
    title: 'Onboard users on their behalf',
    description: 'Create accounts for teammates who have not signed in yet.',
  },
  teams: {
    title: 'Teams & departments',
    description: 'Group people by delivery team or department for clearer ownership.',
  },
  roles: {
    title: 'Roles & permissions',
    description: 'Use built-in roles or create custom ones for your org.',
  },
  permissions: {
    title: 'Permission management',
    description: 'See what each role can do and adjust custom role access.',
  },
  policies: {
    title: 'Access policies',
    description: 'Org-wide rules for SSO, 2FA, invites, and exports.',
  },
};

interface OrgSettingsViewProps {
  theme: Theme;
  onClose: () => void;
  /** Friendly destination label for the sidebar back link, e.g. "Home". */
  backLabel?: string;
}

function SectionCard({
  isDark,
  title,
  description,
  action,
  children,
}: {
  isDark: boolean;
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-xl p-5',
        isDark ? 'bg-mitra-surface' : 'bg-card',
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function statusBadge(status: OrgUserStatus) {
  if (status === 'active') {
    return (
      <span className="inline-flex rounded-md bg-brand-green/10 px-2 py-0.5 text-[10px] font-semibold text-brand-green">
        Active
      </span>
    );
  }
  if (status === 'invited') {
    return (
      <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
        Invited
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      Deactivated
    </span>
  );
}

export function OrgSettingsView({ theme, onClose, backLabel = 'Mitra' }: OrgSettingsViewProps) {
  const isDark = isDarkTheme(theme);
  const [section, setSection] = useState<OrgSettingsSectionId>('organizations');
  const [navQuery, setNavQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [orgs, setOrgs] = useState<Organization[]>(DEMO_ORGANIZATIONS);
  const [activeOrgId, setActiveOrgId] = useState(DEMO_ORGANIZATIONS[0].id);
  const [users, setUsers] = useState<OrgUser[]>(DEMO_USERS);
  const [teams, setTeams] = useState<OrgTeam[]>(DEMO_TEAMS);
  const [roles, setRoles] = useState<OrgRole[]>(DEMO_ROLES);
  const [policies, setPolicies] = useState<AccessPolicy[]>(DEMO_ACCESS_POLICIES);
  const [userSearch, setUserSearch] = useState('');
  const [flash, setFlash] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('role-member');
  const [inviteTeamId, setInviteTeamId] = useState('');

  const [onboardName, setOnboardName] = useState('');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardRoleId, setOnboardRoleId] = useState('role-member');

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDept, setNewTeamDept] = useState('');

  const [customRoleName, setCustomRoleName] = useState('');
  const [customRoleDesc, setCustomRoleDesc] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('role-architect-lead');

  const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? orgs[0];
  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? roles[0];

  const inputClass = cn(
    'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
    isDark
      ? 'border-mitra-border bg-mitra-input text-foreground placeholder:text-muted-foreground focus:border-brand-green/40'
      : 'border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-brand-green/50',
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(''), 3200);
    return () => window.clearTimeout(t);
  }, [flash]);

  const filteredGroups = useMemo(() => {
    const q = navQuery.trim().toLowerCase();
    if (!q) return NAV_GROUPS;
    return NAV_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          SECTION_META[item.id].title.toLowerCase().includes(q) ||
          SECTION_META[item.id].description.toLowerCase().includes(q),
      ),
    })).filter((g) => g.items.length > 0);
  }, [navQuery]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        roleLabel(u.roleId, roles).toLowerCase().includes(q),
    );
  }, [userSearch, users, roles]);

  const updateOrg = (patch: Partial<Organization>) => {
    setOrgs((prev) => prev.map((o) => (o.id === activeOrgId ? { ...o, ...patch } : o)));
  };

  const showFlash = (msg: string) => setFlash(msg);

  const handleInvite = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      showFlash('Enter a valid email to invite.');
      return;
    }
    const name = inviteEmail.split('@')[0].replace(/[._]/g, ' ');
    const display = name.replace(/\b\w/g, (c) => c.toUpperCase());
    setUsers((prev) => [
      {
        id: `u-${Date.now()}`,
        name: display,
        email: inviteEmail.trim().toLowerCase(),
        roleId: inviteRoleId,
        teamIds: inviteTeamId ? [inviteTeamId] : [],
        status: 'invited',
        lastActive: '—',
        invitedBy: 'Ravi Chaurasia',
      },
      ...prev,
    ]);
    setInviteEmail('');
    showFlash(`Invite sent to ${inviteEmail.trim().toLowerCase()}.`);
    setSection('directory');
  };

  const handleOnboard = () => {
    if (!onboardName.trim() || !onboardEmail.trim()) {
      showFlash('Name and email are required.');
      return;
    }
    setUsers((prev) => [
      {
        id: `u-${Date.now()}`,
        name: onboardName.trim(),
        email: onboardEmail.trim().toLowerCase(),
        roleId: onboardRoleId,
        teamIds: [],
        status: 'active',
        lastActive: 'Just now',
      },
      ...prev,
    ]);
    setOnboardName('');
    setOnboardEmail('');
    showFlash(`${onboardName.trim()} was onboarded and marked active.`);
    setSection('directory');
  };

  const setUserStatus = (id: string, status: OrgUserStatus) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    showFlash(status === 'deactivated' ? 'User deactivated.' : 'User reactivated.');
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showFlash('User removed from the organization.');
  };

  const assignRole = (userId: string, roleId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, roleId } : u)));
    showFlash('Role updated.');
  };

  const createTeam = () => {
    if (!newTeamName.trim()) return;
    setTeams((prev) => [
      {
        id: `team-${Date.now()}`,
        name: newTeamName.trim(),
        department: newTeamDept.trim() || 'General',
        memberCount: 0,
        leadName: 'Unassigned',
      },
      ...prev,
    ]);
    setNewTeamName('');
    setNewTeamDept('');
    showFlash('Team created.');
  };

  const createCustomRole = () => {
    if (!customRoleName.trim()) return;
    const id = `role-${Date.now()}`;
    const role: OrgRole = {
      id,
      name: customRoleName.trim(),
      description: customRoleDesc.trim() || 'Custom organization role.',
      isCustom: true,
      permissions: ['artifacts.share'],
      userCount: 0,
    };
    setRoles((prev) => [...prev, role]);
    setSelectedRoleId(id);
    setCustomRoleName('');
    setCustomRoleDesc('');
    showFlash('Custom role created.');
    setSection('permissions');
  };

  const togglePermission = (permId: string) => {
    if (!selectedRole.isCustom) {
      showFlash('Built-in roles are read-only. Create a custom role to edit permissions.');
      return;
    }
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== selectedRole.id) return r;
        const has = r.permissions.includes(permId);
        return {
          ...r,
          permissions: has ? r.permissions.filter((p) => p !== permId) : [...r.permissions, permId],
        };
      }),
    );
  };

  const createOrg = () => {
    const id = `org-${Date.now()}`;
    const org: Organization = {
      id,
      name: 'New organization',
      slug: `org-${orgs.length + 1}`,
      plan: 'Starter',
      seats: 5,
      seatsUsed: 1,
      logoInitials: 'NO',
      primaryColor: 'brand-green',
      website: '',
      industry: '',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setOrgs((prev) => [...prev, org]);
    setActiveOrgId(id);
    setSection('profile');
    showFlash('Organization created — finish profile & branding next.');
  };

  const meta = SECTION_META[section];

  const renderSection = () => {
    switch (section) {
      case 'organizations':
        return (
          <div className="space-y-4">
            <SectionCard
              isDark={isDark}
              title="Your organizations"
              description="Select an org to manage, or create another."
              action={
                <Button type="button" variant="cta" size="sm" className="h-8 gap-1.5 text-xs" onClick={createOrg}>
                  <Plus className="h-3.5 w-3.5" />
                  Create organization
                </Button>
              }
            >
              <div className="space-y-2">
                {orgs.map((org) => {
                  const active = org.id === activeOrgId;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => setActiveOrgId(org.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                        active
                          ? isDark
                            ? 'bg-accent'
                            : 'bg-brand-green/10'
                          : isDark
                            ? 'hover:bg-muted'
                            : 'hover:bg-accent',
                      )}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xs font-bold text-brand-green">
                        {org.logoInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{org.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {org.slug}.mitra.ai · {org.plan} · {org.seatsUsed}/{org.seats} seats
                        </p>
                      </div>
                      {active && <span className="text-[11px] font-semibold text-brand-green">Current</span>}
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-4">
            <SectionCard isDark={isDark} title="Profile" description="Shown on invites and shared links.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Organization name">
                  <input
                    className={inputClass}
                    value={activeOrg.name}
                    onChange={(e) =>
                      updateOrg({
                        name: e.target.value,
                        logoInitials: initialsFromName(e.target.value) || activeOrg.logoInitials,
                      })
                    }
                  />
                </Field>
                <Field label="Industry">
                  <input
                    className={inputClass}
                    value={activeOrg.industry}
                    onChange={(e) => updateOrg({ industry: e.target.value })}
                    placeholder="e.g. Financial Services"
                  />
                </Field>
                <Field label="Website" hint="Optional public site linked from your org profile.">
                  <input
                    className={inputClass}
                    value={activeOrg.website}
                    onChange={(e) => updateOrg({ website: e.target.value })}
                    placeholder="https://"
                  />
                </Field>
                <Field label="Logo initials">
                  <input
                    className={inputClass}
                    value={activeOrg.logoInitials}
                    maxLength={3}
                    onChange={(e) => updateOrg({ logoInitials: e.target.value.toUpperCase() })}
                  />
                </Field>
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="button" variant="cta" size="sm" className="h-8 text-xs" onClick={() => showFlash('Profile saved.')}>
                  Save profile
                </Button>
              </div>
            </SectionCard>
            <SectionCard isDark={isDark} title="Branding" description="Accent used in org chrome and invite emails.">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/15 text-sm font-bold text-brand-green">
                  {activeOrg.logoInitials}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Mitra brand green</p>
                  <p className="text-xs text-muted-foreground">Matches Mitra product accent across themes.</p>
                </div>
              </div>
            </SectionCard>
          </div>
        );

      case 'subdomain':
        return (
          <SectionCard
            isDark={isDark}
            title="Custom subdomain"
            description="Members reach Mitra at your branded hostname."
          >
            <Field label="Subdomain" hint="Letters, numbers, and hyphens. Must be unique across Mitra.">
              <div className="flex items-center gap-2">
                <input
                  className={cn(inputClass, 'max-w-xs')}
                  value={activeOrg.slug}
                  onChange={(e) =>
                    updateOrg({
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, '')
                        .slice(0, 32),
                    })
                  }
                />
                <span className="shrink-0 text-sm text-muted-foreground">.mitra.ai</span>
              </div>
            </Field>
            <div
              className={cn(
                'mt-4 rounded-lg px-3 py-2.5 text-sm',
                isDark ? 'bg-mitra-input' : 'bg-muted',
              )}
            >
              <span className="text-muted-foreground">Preview: </span>
              <span className="font-mono text-foreground">
                https://{activeOrg.slug || 'company'}.mitra.ai
              </span>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="button" variant="cta" size="sm" className="h-8 text-xs" onClick={() => showFlash('Subdomain reserved.')}>
                Save subdomain
              </Button>
            </div>
          </SectionCard>
        );

      case 'subscription':
        return (
          <div className="space-y-4">
            <SectionCard isDark={isDark} title="Current plan">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-display text-2xl font-extrabold text-foreground">{activeOrg.plan}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeOrg.seatsUsed} of {activeOrg.seats} seats in use · Renews Jul 28, 2027
                  </p>
                </div>
                <Button type="button" variant="secondary" size="sm" className="h-8 text-xs">
                  Change plan
                </Button>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-green"
                  style={{ width: `${Math.min(100, (activeOrg.seatsUsed / activeOrg.seats) * 100)}%` }}
                />
              </div>
            </SectionCard>
            <SectionCard isDark={isDark} title="Included">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                  Organization roles, teams, and access policies
                </li>
                <li className="flex gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                  Custom subdomain and branded invites
                </li>
                <li className="flex gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                  Priority support and audit export
                </li>
              </ul>
            </SectionCard>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-4">
            <SectionCard
              isDark={isDark}
              title="Payment method"
              action={
                <Button type="button" variant="secondary" size="sm" className="h-8 text-xs">
                  Update card
                </Button>
              }
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-14 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-foreground">
                  VISA
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">•••• 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 09/28 · Billing email finance@{activeOrg.slug}.example</p>
                </div>
              </div>
            </SectionCard>
            <SectionCard isDark={isDark} title="Recent invoices">
              <div className="divide-y divide-border text-sm">
                {[
                  { id: 'INV-2041', date: 'Jun 28, 2026', amount: '$1,200.00' },
                  { id: 'INV-1988', date: 'May 28, 2026', amount: '$1,200.00' },
                  { id: 'INV-1912', date: 'Apr 28, 2026', amount: '$980.00' },
                ].map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="font-medium text-foreground">{inv.id}</p>
                      <p className="text-xs text-muted-foreground">{inv.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular-nums text-foreground">{inv.amount}</span>
                      <button type="button" className="text-xs font-medium text-brand-green hover:text-brand-green-hover">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        );

      case 'directory':
        return (
          <SectionCard
            isDark={isDark}
            title="People"
            description={`${users.filter((u) => u.status !== 'deactivated').length} active or invited`}
            action={
              <div className="relative w-52">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cn(inputClass, 'h-8 pl-8 text-xs')}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search people…"
                />
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 font-semibold">User</th>
                    <th className="pb-2 font-semibold">Role</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold">Last active</th>
                    <th className="pb-2 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                            {initialsFromName(user.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{user.name}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <select
                          className={cn(inputClass, 'h-8 w-36 py-1 text-xs')}
                          value={user.roleId}
                          onChange={(e) => assignRole(user.id, e.target.value)}
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">{statusBadge(user.status)}</td>
                      <td className="py-3 text-xs text-muted-foreground">{user.lastActive}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          {user.status === 'deactivated' ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[11px]"
                              onClick={() => setUserStatus(user.id, 'active')}
                            >
                              Reactivate
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[11px]"
                              onClick={() => setUserStatus(user.id, 'deactivated')}
                            >
                              Deactivate
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[11px] text-destructive hover:text-destructive"
                            onClick={() => deleteUser(user.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        );

      case 'invite':
        return (
          <SectionCard isDark={isDark} title="Send invites" description="Invitees receive an email with a join link.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <input
                  className={inputClass}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </Field>
              <Field label="Role">
                <select className={inputClass} value={inviteRoleId} onChange={(e) => setInviteRoleId(e.target.value)}>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Team (optional)">
                <select className={inputClass} value={inviteTeamId} onChange={(e) => setInviteTeamId(e.target.value)}>
                  <option value="">No team yet</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="button" variant="cta" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleInvite}>
                <Mail className="h-3.5 w-3.5" />
                Send invite
              </Button>
            </div>
          </SectionCard>
        );

      case 'onboard':
        return (
          <SectionCard
            isDark={isDark}
            title="Create account on behalf"
            description="Useful when onboarding contractors or new hires before their first login."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input className={inputClass} value={onboardName} onChange={(e) => setOnboardName(e.target.value)} />
              </Field>
              <Field label="Work email">
                <input className={inputClass} value={onboardEmail} onChange={(e) => setOnboardEmail(e.target.value)} />
              </Field>
              <Field label="Starting role">
                <select className={inputClass} value={onboardRoleId} onChange={(e) => setOnboardRoleId(e.target.value)}>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="button" variant="cta" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleOnboard}>
                <UserPlus className="h-3.5 w-3.5" />
                Create user
              </Button>
            </div>
          </SectionCard>
        );

      case 'teams':
        return (
          <div className="space-y-4">
            <SectionCard isDark={isDark} title="Add team">
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  className={inputClass}
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Team name"
                />
                <input
                  className={inputClass}
                  value={newTeamDept}
                  onChange={(e) => setNewTeamDept(e.target.value)}
                  placeholder="Department"
                />
                <Button type="button" variant="cta" size="sm" className="h-9 text-xs" onClick={createTeam}>
                  Add
                </Button>
              </div>
            </SectionCard>
            <SectionCard isDark={isDark} title="Teams & departments">
              <div className="space-y-2">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-xl px-3 py-3',
                      isDark ? 'bg-mitra-surface/50' : 'bg-muted/30',
                    )}
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{team.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {team.department} · Lead {team.leadName} · {team.memberCount} members
                      </p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-[11px]">
                      Manage
                    </Button>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        );

      case 'roles':
        return (
          <div className="space-y-4">
            <SectionCard isDark={isDark} title="Create custom role">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Role name">
                  <input className={inputClass} value={customRoleName} onChange={(e) => setCustomRoleName(e.target.value)} />
                </Field>
                <Field label="Description">
                  <input className={inputClass} value={customRoleDesc} onChange={(e) => setCustomRoleDesc(e.target.value)} />
                </Field>
              </div>
              <div className="mt-3 flex justify-end">
                <Button type="button" variant="cta" size="sm" className="h-8 text-xs" onClick={createCustomRole}>
                  Create role
                </Button>
              </div>
            </SectionCard>
            <SectionCard isDark={isDark} title="All roles">
              <div className="grid gap-2 sm:grid-cols-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRoleId(role.id);
                      setSection('permissions');
                    }}
                    className={cn(
                      'rounded-xl px-3 py-3 text-left transition-colors hover:bg-accent',
                      isDark ? 'bg-mitra-surface/50' : 'bg-muted/30',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{role.name}</p>
                      {role.isCustom ? (
                        <span className="text-[10px] font-semibold text-brand-green">Custom</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-muted-foreground">Built-in</span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{role.description}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">{role.userCount} users</p>
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        );

      case 'permissions':
        return (
          <div className="space-y-4">
            <SectionCard isDark={isDark} title="Assign permissions by role">
              <Field label="Role">
                <select className={inputClass} value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)}>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.isCustom ? ' (custom)' : ''}
                    </option>
                  ))}
                </select>
              </Field>
              <p className="mt-3 text-xs text-muted-foreground">{selectedRole.description}</p>
              <div className="mt-4 space-y-2">
                {ORG_PERMISSIONS.map((perm) => {
                  const checked = selectedRole.permissions.includes(perm.id);
                  return (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{perm.label}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{perm.id}</p>
                      </div>
                      <Switch checked={checked} onCheckedChange={() => togglePermission(perm.id)} />
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        );

      case 'policies':
        return (
          <SectionCard isDark={isDark} title="Organization access policies">
            <div className="space-y-3">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className="flex items-start justify-between gap-4 rounded-xl px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{policy.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{policy.description}</p>
                  </div>
                  <Switch
                    checked={policy.enabled}
                    onCheckedChange={(v) => {
                      setPolicies((prev) => prev.map((p) => (p.id === policy.id ? { ...p, enabled: v } : p)));
                      showFlash(`${policy.name} ${v ? 'enabled' : 'disabled'}.`);
                    }}
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="org-settings-page relative flex min-h-0 min-w-0 w-full flex-1 overflow-hidden bg-background">
      {/* Mobile top bar */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 z-30 flex h-12 items-center gap-2 border-b border-border px-3 md:hidden',
          isDark ? 'bg-background' : 'bg-background',
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
            isDark
              ? 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
              : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
          aria-label={`Back to ${backLabel}`}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-foreground">
          {meta.title}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Open sections"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close sections"
          className="fixed inset-0 z-40 bg-background/60 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={cn(
          'settings-nav org-settings-nav flex w-[240px] shrink-0 flex-col border-r border-border/60',
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:shadow-xl',
          'max-md:transition-transform max-md:duration-200',
          mobileNavOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
          'md:relative md:translate-x-0',
        )}
      >
        <div className="shrink-0 border-b border-border px-3 pb-3 pt-3 md:pt-3.5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="group hidden items-center gap-2 md:inline-flex"
              aria-label={`Back to ${backLabel}`}
            >
              <span
                className={cn(
                  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                  isDark
                    ? 'border-mitra-border bg-card text-muted-foreground group-hover:bg-accent group-hover:text-foreground'
                    : 'border-border bg-card text-muted-foreground group-hover:bg-accent group-hover:text-foreground',
                )}
              >
                <ArrowLeft className="h-4 w-4" />
              </span>
              <span className="truncate text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                Back to {backLabel}
              </span>
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7 text-muted-foreground hover:text-foreground md:hidden"
              aria-label="Close sections menu"
              onClick={() => setMobileNavOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="mb-3 min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{activeOrg.name}</p>
            <p className="truncate text-xs text-muted-foreground">{activeOrg.slug}.mitra.ai</p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              placeholder="Search org settings…"
              aria-label="Search org settings"
              className={cn(
                'h-8 w-full rounded-md border pl-8 pr-3 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground',
                isDark
                  ? 'border-mitra-border bg-mitra-input focus:border-brand-green/40'
                  : 'border-border bg-card focus:border-brand-green/50',
              )}
            />
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-3 pt-2" aria-label="Organizational settings">
          {filteredGroups.map((group, groupIndex) => (
            <div key={group.label} className={cn(groupIndex > 0 ? 'mt-5' : 'mt-0')}>
              <p className="mb-0.5 px-2 text-[7px] font-medium uppercase leading-none tracking-normal text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-0">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = section === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSection(item.id);
                        setMobileNavOpen(false);
                      }}
                      className={cn(
                        'flex h-7 w-full items-center gap-1.5 rounded-md px-2 py-0.5 text-left text-xs leading-none transition-colors',
                        active
                          ? 'bg-accent font-medium text-foreground'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-3 w-3 shrink-0',
                          active ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto pt-12 md:pt-0">
        <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-6 sm:px-8 sm:pt-8">
          <div className="mb-6">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {NAV_GROUPS.find((g) => g.items.some((i) => i.id === section))?.label ?? 'Organization'}
            </p>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">{meta.title}</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{meta.description}</p>
          </div>

          {flash && (
            <div
              role="status"
              className="mb-4 rounded-xl bg-muted px-3 py-2.5 text-sm text-foreground"
            >
              {flash}
            </div>
          )}

          {renderSection()}
        </div>
      </main>
    </div>
  );
}

export default OrgSettingsView;
