import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { OrbitingCircles } from '@/src/components/ui/orbiting-circles';
import {
  modulesForRing,
  ORBIT_RING_CONFIG,
  type EcosystemModuleConfig,
  type OrbitRingId,
} from './ecosystemLayout';
import { EcosystemModuleChip } from './EcosystemModuleChip';

interface EcosystemOrbitRingsProps {
  activeId: string | null;
  onHoverStart: (id: string) => void;
  onHoverEnd: () => void;
  onFocus: (id: string) => void;
  onBlur: () => void;
}

function OrbitRing({
  ring,
  radius,
  modules,
  activeId,
  reduceMotion,
  onHoverStart,
  onHoverEnd,
  onFocus,
  onBlur,
}: {
  ring: OrbitRingId;
  radius: number;
  modules: EcosystemModuleConfig[];
  activeId: string | null;
  reduceMotion: boolean | null;
  onHoverStart: (id: string) => void;
  onHoverEnd: () => void;
  onFocus: (id: string) => void;
  onBlur: () => void;
}) {
  const config = ORBIT_RING_CONFIG[ring];

  return (
    <div className="eco-orbit-ring-anchor pointer-events-none absolute inset-0">
      <OrbitingCircles
        className="eco-orbit-item pointer-events-auto"
        radius={radius}
        duration={reduceMotion ? 9999 : config.duration}
        speed={reduceMotion ? 0.001 : config.speed}
        reverse={ring === 'inner'}
        path
        iconSize={1}
      >
        {modules.map((mod) => (
          <EcosystemModuleChip
            key={mod.id}
            module={mod}
            isActive={activeId === mod.id}
            isDimmed={activeId != null && activeId !== mod.id}
            onHoverStart={() => onHoverStart(mod.id)}
            onHoverEnd={onHoverEnd}
            onFocus={() => onFocus(mod.id)}
            onBlur={onBlur}
          />
        ))}
      </OrbitingCircles>
    </div>
  );
}

export function EcosystemOrbitRings({
  activeId,
  onHoverStart,
  onHoverEnd,
  onFocus,
  onBlur,
}: EcosystemOrbitRingsProps) {
  const reduceMotion = useReducedMotion();
  const fieldRef = useRef<HTMLDivElement>(null);
  const [radii, setRadii] = useState({ outer: 180, inner: 118 });

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return undefined;

    const update = () => {
      const size = Math.min(el.clientWidth, el.clientHeight);
      setRadii({
        outer: size * ORBIT_RING_CONFIG.outer.radiusRatio,
        inner: size * ORBIT_RING_CONFIG.inner.radiusRatio,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={fieldRef} className="eco-orbit-field pointer-events-none absolute inset-0 overflow-visible">
      <OrbitRing
        ring="outer"
        radius={radii.outer}
        modules={modulesForRing('outer')}
        activeId={activeId}
        reduceMotion={reduceMotion}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <OrbitRing
        ring="inner"
        radius={radii.inner}
        modules={modulesForRing('inner')}
        activeId={activeId}
        reduceMotion={reduceMotion}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
}
