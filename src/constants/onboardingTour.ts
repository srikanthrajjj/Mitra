export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface OnboardingTourStep {
  id: string;
  title: string;
  content: string;
  /** `data-tour` attribute value on the target element */
  target?: string;
  placement: TourPlacement;
  requiredTab?: string;
  requiresExpandedSidebar?: boolean;
}

export const ONBOARDING_TOUR_STEPS: OnboardingTourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Mitra',
    content:
      'Mitra is your **ServiceNow architect copilot**. In a few stops you will see where to start chats, browse projects, and manage your account.',
    placement: 'center',
  },
  {
    id: 'sidebar',
    title: 'Sidebar workspace',
    target: 'sidebar',
    content:
      'Use **Search** and **New Chat** to get started. Open **Projects** for folders, **Connections** for integrations, and **Favourites** for starred work. **Pinned** and **Recents** keep active threads close.',
    placement: 'right',
    requiresExpandedSidebar: true,
  },
  {
    id: 'quick-start',
    title: 'Quick-start cards',
    target: 'quick-start',
    content:
      'Pick a path that matches your goal — **new application**, **industry template**, **requirements import**, or **analyze an existing app**. Try a demo example to see the flow.',
    placement: 'bottom',
    requiredTab: 'dashboard',
  },
  {
    id: 'composer',
    title: 'Prompt composer',
    target: 'composer',
    content:
      'Describe what you want to build here. Attach specs with the **paperclip**, then send. Mitra will draft tables, scripts, workflows, and Studio deliverables from your instructions.',
    placement: 'top',
    requiredTab: 'dashboard',
  },
  {
    id: 'profile',
    title: 'Account & settings',
    target: 'profile',
    content:
      'Open your profile for **Settings**, restart this tour anytime, or sign out. Configure your **API key** in settings for faster live generations.',
    placement: 'right',
    requiresExpandedSidebar: true,
  },
];

export function tourTargetSelector(target?: string) {
  if (!target) return null;
  return `[data-tour="${target}"]`;
}
