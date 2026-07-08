import type { DevComponentEntry } from '../types';
import { ChatLoaderShowcase } from './ChatLoaderShowcase';

export const chatLoaderEntry: DevComponentEntry = {
  meta: {
    id: 'chat-loader',
    name: 'Thinking Status',
    description: 'Four thinking indicator variations: grid dots (production), typing dots, shimmer label, and glow pulse.',
    tags: ['chat', 'loader', 'status', 'thinking'],
  },
  Showcase: ChatLoaderShowcase,
};

export { ChatLoaderShowcase };
