import { useCallback, useEffect, useRef, useState, Fragment, type ReactNode } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  FileStack,
  Send,
  X,
  Database,
  LayoutGrid,
  Zap,
  CheckSquare,
  ShieldAlert,
  FileText,
  Layers,
  Cpu,
  Info,
  Loader2,
} from 'lucide-react';
import { Theme, UserRole, Solution, FolderStatus } from '../types';
import { isDarkTheme } from '../utils/theme';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Separator } from '@/src/components/ui/separator';
import { Button } from '@/src/components/ui/button';
import { RoleSwitcher } from './RoleSwitcher';
import { DiscoveryAppSuggestionChips } from './DiscoveryAppSuggestionChips';
import {
  ArtifactFormatBadge,
  ArtifactStatusBadge,
  ArtifactTypeIcon,
  BuildStageChip,
  PhaseChip,
} from '../utils/artifactDisplay';
import { getArtifactsWithStatuses } from '../data/solutionArtifacts';
import {
  LANDING_TOKENS,
  MITRA_HEX_SURFACES,
  SEMANTIC_TOKEN_ROWS,
  THEME_TOKENS,
  type ThemeId,
} from '../utils/styleguideTokens';
import { FolderStatusBadge } from './FolderStatusBadge';
import { cn } from '@/lib/utils';

interface StyleguideViewProps {
  theme: Theme;
  activeSolution?: Solution | null;
  onBack?: () => void;
}

type SectionId =
  | 'overview'
  | 'colors'
  | 'typography'
  | 'spacing'
  | 'dev-phases'
  | 'live-state'
  | 'components'
  | 'patterns'
  | 'how-to';

interface NavGroup {
  label: string;
  sections: { id: SectionId; title: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Foundations',
    sections: [
      { id: 'overview', title: 'Overview' },
      { id: 'colors', title: 'Colors & Tokens' },
      { id: 'typography', title: 'Typography' },
      { id: 'spacing', title: 'Spacing & Layout' },
    ],
  },
  {
    label: 'ServiceNow Build Specs',
    sections: [
      { id: 'dev-phases', title: 'Development Phases' },
      { id: 'live-state', title: 'Live Application State' },
    ],
  },
  {
    label: 'Design System',
    sections: [
      { id: 'components', title: 'Components' },
      { id: 'patterns', title: 'Patterns' },
      { id: 'how-to', title: 'How to use' },
    ],
  },
];

const ALL_SECTION_IDS = NAV_GROUPS.flatMap((g) => g.sections.map((s) => s.id));

const THEME_LABELS: Record<ThemeId, string> = {
  dark: 'Dark (default)',
  blue: 'Blue',
};

const CANVAS_SURFACES: Record<ThemeId, { label: string; className: string; hex: string }> = {
  dark: { label: 'Main canvas', className: 'bg-dark-canvas', hex: MITRA_HEX_SURFACES.mitraBg.dark },
  blue: { label: 'Main canvas', className: 'bg-dark-canvas', hex: MITRA_HEX_SURFACES.mitraBg.blue },
};

const PERSONA_VIEWS = [
  { role: 'business_owner', view: 'BusinessOwnerView', sidebar: 'BusinessOwnerSidebar' },
  { role: 'architect', view: 'ChatView + ProjectsView', sidebar: 'ArchitectSidebar' },
  { role: 'stakeholder', view: 'StakeholderReviewView', sidebar: 'StakeholderSidebar' },
  { role: 'developer', view: 'DeveloperWorkspaceView', sidebar: 'DeveloperSidebar' },
  { role: 'security', view: 'SecurityReviewView', sidebar: 'SecuritySidebar' },
  { role: 'sponsor', view: 'SponsorReviewView', sidebar: 'SponsorSidebar' },
  { role: 'admin', view: 'AdminPanelView', sidebar: 'AdminSidebar' },
] as const;

function CopyCodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-muted/30">
      {label && (
        <div className="border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
          {label}
        </div>
      )}
      <div className="flex items-start gap-3 px-4 py-3">
        <pre className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] leading-relaxed text-foreground/90">
          <code>{code}</code>
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-brand-green" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function SectionHeading({ id, title, description }: { id: string; title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2
        id={id}
        className="scroll-mt-6 text-xl font-semibold tracking-tight text-foreground accent-neon glow-green"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function PreviewSurface({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-brand-green/20 bg-card box-glow-green',
        className,
      )}
    >
      {label && (
        <div className="border-b border-border px-4 py-2.5 text-xs font-medium text-muted-foreground">
          Preview
          <span className="mx-2 text-border">·</span>
          {label}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function Swatch({
  name,
  color,
  subtitle,
  hsl,
}: {
  name: string;
  color: string;
  subtitle?: string;
  hsl?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="h-12" style={{ backgroundColor: color }} />
      <div className="px-2.5 py-2">
        <p className="font-mono text-[11px] font-medium text-foreground">{name}</p>
        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{color}</p>
        {hsl && <p className="font-mono text-[9px] text-muted-foreground/80">hsl({hsl})</p>}
        {subtitle && <p className="mt-0.5 text-[10px] text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function ThemeComparisonSwatches() {
  const surfaceKeys = ['background', 'sidebar', 'card'] as const;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Side-by-side semantic surfaces per theme class (from <code className="rounded bg-muted px-1 font-mono text-xs">index.css</code>).
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {(['dark', 'blue'] as ThemeId[]).map((themeId) => (
          <div key={themeId} className={cn('overflow-hidden rounded-xl border border-border', themeId)}>
            <div className="border-b border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground">
              {THEME_LABELS[themeId]}
            </div>
            <div className="space-y-2 p-3">
              <div className={cn('rounded-lg border border-border px-3 py-2', CANVAS_SURFACES[themeId].className)}>
                <p className="text-[10px] font-medium text-foreground">Canvas</p>
                <p className="font-mono text-[9px] text-muted-foreground">{CANVAS_SURFACES[themeId].hex}</p>
              </div>
              {surfaceKeys.map((surfaceKey) => {
                const token = THEME_TOKENS[themeId][surfaceKey];
                return (
                  <Fragment key={surfaceKey}>
                    <Swatch
                      name={surfaceKey}
                      color={token.hex}
                      hsl={token.hsl}
                      subtitle={token.utility}
                    />
                  </Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TokenTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Token</th>
            <th className="px-4 py-3">Dark</th>
            <th className="px-4 py-3">Blue</th>
            <th className="px-4 py-3 hidden md:table-cell">Tailwind</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {SEMANTIC_TOKEN_ROWS.map((row) => (
            <tr key={row.label} className="bg-card">
              <td className="px-4 py-2.5 font-mono text-xs text-foreground">{row.label}</td>
              {(['dark', 'blue'] as ThemeId[]).map((themeId) => {
                const token = THEME_TOKENS[themeId][row.key];
                return (
                  <td key={themeId} className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-4 w-4 shrink-0 rounded border border-border/60"
                        style={{ backgroundColor: token.hex }}
                      />
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {token.hsl}
                        <span className="ml-1 text-foreground/70">{token.hex}</span>
                      </span>
                    </div>
                  </td>
                );
              })}
              <td className="hidden px-4 py-2.5 font-mono text-xs text-brand-green/90 md:table-cell">
                {THEME_TOKENS.dark[row.key].utility}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SamplePanelHeader({ isDark }: { isDark: boolean }) {
  return (
    <div className="artifact-panel border-b border-border pl-3 pr-5 py-3">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="sn-section-header shrink-0">Application files</p>
          <span className="shrink-0 text-[10px] font-medium tabular-nums text-muted-foreground/70">
            (4)
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label="Collapse">
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <p className="artifact-row-title mt-1.5 min-w-0 truncate font-medium text-foreground">
        HR Employee Onboarding
      </p>
      <div className="mt-2">
        <PhaseChip phase={2} isDark={isDark} />
      </div>
    </div>
  );
}

function SampleArtifactRow({ isDark, active }: { isDark: boolean; active?: boolean }) {
  return (
    <div
      className={cn(
        'sn-list-row group px-2 py-2',
        active && 'sn-list-row--active',
      )}
    >
      <div className="flex min-w-0 items-start gap-2 px-1 py-0.5">
        <ArtifactTypeIcon type="requirements_doc" className="mt-0.5 text-muted-foreground/70" />
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 items-center gap-1">
            <p className="artifact-row-title min-w-0 flex-1 truncate font-medium text-foreground">
              Requirements Document
            </p>
            <ArtifactFormatBadge format="DOC" isDark={isDark} />
            <ArtifactStatusBadge status="in_review" isDark={isDark} />
          </div>
          <p className="artifact-row-filing sn-mono mt-0.5 truncate text-muted-foreground/70">
            hr_onboarding_requirements_v2.md
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <BuildStageChip stage="scope" isDark={isDark} />
          </div>
          <p className="artifact-row-meta sn-meta mt-1 truncate">
            Updated by Mitra · v2 · 2h ago
          </p>
        </div>
      </div>
    </div>
  );
}

function StaticCenterToastPreview({ isDark }: { isDark: boolean }) {
  return (
    <div className="flex justify-center py-4">
      <div
        className={cn(
          'flex w-full max-w-sm items-start gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-md transition-all duration-300',
          isDark
            ? 'bg-zinc-950/90 border-brand-green/25 shadow-[0_20px_50px_rgba(0,0,0,0.6)] shadow-brand-green/5'
            : 'bg-white/90 border-emerald-200 shadow-[0_20px_50px_rgba(50,215,75,0.06)]',
        )}
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
            isDark ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50',
          )}
        >
          <CheckCircle2 className={cn('h-4 w-4', isDark ? 'text-emerald-400' : 'text-emerald-600')} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className={cn('text-sm font-semibold leading-snug', isDark ? 'text-foreground' : 'text-slate-900')}>
            Artifact shared
          </p>
          <p className={cn('mt-0.5 text-sm leading-relaxed', isDark ? 'text-muted-foreground' : 'text-slate-600')}>
            Review link sent to stakeholder@company.com
          </p>
        </div>
        <button
          type="button"
          className={cn(
            'shrink-0 rounded-lg p-1 transition-colors',
            isDark ? 'text-muted-foreground hover:bg-white/5' : 'text-slate-400 hover:bg-slate-100',
          )}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ChatComposerPreview({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3',
        isDark ? 'input-invite-glow bg-mitra-surface/60' : 'input-invite-glow light bg-white',
      )}
    >
      <textarea
        readOnly
        rows={2}
        placeholder="Describe your ServiceNow solution…"
        className={cn(
          'w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground',
          isDark ? 'text-illuminate-text' : 'text-slate-900',
        )}
        defaultValue=""
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Phase 1 · Discovery</span>
        <button
          type="button"
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md btn-dark-primary',
            !isDark && 'border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700',
          )}
          aria-label="Send"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ElevationStackPreview({ isDark, themeId }: { isDark: boolean; themeId: ThemeId }) {
  const tokens = THEME_TOKENS[themeId];
  const layers = [
    { label: 'Canvas', className: isDark ? 'bg-dark-canvas border-border' : 'bg-light-canvas border-border', hex: isDark ? MITRA_HEX_SURFACES.mitraBg.dark : MITRA_HEX_SURFACES.lightCanvas.hex },
    { label: 'Sidebar (`bg-sidebar`)', className: 'bg-sidebar border-border', hex: tokens.sidebar.hex },
    { label: 'Card / Panel', className: 'bg-card border-border', hex: tokens.card.hex },
    { label: 'Popover / Menu', className: 'bg-popover border-border', hex: tokens.popover.hex },
  ];

  return (
    <div className="space-y-2">
      {layers.map((layer, i) => (
        <div
          key={layer.label}
          className={cn(
            'flex items-center justify-between rounded-lg border px-4 py-3',
            layer.className,
          )}
          style={{ marginLeft: i * 12 }}
        >
          <span className="text-sm font-medium text-foreground">{layer.label}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{layer.hex}</span>
        </div>
      ))}
    </div>
  );
}

function ArchitectNavPreview({ isDark }: { isDark: boolean }) {
  return (
    <div className="w-full max-w-xs space-y-0.5 rounded-lg border border-sidebar-border bg-sidebar p-2">
      <button
        type="button"
        className={cn(
          'architect-nav-item flex w-full items-center gap-3 rounded-r-lg border-l-2 px-3 py-2.5 text-[13px] font-semibold leading-none',
          isDark
            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
            : 'border-emerald-500 bg-emerald-50 text-emerald-700',
        )}
      >
        Projects (active)
      </button>
      <button
        type="button"
        className={cn(
          'architect-nav-item flex w-full items-center gap-3 rounded-r-lg border-l-2 border-transparent px-3 py-2.5 text-[13px] font-medium leading-none',
          isDark ? 'text-slate-400 hover:bg-emerald-500/5' : 'text-slate-600 hover:bg-emerald-50/55',
        )}
      >
        Connections (default)
      </button>
    </div>
  );
}

function WorkflowStepperPreview({ isDark }: { isDark: boolean }) {
  return (
    <ol className="workflow-stepper max-w-xs">
      <li>
        <div className="workflow-stepper-row">
          <div className="workflow-stepper-connector bg-emerald-500/25" />
          <div
            className={cn(
              'workflow-stepper-node workflow-stepper-node--complete flex h-5 w-5 items-center justify-center rounded-full border',
              isDark ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-emerald-300 bg-emerald-50 text-emerald-600',
            )}
          >
            <Check className="h-3 w-3 stroke-[3]" />
          </div>
          <p className="workflow-stepper-title artifact-row-title text-[12px] font-medium">Discovery complete</p>
        </div>
      </li>
      <li>
        <div className="workflow-stepper-row">
          <div
            className={cn(
              'workflow-stepper-node workflow-stepper-node--active flex h-5 w-5 items-center justify-center rounded-full border',
              isDark ? 'border-brand-green/40 bg-brand-green/15 text-brand-green' : 'border-emerald-400 bg-emerald-50 text-emerald-700',
            )}
          >
            <Loader2 className="h-3 w-3 animate-spin" />
          </div>
          <p className="workflow-stepper-title artifact-row-title text-[12px] font-medium">Design in progress</p>
        </div>
      </li>
    </ol>
  );
}

type DevPhase = 'discovery' | 'schema' | 'forms' | 'logic' | 'testing' | 'release';

const phases = [
  { id: 'discovery' as const, label: '1. Discovery & Stories', icon: FileText },
  { id: 'schema' as const, label: '2. Case Schema & DB', icon: Database },
  { id: 'forms' as const, label: '3. UI Forms & Layout', icon: LayoutGrid },
  { id: 'logic' as const, label: '4. Business Rules', icon: Zap },
  { id: 'testing' as const, label: '5. UAT & Test Scripts', icon: CheckSquare },
  { id: 'release' as const, label: '6. Scope Release Check', icon: ShieldAlert },
];

const phaseDetails: Record<DevPhase, { title: string; desc: string; snippet: string; format: string }> = {
  discovery: {
    title: 'Phase 1: Discovery & Story Specifications',
    desc: 'User stories must be generated in standardized Agile/Jira format. Title names should follow the case type rules.',
    format: 'JSON User Story Spec',
    snippet: `{
  "epic": "HR Case Management",
  "story": "As an HR Specialist, I want to automatically assign onboarding cases, so that SLAs are met.",
  "acceptance_criteria": [
    "Verify sys_user has the correct country department code",
    "Trigger assignment rule based on employee location"
  ],
  "priority": "high",
  "points": 3
}`
  },
  schema: {
    title: 'Phase 2: Database Schema & Case Mappings',
    desc: 'All tables must start with the scope prefix (e.g. x_snc_u_hrsd_*). Ensure columns match ServiceNow HSL variables.',
    format: 'XML ServiceNow Table Definition',
    snippet: `<?xml version="1.0" encoding="UTF-8"?>
<record_update table="sys_db_object">
  <sys_db_object>
    <label>HRSD Onboarding Case</label>
    <name>x_snc_u_hrsd_onboarding_case</name>
    <super_class display_value="Task">sys_case</super_class>
  </sys_db_object>
</record_update>`
  },
  forms: {
    title: 'Phase 3: Form Layouts & Section Layout XML',
    desc: 'Define UI sections, fields positioning, and role-based field restrictions for form views.',
    format: 'XML sys_ui_section Form Layout',
    snippet: `<?xml version="1.0" encoding="UTF-8"?>
<record_update table="sys_ui_section">
  <sys_ui_section action="INSERT_OR_UPDATE">
    <name>x_snc_u_hrsd_onboarding_case</name>
    <title>Employee Credentials</title>
    <sys_ui_element action="INSERT_OR_UPDATE">
      <element>u_employee_name</element>
      <position>0</position>
    </sys_ui_element>
  </sys_ui_section>
</record_update>`
  },
  logic: {
    title: 'Phase 4: Client Scripts & Server Business Rules',
    desc: 'Client-side interactions and server-side rules are bundled into client script collections.',
    format: 'ServiceNow Client Script JavaScript',
    snippet: `function onLoad() {
  // Validate department prefix matching x_snc scope
  var dept = g_form.getValue('u_department');
  if (dept === '') {
    g_form.setMandatory('u_manager', true);
  }
}`
  },
  testing: {
    title: 'Phase 5: Automated Testing (ATF) and Test Script Mappings',
    desc: 'Define the QA matrix, UAT guidelines, and expected results mapping for test runners.',
    format: 'JSON Test Case schema',
    snippet: `{
  "test_suite": "HRSD Regression",
  "steps": [
    { "order": 1, "action": "Open Case Form", "assert": "Form fields are active" },
    { "order": 2, "action": "Submit Empty Name", "assert": "Trigger alert message" }
  ]
}`
  },
  release: {
    title: 'Phase 6: Scope Release Pre-flights',
    desc: 'Verification checklist to be checked prior to bundling update sets for deployment.',
    format: 'XML Deployment Manifest',
    snippet: `<?xml version="1.5" encoding="UTF-8"?>
<manifest>
  <scope>x_snc_u_hrsd_onboarding</scope>
  <update_set_name>HRSD Onboarding v1.0.0</update_set_name>
  <checks>
    <check id="acl_defined">true</check>
    <check id="naming_rules_verified">true</check>
  </checks>
</manifest>`
  }
};

export function StyleguideView({ theme, activeSolution, onBack }: StyleguideViewProps) {
  const isDark = isDarkTheme(theme);
  const themeId: ThemeId = theme === 'blue' ? 'blue' : 'dark';
  const [activeSectionId, setActiveSectionId] = useState<SectionId>('overview');
  const [demoRole, setDemoRole] = useState<UserRole>('architect');
  const [selectedPhase, setSelectedPhase] = useState<DevPhase>('discovery');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const liveArtifacts = activeSolution
    ? (getArtifactsWithStatuses({}, {}, [activeSolution]).find((s) => s.solutionId === activeSolution.id)
        ?.artifacts ?? [])
    : [];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const scrollToSection = useCallback((sectionId: SectionId) => {
    setActiveSectionId(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.location.hash !== `#${sectionId}`) {
      window.history.replaceState(null, '', `${window.location.pathname}#${sectionId}`);
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '') as SectionId;
    if (hash && ALL_SECTION_IDS.includes(hash)) {
      setActiveSectionId(hash);
      requestAnimationFrame(() => {
        sectionRefs.current[hash]?.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    }
  }, []);

  const sectionRef = (id: SectionId) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col font-sans',
        theme,
        isDark ? 'bg-dark-canvas text-foreground' : 'bg-light-canvas text-foreground',
      )}
    >
      <header className="shrink-0 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Back to workspace"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-green/30 bg-brand-green/10">
            <BookOpen className="size-4 text-brand-green" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Mitra Design System</h1>
            <p className="text-xs text-muted-foreground">
              Neon green dashboard theme · live previews from production components
            </p>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-sidebar md:block">
          <ScrollArea className="h-full">
            <nav className="p-3" aria-label="Mitra design system">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="mb-4">
                  <p className="sidebar-section-label mb-1.5 px-2">{group.label}</p>
                  <ul className="space-y-0.5">
                    {group.sections.map((section) => (
                      <li key={section.id}>
                        <button
                          type="button"
                          onClick={() => scrollToSection(section.id)}
                          className={cn(
                            'flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left text-[12px] transition-colors',
                            activeSectionId === section.id
                              ? 'bg-primary/10 font-medium text-brand-green'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                          )}
                        >
                          <ChevronRight
                            className={cn(
                              'size-3 shrink-0 text-brand-green transition-opacity',
                              activeSectionId === section.id ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {section.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto max-w-3xl px-6 py-8 pb-16">
            {/* Overview */}
            <section ref={sectionRef('overview')} className="scroll-mt-6">
              <SectionHeading
                id="overview"
                title="Overview"
                description="Mitra combines ServiceNow enterprise patterns with a neon green accent. Dark is the default theme (`MITRA_THEME`); Blue uses class wrappers on `html` and portaled content."
              />
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  <strong className="text-foreground">Principles:</strong> neutral surfaces (~90%), neon green
                  accent (~10%, <code className="rounded bg-muted px-1 font-mono text-xs">#32d74b</code>), ServiceNow-style
                  file lists, compact artifact typography, persona-specific layouts.
                </p>
                <ul className="list-disc space-y-1.5 pl-5">
                  <li>
                    <span className="text-brand-green">Neon green</span> — primary CTAs, selected states, focus rings
                    (<code className="rounded bg-muted px-1 font-mono text-xs">--ring</code>), 0.5px avatar glow. Not for
                    large fills or body text.
                  </li>
                  <li>
                    <span className="text-foreground">Light default</span> — preference defaults to{' '}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">light</code>; System resolves to{' '}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">light</code> or{' '}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">blue</code> (not dark)
                  </li>
                  <li>
                    <span className="text-foreground">Font size</span> — default level 3 ={' '}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">14px</code> body, display, and
                    filing paths (Rethink Sans)
                  </li>
                  <li>
                    <span className="text-foreground">Verify tokens</span> — open{' '}
                    <code className="rounded bg-muted px-1 font-mono text-xs">/styleguide</code>, toggle theme in
                    Settings, compare swatches below to the live app chrome
                  </li>
                </ul>
              </div>
            </section>

            <Separator className="my-10 bg-border" />

            {/* Colors */}
            <section ref={sectionRef('colors')} className="scroll-mt-6">
              <SectionHeading
                id="colors"
                title="Colors & Tokens"
                description="Semantic HSL variables (shadcn) plus fixed Mitra surface hex values. Source: src/index.css."
              />
              <div className="space-y-6">
                <TokenTable />
                <ThemeComparisonSwatches />
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Brand & fixed hex surfaces</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Swatch name="brand-green" color={MITRA_HEX_SURFACES.brandGreen.hex} subtitle="--color-brand-green" />
                    <Swatch name="vr-cyan" color={MITRA_HEX_SURFACES.vrCyan.hex} subtitle="Logo glow edge" />
                    <Swatch name="mitra-bg (dark)" color={MITRA_HEX_SURFACES.mitraBg.dark} subtitle="bg-dark-canvas base" />
                    <Swatch name="mitra-bg (blue)" color={MITRA_HEX_SURFACES.mitraBg.blue} subtitle=".blue override" />
                    <Swatch name="light-canvas" color={MITRA_HEX_SURFACES.lightCanvas.hex} subtitle="bg-light-canvas" />
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Landing page (separate shell)</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Marketing page uses fixed dark hero — not semantic theme tokens. Mesh gradient uses green/cyan/purple
                    orbs on <code className="rounded bg-muted px-1 font-mono text-xs">#06080a</code>.
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Swatch name="landing-hero" color={LANDING_TOKENS.heroBg} />
                    <Swatch name="landing-accent" color={LANDING_TOKENS.accent} />
                    <Swatch name="landing-cyan" color={LANDING_TOKENS.cyan} />
                    <Swatch name="landing-purple" color={LANDING_TOKENS.purple} />
                  </div>
                </div>
                <PreviewSurface label="Neon green usage">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button>Primary CTA</Button>
                    <button type="button" className="rounded-md px-4 py-2 text-sm btn-dark-primary">
                      btn-dark-primary
                    </button>
                    <span className="accent-neon text-sm font-semibold">accent-neon text</span>
                    <span className="rounded border accent-neon-border px-2 py-1 text-xs">accent-neon-border</span>
                  </div>
                </PreviewSurface>
                <CopyCodeBlock
                  label="Apply theme wrapper"
                  code={`// Pass theme prop; wrap portaled content (modals, dropdowns)
<div className={theme}>
  <DropdownMenuContent className={cn(theme)}>
    …
  </DropdownMenuContent>
</div>`}
                />
              </div>
            </section>

            <Separator className="my-10 bg-border" />

            {/* Typography */}
            <section ref={sectionRef('typography')} className="scroll-mt-6">
              <SectionHeading
                id="typography"
                title="Typography"
                description="Rethink Sans for UI body (default 14px at level 3), display headings, filing paths, and code."
              />
              <div className="space-y-4">
                <PreviewSurface label="Font stacks (level 3 = 14.3px body)">
                  <div className="space-y-4 w-full font-size-level-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Rethink Sans — display headings</p>
                      <p className="text-2xl font-semibold tracking-tight font-display">Solution Architect Workspace</p>
                      <p className="mt-1 text-sm text-muted-foreground font-sans">
                        Rethink Sans body at 14.3px (level 3), line-height 1.55. Chat responses use 13px (
                        <code className="rounded bg-muted px-1 font-mono text-xs">.chat-response-text</code>).
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Rethink Sans — filing / code</p>
                      <p className="sn-mono">hr_onboarding/requirements/v2/requirements_doc.md</p>
                    </div>
                  </div>
                </PreviewSurface>
                <PreviewSurface label="Section labels">
                  <div className="space-y-3 w-full">
                    <p className="sn-section-header">Application files</p>
                    <p className="sidebar-section-label">Recent solutions</p>
                    <div className="artifact-panel rounded-lg border border-border p-3">
                      <p className="artifact-row-title font-medium">Requirements Document</p>
                      <p className="artifact-row-meta mt-1 text-muted-foreground">Updated by Mitra · v2</p>
                      <p className="artifact-row-filing sn-mono mt-1">requirements_doc.md</p>
                    </div>
                  </div>
                </PreviewSurface>
                <CopyCodeBlock
                  label="CSS classes"
                  code={`.sn-section-header     /* 10px uppercase section headers */
.sidebar-section-label /* sidebar group labels */
.artifact-row-title    /* 12px artifact name */
.artifact-row-meta     /* 10px metadata */
.artifact-row-filing   /* 9px mono filing path */
.sn-mono               /* Rethink Sans mono utility */`}
                />
              </div>
            </section>

            <Separator className="my-10 bg-border" />

            {/* Spacing */}
            <section ref={sectionRef('spacing')} className="scroll-mt-6">
              <SectionHeading
                id="spacing"
                title="Spacing & Layout"
                description="Panel widths, gutters, and collapse strips from useResizablePanel.ts and production layouts."
              />
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Panel</th>
                      <th className="px-4 py-3">Default</th>
                      <th className="px-4 py-3">Min</th>
                      <th className="px-4 py-3">Max</th>
                      <th className="px-4 py-3 hidden sm:table-cell">Collapsed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="bg-card">
                      <td className="px-4 py-2.5 font-medium">Left sidebar</td>
                      <td className="px-4 py-2.5 font-mono text-xs">256px</td>
                      <td className="px-4 py-2.5 font-mono text-xs">200px</td>
                      <td className="px-4 py-2.5 font-mono text-xs">400px</td>
                      <td className="hidden px-4 py-2.5 font-mono text-xs sm:table-cell">48px</td>
                    </tr>
                    <tr className="bg-card">
                      <td className="px-4 py-2.5 font-medium">Artifact panel (right)</td>
                      <td className="px-4 py-2.5 font-mono text-xs">280px</td>
                      <td className="px-4 py-2.5 font-mono text-xs">280px</td>
                      <td className="px-4 py-2.5 font-mono text-xs">480px</td>
                      <td className="hidden px-4 py-2.5 font-mono text-xs sm:table-cell">44px</td>
                    </tr>
                    <tr className="bg-card">
                      <td className="px-4 py-2.5 font-medium">Center column</td>
                      <td className="px-4 py-2.5 font-mono text-xs">flex-1</td>
                      <td className="px-4 py-2.5 font-mono text-xs">320px</td>
                      <td className="px-4 py-2.5 font-mono text-xs">—</td>
                      <td className="hidden px-4 py-2.5 sm:table-cell">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Gutters:</strong> artifact header{' '}
                  <code className="rounded bg-muted px-1 font-mono text-xs">pl-3 pr-5 py-3</code>, folder rows{' '}
                  <code className="rounded bg-muted px-1 font-mono text-xs">py-1.5</code>, SN list rows{' '}
                  <code className="rounded bg-muted px-1 font-mono text-xs">px-2 py-2</code>.
                </p>
                <p>
                  <strong className="text-foreground">Resize handle:</strong>{' '}
                  <code className="rounded bg-muted px-1 font-mono text-xs">PanelResizeHandle</code> —{' '}
                  <code className="rounded bg-muted px-1 font-mono text-xs">w-1.5 cursor-col-resize</code>, inner
                  line turns <code className="rounded bg-muted px-1 font-mono text-xs">bg-primary</code> on drag.
                </p>
              </div>
            </section>

            <Separator className="my-10 bg-border" />

            {/* ServiceNow Phases */}
            <section ref={sectionRef('dev-phases')} className="scroll-mt-6">
              <SectionHeading
                id="dev-phases"
                title="ServiceNow Development Phases"
                description="Guidelines, schemas, and specs mapped across each development phase."
              />
              <div className="space-y-4">
                {/* Horizontal / Grid of Clickable Steps */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                  {phases.map((p, idx) => {
                    const Icon = p.icon;
                    const isSelected = selectedPhase === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPhase(p.id)}
                        className={cn(
                          "p-3 rounded-xl border text-left flex flex-col justify-between gap-3 cursor-pointer transition-all hover:bg-muted/40",
                          isSelected 
                            ? "border-brand-green bg-brand-green/5 text-brand-green font-semibold shadow-[0_0_15px_rgba(50,215,75,0.15)] animate-pulse"
                            : "border-border bg-card text-muted-foreground"
                        )}
                      >
                        <div className="flex justify-between items-center w-full">
                          <Icon className={cn("h-4 w-4", isSelected ? "text-brand-green" : "text-muted-foreground")} />
                          <span className="text-[10px] font-mono text-muted-foreground/60">0{idx + 1}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-foreground tracking-tight truncate w-full">
                          {p.label.split('. ')[1]}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Phase Info Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-2xl border border-border bg-card/65">
                  <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded border border-brand-green/20">
                          {phaseDetails[selectedPhase].format}
                        </span>
                        <h3 className="text-base font-semibold text-foreground mt-2.5">
                          {phaseDetails[selectedPhase].title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {phaseDetails[selectedPhase].desc}
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-border/40">
                      <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-brand-green" /> Architecture Guidelines
                      </h4>
                      <ul className="list-disc pl-5 text-[11px] text-muted-foreground space-y-1">
                        {selectedPhase === 'discovery' && (
                          <>
                            <li>Verify story descriptions match technical deliverables.</li>
                            <li>Each story acceptance criteria maps directly to user-facing validations.</li>
                          </>
                        )}
                        {selectedPhase === 'schema' && (
                          <>
                            <li>ServiceNow tables require appropriate primary keys and task extensions.</li>
                            <li>Enforce ServiceNow naming patterns: scope x_snc prefix.</li>
                          </>
                        )}
                        {selectedPhase === 'forms' && (
                          <>
                            <li>Forms must render correctly in both light and dark system schemes.</li>
                            <li>Include standard task-based metadata fields on upper sections.</li>
                          </>
                        )}
                        {selectedPhase === 'logic' && (
                          <>
                            <li>Limit client scripts to minor UI validation loops to optimize response times.</li>
                            <li>Avoid blocking database queries inside business rule execution paths.</li>
                          </>
                        )}
                        {selectedPhase === 'testing' && (
                          <>
                            <li>Write automated tests for custom UI sections and field restrictions.</li>
                            <li>Verify data boundary limits in all custom integration APIs.</li>
                          </>
                        )}
                        {selectedPhase === 'release' && (
                          <>
                            <li>Complete clean bundle verification of all Update Sets.</li>
                            <li>Ensure active deliverables align with stakeholder sign-offs.</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-3 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground font-mono">
                        Mock Configuration Template
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(phaseDetails[selectedPhase].snippet, selectedPhase)}
                        className="text-xs text-brand-green hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        {copiedText === selectedPhase ? (
                          <><Check className="h-3.5 w-3.5" /> Copied</>
                        ) : (
                          <><Copy className="h-3.5 w-3.5" /> Copy Code</>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-black/40 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed border border-border/30 max-h-[300px] flex-1">
                      <code>{phaseDetails[selectedPhase].snippet}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <Separator className="my-10 bg-border" />

            {/* Live Application State */}
            <section ref={sectionRef('live-state')} className="scroll-mt-6">
              <SectionHeading
                id="live-state"
                title="Live Application State"
                description="Real-time metadata parameters and generated file deliverables of your current session."
              />
              {activeSolution ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Left Column: Solution Meta */}
                  <div className="p-5 rounded-2xl border border-border bg-card/65 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-brand-green animate-pulse" /> Workspace Active Session
                    </h3>
                    
                    <div className="space-y-3 divide-y divide-border/40 text-xs">
                      <div className="flex justify-between py-1.5">
                        <span className="text-muted-foreground">Solution Name:</span>
                        <span className="font-semibold text-foreground">{activeSolution.name}</span>
                      </div>
                      <div className="flex justify-between py-1.5 font-mono">
                        <span className="text-muted-foreground">Solution ID:</span>
                        <span className="text-brand-green">{activeSolution.id}</span>
                      </div>
                      <div className="flex justify-between py-1.5 font-mono">
                        <span className="text-muted-foreground">Scope Prefix:</span>
                        <span className="text-zinc-300">x_snc_{activeSolution.id.replace(/-/g, '_')}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-muted-foreground">Build Stage:</span>
                        <span className="font-semibold text-foreground uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-muted">
                          {activeSolution.blueprint.status}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-muted-foreground">Chat History:</span>
                        <span className="font-semibold text-foreground">{activeSolution.chatHistory.length} messages</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Artifacts */}
                  <div className="p-5 rounded-2xl border border-border bg-card/65 flex flex-col justify-between">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FileStack className="h-4 w-4 text-brand-green" /> Deliverable Files ({liveArtifacts.length})
                    </h3>
                    
                    <div className="mt-4 flex-1 max-h-[220px] overflow-y-auto space-y-2 pr-1">
                      {liveArtifacts.map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 border border-border/20 transition-all">
                          <div className="min-w-0 flex-1 pr-3">
                            <span className="truncate block text-foreground font-medium" title={a.name}>{a.name}</span>
                            <span className="font-mono text-[9px] text-muted-foreground mt-0.5 block">{a.id}</span>
                          </div>
                          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25 shrink-0">
                            {a.artifactFormat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center border border-dashed border-border rounded-2xl bg-card/45 flex flex-col items-center justify-center gap-3">
                  <Cpu className="h-8 w-8 text-muted-foreground opacity-60" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">No active solution selected</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Select a solution in the dashboard or sidebar first to inspect active session variables and live deliverables.
                    </p>
                  </div>
                </div>
              )}
            </section>

            <Separator className="my-10 bg-border" />

            {/* Components */}
            <section ref={sectionRef('components')} className="scroll-mt-6">
              <SectionHeading
                id="components"
                title="Components"
                description="Live previews of production components — import paths match the running app."
              />
              <div className="space-y-6">
                <PreviewSurface label="Buttons">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <button type="button" className="rounded-md px-4 py-2 text-sm btn-dark-primary">
                      btn-dark-primary
                    </button>
                  </div>
                </PreviewSurface>

                <PreviewSurface label="Badges & chips">
                  <div className="flex flex-wrap items-center gap-2">
                    <ArtifactFormatBadge format="DOC" isDark={isDark} />
                    <ArtifactStatusBadge status="approved" isDark={isDark} />
                    <ArtifactStatusBadge status="in_review" isDark={isDark} />
                    <ArtifactStatusBadge status="pending" isDark={isDark} />
                    <ArtifactStatusBadge status="draft" isDark={isDark} />
                    <PhaseChip phase={2} isDark={isDark} />
                    <BuildStageChip stage="scope" isDark={isDark} />
                  </div>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="mb-2 text-xs text-muted-foreground">Folder status (Projects browser / table)</p>
                    <div className="flex flex-wrap gap-2">
                      {(['draft', 'in_review', 'accepted', 'approved', 'rejected', 'changes_requested'] as FolderStatus[]).map((s) => (
                        <Fragment key={s}>
                          <FolderStatusBadge status={s} isDark={isDark} />
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </PreviewSurface>

                <PreviewSurface label="Architect nav (.architect-nav-item)">
                  <ArchitectNavPreview isDark={isDark} />
                </PreviewSurface>

                <PreviewSurface label="Workflow stepper (Status tab)">
                  <WorkflowStepperPreview isDark={isDark} />
                </PreviewSurface>

                <PreviewSurface label="Settings panel (.settings-panel)">
                  <div className={cn('settings-page rounded-xl p-4', 'dark')}>
                    <div className="settings-panel max-w-md overflow-hidden">
                      <div className="settings-nav border-b border-border px-4 py-3 text-xs font-medium text-muted-foreground">
                        Settings navigation
                      </div>
                      <div className="settings-row flex items-center justify-between px-4 py-3 text-sm">
                        <span>Theme</span>
                        <span className="font-mono text-xs text-muted-foreground">{theme}</span>
                      </div>
                    </div>
                  </div>
                </PreviewSurface>

                <PreviewSurface label="Chat composer">
                  <div className="w-full max-w-lg">
                    <ChatComposerPreview isDark={isDark} />
                  </div>
                </PreviewSurface>

                <PreviewSurface label="Discovery suggestion chips">
                  <DiscoveryAppSuggestionChips
                    theme={theme}
                    compact
                    onSelect={() => undefined}
                  />
                </PreviewSurface>

                <PreviewSurface label="Role switcher">
                  <RoleSwitcher theme={theme} role={demoRole} onChange={setDemoRole} />
                </PreviewSurface>

                <PreviewSurface label="Panel header — Application files" className="p-0">
                  <SamplePanelHeader isDark={isDark} />
                </PreviewSurface>

                <PreviewSurface label="Artifact file list row" className="p-0">
                  <div className="artifact-panel">
                    <SampleArtifactRow isDark={isDark} active />
                    <SampleArtifactRow isDark={isDark} />
                  </div>
                </PreviewSurface>

                <PreviewSurface label="SN list row (.sn-list-row)">
                  <div className="w-full max-w-md rounded-lg border border-border overflow-hidden">
                    <div className="sn-list-row px-3 py-2.5">
                      <p className="text-sm font-medium">Default row — hover for highlight</p>
                      <p className="sn-meta mt-0.5">Secondary metadata line</p>
                    </div>
                    <div className="sn-list-row sn-list-row--active px-3 py-2.5">
                      <p className="text-sm font-medium text-foreground">Active row — primary left border</p>
                    </div>
                    <div className="sn-list-row sn-list-row--conflict px-3 py-2.5">
                      <p className="text-sm font-medium">Conflict row — amber left border</p>
                    </div>
                  </div>
                </PreviewSurface>

                <PreviewSurface label="CenterToast (static)">
                  <StaticCenterToastPreview isDark={isDark} />
                </PreviewSurface>

                <CopyCodeBlock
                  label="Import paths"
                  code={`import { Button } from '@/src/components/ui/button';
import { RoleSwitcher } from '@/src/components/RoleSwitcher';
import { CenterToast } from '@/src/components/CenterToast';
import {
  ArtifactFormatBadge,
  ArtifactStatusBadge,
  PhaseChip,
  BuildStageChip,
} from '@/src/utils/artifactDisplay';`}
                />
              </div>
            </section>

            <Separator className="my-10 bg-border" />

            {/* Patterns */}
            <section ref={sectionRef('patterns')} className="scroll-mt-6">
              <SectionHeading
                id="patterns"
                title="Patterns"
                description="Recurring layout and visual patterns across persona views."
              />
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Elevation stack ({THEME_LABELS[themeId]})</h3>
                  <PreviewSurface label="Surface layers">
                    <ElevationStackPreview isDark={isDark} themeId={themeId} />
                  </PreviewSurface>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">ServiceNow file-list aesthetic</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Compact rows with mono filing paths, uppercase format badges, and status pills. See{' '}
                    <code className="rounded bg-muted px-1 font-mono text-xs">ArtifactCardsPanel.tsx</code>.
                  </p>
                  <PreviewSurface label="File stack icon + vertical strip" className="flex justify-center">
                    <div className="flex h-32 w-11 flex-col items-center rounded-lg border border-border bg-sidebar py-2">
                      <FileStack className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                      <span className="mt-auto select-none text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 [writing-mode:vertical-rl]">
                        Files
                      </span>
                    </div>
                  </PreviewSurface>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Phase badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {([1, 2, 3, 4, 5] as const).map((p) => (
                      <Fragment key={p}>
                        <PhaseChip phase={p} isDark={isDark} />
                      </Fragment>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Persona views</h3>
                  <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Main view</th>
                          <th className="px-4 py-3 hidden sm:table-cell">Sidebar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {PERSONA_VIEWS.map((row) => (
                          <tr key={row.role} className="bg-card">
                            <td className="px-4 py-2.5 font-medium capitalize">{row.role}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{row.view}</td>
                            <td className="hidden px-4 py-2.5 font-mono text-xs text-muted-foreground sm:table-cell">
                              {row.sidebar}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Portal theme wrappers</h3>
                  <p className="text-sm text-muted-foreground">
                    Modals and toasts render via portals — pass{' '}
                    <code className="rounded bg-muted px-1 font-mono text-xs">theme</code> and wrap content in{' '}
                    <code className="rounded bg-muted px-1 font-mono text-xs">dark</code> or{' '}
                    <code className="rounded bg-muted px-1 font-mono text-xs">light</code>. Use{' '}
                    <code className="rounded bg-muted px-1 font-mono text-xs">glass-panel-dark</code> /{' '}
                    <code className="rounded bg-muted px-1 font-mono text-xs">glass-panel-light</code> for elevated
                    surfaces (see ShareArtifactModal, CenterToast).
                  </p>
                </div>
              </div>
            </section>

            <Separator className="my-10 bg-border" />

            {/* How to use */}
            <section ref={sectionRef('how-to')} className="scroll-mt-6">
              <SectionHeading
                id="how-to"
                title="How to use"
                description="Quick reference for developers adding UI to Mitra."
              />
              <div className="space-y-4">
                <CopyCodeBlock
                  label="cn() utility"
                  code={`import { cn } from '@/lib/utils';

<div className={cn(
  'sn-list-row px-2 py-2',
  isActive && 'sn-list-row--active',
  theme,
)} />`}
                />

                <CopyCodeBlock
                  label="Adding an artifact row — copy from ArtifactCardsPanel"
                  code={`<div className={cn('sn-list-row group px-2 py-2', isActive && 'sn-list-row--active')}>
  <button type="button" className="min-w-0 flex-1 px-1 py-0.5 text-left">
    <div className="flex items-start gap-2">
      <ArtifactTypeIcon type={artifact.type} />
      <div className="min-w-0 flex-1">
        <p className="artifact-row-title truncate font-medium">{artifact.name}</p>
        <p className="artifact-row-filing sn-mono truncate">{artifact.filingName}</p>
        <ArtifactStatusBadge status={artifact.status} isDark={isDark} />
      </div>
    </div>
  </button>
</div>`}
                />

                <CopyCodeBlock
                  label="shadcn add component"
                  code={`npx shadcn@latest add button
# Config: components.json → @/src/components/ui/*`}
                />

                <div className="rounded-xl border border-border bg-muted/20 p-5">
                  <h3 className="text-sm font-semibold text-foreground">Markdown deep reference</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Supplementary docs live in{' '}
                    <code className="rounded bg-muted px-1 font-mono text-xs">styleguide/</code> — foundations,
                    component specs, copy-paste snippets. This in-app view is the canonical live preview; markdown
                    files are for offline/deep dives.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <li>
                      <code className="font-mono text-xs">styleguide/foundations/colors.md</code>
                    </li>
                    <li>
                      <code className="font-mono text-xs">styleguide/components/artifact-file-list.md</code>
                    </li>
                    <li>
                      <code className="font-mono text-xs">styleguide/patterns/persona-views.md</code>
                    </li>
                    <li>
                      <code className="font-mono text-xs">styleguide/copy-paste/snippets.css</code>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
