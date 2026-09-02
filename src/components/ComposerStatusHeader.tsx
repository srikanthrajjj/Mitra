import { ServiceNowInstance, instanceHostname, isProdInstance } from '../data/serviceNowInstances';
import { useOrgSession } from '../contexts/OrgSessionContext';
import { OrgSwitchBanner } from './OrgSwitchBanner';
import { ProdInstanceBanner } from './ProdInstanceBanner';

interface ComposerStatusHeaderProps {
  isDark: boolean;
  instance?: ServiceNowInstance;
  /** Set by SimulationComposerStack when the simulation note sits above. */
  stacked?: boolean;
}

/**
 * The warning strips attached above the composer: switched-organization first,
 * then the production-instance warning. Both square off their top corners when
 * something else already sits above them.
 */
export function ComposerStatusHeader({ isDark, instance, stacked = false }: ComposerStatusHeaderProps) {
  const { isOrgSwitched } = useOrgSession();
  const showProd = Boolean(instance && isProdInstance(instance));

  if (!isOrgSwitched && !showProd) return null;

  return (
    <>
      <OrgSwitchBanner isDark={isDark} stacked={stacked} />
      {showProd && instance && (
        <ProdInstanceBanner
          isDark={isDark}
          instanceName={instance.name}
          hostname={instanceHostname(instance.url)}
          stacked={stacked || isOrgSwitched}
        />
      )}
    </>
  );
}
