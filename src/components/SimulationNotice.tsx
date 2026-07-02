import SimulationComposerStack from './SimulationComposerStack';
import { Theme } from '../types';

/** @deprecated Use SimulationComposerStack on the composer instead */
export default function SimulationNotice({ theme }: { theme: Theme }) {
  return (
    <SimulationComposerStack theme={theme}>
      <div className="p-3" />
    </SimulationComposerStack>
  );
}
