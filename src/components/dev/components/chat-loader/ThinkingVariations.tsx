import { useEffect, useState } from 'react';
import MitraThinkingIndicator, { THINKING_STEPS as MITRA_THINKING_STEPS } from '../../../MitraThinkingIndicator';
import { cn } from '@/lib/utils';
import './thinking-variations.css';

export const THINKING_STEPS = MITRA_THINKING_STEPS.architect;

function useThinkingStepCycle(stepCount: number, intervalMs = 1600) {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFading(false);
  }, [stepCount]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFading(true);
      window.setTimeout(() => {
        setIndex((current) => (current < stepCount - 1 ? current + 1 : current));
        setFading(false);
      }, 220);
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [stepCount, intervalMs]);

  return { index, fading };
}

type PreviewTheme = 'dark' | 'light';

function themeClass(theme: PreviewTheme) {
  return theme === 'dark' ? 'mitra-think--dark' : 'mitra-think--light';
}

/** 1. Grid dots — production snake scan */
export function PhaseStreamThinking({ theme }: { theme: PreviewTheme }) {
  return (
    <MitraThinkingIndicator
      theme={theme === 'dark' ? 'dark' : 'light'}
      context="architect"
    />
  );
}

/** 2. Typing dots — short-wait indicator (Slack / iMessage pattern) */
export function TypingDotsThinking({ theme }: { theme: PreviewTheme }) {
  return (
    <div
      className={cn('mitra-think mitra-think--dots', themeClass(theme))}
      role="status"
      aria-live="polite"
      aria-label="Mitra is thinking"
    >
      <span className="mitra-think__dots-label">Mitra is thinking</span>
      <span className="mitra-think__dots" aria-hidden="true">
        <span className="mitra-think__dot" />
        <span className="mitra-think__dot" />
        <span className="mitra-think__dot" />
      </span>
    </div>
  );
}

/** 3. Shimmer label — low-attention living breadcrumb for background tasks */
export function ShimmerThinking({ theme }: { theme: PreviewTheme }) {
  const { index, fading } = useThinkingStepCycle(THINKING_STEPS.length);

  return (
    <div
      className={cn('mitra-think mitra-think--shimmer', themeClass(theme))}
      role="status"
      aria-live="polite"
      aria-label={`Mitra is working: ${THINKING_STEPS[index]}`}
    >
      <span className="mitra-think__shimmer-dot" aria-hidden="true" />
      <p
        className={cn(
          'mitra-think__shimmer-text',
          fading && 'opacity-70',
        )}
      >
        {THINKING_STEPS[index]}...
      </p>
    </div>
  );
}

/** 4. Glow pulse — single breathing orb, ultra-minimal */
export function GlowPulseThinking({ theme }: { theme: PreviewTheme }) {
  return (
    <div
      className={cn('mitra-think mitra-think--glow', themeClass(theme))}
      role="status"
      aria-live="polite"
      aria-label="Thinking"
    >
      <span className="mitra-think__glow-orb-wrap" aria-hidden="true">
        <span className="mitra-think__glow-halo" />
        <span className="mitra-think__glow-orb" />
      </span>
      <span className="mitra-think__glow-label">Thinking</span>
    </div>
  );
}