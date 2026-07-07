import LightRays from './LightRays';
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
    <div className="landing-page landing-echelon overflow-x-hidden bg-[#030508] text-white antialiased selection:bg-[#00ff66]/25 selection:text-white">
      <div className="relative z-10">
      <div className="relative flex min-h-screen flex-col">
        <div className="landing-echelon-hero-bg absolute inset-0 overflow-hidden" aria-hidden>
          {version !== 'v3' && (
            <LightRays
              className="landing-hero-light-rays opacity-60"
              raysOrigin="top-center"
              raysColor="#00ff66"
              raysSpeed={1}
              lightSpread={1.2}
              rayLength={2.8}
              pulsating
              fadeDistance={1.5}
              saturation={0.9}
              followMouse
              mouseInfluence={0.35}
              noiseAmount={0}
              distortion={0}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#030508] via-transparent to-[#030508]" />
        </div>

        {version === 'v3' && (
          <div className="relative z-50 border-b border-[#00ff66]/15 bg-[#00ff66]/5 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-[#00ff66]">
            Previewing v3 — launching soon
          </div>
        )}

        <LandingNav
          onGetStarted={onGetStarted}
          onSignIn={onSignIn}
        />
        <LandingHeroEchelon onGetStarted={onGetStarted} />
      </div>

      <LandingHowItWorks />
      <LandingPlatformSection />
      <LandingAnimatedBeam />
      <LandingInstanceDemo onGetStarted={onGetStarted} />
      <LandingFinalCta onGetStarted={onGetStarted} />
      </div>
      <LandingFooterReveal onGetStarted={onGetStarted} />
    </div>
  );
}
