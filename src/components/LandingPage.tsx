import LightRays from './LightRays';
import { motion } from 'motion/react';
import {
  LandingNav,
  LandingHeroEchelon,
  LandingHowItWorks,
  LandingPlatformSection,
  LandingInstanceDemo,
  LandingFinalCta,
} from './landing/EchelonLandingSections';
import { LandingAnimatedBeam } from './landing/LandingAnimatedBeam';
import { LandingFooterReveal } from './landing/LandingFooterReveal';

function LandingScrollReveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface LandingPageProps {
  version?: 'v2' | 'v3';
  setVersion?: (v: 'v2' | 'v3') => void;
  onGetStarted: () => void;
  onSignIn?: () => void;
}

export default function LandingPage({
  version = 'v2',
  setVersion,
  onGetStarted,
  onSignIn,
}: LandingPageProps) {
  return (
    <div className="landing-page landing-echelon landing-echelon-atmosphere overflow-x-hidden text-white antialiased selection:bg-[var(--landing-accent)]/25 selection:text-white">
      <div className="relative z-10">
      <div className="relative flex min-h-screen flex-col">
        <div className="landing-echelon-hero-bg absolute inset-0 overflow-hidden" aria-hidden>
          {version !== 'v3' && (
            <LightRays
              className="landing-hero-light-rays opacity-55"
              raysOrigin="top-center"
              raysColor="#32d74b"
              raysSpeed={1}
              lightSpread={1.2}
              rayLength={2.8}
              pulsating
              fadeDistance={1.5}
              saturation={0.85}
              followMouse
              mouseInfluence={0.35}
              noiseAmount={0}
              distortion={0}
            />
          )}
          <div className="landing-echelon-dot-grid absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--landing-bg)] via-transparent to-[var(--landing-bg)]" />
        </div>

        {version === 'v3' && (
          <div className="relative z-50 border-b border-[var(--landing-accent)]/15 bg-[var(--landing-accent)]/5 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--landing-accent)]">
            Previewing v3 — launching soon
          </div>
        )}

        <LandingNav
          onGetStarted={onGetStarted}
          onSignIn={onSignIn}
        />
        <LandingScrollReveal>
          <LandingHeroEchelon onGetStarted={onGetStarted} />
        </LandingScrollReveal>
      </div>

      <LandingScrollReveal delay={0.04}>
        <LandingHowItWorks />
      </LandingScrollReveal>
      {/* Tall multi-viewport section — no opacity gate (avoids blank scroll gaps) */}
      <LandingPlatformSection />
      <LandingScrollReveal delay={0.04}>
        <LandingAnimatedBeam />
      </LandingScrollReveal>
      <LandingScrollReveal delay={0.06}>
        <LandingInstanceDemo onGetStarted={onGetStarted} />
      </LandingScrollReveal>
      <LandingScrollReveal delay={0.08}>
        <LandingFinalCta onGetStarted={onGetStarted} />
      </LandingScrollReveal>
      </div>
      <LandingFooterReveal onGetStarted={onGetStarted} />
    </div>
  );
}
