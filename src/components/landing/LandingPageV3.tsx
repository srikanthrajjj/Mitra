import { ArrowRight, ChevronRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { LandingFooterReveal } from './LandingFooterReveal';
import { LandingMitraProductFrame } from './LandingMitraProductFrame';
import { LandingNav } from './EchelonLandingSections';
import { LandingIntentToDeploy } from './LandingIntentToDeploy';
import { LandingHeroChatDemo } from '../LandingHeroChatDemo';
import { HERO, HERO_STATS, DEMO_SECTION } from './echelonLandingData';

interface LandingPageV3Props {
  onGetStarted: () => void;
  onSignIn?: () => void;
}

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

const CONTROL_TOWER = [
  {
    title: 'Governed delivery',
    desc: 'Human checkpoints at every promote — stories, flows, and update sets stay auditable.',
  },
  {
    title: 'Instance-aware AI',
    desc: 'Mitra grounds builds in your ServiceNow patterns, CMDB, and industry playbooks.',
  },
  {
    title: 'Go-live packs',
    desc: 'Tests, docs, and release notes ship with the build — not as an afterthought.',
  },
] as const;

/** IlluminAIte-reference V3 landing — flat type, split hero, SN-style product bands. */
export function LandingPageV3({
  onGetStarted,
  onSignIn,
}: LandingPageV3Props) {
  return (
    <div className="landing-page landing-echelon landing-design-v3 overflow-x-hidden text-white antialiased selection:bg-[var(--landing-accent)]/25 selection:text-white">
      <LandingNav
        onGetStarted={onGetStarted}
        onSignIn={onSignIn}
      />

      {/* ── HERO: left copy + stats + white CTA | right intent→deploy panel ── */}
      <section className="relative overflow-hidden pb-16 pt-8 md:pb-24 md:pt-12">
        <div className="landing-echelon-hero-bg absolute inset-0" aria-hidden>
          <div className="landing-echelon-dot-grid absolute inset-0" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <SectionReveal>
              <h1 className="max-w-xl font-display text-[2.35rem] font-bold leading-[1.08] tracking-tight text-white md:text-[3.25rem] lg:text-[3.65rem]">
                {HERO.title}
              </h1>
              <p className="landing-body-muted mt-5 max-w-lg text-base font-normal leading-relaxed md:text-[1.05rem]">
                {HERO.subtitle}
              </p>

              <div className="mt-10 grid gap-8 border-t border-white/[0.08] pt-8 sm:grid-cols-3 sm:gap-6">
                {HERO_STATS.map((stat) => (
                  <div key={stat.label}>
                    <p className="landing-stat-value font-display text-[2.35rem] font-bold tracking-tight md:text-[2.75rem]">
                      {stat.target}
                      {stat.suffix === '×' ? 'x' : stat.suffix}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-white">{stat.label}</p>
                    <p className="landing-body-muted mt-1.5 text-xs leading-relaxed">{stat.desc}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={onGetStarted}
                className="landing-cta-white mt-10 inline-flex items-center gap-1.5 rounded-full px-8 py-3 text-sm font-semibold"
              >
                {HERO.primaryCta}
                <ChevronRight className="h-4 w-4" />
              </button>
            </SectionReveal>

            <SectionReveal>
              <LandingIntentToDeploy />
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ── SN mid: light product frame on dark/violet band ── */}
      <section className="landing-band-violet relative overflow-hidden px-6 py-20 md:py-28">
        <div className="relative z-10 mx-auto max-w-6xl">
          <SectionReveal className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--landing-accent)]">
              Meet Mitra
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-[3.35rem]">
              Enterprise ServiceNow delivery, framed for control
            </h2>
            <p className="landing-body-muted mx-auto mt-5 max-w-xl text-base leading-relaxed">
              A bordered workspace with floating delivery cards — intent becomes stories, catalogs,
              flows, and go-live packs with humans in the loop.
            </p>
          </SectionReveal>

          <SectionReveal className="mt-14 px-2 sm:px-6 md:px-10">
            <LandingMitraProductFrame variant="hero" />
          </SectionReveal>
        </div>
      </section>

      {/* ── Dual-CTA control tower (SN.com quality band) ── */}
      <section id="platform" className="landing-band-elevated border-y border-white/[0.05] px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <SectionReveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--landing-accent)]">
              Control tower
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white md:text-[2.75rem]">
              One surface for architects, owners, and delivery leads
            </h2>
            <p className="landing-body-muted mt-5 text-base leading-relaxed">
              Switch personas without switching tools. Mitra keeps design, build, test, and deploy
              aligned to ServiceNow best practices — industry outcomes included.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onGetStarted}
                className="landing-cta-white inline-flex items-center gap-1.5 rounded-full px-7 py-3 text-sm font-semibold"
              >
                Try IlluminAIte
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onGetStarted}
                className="landing-cta-ghost rounded-full px-7 py-3 text-sm"
              >
                Request Demo
              </button>
            </div>
          </SectionReveal>

          <SectionReveal>
            <ul className="space-y-4">
              {CONTROL_TOWER.map((item) => (
                <li
                  key={item.title}
                  className="landing-v3-tower-card flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
                >
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--landing-accent)]/30 bg-[var(--landing-accent)]/10">
                    <ShieldCheck className="h-5 w-5 text-[var(--landing-accent)]" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-white">{item.title}</p>
                    <p className="landing-body-muted mt-1.5 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionReveal>
        </div>
      </section>

      {/* ── Demo: chat in light product frame ── */}
      <section id="demo" className="landing-band-dark px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionReveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--landing-accent)]">
              See Mitra in action
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl">
              {DEMO_SECTION.title}
            </h2>
            <p className="landing-body-muted mt-5 text-base leading-relaxed">{DEMO_SECTION.subtitle}</p>
            <button
              type="button"
              onClick={onGetStarted}
              className="landing-cta-white mt-8 inline-flex items-center gap-1.5 rounded-full px-7 py-3 text-sm font-semibold"
            >
              {DEMO_SECTION.primaryCta}
              <ChevronRight className="h-4 w-4" />
            </button>
          </SectionReveal>

          <SectionReveal>
            <div className="landing-mitra-frame relative">
              <div
                className="pointer-events-none absolute inset-[-6%] rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(41,255,29,0.12),transparent_70%)] blur-xl"
                aria-hidden
              />
              <div className="landing-mitra-frame-shell relative overflow-hidden border-[3px] border-[#1a1f24] bg-[#f3f5f7] p-3 md:p-4">
                <LandingHeroChatDemo isLight />
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section id="cta" className="landing-band-dark relative overflow-hidden border-t border-white/[0.05] px-6 py-24 md:py-28">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_50%_80%,rgba(41,255,29,0.1),transparent_70%)]"
          aria-hidden
        />
        <SectionReveal className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-[3.5rem]">
            Ready to implement faster?
          </h2>
          <p className="landing-body-muted mx-auto mt-5 max-w-xl text-base leading-relaxed">
            Let IlluminAIte turn your ServiceNow requirements into deployment-ready delivery.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onGetStarted}
              className="landing-cta-white h-12 min-w-[170px] rounded-full px-8 text-sm font-semibold"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="landing-cta-ghost h-12 rounded-full px-8 text-sm"
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
