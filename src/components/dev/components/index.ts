import type {
  DevComponentEntry,
  DevComponentId,
  DevComponentMeta,
  DevShowcaseComponent,
} from './types';
import { chatLoaderEntry } from './chat-loader';
import { todoCardEntry } from './todo-card';
import { streamingTextEntry } from './streaming-text';
import { chatBubbleEntry } from './chat-bubble';
import { entryChipsEntry } from './entry-chips';

export type { DevComponentEntry, DevComponentId, DevComponentMeta, DevShowcaseComponent };

export const DEV_COMPONENT_ENTRIES: DevComponentEntry[] = [
  chatLoaderEntry,
  todoCardEntry,
  streamingTextEntry,
  chatBubbleEntry,
  entryChipsEntry,
];

export const DEV_COMPONENTS: DevComponentMeta[] = DEV_COMPONENT_ENTRIES.map((entry) => entry.meta);

export const DEV_COMPONENT_SHOWCASES = DEV_COMPONENT_ENTRIES.reduce(
  (acc, entry) => {
    acc[entry.meta.id] = entry.Showcase;
    return acc;
  },
  {} as Record<DevComponentId, DevShowcaseComponent>,
);

export function isDevComponentId(value: string): value is DevComponentId {
  return DEV_COMPONENT_ENTRIES.some((entry) => entry.meta.id === value);
}

export function getDevComponentMeta(id: DevComponentId): DevComponentMeta | undefined {
  return DEV_COMPONENTS.find((component) => component.id === id);
}
