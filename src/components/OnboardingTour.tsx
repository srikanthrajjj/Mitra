import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';

interface OnboardingTourProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
}

interface Step {
  title: string;
  content: string;
  selector: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export default function OnboardingTour({ theme, isOpen, onClose }: OnboardingTourProps) {
  const isDark = isDarkTheme(theme);
  const [stepIndex, setStepIndex] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const steps: Step[] = [
    {
      title: 'Meet Mitra, Your AI Architect',
      content:
        "Welcome to Mitra! I am your Senior **ServiceNow Enterprise Architect** AI advisor. I'll help you model **database schemas**, inherit from base **task structures**, generate **Client Scripts**, configure **Business Rules**, and apply **SOX/GDPR/HIPAA compliance** frameworks.",
      selector: '',
      placement: 'center',
    },
    {
      title: 'Core Navigation Workspace',
      content:
        'This sidebar is your navigation center. Switch between your **Dashboard** landing view, database **Connections**, and starred **Favourites**. Open chats from the **Folders** section below.',
      selector: '#tour-nav',
      placement: 'right',
    },
    {
      title: 'Quick-Action Launcher',
      content:
        'Start from four paths — **build a new application**, browse **industry templates**, **convert requirements** into a blueprint, or **analyze an existing app**. Tap a demo example to simulate the flow.',
      selector: '#tour-actions',
      placement: 'bottom',
    },
    {
      title: 'AI Prompting & Requirements Upload',
      content:
        'Enter your architectural instructions here, or attach spec sheets using the paperclip button. I will instantly analyze them and design custom **tables, fields, scripts, and workflows**.',
      selector: '#tour-input-bar',
      placement: 'top',
    },
    {
      title: 'ServiceNow Profile & Key Config',
      content:
        'Click your profile details here to manage your settings or configure your **Gemini API Key**. A custom key will increase your query limits and speed up solution generations.',
      selector: '#tour-profile-card',
      placement: 'right',
    },
  ];

  const currentStep = steps[stepIndex];

  const parseTourContent = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return (
          <strong
            key={idx}
            className={`font-semibold ${isDark ? 'text-illuminate-text' : 'text-emerald-700'}`}
          >
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    if (!currentStep.selector) {
      setCoords(null);
      return;
    }

    const updatePosition = () => {
      const el = document.querySelector(currentStep.selector);
      if (el) {
        el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setCoords(null);
      }
    };

    const timer = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [stepIndex, isOpen, currentStep.selector]);

  if (!isOpen) return null;

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

  const handleComplete = () => {
    localStorage.setItem('mitra_tour_completed', 'true');
    onClose();
  };

  let tooltipStyle: React.CSSProperties = {};
  let placementClass = '';

  if (coords) {
    const spacing = 20;
    switch (currentStep.placement) {
      case 'top':
        tooltipStyle = { left: coords.left + coords.width / 2, top: coords.top - spacing };
        placementClass = 'fixed -translate-x-1/2 -translate-y-full';
        break;
      case 'bottom':
        tooltipStyle = { left: coords.left + coords.width / 2, top: coords.top + coords.height + spacing };
        placementClass = 'fixed -translate-x-1/2';
        break;
      case 'left':
        tooltipStyle = { left: coords.left - spacing, top: coords.top + coords.height / 2 };
        placementClass = 'fixed -translate-x-full -translate-y-1/2';
        break;
      case 'right':
        tooltipStyle = { left: coords.left + coords.width + spacing, top: coords.top + coords.height / 2 };
        placementClass = 'fixed -translate-y-1/2';
        break;
      default:
        tooltipStyle = { left: '50%', top: '50%' };
        placementClass = 'fixed -translate-x-1/2 -translate-y-1/2';
        break;
    }
  } else {
    tooltipStyle = { left: '50%', top: '50%' };
    placementClass = 'fixed -translate-x-1/2 -translate-y-1/2';
  }

  const pad = 6;
  const spotlightStyle = coords
    ? {
        top: coords.top - pad,
        left: coords.left - pad,
        width: coords.width + pad * 2,
        height: coords.height + pad * 2,
      }
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans pointer-events-none select-none">
      {!coords && (
        <div className="vr-tour-backdrop pointer-events-auto" onClick={handleComplete}>
          <div className="vr-bg-rays" />
          <div className="vr-bg-stars" />
        </div>
      )}

      {coords && (
        <div className="absolute inset-0 pointer-events-auto" onClick={handleComplete} />
      )}

      {spotlightStyle && (
        <div
          className="vr-tour-spotlight fixed pointer-events-none z-50 transition-all duration-300"
          style={spotlightStyle}
        />
      )}

      <div
        className={`vr-tour-panel w-[340px] md:w-[400px] rounded-2xl p-5 pointer-events-auto z-50 transition-all duration-300 relative ${placementClass} ${
          isDark
            ? 'glass-panel-dark text-illuminate-text backdrop-blur-md'
            : 'bg-white/95 border border-slate-200 text-slate-800 backdrop-blur-md shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)]'
        }`}
        style={tooltipStyle}
      >
        <div>
          <div className="flex items-start justify-between mb-1">
            <p className={`text-[9px] font-mono uppercase tracking-[0.18em] ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Step {stepIndex + 1} of {steps.length}
            </p>
            <button
              onClick={handleComplete}
              className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                isDark
                  ? 'text-slate-500 hover:text-illuminate-text hover:bg-white/[0.04]'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h3 className={`font-display font-semibold text-[15px] leading-snug tracking-tight mb-3 pr-6 ${
            isDark ? 'text-illuminate-text' : 'text-slate-900'
          }`}>
            {currentStep.title}
          </h3>

          <p className={`text-[12.5px] leading-relaxed mb-5 font-sans font-normal ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {parseTourContent(currentStep.content)}
          </p>

          <div className={`flex items-center justify-between pt-4 border-t ${
            isDark ? 'border-white/[0.06]' : 'border-slate-200'
          }`}>
            <div className="flex gap-1.5 items-center">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`vr-tour-step-node ${
                    idx === stepIndex
                      ? 'vr-tour-step-node--active'
                      : idx < stepIndex
                        ? 'vr-tour-step-node--done'
                        : ''
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleComplete}
                className={`cursor-pointer px-2 py-1 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Skip
              </button>

              {stepIndex > 0 && (
                <button
                  onClick={handleBack}
                  className="btn-secondary cursor-pointer px-4 py-2 text-xs flex items-center gap-1.5 transition-all duration-200"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                className="btn-cta cursor-pointer px-4 py-2 text-xs flex items-center gap-1.5 transition-all duration-200"
              >
                {stepIndex === steps.length - 1 ? (
                  'Finish'
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-3.5 h-3.5" />
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
