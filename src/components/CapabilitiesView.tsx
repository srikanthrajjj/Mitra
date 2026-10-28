import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Search } from 'lucide-react';
import { Theme, UserRole } from '../types';
import { isDarkTheme } from '../utils/theme';
import capabilitiesHero from '../assets/capabilities-hero.png';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { TabBar } from './dev/tab-bar/TabBar';
import { SKILLS as SKILL_DATA, SKILL_CATEGORIES } from '../data/skills';
import { HOME_ACTIONS } from '../data/homeActions';
import { ROLE_LABELS, ROLE_PROFILE_SUBTITLES } from '../constants/role';
import { PERSONA_TONE_HINTS } from '../constants/personaTone';

interface CapabilitiesViewProps {
  theme: Theme;
  onNavigate?: (tab: string) => void;
  onStartChat?: (prompt: string) => void;
}

type GroupId = 'all' | 'build' | 'automate' | 'insights' | 'roles' | 'features';

interface CapabilityEntry {
  label: string;
  description: string;
  category: Exclude<GroupId, 'all'>;
  eyebrow?: string;
  tab?: string;
}

const ENTRY_POINTS: CapabilityEntry[] = HOME_ACTIONS.map((action) => ({
  label: action.title,
  description: action.prompt,
  category: 'build',
}));

const DELIVERABLES: CapabilityEntry[] = [
  { label: 'Requirements Document', description: 'Structured functional and non-functional requirements with acceptance criteria.', category: 'build' },
  { label: 'User Stories', description: 'Agile-ready stories with clear, testable acceptance criteria.', category: 'build' },
  { label: 'Process Flow', description: 'Visual process maps for approvals, fulfillment, and escalation paths.', category: 'automate' },
  { label: 'Data Model', description: 'Table schemas, fields, and relationships for your application.', category: 'build' },
  { label: 'Workflow (Flow Designer)', description: 'Flow Designer-ready automation with conditions and SLA timers.', category: 'automate' },
  { label: 'Role Matrix', description: 'ACL and role-based access mapping for governance and security review.', category: 'roles' },
  { label: 'Script Library', description: 'Business rules, script includes, and reusable server-side logic.', category: 'automate' },
  { label: 'Executive Summary', description: 'Stakeholder-ready summary for sponsor and leadership sign-off.', category: 'insights' },
  { label: 'RFP Package', description: 'Vendor-ready scope package for procurement workflows.', category: 'build' },
  { label: 'Test Script (ATF)', description: 'Automated Test Framework scripts covering key scenarios.', category: 'automate' },
  { label: 'Deployment Checklist', description: 'Go-live readiness checklist across environments.', category: 'automate' },
];

const SERVICENOW_MODULES: CapabilityEntry[] = [
  { label: 'ITSM', description: 'Streamline incident, problem, and change management with connected service workflows.', category: 'automate' },
  { label: 'HRSD', description: 'Transform employee experiences with intelligent HR case management and service delivery.', category: 'automate' },
  { label: 'CSM', description: 'Resolve customer cases with proactive, AI-assisted service management.', category: 'automate' },
  { label: 'SecOps', description: 'Accelerate threat detection and response with connected security operations.', category: 'roles' },
  { label: 'GRC / IRM', description: 'Connect compliance monitoring, risk assessment, and continuous controls.', category: 'insights' },
  { label: 'FSO', description: 'Support financial services operations with insights and automation.', category: 'insights' },
  { label: 'FSM', description: 'Coordinate scheduling, dispatching, and real-time field operations.', category: 'automate' },
  { label: 'CMDB', description: 'Maintain an accurate picture of your IT estate with discovery and mapping.', category: 'insights' },
  { label: 'Now Assist', description: 'Bring generative AI support to work across the Now Platform.', category: 'build' },
  { label: 'Service Portal', description: 'Create self-service experiences that help people find what they need.', category: 'build' },
];

const FEATURES: CapabilityEntry[] = [
  { label: 'Projects', description: 'Organize solutions and conversations in a project workspace.', category: 'features', tab: 'projects' },
  { label: 'Connections', description: 'Link Dev, Test, and Prod instances for grounded context.', category: 'features', tab: 'connections' },
  { label: 'Search', description: 'Find a project, artifact, or conversation in seconds.', category: 'features', tab: 'search' },
  { label: 'Skills', description: 'Manage reusable, parameterized AI actions.', category: 'features', tab: 'skills' },
  { label: 'Favourites', description: 'Keep frequently used solutions close at hand.', category: 'features', tab: 'favourites' },
  { label: 'Mitra Insights', description: 'Explore adoption, productivity, and quality trends.', category: 'features', tab: 'analytics' },
  { label: 'Feedback', description: 'Share product feedback directly from your workspace.', category: 'features', tab: 'feedback' },
];

const ROLES: UserRole[] = ['business_owner', 'architect', 'stakeholder', 'developer', 'security', 'admin', 'sponsor'];
const ROLE_ENTRIES: CapabilityEntry[] = ROLES.map((role) => ({
  label: ROLE_PROFILE_SUBTITLES[role],
  eyebrow: ROLE_LABELS[role],
  description: PERSONA_TONE_HINTS[role],
  category: 'roles',
}));

const SKILL_ENTRIES: CapabilityEntry[] = SKILL_CATEGORIES.flatMap((category) =>
  SKILL_DATA.filter((skill) => skill.category === category).map((skill) => ({
    label: skill.name,
    description: skill.description,
    eyebrow: category,
    category: 'automate' as const,
    tab: 'skills',
  })),
);

const CAPABILITIES: CapabilityEntry[] = [
  ...ENTRY_POINTS,
  ...DELIVERABLES,
  ...SERVICENOW_MODULES,
  ...ROLE_ENTRIES,
  ...FEATURES,
  ...SKILL_ENTRIES,
];

const GROUPS: { id: GroupId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'build', label: 'Build & develop' },
  { id: 'automate', label: 'Automate' },
  { id: 'insights', label: 'Insights' },
  { id: 'roles', label: 'Roles & security' },
  { id: 'features', label: 'Workspace' },
];

const STARTER_SUGGESTIONS = [
  'Build a ServiceNow app from an idea',
  'Automate a request and approval workflow',
  'Turn requirements into a solution blueprint',
];
const CAPABILITIES_HERO_DISMISSED_KEY = 'mitra.capabilities.hero-dismissed.v1';

function categoryLabel(category: CapabilityEntry['category']) {
  return GROUPS.find((group) => group.id === category)?.label ?? 'Build & develop';
}

function CapabilityRow({
  entry,
  selected,
  onSelect,
  reducedMotion,
  index,
}: {
  entry: CapabilityEntry;
  selected: boolean;
  onSelect: () => void;
  reducedMotion: boolean | null;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reducedMotion ? undefined : { x: 4, transition: { duration: 0.16, delay: 0 } }}
      whileFocus={reducedMotion ? undefined : { x: 4, transition: { duration: 0.16, delay: 0 } }}
      whileTap={reducedMotion ? undefined : { scale: 0.99, transition: { duration: 0.08 } }}
      transition={{ duration: 0.22, delay: reducedMotion ? 0 : Math.min(index * 0.025, 0.18) }}
      className={cn(
        'group relative flex w-full !rounded-none items-center border-0 border-l-2 border-transparent px-4 py-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        selected ? 'border-l-brand-green bg-brand-green/10' : 'hover:bg-accent',
      )}
    >
      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-base font-semibold', selected ? 'text-brand-green' : 'text-foreground')}>{entry.label}</span>
        <span className="mt-1 block truncate text-sm leading-relaxed text-muted-foreground">{entry.description}</span>
      </span>
      <span className={cn('shrink-0 text-sm font-medium text-brand-green transition-all duration-200', selected ? 'translate-x-0 opacity-100' : 'translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100')}>
        View details →
      </span>
    </motion.button>
  );
}

export default function CapabilitiesView({ theme, onNavigate, onStartChat }: CapabilitiesViewProps) {
  const isDark = isDarkTheme(theme);
  const reducedMotion = useReducedMotion();
  const [activeGroup, setActiveGroup] = useState<GroupId>('all');
  const [query, setQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('Build a New Application');
  const [showHero, setShowHero] = useState(() => {
    try {
      return window.localStorage.getItem(CAPABILITIES_HERO_DISMISSED_KEY) !== 'true';
    } catch {
      return true;
    }
  });
  const [showAskMitra, setShowAskMitra] = useState(false);
  const [askPrompt, setAskPrompt] = useState('');
  const askPromptRef = useRef<HTMLTextAreaElement>(null);
  const askButtonRef = useRef<HTMLButtonElement>(null);
  const askWindowRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!showAskMitra) return;
    const focusFrame = window.requestAnimationFrame(() => askPromptRef.current?.focus());
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!askWindowRef.current?.contains(target) && !askButtonRef.current?.contains(target)) {
        setShowAskMitra(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowAskMitra(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [showAskMitra]);

  const filtered = useMemo(() => CAPABILITIES.filter((entry) => {
    const groupMatches = activeGroup === 'all' || entry.category === activeGroup;
    const term = query.trim().toLowerCase();
    const searchMatches = !term || `${entry.label} ${entry.description} ${entry.eyebrow ?? ''}`.toLowerCase().includes(term);
    return groupMatches && searchMatches;
  }), [activeGroup, query]);

  const selected = filtered.find((entry) => entry.label === selectedLabel) ?? filtered[0];
  const selectedCategory = selected ? categoryLabel(selected.category) : '';
  const outcomes = selected?.category === 'automate'
    ? [
        'Define the trigger, conditions, and teams involved.',
        'Map approvals, handoffs, and service levels.',
        'Review the flow before implementation.',
      ]
    : selected?.category === 'insights'
      ? [
          'Bring relevant operational metrics together.',
          'Surface trends, gaps, and outliers.',
          'Turn findings into prioritized next steps.',
        ]
      : selected?.category === 'roles'
        ? [
            'Map users, teams, and access requirements.',
            'Define roles, responsibilities, and safeguards.',
            'Review access boundaries before rollout.',
          ]
        : selected?.category === 'features'
          ? [
              'Find the project or workspace tool you need.',
              'Keep conversations and solution work organized.',
              'Continue with guidance from Mitra.',
            ]
          : [
              'Turn the idea into a clear application scope.',
              'Generate tables, forms, and UI pages.',
              'Add workflows and sample data.',
            ];

  const begin = () => onNavigate?.('new-chat');
  const dismissHero = () => {
    setShowHero(false);
    try {
      window.localStorage.setItem(CAPABILITIES_HERO_DISMISSED_KEY, 'true');
    } catch {
      // Keep the banner dismissed for this session if storage is unavailable.
    }
  };
  const startFromHero = () => {
    dismissHero();
    begin();
  };

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-5 pb-4 pt-7 md:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4">
          <div className="min-w-48 flex-1">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-[42px]">Capabilities</h1>
            <p className="mt-1 text-sm text-muted-foreground">Turn ideas into real ServiceNow solutions with AI.</p>
          </div>
          <div className="relative ml-auto [perspective:900px]">
            <Button ref={askButtonRef} variant="cta" size="default" onClick={() => setShowAskMitra((open) => !open)} className="ask-mitra-cta h-11 shrink-0 cursor-pointer rounded-xl">
              Ask Mitra
            </Button>
            <AnimatePresence>
              {showAskMitra && (
                <motion.section
                  ref={askWindowRef}
                  role="dialog"
                  aria-labelledby="ask-mitra-title"
                  initial={reducedMotion ? false : { opacity: 0, y: -16, scale: 0.91, rotateX: -10 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -10, scale: 0.96, rotateX: -5 }}
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 28, mass: 0.7 }}
                  className={cn(
                    'absolute isolate right-0 top-full z-[100] mt-3 w-[min(38rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] origin-top-right overflow-visible rounded-2xl border p-7 backdrop-blur-2xl will-change-transform md:p-10',
                    isDark
                      ? 'border-mitra-border bg-mitra-surface shadow-[0_0_0_1px_hsl(var(--ring)/0.18),0_18px_60px_hsl(var(--foreground)/0.24),0_0_32px_hsl(var(--ring)/0.2)]'
                      : 'border-border bg-card shadow-[0_0_0_1px_hsl(var(--ring)/0.18),0_18px_60px_hsl(var(--foreground)/0.16),0_0_32px_hsl(var(--ring)/0.14)]',
                  )}
                >
                  <span aria-hidden="true" className={cn('absolute -top-1.5 right-7 h-3 w-3 rotate-45 border-l border-t', isDark ? 'border-mitra-border bg-mitra-surface' : 'border-border bg-card')} />
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl">
                    <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-green/10 blur-3xl" />
                    <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-green/70 to-transparent" />
                  </div>
                  <div className="mb-7 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-green">Mitra AI</p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">New conversation</p>
                    </div>
                    <button type="button" onClick={() => setShowAskMitra(false)} className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground">Close</button>
                  </div>
                  <h2 id="ask-mitra-title" className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
                    What would you like to build?
                  </h2>
                  <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">Describe the ServiceNow solution you have in mind. I’ll help shape the scope and plan the next steps.</p>

                  <div className="mt-7" aria-label="Suggestions to get started">
                    {STARTER_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setAskPrompt(suggestion);
                          askPromptRef.current?.focus();
                        }}
                        className={cn(
                          'group block w-full cursor-pointer py-3 text-left text-base text-muted-foreground hover:text-brand-green focus-visible:outline-none focus-visible:text-brand-green',
                          !reducedMotion && 'transition-all duration-200 hover:translate-x-1',
                        )}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  <form
                    className="mt-7 border-t border-border pt-6"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const prompt = askPrompt.trim();
                      if (!prompt) return;
                      setShowAskMitra(false);
                      setAskPrompt('');
                      onStartChat?.(prompt);
                    }}
                  >
                    <textarea
                      ref={askPromptRef}
                      value={askPrompt}
                      onChange={(event) => setAskPrompt(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          event.currentTarget.form?.requestSubmit();
                        }
                      }}
                      rows={3}
                      placeholder="Ask Mitra anything…"
                      aria-label="Message Mitra"
                      className={cn('min-h-28 w-full resize-none rounded-xl border border-border p-4 text-base leading-relaxed outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50', isDark ? 'bg-mitra-input text-foreground placeholder:text-muted-foreground' : 'bg-background text-foreground placeholder:text-muted-foreground')}
                    />
                    <div className="mt-4 flex justify-end">
                      <Button variant="cta" type="submit" disabled={!askPrompt.trim()}>Start with Mitra</Button>
                    </div>
                  </form>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <AnimatePresence initial={false}>
          {showHero && <motion.section
            key="capabilities-hero"
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8, height: 0, marginBottom: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: 'easeOut' }}
            aria-label="Mitra for ServiceNow"
            className="relative isolate min-h-[260px] overflow-hidden rounded-2xl bg-card px-7 py-7 md:min-h-[290px] md:px-9 md:py-9"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/10 via-transparent to-muted" />
              <img
                src={capabilitiesHero}
                alt=""
                className={cn('absolute right-[-3%] top-1/2 hidden h-[430px] w-[645px] max-w-[68%] -translate-y-1/2 object-contain object-right md:block', isDark ? 'opacity-70' : 'opacity-90')}
              />
            </div>
            <div className="relative max-w-[600px]">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Mitra for ServiceNow</p>
              <h2 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground md:text-[44px]">Build, automate, and<br className="hidden sm:block" /> optimize <span className="text-brand-green">— with AI.</span></h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">Turn your ideas into real ServiceNow solutions. Create applications, streamline workflows, get insights, and accelerate delivery.</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button variant="cta" size="lg" onClick={startFromHero} className="rounded-full px-6">Get started</Button>
                <Button variant="outline" size="lg" onClick={dismissHero} className="rounded-full border-border bg-card px-5">Dismiss</Button>
              </div>
            </div>
          </motion.section>}
          </AnimatePresence>

          <section aria-labelledby="all-capabilities-heading" className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
            <div className="min-w-0 rounded-xl bg-card p-4 md:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 id="all-capabilities-heading" className="font-display text-xl font-bold tracking-tight text-foreground">All capabilities</h2>
                  <span className="text-xs text-muted-foreground">{filtered.length} results</span>
                </div>
                <label className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search capabilities…"
                    aria-label="Search capabilities"
                    className={cn('h-10 w-full rounded-xl border border-border pl-9 pr-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50', isDark ? 'bg-mitra-input text-foreground placeholder:text-muted-foreground' : 'bg-card text-foreground placeholder:text-muted-foreground')}
                  />
                </label>
              </div>
              <TabBar
                tabs={GROUPS.map(({ id, label }) => ({ id, label }))}
                activeTab={activeGroup}
                variant="pill"
                size="compact"
                fullWidth={false}
                isDark={isDark}
                ariaLabel="Capability categories"
                className="mb-4 flex-wrap"
                onTabChange={(id) => setActiveGroup(id as GroupId)}
              />
              <div
                id={`panel-${activeGroup}`}
                aria-labelledby={`tab-${activeGroup}`}
                role="tabpanel"
                tabIndex={0}
                aria-label="Capability results"
                className="min-h-[20rem] max-h-[65vh] overflow-y-auto overscroll-contain"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {filtered.length ? (
                    <motion.div key={`${activeGroup}-${query}`} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reducedMotion ? undefined : { opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.16 }}>
                      {filtered.map((entry, index) => <CapabilityRow key={`${entry.category}-${entry.label}`} entry={entry} index={index} reducedMotion={reducedMotion} selected={selected?.label === entry.label} onSelect={() => setSelectedLabel(entry.label)} />)}
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-48 flex-col items-center justify-center px-5 text-center">
                      <Search className="mb-3 h-5 w-5 text-muted-foreground" />
                      <p className="text-sm font-semibold text-foreground">No matches</p>
                      <p className="mt-1 text-xs text-muted-foreground">Try another capability, template, or phrase.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <aside className="min-w-0 rounded-xl bg-card p-6 md:p-7" aria-live="polite">
              {selected ? (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={selected.label} initial={reducedMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -4 }} transition={{ duration: reducedMotion ? 0 : 0.18 }}>
                    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{selectedCategory}</div>
                    <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">{selected.label}</h3>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">{selected.description}</p>
                    <Button variant="cta" size="lg" onClick={() => { dismissHero(); selected.tab ? onNavigate?.(selected.tab) : begin(); }} className="mt-5 rounded-full px-6">Get started</Button>
                    <ul aria-label="Mitra can help with" className="mt-7 list-disc space-y-3 border-t border-border/50 pt-6 pl-5 text-[15px] leading-relaxed text-muted-foreground marker:text-brand-green">
                      {outcomes.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    {selected.eyebrow && <p className="mt-5 text-xs text-muted-foreground">Designed for <span className="font-medium text-foreground">{selected.eyebrow}</span></p>}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex min-h-60 flex-col items-center justify-center text-center"><Search className="mb-3 h-5 w-5 text-muted-foreground" /><p className="text-sm font-medium text-foreground">Choose a capability</p><p className="mt-1 text-xs text-muted-foreground">Select a row to see what Mitra can help you do.</p></div>
              )}
            </aside>
          </section>
        </div>
      </div>

    </div>
  );
}
