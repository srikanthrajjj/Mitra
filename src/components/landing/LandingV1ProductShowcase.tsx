import { LandingMitraProductFrame } from './LandingMitraProductFrame';

/** V1 product showcase — headline + Mitra dashboard in animated glass frame */
export function LandingV1ProductShowcase() {
  return (
    <section
      id="product"
      className="landing-section-surface relative overflow-x-clip px-6 py-16 md:py-24"
      aria-labelledby="v1-product-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(26,175,0,0.08),transparent_70%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--landing-accent)]">
            Meet Mitra
          </p>
          <h2 id="v1-product-heading" className="landing-v1-section-title mt-4">
            AI without workflows is just{' '}
            <span className="landing-v1-accent-word">expensive advice</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/55">
            Mitra turns intent into ServiceNow delivery — stories, catalogs, flows, tests, and
            go-live packs — with humans in control.
          </p>
        </div>

        <div className="mt-12 px-4 sm:mt-14 sm:px-8 md:px-12 lg:px-16">
          <div className="landing-glass-frame">
            <div className="landing-glass-frame-border" aria-hidden>
              <div className="landing-glass-frame-glow" />
            </div>
            <div className="landing-glass-frame-inner">
              <LandingMitraProductFrame variant="hero" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
