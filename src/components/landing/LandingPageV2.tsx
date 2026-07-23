import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { LandingFooterReveal } from './LandingFooterReveal';
import { LandingMitraProductFrame } from './LandingMitraProductFrame';
import { LandingAnimatedBeam } from './LandingAnimatedBeam';
import { LandingNav } from './EchelonLandingSections';
import {
  HERO,
  LIFECYCLE_SECTION,
  DEMO_SECTION,
} from './echelonLandingData';
import { LandingLifecycleTimeline } from './LandingLifecycleTimeline';
import { LandingIntentJourney } from './LandingIntentJourney';
import { LandingHeroChatDemo } from '../LandingHeroChatDemo';

interface LandingPageV2Props {
  onGetStarted: () => void;
  onSignIn?: () => void;
}

/** Matches screenshot line breaks: green lead, white rest. */
const HERO_TITLE_GREEN = ['AI-Powered', 'ServiceNow', 'Implementations,'] as const;
const HERO_TITLE_WHITE = ['Industry', 'Specific', 'Outcomes.'] as const;

function SectionReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -6% 0px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LandingPageV2({
  onGetStarted,
  onSignIn,
}: LandingPageV2Props) {
  return (
    <div className="landing-page landing-echelon landing-design-v2 overflow-x-hidden text-white antialiased selection:bg-[var(--landing-accent)]/25 selection:text-white">
      {/* ── HERO: full-bleed graphic bg + left copy overlay (cards live in the image) ── */}
      <section className="landing-v2-hero relative min-h-[100svh] w-full overflow-hidden">
        <div className="landing-v2-hero-media absolute inset-0" aria-hidden>
          <img
            src="/landing/hero-v2.png"
            alt=""
            className="landing-v2-hero-img absolute inset-0 h-full w-full max-w-none object-cover object-[58%_center]"
            decoding="async"
            fetchPriority="high"
          />
          <div className="landing-v2-hero-scrim absolute inset-0" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--landing-bg)] to-transparent" />
        </div>

        <div className="absolute inset-x-0 top-0 z-50">
          <LandingNav
            onGetStarted={onGetStarted}
            onSignIn={onSignIn}
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-center px-6 pb-[18vh] pt-28 md:pb-[22vh] md:pt-32">
          <SectionReveal>
            <div className="max-w-[20rem] sm:max-w-md md:max-w-lg lg:max-w-[28rem]">
              <h1 className="font-display text-[2.35rem] font-bold leading-[1.05] tracking-tight sm:text-[2.85rem] md:text-[3.5rem] lg:text-[4rem]">
                <span className="landing-glow-word">
                  {HERO_TITLE_GREEN.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
                <span className="text-white">
                  {HERO_TITLE_WHITE.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </h1>
              <p className="landing-body-muted mt-6 max-w-md text-[0.95rem] font-light leading-relaxed md:text-base">
                {HERO.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="landing-cta-primary inline-flex items-center gap-1 px-7 py-3 text-sm"
                >
                  {HERO.primaryCta}
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="landing-cta-ghost px-7 py-3 text-sm"
                >
                  Request Demo
                </button>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── PRODUCT SHOWCASE (SN-style framed Mitra UI) ── */}
      <section className="landing-band-violet relative overflow-hidden px-6 py-20 md:py-28">
        <div className="relative z-10 mx-auto max-w-6xl">
          <SectionReveal className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--landing-accent)]">
              Meet Mitra
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-[3.4rem]">
              AI without workflows is just{' '}
              <span className="landing-glow-word">expensive advice</span>
            </h2>
            <p className="landing-body-muted mx-auto mt-5 max-w-xl text-base leading-relaxed">
              Mitra turns intent into ServiceNow delivery — stories, catalogs, flows, tests, and
              go-live packs — with humans in control.
            </p>
          </SectionReveal>

          <SectionReveal className="mt-14 px-2 sm:px-6 md:px-10">
            <LandingMitraProductFrame variant="hero" />
          </SectionReveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="landing-band-dark px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl text-center">
          <SectionReveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--landing-accent)]/80">
              {LIFECYCLE_SECTION.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
              {LIFECYCLE_SECTION.title}
            </h2>
            <p className="landing-body-muted mx-auto mt-5 max-w-2xl text-base leading-relaxed">
              {LIFECYCLE_SECTION.subtitle}
            </p>
          </SectionReveal>
          <div className="mt-12">
            <LandingLifecycleTimeline />
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <LandingIntentJourney />

      {/* ── CHAT IN FRAME ── */}
      <section id="demo" className="landing-band-product border-t border-white/[0.05] px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionReveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--landing-accent)]">
              See Mitra in action
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl">
              {DEMO_SECTION.title}
            </h2>
            <p className="landing-body-muted mt-5 text-base leading-relaxed">
              {DEMO_SECTION.subtitle}
            </p>
            <button
              type="button"
              onClick={onGetStarted}
              className="landing-cta-primary mt-8 inline-flex items-center gap-1 px-7 py-3 text-sm"
            >
              {DEMO_SECTION.primaryCta}
              <ChevronRight className="h-4 w-4" />
            </button>
          </SectionReveal>

          <SectionReveal>
            <div className="landing-mitra-frame relative">
              <div
                className="pointer-events-none absolute inset-[-6%] rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(98,216,78,0.14),transparent_70%)] blur-xl"
                aria-hidden
              />
              <div className="landing-mitra-frame-shell relative overflow-hidden border-[3px] border-[#1a1f24] bg-[#f3f5f7] p-3 md:p-4">
                <LandingHeroChatDemo isLight />
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── ECOSYSTEM ── */}
      <LandingAnimatedBeam />

      {/* ── FINAL CTA ── */}
      <section id="cta" className="landing-band-dark relative overflow-hidden border-t border-white/[0.05] px-6 py-24 md:py-28">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_50%_80%,rgba(98,216,78,0.16),transparent_70%)]"
          aria-hidden
        />
        <SectionReveal className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-[3.6rem]">
            Ready to implement <span className="landing-glow-word">faster</span>?
          </h2>
          <p className="landing-body-muted mx-auto mt-5 max-w-xl text-base leading-relaxed">
            Let IlluminAIte turn your ServiceNow requirements into deployment-ready delivery.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onGetStarted}
              className="landing-cta-primary h-12 min-w-[170px] px-8 text-sm"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="landing-cta-ghost h-12 px-8 text-sm"
            >
              Request Demo
            </button>
          </div>
        </SectionReveal>
      </section>

      <LandingFooterReveal onGetStarted={onGetStarted} />
    </div>
  );
}
