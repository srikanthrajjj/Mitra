import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, ArrowLeft, X, Loader2 } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';
import {
  ONBOARDING_TOUR_STEPS,
  tourTargetSelector,
  type OnboardingTourStep,
  type TourPlacement,
} from '../constants/onboardingTour';

interface OnboardingTourProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  onPrepareStep?: (step: OnboardingTourStep) => void;
}

type Coords = { top: number; left: number; width: number; height: number };

const PANEL_WIDTH = 400;
const PANEL_HEIGHT_ESTIMATE = 260;
const SPOTLIGHT_PAD = 8;

function parseTourContent(text: string, isDark: boolean) {
  const parts = text.split('**');
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      return (
        <strong
          key={idx}
          className={`font-semibold ${isDark ? 'text-illuminate-text' : 'text-brand-green'}`}
        >
          {part}
        </strong>
      );
    }
    return part;
  });
}

function clampPanelPosition(
  placement: TourPlacement,
  coords: Coords,
  spacing: number,
): { style: React.CSSProperties; placementClass: string } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 16;

  let left = coords.left + coords.width / 2;
  let top = coords.top + coords.height / 2;
  let placementClass = 'fixed -translate-x-1/2 -translate-y-1/2';
  let resolvedPlacement = placement;

  if (placement === 'right' && left + spacing + PANEL_WIDTH > vw - margin) {
    resolvedPlacement = 'left';
  } else if (placement === 'left' && left - spacing - PANEL_WIDTH < margin) {
    resolvedPlacement = 'right';
  } else if (placement === 'bottom' && top + coords.height / 2 + spacing + PANEL_HEIGHT_ESTIMATE > vh - margin) {
    resolvedPlacement = 'top';
  } else if (placement === 'top' && top - coords.height / 2 - spacing - PANEL_HEIGHT_ESTIMATE < margin) {
    resolvedPlacement = 'bottom';
  }

  switch (resolvedPlacement) {
    case 'top':
      left = coords.left + coords.width / 2;
      top = coords.top - spacing;
      placementClass = 'fixed -translate-x-1/2 -translate-y-full';
      break;
    case 'bottom':
      left = coords.left + coords.width / 2;
      top = coords.top + coords.height + spacing;
      placementClass = 'fixed -translate-x-1/2';
      break;
    case 'left':
      left = coords.left - spacing;
      top = coords.top + coords.height / 2;
      placementClass = 'fixed -translate-x-full -translate-y-1/2';
      break;
    case 'right':
      left = coords.left + coords.width + spacing;
      top = coords.top + coords.height / 2;
      placementClass = 'fixed -translate-y-1/2';
      break;
    default:
      left = vw / 2;
      top = vh / 2;
      placementClass = 'fixed -translate-x-1/2 -translate-y-1/2';
      break;
  }

  const clampedLeft = Math.min(Math.max(left, margin + PANEL_WIDTH / 2), vw - margin - PANEL_WIDTH / 2);
  const clampedTop = Math.min(Math.max(top, margin + 40), vh - margin - 40);

  return {
    style: { left: clampedLeft, top: clampedTop },
    placementClass,
  };
}

export default function OnboardingTour({
  theme,
  isOpen,
  onClose,
  onPrepareStep,
}: OnboardingTourProps) {
  const isDark = isDarkTheme(theme);
  const steps = ONBOARDING_TOUR_STEPS;
  const [stepIndex, setStepIndex] = useState(0);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [targetReady, setTargetReady] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const currentStep = steps[stepIndex];
  const selector = tourTargetSelector(currentStep.target);

  const updateTargetPosition = useCallback(() => {
    if (!selector) {
      setCoords(null);
      setTargetReady(true);
      return;
    }

    const el = document.querySelector(selector);
    if (!el) {
      setCoords(null);
      setTargetReady(false);
      return;
    }

    el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setCoords(null);
      setTargetReady(false);
      return;
    }

    setCoords({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setTargetReady(true);

    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = new ResizeObserver(() => {
      const next = el.getBoundingClientRect();
      setCoords({
        top: next.top,
        left: next.left,
        width: next.width,
        height: next.height,
      });
    });
    resizeObserverRef.current.observe(el);
  }, [selector]);

  useEffect(() => {
    if (!isOpen) return;
    setStepIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    onPrepareStep?.(currentStep);
    setTargetReady(!currentStep.target);
    setCoords(null);

    let attempts = 0;
    const maxAttempts = 20;

    const tryLocate = () => {
      attempts += 1;
      if (!selector) {
        updateTargetPosition();
        return;
      }

      const el = document.querySelector(selector);
      if (el) {
        updateTargetPosition();
        return;
      }

      if (attempts < maxAttempts) {
        window.setTimeout(tryLocate, 120);
      } else {
        setTargetReady(false);
      }
    };

    const startTimer = window.setTimeout(tryLocate, 180);

    return () => {
      window.clearTimeout(startTimer);
      resizeObserverRef.current?.disconnect();
    };
  }, [isOpen, stepIndex, currentStep, onPrepareStep, selector, updateTargetPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const onLayoutChange = () => updateTargetPosition();
    window.addEventListener('resize', onLayoutChange);
    window.addEventListener('scroll', onLayoutChange, true);

    return () => {
      window.removeEventListener('resize', onLayoutChange);
      window.removeEventListener('scroll', onLayoutChange, true);
    };
  }, [isOpen, updateTargetPosition]);

  if (!isOpen) return null;

  const handleComplete = () => {
    localStorage.setItem('mitra_tour_completed', 'true');
    onClose();
  };

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const spacing = 20;
  const hasSpotlight = Boolean(coords && targetReady);
  const { style: tooltipStyle, placementClass } = hasSpotlight && coords
    ? clampPanelPosition(currentStep.placement, coords, spacing)
    : { style: { left: '50%', top: '50%' } as React.CSSProperties, placementClass: 'fixed -translate-x-1/2 -translate-y-1/2' };

  const spotlightStyle = hasSpotlight && coords
    ? {
        top: coords.top - SPOTLIGHT_PAD,
        left: coords.left - SPOTLIGHT_PAD,
        width: coords.width + SPOTLIGHT_PAD * 2,
        height: coords.height + SPOTLIGHT_PAD * 2,
      }
    : null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-sans pointer-events-none select-none">
      {!hasSpotlight && (
        <div className="vr-tour-backdrop pointer-events-auto" aria-hidden />
      )}

      {hasSpotlight && (
        <div className="absolute inset-0 pointer-events-auto" aria-hidden />
      )}

      {spotlightStyle && (
        <div
          className={cn(
            'vr-tour-spotlight fixed pointer-events-none z-[101] transition-all duration-300',
            isDark ? '' : 'vr-tour-spotlight--light',
          )}
          style={spotlightStyle}
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mitra-tour-title"
        className={cn(
          'vr-tour-panel w-[min(400px,calc(100vw-2rem))] rounded-2xl p-5 pointer-events-auto z-[102] transition-all duration-300',
          placementClass,
          isDark
            ? 'glass-panel-dark text-illuminate-text backdrop-blur-md'
            : 'bg-card/95 border border-border text-foreground backdrop-blur-md shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)]',
        )}
        style={tooltipStyle}
      >
        <div>
          <div className="mb-1 flex items-start justify-between">
            <p
              className={cn(
                'text-[9px] font-mono uppercase tracking-[0.18em]',
                isDark ? 'text-slate-500' : 'text-muted-foreground',
              )}
            >
              Step {stepIndex + 1} of {steps.length}
            </p>
            <button
              type="button"
              onClick={handleComplete}
              className={cn(
                'cursor-pointer rounded-lg p-1.5 transition-all duration-200',
                isDark
                  ? 'text-slate-500 hover:bg-white/[0.04] hover:text-illuminate-text'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
              aria-label="Close tour"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <h3
            id="mitra-tour-title"
            className={cn(
              'mb-3 pr-6 font-display text-[15px] font-semibold leading-snug tracking-tight',
              isDark ? 'text-illuminate-text' : 'text-foreground',
            )}
          >
            {currentStep.title}
          </h3>

          <p
            className={cn(
              'mb-5 font-sans text-[12.5px] font-normal leading-relaxed',
              isDark ? 'text-slate-400' : 'text-muted-foreground',
            )}
          >
            {parseTourContent(currentStep.content, isDark)}
          </p>

          {currentStep.target && !targetReady && (
            <div
              className={cn(
                'mb-4 flex items-center gap-2 text-[11px]',
                isDark ? 'text-slate-500' : 'text-muted-foreground',
              )}
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              <span>Locating this part of the workspace…</span>
            </div>
          )}

          <div
            className={cn(
              'flex items-center justify-between border-t pt-4',
              isDark ? 'border-white/[0.06]' : 'border-border',
            )}
          >
            <div className="flex items-center gap-1.5">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  title={`Step ${idx + 1}: ${step.title}`}
                  className={cn(
                    'vr-tour-step-node',
                    idx === stepIndex && 'vr-tour-step-node--active',
                    idx < stepIndex && 'vr-tour-step-node--done',
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleComplete}
                className={cn(
                  'cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold tracking-wide transition-colors',
                  isDark ? 'text-slate-500 hover:text-slate-300' : 'text-muted-foreground hover:text-slate-600',
                )}
              >
                Skip
              </button>

              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-secondary flex cursor-pointer items-center gap-1.5 px-4 py-2 text-xs transition-all duration-200"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={Boolean(currentStep.target) && !targetReady}
                className="btn-cta flex cursor-pointer items-center gap-1.5 px-4 py-2 text-xs transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {stepIndex === steps.length - 1 ? (
                  'Finish'
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
