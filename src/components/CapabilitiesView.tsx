import { useRef, useState, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { Theme, UserRole } from '../types';
import { cardSurfaceHover, isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';
import { SKILLS, SKILL_CATEGORIES } from '../data/skills';
import { HOME_ACTIONS } from '../data/homeActions';
import { ROLE_LABELS, ROLE_PROFILE_SUBTITLES } from '../constants/role';
import { PERSONA_TONE_HINTS } from '../constants/personaTone';

interface CapabilitiesViewProps {
  theme: Theme;
  onNavigate?: (tab: string) => void;
}

interface CapabilityEntry {
  label: string;
  description: string;
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

function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="flex items-center gap-1 text-xs font-medium text-brand-green hover:text-brand-green-hover"
          >
            {action.label}
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

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
      <h3 className="text-[13px] font-semibold text-foreground">{entry.label}</h3>
      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{entry.description}</p>
    </div>
  );
}

function CapabilityGrid({
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setHasScrolled(scrollRef.current.scrollTop > 0);
    }
  }, []);

  const skillsByCategory = SKILL_CATEGORIES.map((category) => ({
    category,
    skills: SKILLS.filter((s) => s.category === category),
  }));

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      {/* Sticky header */}
      <div className="shrink-0">
        <div className="px-4 pt-8 md:px-8 lg:px-12 pb-4">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
              Capabilities
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Everything Mitra can do for you, organized by function.
            </p>
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
        <div className="mx-auto max-w-6xl space-y-10">
          {/* Ways to Start */}
          <section>
            <SectionHeading title="Ways to Start" subtitle="Four entry points into a new solution, from a blank prompt to an existing app." />
            <CapabilityGrid entries={ENTRY_POINTS} isDark={isDark} />
          </section>

          {/* Skills */}
          <section>
            <SectionHeading
              title="Skills"
              subtitle="Reusable, parameterized AI actions grouped by discipline."
              action={onNavigate ? { label: 'View all', onClick: () => onNavigate('skills') } : undefined}
            />
            <div className="space-y-5">
              {skillsByCategory.map(({ category, skills }) => (
                <div key={category}>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {category}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {skills.map((skill) => (
                      <div
                        key={skill.id}
                        className={cn('rounded-xl border-0 p-4', cardSurfaceHover(isDark))}
                      >
                        <h3 className="text-[13px] font-semibold text-foreground">{skill.name}</h3>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {skill.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Roles */}
          <section>
            <SectionHeading
              title="Roles"
              subtitle="Mitra adapts tone, output, and gating logic to seven roles across the delivery lifecycle."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ROLES.map((role) => (
                <div key={role} className={cn('rounded-xl border-0 p-4', cardSurfaceHover(isDark))}>
                  <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-green">
                    {ROLE_LABELS[role]}
                  </span>
                  <p className="mt-2 text-[11px] font-medium text-foreground">{ROLE_PROFILE_SUBTITLES[role]}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{PERSONA_TONE_HINTS[role]}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Deliverables */}
          <section>
            <SectionHeading title="Deliverables" subtitle="Artifact types Mitra produces as a solution moves through phases." />
            <CapabilityGrid entries={DELIVERABLES} isDark={isDark} />
          </section>

          {/* Coverage */}
          <section>
            <SectionHeading title="Coverage" subtitle="ServiceNow modules Mitra can design, build, and govern across." />
            <CapabilityGrid entries={SERVICENOW_MODULES} isDark={isDark} />
          </section>

          {/* Features */}
          <section>
            <SectionHeading title="Features" subtitle="Workspace tools that support the build, beyond the chat itself." />
            <CapabilityGrid entries={FEATURES} isDark={isDark} onNavigate={onNavigate} />
          </section>
        </div>
      </div>
    </div>
  );
}
