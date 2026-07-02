import type { DevComponentEntry } from '../types';
import { ChatBubbleShowcase } from './ChatBubbleShowcase';

export const chatBubbleEntry: DevComponentEntry = {
  meta: {
    id: 'chat-bubble',
    name: 'Chat Bubble',
    description: 'User and Mitra message row layout with avatar and bubble surfaces.',
    tags: ['chat', 'message', 'layout'],
  },
  Showcase: ChatBubbleShowcase,
};

export { ChatBubbleShowcase };
