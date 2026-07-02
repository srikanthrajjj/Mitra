import type { DevComponentEntry } from '../types';
import { ChatLoaderShowcase } from './ChatLoaderShowcase';

export const chatLoaderEntry: DevComponentEntry = {
  meta: {
    id: 'chat-loader',
    name: 'Chat Loader',
    description: 'Animated thinking indicator with cycling status text and progress bar.',
    tags: ['chat', 'loader', 'status'],
  },
  Showcase: ChatLoaderShowcase,
};

export { ChatLoaderShowcase };
