import readme from '../../styleguide/README.md?raw';
import colors from '../../styleguide/foundations/colors.md?raw';
import typography from '../../styleguide/foundations/typography.md?raw';
import spacing from '../../styleguide/foundations/spacing.md?raw';
import elevation from '../../styleguide/foundations/elevation.md?raw';
import buttons from '../../styleguide/components/buttons.md?raw';
import badgesChips from '../../styleguide/components/badges-chips.md?raw';
import cardsPanels from '../../styleguide/components/cards-panels.md?raw';
import sidebar from '../../styleguide/components/sidebar.md?raw';
import chatComposer from '../../styleguide/components/chat-composer.md?raw';
import artifactFileList from '../../styleguide/components/artifact-file-list.md?raw';
import modalsToasts from '../../styleguide/components/modals-toasts.md?raw';
import formsInputs from '../../styleguide/components/forms-inputs.md?raw';
import roleSwitcher from '../../styleguide/components/role-switcher.md?raw';
import darkMode from '../../styleguide/patterns/dark-mode.md?raw';
import servicenowAesthetic from '../../styleguide/patterns/servicenow-aesthetic.md?raw';
import phaseBadges from '../../styleguide/patterns/phase-badges.md?raw';
import personaViews from '../../styleguide/patterns/persona-views.md?raw';
import snippetsCss from '../../styleguide/copy-paste/snippets.css?raw';
import componentChecklist from '../../styleguide/copy-paste/component-checklist.md?raw';

export type StyleguideCategory =
  | 'overview'
  | 'foundations'
  | 'components'
  | 'patterns'
  | 'copy-paste';

export interface StyleguideSection {
  id: string;
  title: string;
  category: StyleguideCategory;
  content: string;
}

export const STYLEGUIDE_CATEGORIES: { id: StyleguideCategory; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'foundations', label: 'Foundations' },
  { id: 'components', label: 'Components' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'copy-paste', label: 'Copy-paste' },
];

export const STYLEGUIDE_SECTIONS: StyleguideSection[] = [
  { id: 'overview', title: 'Overview', category: 'overview', content: readme },
  { id: 'colors', title: 'Colors', category: 'foundations', content: colors },
  { id: 'typography', title: 'Typography', category: 'foundations', content: typography },
  { id: 'spacing', title: 'Spacing', category: 'foundations', content: spacing },
  { id: 'elevation', title: 'Elevation', category: 'foundations', content: elevation },
  { id: 'buttons', title: 'Buttons', category: 'components', content: buttons },
  { id: 'badges-chips', title: 'Badges & chips', category: 'components', content: badgesChips },
  { id: 'cards-panels', title: 'Cards & panels', category: 'components', content: cardsPanels },
  { id: 'sidebar', title: 'Sidebar', category: 'components', content: sidebar },
  { id: 'chat-composer', title: 'Chat composer', category: 'components', content: chatComposer },
  { id: 'artifact-file-list', title: 'Artifact file list', category: 'components', content: artifactFileList },
  { id: 'modals-toasts', title: 'Modals & toasts', category: 'components', content: modalsToasts },
  { id: 'forms-inputs', title: 'Forms & inputs', category: 'components', content: formsInputs },
  { id: 'role-switcher', title: 'Role switcher', category: 'components', content: roleSwitcher },
  { id: 'dark-mode', title: 'Dark mode', category: 'patterns', content: darkMode },
  { id: 'servicenow-aesthetic', title: 'ServiceNow aesthetic', category: 'patterns', content: servicenowAesthetic },
  { id: 'phase-badges', title: 'Phase badges', category: 'patterns', content: phaseBadges },
  { id: 'persona-views', title: 'Persona views', category: 'patterns', content: personaViews },
  { id: 'snippets', title: 'CSS snippets', category: 'copy-paste', content: snippetsCss },
  { id: 'component-checklist', title: 'Component checklist', category: 'copy-paste', content: componentChecklist },
];

const LINK_PATH_TO_SECTION: Record<string, string> = {
  './foundations/colors.md': 'colors',
  './foundations/typography.md': 'typography',
  './foundations/spacing.md': 'spacing',
  './foundations/elevation.md': 'elevation',
  './components/': 'buttons',
  './patterns/': 'dark-mode',
  './copy-paste/snippets.css': 'snippets',
  './copy-paste/component-checklist.md': 'component-checklist',
  'foundations/colors.md': 'colors',
  'foundations/typography.md': 'typography',
  'foundations/spacing.md': 'spacing',
  'foundations/elevation.md': 'elevation',
  'copy-paste/snippets.css': 'snippets',
  'copy-paste/component-checklist.md': 'component-checklist',
};

export function resolveStyleguideLink(href: string): string | null {
  const normalized = href.replace(/^\.\//, '');
  if (LINK_PATH_TO_SECTION[href] || LINK_PATH_TO_SECTION[normalized]) {
    return LINK_PATH_TO_SECTION[href] ?? LINK_PATH_TO_SECTION[normalized] ?? null;
  }
  const mdMatch = normalized.match(/(?:components|patterns|foundations|copy-paste)\/([^/]+)\.md$/);
  if (mdMatch) return mdMatch[1];
  const cssMatch = normalized.match(/copy-paste\/snippets\.css$/);
  if (cssMatch) return 'snippets';
  return null;
}
