import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Search, X } from 'lucide-react';
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
  const [showOverview, setShowOverview] = useState(false);
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
        { title: 'Map the work', detail: 'Triggers, conditions, and the teams involved.' },
        { title: 'Shape the flow', detail: 'Approvals and handoffs in the right order.' },
        { title: 'Move to delivery', detail: 'Reviewable steps ready for implementation.' },
      ]
    : selected?.category === 'insights'
      ? [
          { title: 'Bring context together', detail: 'Connect the operational signals that matter.' },
          { title: 'Find the pattern', detail: 'Surface gaps and meaningful measures.' },
          { title: 'Choose a next step', detail: 'Turn findings into a focused plan.' },
        ]
      : selected?.category === 'roles'
        ? [
            { title: 'Understand access', detail: 'Identify people and their requirements.' },
            { title: 'Set clear boundaries', detail: 'Define responsibilities and safeguards.' },
            { title: 'Review with confidence', detail: 'Check the model before delivery.' },
          ]
        : selected?.category === 'features'
          ? [
              { title: 'Start in context', detail: 'Open the workspace tool for the task.' },
              { title: 'Keep work connected', detail: 'Bring your project into the workflow.' },
              { title: 'Build with guidance', detail: 'Continue with Mitra by your side.' },
            ]
          : [
              { title: 'Shape the idea', detail: 'Turn the request into a clear solution scope.' },
              { title: 'Build the foundation', detail: 'Create the tables, forms, and structure.' },
              { title: 'Refine the result', detail: 'Use guided next steps to move forward.' },
            ];

  const begin = () => onNavigate?.('new-chat');

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-5 pb-4 pt-7 md:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4">
          <div className="min-w-48 flex-1">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-[42px]">Capabilities</h1>
            <p className="mt-1 text-sm text-muted-foreground">Turn ideas into real ServiceNow solutions with AI.</p>
          </div>
          <div className="relative ml-auto [perspective:900px]">
            <Button ref={askButtonRef} variant="secondary" size="default" onClick={() => setShowAskMitra((open) => !open)} className="h-11 shrink-0 cursor-pointer rounded-xl bg-brand-green/10 text-brand-green hover:bg-brand-green/15">
              Ask Mitra
            </Button>
            <AnimatePresence>
              {showAskMitra && (
                <motion.section
                  ref={askWindowRef}
                  role="dialog"
                  aria-labelledby="ask-mitra-title"
                  initial={reducedMotion ? false : { opacity: 0, y: -12, scale: 0.94, rotateX: -8 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -8, scale: 0.97, rotateX: -4 }}
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 28, mass: 0.7 }}
                  className={cn(
                    'absolute right-0 top-full z-[100] mt-3 w-[min(34rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] origin-top-right overflow-visible rounded-2xl border p-6 backdrop-blur-2xl will-change-transform md:p-9',
                    isDark
                      ? 'border-mitra-border bg-mitra-surface shadow-[0_16px_48px_hsl(var(--foreground)/0.18)]'
                      : 'border-border bg-card shadow-[0_16px_48px_hsl(var(--foreground)/0.12)]',
                  )}
                >
                  <span aria-hidden="true" className={cn('absolute -top-1.5 right-7 h-3 w-3 rotate-45 border-l border-t', isDark ? 'border-mitra-border bg-mitra-surface' : 'border-border bg-card')} />
                  <div className="mb-8 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-muted-foreground">New conversation</span>
                    <button type="button" onClick={() => setShowAskMitra(false)} className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground">Close</button>
                  </div>
                  <h2 id="ask-mitra-title" className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    What would you like to build?
                  </h2>
                  <p className="mt-2 text-base text-muted-foreground">Start with an idea, a workflow, or a set of requirements.</p>

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
                    className="mt-6 border-t border-border pt-5"
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
                      rows={2}
                      placeholder="Ask Mitra anything…"
                      aria-label="Message Mitra"
                      className={cn('w-full resize-none rounded-xl border border-border p-4 text-base outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50', isDark ? 'bg-mitra-input text-foreground placeholder:text-muted-foreground' : 'bg-background text-foreground placeholder:text-muted-foreground')}
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
          <motion.section
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
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
                <Button variant="cta" size="lg" onClick={begin} className="rounded-full px-6">Get started</Button>
                <Button variant="outline" size="lg" onClick={() => setShowOverview(true)} className="rounded-full border-border bg-card px-5">Watch overview</Button>
              </div>
            </div>
          </motion.section>

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
                    <Button variant="cta" size="lg" onClick={selected.tab ? () => onNavigate?.(selected.tab!) : begin} className="mt-5 rounded-full px-6">Get started</Button>
                    <div className="my-7" />
                    <div className="pt-1">
                      <h4 className="font-display text-lg font-bold text-foreground">What you can do</h4>
                      <p className="mt-1 text-sm text-muted-foreground">From first idea to a solution you can move forward with.</p>
                      <ol className="mt-5 grid gap-y-5">
                        {outcomes.map((item, index) => <li key={item.title} className="min-w-0"><span className="font-display text-[28px] font-bold leading-none tracking-tight text-brand-green/80">0{index + 1}</span><span className="mt-3 block text-[15px] font-semibold leading-snug text-foreground">{item.title}</span><span className="mt-1.5 block text-[13px] leading-relaxed text-muted-foreground">{item.detail}</span></li>)}
                      </ol>
                    </div>
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

      <AnimatePresence>
        {showOverview && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOverview(false)}>
            <motion.section role="dialog" aria-modal="true" aria-labelledby="overview-title" className="w-full max-w-lg rounded-2xl border border-mitra-border bg-mitra-surface p-6" initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }} onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4"><h2 id="overview-title" className="font-display text-xl font-bold text-foreground">Meet Mitra for ServiceNow</h2><button type="button" aria-label="Close overview" onClick={() => setShowOverview(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><X className="h-4 w-4" /></button></div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Mitra helps you turn plain-language ideas into ServiceNow solutions. Start with an application, automate a workflow, or explore insights—then build with guided, role-aware steps.</p>
              <div className="mt-5 flex flex-wrap gap-2">{['Build applications', 'Automate workflows', 'Explore insights'].map((item) => <span key={item} className="rounded-full bg-muted px-3 py-1.5 text-xs text-foreground">{item}</span>)}</div>
              <div className="mt-6 flex justify-end"><Button variant="cta" onClick={() => { setShowOverview(false); begin(); }}>Get started</Button></div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
