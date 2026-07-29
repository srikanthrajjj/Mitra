import type { ElementType } from 'react';
import { cn } from '@/lib/utils';
import './tab-bar.css';

export type TabBarItem = {
  id: string;
  label: string;
  icon?: ElementType;
  count?: number;
};

export type TabBarVariant = 'boxed' | 'underline' | 'cta' | 'pill';
export type TabBarSize = 'default' | 'compact';

export function TabBar({
  tabs,
  activeTab,
  variant = 'boxed',
  size = 'default',
  fullWidth = true,
  isDark = true,
  ariaLabel = 'Sections',
  className,
  onTabChange,
}: {
  tabs: TabBarItem[];
  activeTab: string;
  variant?: TabBarVariant;
  size?: TabBarSize;
  fullWidth?: boolean;
  isDark?: boolean;
  ariaLabel?: string;
  className?: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        'mitra-tab-bar',
        `mitra-tab-bar--${variant}`,
        size === 'compact' && 'mitra-tab-bar--compact',
        !fullWidth && 'mitra-tab-bar--inline',
        !isDark && 'mitra-tab-bar--light',
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
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
            className={cn('mitra-tab-bar__tab', selected && 'mitra-tab-bar__tab--active')}
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
