import { HOME_ACTIONS } from './homeActions';

export interface StarterPrompt {
  id: string;
  label: string;
  prompt: string;
}

/** Demo prompts — HRSD first, then build examples */
export const STARTER_PROMPTS: StarterPrompt[] = [
  { id: 'hrsd', label: 'Create HRSD app', prompt: 'I want to create an HRSD app' },
  ...HOME_ACTIONS[0].examples.map((ex, i) => ({
    id: `describe-${i}`,
    label: ex.label,
    prompt: ex.prompt,
  })),
];
