import type { DevComponentEntry } from '../components/types';
import { TabBarShowcase } from './TabBarShowcase';

export const tabBarEntry: DevComponentEntry = {
  meta: {
    id: 'tab-bar',
    name: 'Tab Bar',
    description: 'Reusable tab navigation with boxed, underline, pill, and CTA button variants. Full ARIA semantics.',
    tags: ['navigation', 'tabs', 'panels', 'dashboard'],
  },
  Showcase: TabBarShowcase,
};

export { TabBarShowcase };
export { TabBar, type TabBarItem, type TabBarVariant, type TabBarSize } from './TabBar';
