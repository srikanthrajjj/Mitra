import React from 'react';
import { MitraLogo } from './MitraLogo';

interface WelcomeScreenProps {
  onSignIn: () => void;
  onExploreGuest: () => void;
}

export default function WelcomeScreen({ onSignIn, onExploreGuest }: WelcomeScreenProps) {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-mitra-bg relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="relative mb-6 animate-welcome-in welcome-delay-1">
          <div className="absolute inset-0 -m-8 rounded-full bg-white/[0.03] blur-3xl pointer-events-none" aria-hidden />
          <MitraLogo
            alt="Mitra logo"
            className="relative w-40 h-40 md:w-48 md:h-48 select-none"
          />
        </div>

        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight text-illuminate-text mb-10 animate-welcome-in welcome-delay-2">
          Mitra
        </h1>

        <div className="flex flex-col items-center gap-3 w-full max-w-xs animate-welcome-in welcome-delay-3">
          <button
            onClick={onSignIn}
            className="w-full py-3 px-6 text-[14px] font-bold btn-cta transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            Sign in as
          </button>

          <button
            onClick={onExploreGuest}
            className="w-full py-3 px-6 rounded-md text-[14px] font-semibold text-illuminate-muted border border-white/[0.06] bg-mitra-bg/80 hover:bg-mitra-surface hover:text-illuminate-text hover:border-white/[0.1] transition-all duration-300 cursor-pointer"
          >
            Explore as guest
          </button>
        </div>
      </div>
    </div>
  );
}
