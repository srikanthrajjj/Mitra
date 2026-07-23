import { ChevronRight } from 'lucide-react';
import { READY_CTA_SECTION } from './echelonLandingData';
import { LandingTextLine, LandingTextReveal } from './LandingTextReveal';

interface LandingV1ReadyCtaProps {
  onGetStarted: () => void;
}

/** V1 closing CTA — sits below the demo section */
export function LandingV1ReadyCta({ onGetStarted }: LandingV1ReadyCtaProps) {
  return (
    <section
      id="ready"
      className="landing-section-surface relative border-t border-white/[0.04] px-6 py-20 md:py-28"
      aria-labelledby="ready-cta-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,rgba(26,175,0,0.1),transparent_70%)]"
        aria-hidden
      />

      <LandingTextReveal className="relative mx-auto max-w-3xl text-center">
        <LandingTextLine className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--landing-accent)]">
          {READY_CTA_SECTION.eyebrow}
        </LandingTextLine>
        <LandingTextLine as="h2" className="landing-v1-section-title mt-4">
          <span id="ready-cta-heading">
            {READY_CTA_SECTION.titleLead}{' '}
            <span className="landing-v1-accent-word">{READY_CTA_SECTION.titleAccent}</span>
          </span>
        </LandingTextLine>
        <LandingTextLine
          as="p"
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/55"
        >
          {READY_CTA_SECTION.subtitle}
        </LandingTextLine>

        <LandingTextLine className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onGetStarted}
            className="landing-cta-v1-primary inline-flex items-center gap-1.5 px-8 py-3.5 text-sm"
          >
            {READY_CTA_SECTION.primaryCta}
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onGetStarted}
            className="landing-cta-v1-ghost px-7 py-3.5 text-sm"
          >
            {READY_CTA_SECTION.secondaryCta}
          </button>
        </LandingTextLine>
      </LandingTextReveal>
    </section>
  );
}
