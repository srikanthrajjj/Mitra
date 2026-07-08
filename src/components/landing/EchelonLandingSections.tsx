import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, ChevronDown, ChevronRight, Quote, Shield, Mail,
} from 'lucide-react';
import { IlluminaiteLogo } from '../IlluminaiteLogo';
import { LandingHeroChatDemo } from '../LandingHeroChatDemo';
import { Button } from '../ui/button';
import Threads from '../ui/Threads';
import { cn } from '@/lib/utils';
import { LandingLifecycleTimeline } from './LandingLifecycleTimeline';
import { LandingIntentJourney } from './LandingIntentJourney';
import { LandingEcosystemOrbit } from './LandingEcosystemOrbit';
import {
  NAV_LINKS,
  HERO,
  LIFECYCLE_SECTION,
  CAPABILITIES_SECTION,
  CAPABILITIES,
  AI_AGENTS_SECTION,
  AI_AGENT_FEATURES,
  INDUSTRY_SECTION,
  INDUSTRY_SOLUTIONS,
  DEMO_SECTION,
  CAPABILITY_TAGS,
  SECURITY_SECTION,
  SECURITY_ITEMS,
  FINAL_CTA,
} from './echelonLandingData';

interface LandingNavProps {
  onGetStarted: () => void;
  onSignIn?: () => void;
  version?: 'v2' | 'v3';
  setVersion?: (v: 'v2' | 'v3') => void;
}

export function LandingNav({ onGetStarted, onSignIn, version, setVersion }: LandingNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <nav className="landing-echelon-nav relative z-50 mx-auto grid w-full max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-4 md:py-5">
      <IlluminaiteLogo className="h-[26px] w-auto" />
      <div className="hidden items-center justify-center gap-6 lg:flex">
        {NAV_LINKS.map((link) => {
          if (link.children) {
            const isOpen = openDropdown === link.label;
            return (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-white/80 transition-colors hover:text-[var(--landing-accent)]"
                  aria-expanded={isOpen}
                >
                  {link.label}
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className="absolute left-1/2 top-[calc(100%+10px)] z-50 min-w-[11rem] -translate-x-1/2 rounded-xl border border-white/10 bg-[#0a0c0e]/95 p-1.5 shadow-xl backdrop-blur-md">
                    {link.children.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block rounded-lg px-3 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                'text-[13px] font-medium transition-colors',
                link.accent
                  ? 'text-[var(--landing-accent)] hover:text-[var(--landing-accent)]'
                  : 'text-white/80 hover:text-[var(--landing-accent)]',
              )}
            >
              {link.label}
            </a>
          );
        })}
      </div>
      <div className="flex items-center gap-2.5">
        {setVersion && (
          <div className="mr-1 hidden items-center rounded-full border border-white/10 bg-white/[0.03] p-0.5 sm:flex">
            {(['v2', 'v3'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVersion(v)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all',
                  version === v ? 'bg-[var(--landing-accent)] text-black' : 'text-white/40 hover:text-white/70',
                )}
              >
                {v}
              </button>
            ))}
          </div>
        )}
        {onSignIn && (
          <button
            type="button"
            onClick={onSignIn}
            className="hidden rounded-full border border-white/20 px-4 py-2 text-[13px] font-medium text-white/80 transition-colors hover:border-white/35 hover:text-white sm:inline-flex"
          >
            Sign in
          </button>
        )}
        <button
          type="button"
          onClick={onGetStarted}
          className="rounded-full bg-[var(--landing-accent)] px-4 py-2 text-[13px] font-semibold text-black transition-opacity hover:opacity-90"
        >
          {HERO.secondaryCta}
        </button>
      </div>
    </nav>
  );
}

interface LandingHeroEchelonProps {
  onGetStarted: () => void;
}

export function LandingHeroEchelon({ onGetStarted }: LandingHeroEchelonProps) {
  return (
    <section className="landing-echelon-hero relative flex min-h-[calc(100vh-88px)] flex-1 flex-col items-center justify-center px-6 pb-14 pt-8 text-center md:min-h-[calc(100vh-96px)] md:pb-18 md:pt-10">
      <h1 className="mx-auto max-w-4xl font-display text-[2rem] font-medium leading-[1.15] tracking-tight text-white md:text-[2.75rem] lg:text-[3.25rem]">
        {HERO.title}
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-white/55 md:mt-7 md:text-lg">
        {HERO.subtitle}
      </p>

      <div className="mt-8 w-full max-w-lg">
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-black/60 px-2 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(0,255,102,0.08)]">
          <div className="pl-3">
            <Mail className="h-4 w-4 text-white/40" />
          </div>
          <input
            type="email"
            placeholder="you@company.com"
            className="flex-1 bg-transparent px-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--landing-accent)] px-6 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            Try IlluminAIte
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-[var(--landing-accent)]">
          Free trial - connect to your PDI in 5 minutes.
        </p>
      </div>
    </section>
  );
}

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-[#050608] px-6 py-18 md:py-26">
      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <p className="mt-14 text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--landing-accent)]/70 md:mt-16">
          {LIFECYCLE_SECTION.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-2xl font-medium text-white md:text-4xl">{LIFECYCLE_SECTION.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/45">{LIFECYCLE_SECTION.subtitle}</p>

        <LandingLifecycleTimeline />
      </div>
    </section>
  );
}

export function LandingPlatformSection() {
  return <LandingIntentJourney />;
}

export function LandingCapabilities() {
  return (
    <section className="bg-[#06080a] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="font-display text-2xl font-medium text-white md:text-4xl">{CAPABILITIES_SECTION.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/45">{CAPABILITIES_SECTION.subtitle}</p>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.title}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-left"
            >
              <h3 className="text-base font-semibold text-white">{cap.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/45">{cap.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingLandscape() {
  return <LandingEcosystemOrbit />;
}

export function LandingAiAgents() {
  return (
    <section className="bg-[#06080a] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="font-display text-2xl font-medium text-white md:text-4xl">{AI_AGENTS_SECTION.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-white/45">{AI_AGENTS_SECTION.subtitle}</p>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AI_AGENT_FEATURES.map((feat) => (
            <div key={feat.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left">
              <h3 className="text-sm font-semibold text-white">{feat.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/45">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface LandingIndustrySolutionsProps {
  activeId: string;
  onSelect: (id: string) => void;
}

export function LandingIndustrySolutions({ activeId, onSelect }: LandingIndustrySolutionsProps) {
  const active = INDUSTRY_SOLUTIONS.find((s) => s.id === activeId) ?? INDUSTRY_SOLUTIONS[0];

  return (
    <section id="industries" className="bg-[#030508] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-2xl font-medium text-white md:text-4xl">{INDUSTRY_SECTION.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-white/40">{INDUSTRY_SECTION.subtitle}</p>

        <div className="mb-8 mt-10 flex flex-wrap justify-center gap-4">
          {INDUSTRY_SOLUTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={cn(
                'rounded-full border px-5 py-2 text-sm font-semibold transition-all',
                activeId === s.id
                  ? 'border-white/25 bg-white/5 text-white'
                  : 'border-transparent text-white/30 hover:text-white/55',
              )}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="landing-testimonial-card overflow-hidden rounded-[2rem] bg-[#f8f6f1] p-8 md:p-12">
          <Quote className="mb-4 h-7 w-7 text-[var(--landing-accent-deep)]" />
          <h3 className="text-xl font-semibold text-black">{active.name}</h3>
          <p className="mt-2 text-[10px] font-mono uppercase tracking-wider text-black/40">Products: {active.products}</p>
          <p className="mt-4 text-base font-light leading-relaxed text-black/75">{active.desc}</p>
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm italic text-white/40">{INDUSTRY_SECTION.closing}</p>
      </div>
    </section>
  );
}

interface LandingInstanceDemoProps {
  onGetStarted: () => void;
}

export function LandingInstanceDemo({ onGetStarted }: LandingInstanceDemoProps) {
  return (
    <section id="demo" className="border-t border-white/[0.04] bg-[#030508] px-6 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-medium leading-snug text-white md:text-4xl">{DEMO_SECTION.title}</h2>
          <p className="mt-6 text-sm leading-relaxed text-white/55">{DEMO_SECTION.subtitle}</p>
          <button
            type="button"
            onClick={onGetStarted}
            className="mt-8 inline-flex items-center gap-1 rounded-full bg-[var(--landing-accent)] px-6 py-3 text-sm font-semibold text-black"
          >
            {DEMO_SECTION.primaryCta}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="min-w-0">
          <LandingHeroChatDemo />
        </div>
      </div>
    </section>
  );
}

export function LandingCapabilitiesMarquee() {
  const doubled = [...CAPABILITY_TAGS, ...CAPABILITY_TAGS];

  return (
    <section id="capabilities" className="overflow-hidden border-t border-white/[0.04] bg-[#06080a] py-16">
      <div className="landing-marquee">
        <div className="landing-marquee-track">
          {doubled.map((tag, i) => (
            <span key={`${tag}-${i}`} className="landing-marquee-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingSecurity() {
  return (
    <section className="bg-[#030508] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--landing-accent)]">{SECURITY_SECTION.eyebrow}</p>
            <h2 className="mt-3 font-display text-2xl font-medium text-white md:text-4xl">{SECURITY_SECTION.title}</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/45">{SECURITY_SECTION.subtitle}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SECURITY_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <Shield className="h-4 w-4 shrink-0 text-[var(--landing-accent)]" />
                <span className="text-sm text-white/65">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface LandingFinalCtaProps {
  onGetStarted: () => void;
}

export function LandingFinalCta({ onGetStarted }: LandingFinalCtaProps) {
  return (
    <section id="cta" className="relative z-10 overflow-hidden border-t border-white/[0.04] bg-[#040608] px-6 py-20 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_36%_28%_at_50%_78%,rgba(139,234,60,0.08),transparent_74%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[260px] opacity-[0.08]" aria-hidden>
        <Threads color={[0.545, 0.918, 0.235]} amplitude={0.5} distance={0} enableMouseInteraction={false} />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[260px] bg-gradient-to-t from-[#040608] via-transparent to-[#040608]/90"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-3xl text-center"
      >
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto font-display text-3xl font-medium leading-[1.08] tracking-tight text-white md:text-5xl lg:text-[3.9rem]"
        >
          Ready to implement faster?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/45 md:text-base"
        >
          Let IlluminAIte turn your ServiceNow requirements into deployment-ready delivery.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex items-center justify-center"
        >
          <Button
            size="lg"
            className="h-12 min-w-[170px] rounded-full bg-white px-8 text-sm font-semibold text-black shadow-[0_10px_35px_rgba(255,255,255,0.08)] hover:bg-white/95"
            onClick={onGetStarted}
          >
            Get Started
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Legacy exports kept for any stale imports — map to new sections
export const LandingTestimonials = LandingIndustrySolutions;
export const LandingFrustrations = LandingAiAgents;
export const LandingTeamRoles = LandingCapabilities;
export { LandingFooterReveal as LandingFooter } from './LandingFooterReveal';
