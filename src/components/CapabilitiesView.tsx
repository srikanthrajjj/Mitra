import { useRef, useState, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { Theme, UserRole } from '../types';
import { cardSurfaceHover, isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';
import { SKILLS, SKILL_CATEGORIES } from '../data/skills';
import { HOME_ACTIONS } from '../data/homeActions';
import { ROLE_LABELS, ROLE_PROFILE_SUBTITLES } from '../constants/role';
import { PERSONA_TONE_HINTS } from '../constants/personaTone';
import { TabBar } from './dev/tab-bar/TabBar';

interface CapabilitiesViewProps {
  theme: Theme;
  onNavigate?: (tab: string) => void;
}

type GroupId = 'start' | 'skills' | 'roles' | 'deliverables' | 'coverage' | 'features';

interface CapabilityEntry {
  label: string;
  description: string;
  /** Small pill shown above the label — used for role badges. */
  eyebrow?: string;
  tab?: string;
}

const ENTRY_POINTS: CapabilityEntry[] = HOME_ACTIONS.map((action) => ({
  label: action.title,
  description: action.prompt,
}));

const DELIVERABLES: CapabilityEntry[] = [
  { label: 'Requirements Document', description: 'Structured functional & non-functional requirements with acceptance criteria.' },
  { label: 'User Stories', description: 'Agile/Jira-ready stories with INVEST-aligned acceptance criteria.' },
  { label: 'Process Flow', description: 'Visual process maps for approvals, fulfillment, and escalation paths.' },
  { label: 'Data Model', description: 'Table schemas, fields, and relationships for the target application.' },
  { label: 'Workflow (Flow Designer)', description: 'Flow Designer-ready automation with conditions and SLA timers.' },
  { label: 'Role Matrix', description: 'ACL and role-based access mapping for governance and security review.' },
  { label: 'Script Library', description: 'Business rules, script includes, and reusable server-side logic.' },
  { label: 'Executive Summary', description: 'Stakeholder-ready summary for sponsor and leadership sign-off.' },
  { label: 'RFP Package', description: 'Vendor/partner-ready scope package for procurement workflows.' },
  { label: 'Test Script (ATF)', description: 'Automated Test Framework scripts covering key scenarios.' },
  { label: 'Deployment Checklist', description: 'Go-live readiness checklist across environments.' },
];

const SERVICENOW_MODULES: CapabilityEntry[] = [
  { label: 'ITSM', description: 'Streamline IT service delivery with AI-powered incident, problem, and change management workflows.' },
  { label: 'HRSD', description: 'Transform employee experiences with intelligent HR case management and service delivery.' },
  { label: 'CSM', description: 'Elevate customer satisfaction with proactive, AI-driven service management and case resolution.' },
  { label: 'SecOps', description: 'Accelerate threat detection and response with AI-enhanced security operations.' },
  { label: 'GRC / IRM', description: 'Automate compliance monitoring and risk assessment with continuous AI analysis.' },
  { label: 'FSO', description: 'Unlock financial insights with AI-driven analysis, reporting, and operational efficiency.' },
  { label: 'FSM', description: 'Optimize field operations with intelligent scheduling, dispatching, and real-time tracking.' },
  { label: 'CMDB', description: 'Maintain a living, accurate picture of your IT estate with AI-powered discovery and mapping.' },
  { label: 'Now Assist', description: 'Deploy generative AI agents across your Now Platform for instant, intelligent support.' },
  { label: 'Service Portal', description: 'Build intelligent, self-service portals that anticipate user needs with AI suggestions.' },
];

const FEATURES: CapabilityEntry[] = [
  { label: 'Projects', description: 'Box-style folder tree to organize solutions and chat threads.', tab: 'projects' },
  { label: 'Connections', description: 'Link Dev/Test/Prod ServiceNow instances for grounded context.', tab: 'connections' },
  { label: 'Search', description: 'Jump to any project, artifact, or conversation instantly.', tab: 'search' },
  { label: 'Skills', description: 'Reusable, parameterized AI actions you can run on demand.', tab: 'skills' },
  { label: 'Favourites', description: 'Pin frequently used solutions for quick access.', tab: 'favourites' },
  { label: 'Mitra Insights', description: 'Adoption, productivity, and quality analytics dashboard.', tab: 'analytics' },
  { label: 'Feedback', description: 'Send product feedback directly from the workspace.', tab: 'feedback' },
];

const ROLES: UserRole[] = ['business_owner', 'architect', 'stakeholder', 'developer', 'security', 'admin', 'sponsor'];

const ROLE_ENTRIES: CapabilityEntry[] = ROLES.map((role) => ({
  label: ROLE_PROFILE_SUBTITLES[role],
  eyebrow: ROLE_LABELS[role],
  description: PERSONA_TONE_HINTS[role],
}));

const SKILLS_BY_CATEGORY = SKILL_CATEGORIES.map((category) => ({
  category,
  entries: SKILLS.filter((s) => s.category === category).map(
    (s): CapabilityEntry => ({ label: s.name, description: s.description }),
  ),
}));

const GROUPS: { id: GroupId; label: string; count: number }[] = [
  { id: 'start', label: 'Ways to Start', count: ENTRY_POINTS.length },
  { id: 'skills', label: 'Skills', count: SKILLS.length },
  { id: 'roles', label: 'Roles', count: ROLE_ENTRIES.length },
  { id: 'deliverables', label: 'Deliverables', count: DELIVERABLES.length },
  { id: 'coverage', label: 'Coverage', count: SERVICENOW_MODULES.length },
  { id: 'features', label: 'Features', count: FEATURES.length },
];

function CapabilityCard({
  entry,
  isDark,
  onNavigate,
}: {
  entry: CapabilityEntry;
  isDark: boolean;
  onNavigate?: (tab: string) => void;
}) {
  const clickable = Boolean(entry.tab && onNavigate);
  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onNavigate!(entry.tab!) : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate!(entry.tab!);
              }
            }
          : undefined
      }
      className={cn(
        'rounded-xl border-0 p-4',
        clickable && 'cursor-pointer',
        cardSurfaceHover(isDark),
      )}
    >
      {entry.eyebrow && (
        <span className="mb-2 inline-flex rounded-full bg-brand-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-green">
          {entry.eyebrow}
        </span>
      )}
      <h3 className="text-[13px] font-semibold text-foreground">{entry.label}</h3>
      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{entry.description}</p>
    </div>
  );
}

function CapabilityItems({
  entries,
  isDark,
  onNavigate,
}: {
  entries: CapabilityEntry[];
  isDark: boolean;
  onNavigate?: (tab: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <CapabilityCard key={entry.label} entry={entry} isDark={isDark} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

export default function CapabilitiesView({ theme, onNavigate }: CapabilitiesViewProps) {
  const isDark = isDarkTheme(theme);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [activeGroup, setActiveGroup] = useState<GroupId>('start');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setHasScrolled(scrollRef.current.scrollTop > 0);
    }
  }, []);

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      {/* Sticky header */}
      <div className="shrink-0">
        <div className="px-4 pb-4 pt-8 md:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
                  Capabilities
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Everything Mitra can do for you, organized by group.
                </p>
              </div>
              {activeGroup === 'skills' && onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('skills')}
                  className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand-green hover:text-brand-green-hover"
                >
                  Manage in Skills
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <TabBar
                tabs={GROUPS.map((g) => ({ id: g.id, label: g.label, count: g.count }))}
                activeTab={activeGroup}
                variant="pill"
                size="compact"
                fullWidth={false}
                isDark={isDark}
                ariaLabel="Capability groups"
                onTabChange={(id) => setActiveGroup(id as GroupId)}
              />
            </div>
          </div>
        </div>
        <div
          className={cn(
            'border-b transition-opacity duration-200',
            hasScrolled ? 'border-border opacity-100' : 'border-transparent opacity-0',
          )}
        />
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-12 pt-4 md:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div role="tabpanel" id={`panel-${activeGroup}`} aria-labelledby={`tab-${activeGroup}`}>
            {activeGroup === 'start' && (
              <CapabilityItems entries={ENTRY_POINTS} isDark={isDark} onNavigate={onNavigate} />
            )}

            {activeGroup === 'skills' && (
              <div className="space-y-5">
                {SKILLS_BY_CATEGORY.map(({ category, entries }) => (
                  <div key={category}>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {category}
                    </p>
                    <CapabilityItems entries={entries} isDark={isDark} onNavigate={onNavigate} />
                  </div>
                ))}
              </div>
            )}

            {activeGroup === 'roles' && (
              <CapabilityItems entries={ROLE_ENTRIES} isDark={isDark} onNavigate={onNavigate} />
            )}

            {activeGroup === 'deliverables' && (
              <CapabilityItems entries={DELIVERABLES} isDark={isDark} onNavigate={onNavigate} />
            )}

            {activeGroup === 'coverage' && (
              <CapabilityItems entries={SERVICENOW_MODULES} isDark={isDark} onNavigate={onNavigate} />
            )}

            {activeGroup === 'features' && (
              <CapabilityItems entries={FEATURES} isDark={isDark} onNavigate={onNavigate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
