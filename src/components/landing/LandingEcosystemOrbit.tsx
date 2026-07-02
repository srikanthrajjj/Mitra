import { useCallback, useState } from 'react';
import { EcosystemConnectionField } from './ecosystem/EcosystemConnectionField';
import { EcosystemCore } from './ecosystem/EcosystemCore';
import { EcosystemOrbitRings } from './ecosystem/EcosystemOrbitRings';
import { ECOSYSTEM_SECTION } from './echelonLandingData';

export function LandingEcosystemOrbit() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const activeId = hoveredId ?? focusedId;

  const clearActive = useCallback(() => {
    setHoveredId(null);
    setFocusedId(null);
  }, []);

  return (
    <section
      id="ecosystem"
      className="eco-section relative overflow-hidden border-t border-white/[0.03] px-6 py-28 md:py-36"
      aria-labelledby="ecosystem-heading"
    >
      <div className="eco-ambient pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="mx-auto max-w-xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/35">
            {ECOSYSTEM_SECTION.eyebrow}
          </p>
          <h2
            id="ecosystem-heading"
            className="mt-5 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-[1.15] tracking-tight text-white"
          >
            {ECOSYSTEM_SECTION.headline}
          </h2>
        </header>

        <div
          className="eco-stage relative mx-auto mt-20 flex aspect-square w-full max-w-[min(96vw,720px)] items-center justify-center md:mt-24"
          onMouseLeave={clearActive}
        >
          <div className="eco-hub relative size-full">
            <div className="absolute inset-0">
              <EcosystemConnectionField />

              <EcosystemOrbitRings
                activeId={activeId}
                onHoverStart={setHoveredId}
                onHoverEnd={() => setHoveredId(null)}
                onFocus={setFocusedId}
                onBlur={() => setFocusedId(null)}
              />
            </div>

            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <EcosystemCore />
            </div>
          </div>
        </div>

        <p className="mx-auto mt-16 max-w-lg text-center text-sm leading-relaxed text-white/38 md:text-[15px]">
          {ECOSYSTEM_SECTION.subtitle}
        </p>
      </div>
    </section>
  );
}
