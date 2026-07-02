import type { DevComponentEntry } from '../types';
import { EntryChipsShowcase } from './EntryChipsShowcase';

export const entryChipsEntry: DevComponentEntry = {
  meta: {
    id: 'entry-chips',
    name: 'Entry Chips',
    description: 'Cold-start prompt chips for choosing how to begin a conversation.',
    tags: ['onboarding', 'chips', 'prompts'],
  },
  Showcase: EntryChipsShowcase,
};

export { EntryChipsShowcase };
