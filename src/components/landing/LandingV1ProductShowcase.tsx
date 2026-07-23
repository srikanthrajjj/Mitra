import { LandingMitraProductFrame } from './LandingMitraProductFrame';

/** V1 product showcase — headline + Mitra dashboard in animated glass frame */
export function LandingV1ProductShowcase() {
  return (
    <section
      id="about"
      className="landing-section-surface relative overflow-x-clip px-6 py-16 md:py-24"
      aria-labelledby="v1-product-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_35%,rgba(26,175,0,0.04),transparent_70%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--landing-accent)]">
            Meet Mitra
          </p>
          <h2 id="v1-product-heading" className="landing-v1-section-title mt-4">
            ServiceNow delivery that{' '}
            <span className="landing-v1-accent-word">ships past the brief</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/55">
            Mitra converts stakeholder intent into stories, catalogs, flows, tests, and go-live
            packs — structured for your platform teams, with humans approving every step.
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
