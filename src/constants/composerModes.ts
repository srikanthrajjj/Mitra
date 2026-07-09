export type ComposerModeId = 'plan' | 'build';

export interface ComposerModeOption {
  id: ComposerModeId;
  label: string;
  placeholder: string;
}

export const COMPOSER_MODES: ComposerModeOption[] = [
  {
    id: 'plan',
    label: 'Plan',
    placeholder: 'Plan the workflow, architecture, or implementation approach…',
  },
  {
    id: 'build',
    label: 'Build',
    placeholder: 'Describe what you want to build…',
  },
];

export function getComposerModeOption(modeId: ComposerModeId): ComposerModeOption {
  return COMPOSER_MODES.find((mode) => mode.id === modeId) ?? COMPOSER_MODES[0];
}

export function getComposerModePlaceholder(
  modeId: ComposerModeId,
  fallback = 'How can I help you today?',
): string {
  return getComposerModeOption(modeId).placeholder || fallback;
}
