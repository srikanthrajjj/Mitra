import { useEffect, useState } from 'react';
import LightRays from './LightRays';
import { motion } from 'motion/react';
import {
  LandingNav,
  LandingHeroEchelon,
  LandingHowItWorks,
  LandingPlatformSection,
  LandingInstanceDemo,
} from './landing/EchelonLandingSections';
import { LandingAnimatedBeam } from './landing/LandingAnimatedBeam';
import { LandingFooterReveal } from './landing/LandingFooterReveal';
import { LandingFloatingAssistant } from './landing/LandingFloatingAssistant';
import { LandingV1ProductShowcase } from './landing/LandingV1ProductShowcase';
import { LandingV1ReadyCta } from './landing/LandingV1ReadyCta';
import { LandingPageV2 } from './landing/LandingPageV2';
import { LandingPageV3 } from './landing/LandingPageV3';
import {
  LandingDesignContext,
  type LandingDesign,
} from './landing/LandingDesignContext';
import { cn } from '@/lib/utils';

const LANDING_DESIGN_KEY = 'mitra_landing_design';

function LandingScrollReveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -6% 0px' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
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
  setVersion: _setVersion,
  onGetStarted,
  onSignIn,
}: LandingPageProps) {
  const [landingDesign, setLandingDesign] = useState<LandingDesign>(() => {
    try {
      const stored = localStorage.getItem(LANDING_DESIGN_KEY);
      if (stored === 'v1' || stored === 'v2' || stored === 'v3') return stored;
      return 'v1';
    } catch {
      return 'v1';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANDING_DESIGN_KEY, landingDesign);
    } catch {
      /* ignore */
    }
  }, [landingDesign]);

  if (landingDesign === 'v3') {
    return (
      <LandingDesignContext.Provider value={landingDesign}>
        <LandingPageV3
          onGetStarted={onGetStarted}
          onSignIn={onSignIn}
        />
      </LandingDesignContext.Provider>
    );
  }

  if (landingDesign === 'v2') {
    return (
      <LandingDesignContext.Provider value={landingDesign}>
        <LandingPageV2
          onGetStarted={onGetStarted}
          onSignIn={onSignIn}
        />
      </LandingDesignContext.Provider>
    );
  }

  return (
    <LandingDesignContext.Provider value={landingDesign}>
      <div
        className={cn(
          'landing-page landing-echelon overflow-x-hidden text-white antialiased selection:bg-[var(--landing-accent)]/25 selection:text-white',
          'landing-design-v1 landing-echelon-atmosphere',
        )}
      >
        <div className="relative z-10 landing-v1-content-curtain">
          <div className="relative flex min-h-screen flex-col">
            <div className="landing-echelon-hero-bg absolute inset-0 overflow-hidden" aria-hidden>
              {version !== 'v3' && (
                <LightRays
                  className="landing-hero-light-rays opacity-45"
                  raysOrigin="top-center"
                  raysColor="#1AAF00"
                  raysSpeed={1}
                  lightSpread={1.2}
                  rayLength={2.8}
                  pulsating
                  fadeDistance={1.5}
                  saturation={0.7}
                  followMouse
                  mouseInfluence={0.35}
                  noiseAmount={0}
                  distortion={0}
                />
              )}
              <div className="landing-echelon-dot-grid absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--landing-bg)] via-transparent to-[var(--landing-bg)]" />
            </div>

            <LandingNav
              onGetStarted={onGetStarted}
              onSignIn={onSignIn}
            />
            <LandingScrollReveal>
              <LandingHeroEchelon onGetStarted={onGetStarted} />
            </LandingScrollReveal>
          </div>

          <LandingScrollReveal delay={0.03}>
            <LandingV1ProductShowcase />
          </LandingScrollReveal>
          <LandingScrollReveal delay={0.04}>
            <LandingHowItWorks />
          </LandingScrollReveal>
          <LandingScrollReveal delay={0.04}>
            <LandingPlatformSection />
          </LandingScrollReveal>
          <LandingScrollReveal delay={0.04}>
            <LandingAnimatedBeam />
          </LandingScrollReveal>
          <LandingScrollReveal delay={0.06}>
            <LandingInstanceDemo onGetStarted={onGetStarted} />
          </LandingScrollReveal>
          <LandingScrollReveal delay={0.07}>
            <LandingV1ReadyCta onGetStarted={onGetStarted} />
          </LandingScrollReveal>
        </div>

        <LandingFooterReveal onGetStarted={onGetStarted} />
        <LandingFloatingAssistant onGetDemo={onGetStarted} />
      </div>
    </LandingDesignContext.Provider>
  );
}
