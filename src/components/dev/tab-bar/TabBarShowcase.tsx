import { useState } from 'react';
import { FileStack, GitBranch, Settings, Users, BarChart3 } from 'lucide-react';
import { DevShowcaseShell } from '../shared/DevShowcaseShell';
import { TAB_BAR_HTML, TAB_BAR_CSS, TAB_BAR_REACT } from './snippets';
import { cn } from '@/lib/utils';
import './tab-bar.css';

type Tab = { id: string; label: string; icon?: React.ElementType; count?: number };

const DEMO_TABS: Tab[] = [
  { id: 'artifacts', label: 'Artifacts', icon: FileStack, count: 5 },
  { id: 'status', label: 'Status', icon: GitBranch },
];

const DASHBOARD_TABS: Tab[] = [
  { id: 'executive', label: 'Executive', icon: BarChart3 },
  { id: 'developer', label: 'Developer', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function TabBar({
  tabs,
  activeTab,
  variant = 'boxed',
  isDark = true,
  onTabChange,
}: {
  tabs: Tab[];
  activeTab: string;
  variant?: 'boxed' | 'underline' | 'cta';
  isDark?: boolean;
  onTabChange: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        'mitra-tab-bar',
        `mitra-tab-bar--${variant}`,
        !isDark && 'mitra-tab-bar--light',
      )}
      role="tablist"
      aria-label="Sections"
    >
      {tabs.map(({ id, label, icon: Icon, count }) => {
        const selected = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`panel-${id}`}
            id={`tab-${id}`}
            onClick={() => onTabChange(id)}
            className={cn(
              'mitra-tab-bar__tab',
              selected && 'mitra-tab-bar__tab--active',
            )}
          >
            {Icon && <Icon className="mitra-tab-bar__icon" />}
            <span>{label}</span>
            {count != null && count > 0 && (
              <span className="mitra-tab-bar__count">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function BoxedPreview({ theme }: { theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';
  const [tab, setTab] = useState('artifacts');

  return (
    <div className="w-full max-w-sm">
      <TabBar
        tabs={DEMO_TABS}
        activeTab={tab}
        variant="boxed"
        isDark={isDark}
        onTabChange={setTab}
      />
      <div className={cn(
        'mt-3 rounded-lg border p-4 text-xs',
        isDark ? 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]' : 'border-border bg-card',
      )}>
        <p className="text-muted-foreground">
          {tab === 'artifacts' ? 'Artifact panel content goes here.' : 'Status panel content goes here.'}
        </p>
      </div>
    </div>
  );
}

function UnderlinePreview({ theme }: { theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';
  const [tab, setTab] = useState('overview');

  return (
    <div className="w-full max-w-sm">
      <TabBar
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'details', label: 'Details' },
          { id: 'history', label: 'History' },
        ]}
        activeTab={tab}
        variant="underline"
        isDark={isDark}
        onTabChange={setTab}
      />
      <div className={cn(
        'mt-3 p-4 text-xs',
        isDark ? 'text-muted-foreground' : 'text-muted-foreground',
      )}>
        <p>Underline tab content for "{tab}" tab.</p>
      </div>
    </div>
  );
}

function CtaPreview({ theme }: { theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';
  const [tab, setTab] = useState('executive');

  return (
    <div className="w-full max-w-sm">
      <TabBar
        tabs={DASHBOARD_TABS}
        activeTab={tab}
        variant="cta"
        isDark={isDark}
        onTabChange={setTab}
      />
      <div className={cn(
        'mt-3 rounded-lg border p-4 text-xs',
        isDark ? 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]' : 'border-border bg-card',
      )}>
        <p className="text-muted-foreground">
          Dashboard content for "{tab}" view.
        </p>
      </div>
    </div>
  );
}

export function TabBarShowcase() {
  return (
    <DevShowcaseShell
      title="Tab Bar"
      description="Reusable tab navigation with 3 variants: boxed (panel tabs), underline (section nav), and CTA buttons (dashboard filters). Full ARIA semantics with role=tablist."
      notes={
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Boxed</strong> — artifact panel style with bordered pill container. Active: <code>bg-brand-green/10</code></li>
          <li><strong>Underline</strong> — bottom border indicator. Active: green bottom border</li>
          <li><strong>CTA</strong> — uses <code>variant="cta"</code> pattern. Active: solid green with black text</li>
          <li>Always include <code>role="tablist"</code>, <code>role="tab"</code>, <code>aria-selected</code></li>
          <li>Use <code>isDarkTheme(theme)</code> for theme detection</li>
        </ul>
      }
      previews={[
        {
          label: 'Boxed (Panel Tabs)',
          content: (theme) => <BoxedPreview theme={theme} />,
        },
        {
          label: 'Underline (Section Nav)',
          content: (theme) => <UnderlinePreview theme={theme} />,
        },
        {
          label: 'CTA Buttons (Dashboard)',
          content: (theme) => <CtaPreview theme={theme} />,
        },
      ]}
      snippets={{ html: TAB_BAR_HTML, css: TAB_BAR_CSS, react: TAB_BAR_REACT }}
    />
  );
}
