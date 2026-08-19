import type { DevComponentEntry } from '../types';
import { StepperShowcase } from './StepperShowcase';

export const stepperEntry: DevComponentEntry = {
  meta: {
    id: 'stepper',
    name: 'Stepper',
    description: 'Vertical and horizontal progress indicators for multi-phase workflows.',
    tags: ['progress', 'stepper', 'workflow'],
  },
  Showcase: StepperShowcase,
};

export { StepperShowcase };
