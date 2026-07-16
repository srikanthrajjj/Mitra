import tabBarCss from './tab-bar.css?raw';

export const TAB_BAR_HTML = `<!-- Boxed variant (dark) -->
<div class="mitra-tab-bar mitra-tab-bar--boxed" role="tablist" aria-label="Sections">
  <button class="mitra-tab-bar__tab mitra-tab-bar__tab--active" role="tab" aria-selected="true" aria-controls="panel-artifacts" id="tab-artifacts">
    <svg class="mitra-tab-bar__icon" ...></svg>
    <span>Artifacts</span>
    <span class="mitra-tab-bar__count">(5)</span>
  </button>
  <button class="mitra-tab-bar__tab" role="tab" aria-selected="false" aria-controls="panel-status" id="tab-status">
    <svg class="mitra-tab-bar__icon" ...></svg>
    <span>Status</span>
  </button>
</div>

<!-- Underline variant -->
<div class="mitra-tab-bar mitra-tab-bar--underline" role="tablist" aria-label="Sections">
  <button class="mitra-tab-bar__tab mitra-tab-bar__tab--active" role="tab" aria-selected="true">Overview</button>
  <button class="mitra-tab-bar__tab" role="tab" aria-selected="false">Details</button>
  <button class="mitra-tab-bar__tab" role="tab" aria-selected="false">History</button>
</div>

<!-- CTA variant -->
<div class="mitra-tab-bar mitra-tab-bar--cta" role="tablist" aria-label="Dashboard">
  <button class="mitra-tab-bar__tab mitra-tab-bar__tab--active" role="tab" aria-selected="true">Executive</button>
  <button class="mitra-tab-bar__tab" role="tab" aria-selected="false">Developer</button>
</div>`;

export const TAB_BAR_CSS = tabBarCss;

export const TAB_BAR_REACT = `import { useState } from 'react';
import { FileStack, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import './tab-bar.css';

type Tab = { id: string; label: string; icon?: React.ElementType; count?: number };

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
        \`mitra-tab-bar--\${variant}\`,
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
            aria-controls={\`panel-\${id}\`}
            id={\`tab-\${id}\`}
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

// Usage
function MyPanel() {
  const [tab, setTab] = useState('artifacts');
  return (
    <TabBar
      tabs={[
        { id: 'artifacts', label: 'Artifacts', icon: FileStack, count: 5 },
        { id: 'status', label: 'Status', icon: GitBranch },
      ]}
      activeTab={tab}
      variant="boxed"
      isDark={true}
      onTabChange={setTab}
    />
  );
}`;
