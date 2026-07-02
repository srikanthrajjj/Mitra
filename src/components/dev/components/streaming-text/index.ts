import type { DevComponentEntry } from '../types';
import { StreamingTextShowcase } from './StreamingTextShowcase';

export const streamingTextEntry: DevComponentEntry = {
  meta: {
    id: 'streaming-text',
    name: 'Streaming Text',
    description: 'Smooth token reveal with breathing cursor while the model streams.',
    tags: ['chat', 'stream', 'cursor'],
  },
  Showcase: StreamingTextShowcase,
};

export { StreamingTextShowcase };
