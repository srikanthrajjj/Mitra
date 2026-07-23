import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, ChevronDown, ChevronRight, Quote, Shield, Mail,
} from 'lucide-react';
import { IlluminaiteLogo } from '../IlluminaiteLogo';
import { LandingHeroChatDemo } from '../LandingHeroChatDemo';
import { cn } from '@/lib/utils';
import { LandingLifecycleTimeline } from './LandingLifecycleTimeline';
import { LandingIntentJourney } from './LandingIntentJourney';
import { LandingEcosystemOrbit } from './LandingEcosystemOrbit';
import { useLandingDesign, type LandingDesign } from './LandingDesignContext';
import {
  NAV_LINKS,
  HERO,
  HERO_STATS,
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
} from './echelonLandingData';

interface LandingNavProps {
  onGetStarted: () => void;
  onSignIn?: () => void;
  landingDesign?: LandingDesign;
}

export function LandingNav({
  onGetStarted,
  onSignIn,
  landingDesign,
}: LandingNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const ctxDesign = useLandingDesign();
  const design = landingDesign ?? ctxDesign;
  const useAccentCta = design === 'v1' || design === 'v2' || design === 'v3';
  const isV1 = design === 'v1';

  const navInner = (
    <nav className="landing-echelon-nav relative z-50 mx-auto flex h-16 w-full max-w-6xl items-center px-6 md:h-[4.25rem]">
      <IlluminaiteLogo className="relative z-10 h-[26px] w-auto shrink-0" />

      <div className="absolute inset-x-0 hidden items-center justify-center gap-6 xl:gap-8 lg:flex">
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
                  className={cn(
                    'inline-flex items-center gap-1 text-[13px] transition-colors',
                    isV1
                      ? 'font-semibold text-white/80 hover:text-brand-green'
                      : 'font-medium text-white/80 hover:text-[var(--landing-accent)]',
                  )}
                  aria-expanded={isOpen}
                >
                  {link.label}
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className="absolute left-1/2 top-[calc(100%+10px)] z-50 min-w-[11rem] -translate-x-1/2 rounded-xl border border-mitra-border bg-mitra-surface/95 p-1.5 shadow-xl backdrop-blur-md">
                    {link.children.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
                'inline-flex items-center text-[13px] transition-colors',
                isV1
                  ? cn(
                      'font-semibold',
                      link.accent
                        ? 'text-brand-green hover:text-brand-green'
                        : 'text-white/80 hover:text-brand-green',
                    )
                  : cn(
                      'font-medium',
                      link.accent
                        ? 'text-[var(--landing-accent)] hover:text-[var(--landing-accent)]'
                        : 'text-white/80 hover:text-[var(--landing-accent)]',
                    ),
              )}
            >
              {link.accent && isV1 && (
                <span
                  className="mr-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green"
                  aria-hidden
                />
              )}
              {link.label}
            </a>
          );
        })}
      </div>

      <div className="relative z-10 ml-auto flex shrink-0 items-center gap-2.5 sm:gap-3">
        {onSignIn && !isV1 && (
          <button
            type="button"
            onClick={onSignIn}
            className="hidden text-[13px] font-semibold text-white transition-colors hover:text-[var(--landing-accent)] md:inline-flex"
          >
            Sign in
          </button>
        )}
        <button
          type="button"
          onClick={onGetStarted}
          className={cn(
            'px-4 py-2 text-[13px] sm:px-5',
            isV1
              ? 'rounded-full bg-card font-semibold text-foreground transition-opacity hover:opacity-90'
              : useAccentCta
                ? 'landing-cta-primary'
                : 'rounded-full bg-card font-semibold text-foreground transition-opacity hover:opacity-90',
          )}
        >
          {HERO.secondaryCta}
        </button>
      </div>
    </nav>
  );

  if (isV1) {
    return (
      <header className="dark relative z-50 w-full bg-transparent">
        {navInner}
      </header>
    );
  }

  return navInner;
}

interface LandingHeroEchelonProps {
  onGetStarted: () => void;
}

export function LandingHeroEchelon({ onGetStarted }: LandingHeroEchelonProps) {
  const design = useLandingDesign();
  const isV2 = design === 'v2';
  const isV1 = design === 'v1';
  const [titleLead, titleRest] = HERO.title.includes(',')
    ? [HERO.title.slice(0, HERO.title.indexOf(',') + 1), HERO.title.slice(HERO.title.indexOf(',') + 1).trim()]
    : [HERO.title, ''];

  return (
    <section
      id="home"
      className={cn(
        'landing-echelon-hero landing-band-hero relative flex min-h-[calc(100vh-88px)] flex-1 flex-col px-6 pb-14 pt-8 md:min-h-[calc(100vh-96px)] md:pb-18 md:pt-10',
        isV2 ? 'items-stretch justify-center' : 'items-center justify-center text-center',
      )}
    >
      <div
        className={cn(
          'mx-auto w-full',
          isV1 ? 'max-w-7xl' : 'max-w-6xl',
          isV2 && 'grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14',
        )}
      >
        <div className={cn(!isV2 && 'text-center')}>
          <h1
            className={cn(
              'font-display tracking-tight text-white',
              isV2
                ? 'max-w-3xl text-[2.35rem] font-bold leading-[1.08] md:text-[3.25rem] lg:text-[3.75rem]'
                : isV1
                  ? 'mx-auto max-w-6xl text-[2.5rem] font-bold leading-[1.06] sm:text-[3rem] md:text-[3.75rem] lg:max-w-7xl lg:text-[4.25rem]'
                  : 'mx-auto max-w-4xl text-[2rem] font-medium leading-[1.15] md:text-[2.75rem] lg:text-[3.25rem]',
            )}
          >
            {isV2 || isV1 ? (
              <>
                {isV1 ? (
                  <>
                    <span className="block text-balance">AI-Powered ServiceNow Implementations,</span>
                    <span className="block text-balance">Industry Specific Outcomes.</span>
                  </>
                ) : (
                  <>
                    <span className="landing-glow-word">{titleLead}</span>
                    {titleRest ? (
                      <>
                        <br className="hidden sm:block" />
                        <span className="text-white"> {titleRest}</span>
                      </>
                    ) : null}
                  </>
                )}
              </>
            ) : (
              HERO.title
            )}
          </h1>

          {!isV2 && !isV1 && (
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-[var(--landing-muted)] md:mt-7 md:text-lg">
              {HERO.subtitle}
            </p>
          )}

          {isV1 && (
            <p className="mx-auto mt-5 max-w-2xl text-base font-semibold text-white md:mt-6 md:text-lg lg:max-w-3xl">
              Design, develop, test, and deploy ServiceNow — with AI.
            </p>
          )}
        </div>

        {isV2 && (
          <div className="lg:pb-2">
            <p className="landing-body-muted max-w-md text-base font-light leading-relaxed md:text-lg">
              {HERO.subtitle}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onGetStarted}
                className="landing-cta-primary inline-flex items-center gap-1 px-6 py-2.5 text-sm"
              >
                {HERO.primaryCta}
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onGetStarted}
                className="landing-cta-ghost px-6 py-2.5 text-sm"
              >
                {HERO.secondaryCta}
              </button>
            </div>
          </div>
        )}
      </div>

      {isV1 ? (
        <div className="mx-auto mt-12 flex w-full max-w-4xl flex-wrap items-end justify-center gap-12 sm:gap-16 md:mt-16 lg:max-w-5xl">
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="landing-stat-analytics font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-[3.25rem]">
                {stat.target}
                {stat.suffix}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={cn(
            'mx-auto mt-10 grid w-full max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6',
            isV2 && 'mt-14 max-w-6xl gap-4 sm:gap-4',
          )}
        >
          {HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className={cn(isV2 ? 'landing-stat-card text-left' : 'text-center')}
            >
              <p
                className={cn(
                  'font-display tracking-tight md:text-4xl',
                  isV2 ? 'landing-stat-value text-3xl font-bold' : 'text-3xl font-semibold text-[var(--landing-accent)]',
                )}
              >
                {stat.target}
                {stat.suffix}
              </p>
              <p className="mt-1.5 text-sm font-medium text-white">{stat.label}</p>
              <p className={cn('mt-1 text-xs leading-relaxed', isV2 ? 'landing-body-muted opacity-80' : 'text-white/50')}>
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {isV1 ? (
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 md:mt-14">
          <button
            type="button"
            onClick={onGetStarted}
            className="landing-cta-v1-primary inline-flex items-center gap-1.5 px-8 py-3.5 text-sm"
          >
            Try IlluminAIte
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : !isV2 ? (
        <div className="mt-10 w-full max-w-lg">
          <div className="landing-email-pill flex items-center gap-2 px-2 py-2">
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
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              Try IlluminAIte
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-[var(--landing-accent)]">
            Free trial - connect to your PDI in 5 minutes.
          </p>
        </div>
      ) : null}
    </section>
  );
}

export function LandingHowItWorks() {
  const design = useLandingDesign();
  const isV1 = design === 'v1';
  const isV2 = design === 'v2';

  return (
    <section
      id="how-it-works"
      className={cn(
        'relative overflow-hidden px-6 py-18 md:py-26',
        isV2 ? 'landing-band-dark' : 'landing-section-surface',
      )}
    >
      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <p className="mt-14 text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--landing-accent)]/70 md:mt-16">
          {LIFECYCLE_SECTION.eyebrow}
        </p>
        <h2
          className={cn(
            'mt-3 font-display text-white',
            isV1 && 'landing-v1-section-title',
            isV2 && 'text-2xl font-bold md:text-[2.75rem]',
            !isV1 && !isV2 && 'text-2xl font-medium md:text-4xl',
          )}
        >
          {LIFECYCLE_SECTION.title}
        </h2>
        <p
          className={cn(
            'mx-auto mt-4 max-w-2xl text-sm leading-relaxed',
            isV2 ? 'landing-body-muted' : 'text-white/45',
          )}
        >
          {LIFECYCLE_SECTION.subtitle}
        </p>

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
    <section className="landing-section-surface-elevated px-6 py-20 md:py-28">
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
    <section className="landing-section-surface-elevated px-6 py-20 md:py-28">
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
    <section id="industries" className="landing-section-surface px-6 py-16 md:py-20">
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
  const design = useLandingDesign();
  const isV1 = design === 'v1';
  const isV2 = design === 'v2';

  return (
    <section
      id="demo"
      className={cn(
        'border-t border-white/[0.04] px-6 py-20 md:py-28',
        isV2 ? 'landing-band-product' : 'landing-section-surface',
      )}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <h2
            className={cn(
              'font-display text-white',
              isV1 && 'landing-v1-section-title',
              isV2 && 'text-2xl font-bold leading-snug md:text-[2.75rem]',
              !isV1 && !isV2 && 'text-2xl font-medium leading-snug md:text-4xl',
            )}
          >
            {DEMO_SECTION.title}
          </h2>
          <p className={cn('mt-6 text-sm leading-relaxed', isV2 ? 'landing-body-muted' : 'text-white/55')}>
            {DEMO_SECTION.subtitle}
          </p>
          <button
            type="button"
            onClick={onGetStarted}
            className={cn(
              'mt-8 inline-flex items-center gap-1 px-6 py-3 text-sm font-semibold',
              isV2
                ? 'landing-cta-primary'
                : 'rounded-full bg-[var(--landing-accent)] text-black',
            )}
          >
            {DEMO_SECTION.primaryCta}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className={cn('min-w-0', isV2 && 'landing-product-shell p-3 md:p-4')}>
          <LandingHeroChatDemo />
        </div>
      </div>
    </section>
  );
}

export function LandingCapabilitiesMarquee() {
  const doubled = [...CAPABILITY_TAGS, ...CAPABILITY_TAGS];

  return (
    <section id="capabilities" className="landing-section-surface-elevated overflow-hidden border-t border-white/[0.04] py-16">
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
    <section className="landing-section-surface px-6 py-20 md:py-28">
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

// Legacy exports kept for any stale imports — map to new sections
export const LandingTestimonials = LandingIndustrySolutions;
export const LandingFrustrations = LandingAiAgents;
export const LandingTeamRoles = LandingCapabilities;
export { LandingFooterReveal as LandingFooter } from './LandingFooterReveal';
