import type { DevComponentEntry } from '../types';
import { TodoCardShowcase } from './TodoCardShowcase';

export const todoCardEntry: DevComponentEntry = {
  meta: {
    id: 'todo-card',
    name: 'Todo Card',
    description: 'Build-plan checklist shown inside assistant messages during generation.',
    tags: ['chat', 'todos', 'checklist'],
  },
  Showcase: TodoCardShowcase,
};

export { TodoCardShowcase };
