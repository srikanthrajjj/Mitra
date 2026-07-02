import type { ComponentType } from 'react';
import type { Theme } from '../../../types';

export type DevComponentId =
  | 'chat-loader'
  | 'todo-card'
  | 'streaming-text'
  | 'chat-bubble'
  | 'entry-chips';

export interface DevComponentMeta {
  id: DevComponentId;
  name: string;
  description: string;
  tags: string[];
}

export type DevShowcaseComponent = ComponentType<{ theme?: Theme }>;

export interface DevComponentEntry {
  meta: DevComponentMeta;
  Showcase: DevShowcaseComponent;
}
