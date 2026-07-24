import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { IlluminaiteLogo } from '../IlluminaiteLogo';
import { useLandingDesign } from './LandingDesignContext';
import { LandingTextLine, LandingTextReveal } from './LandingTextReveal';

const INNER_RING = [
  { name: 'ITSM', desc: 'Streamline IT service delivery with AI-powered incident, problem, and change management workflows.', angle: 0 },
  { name: 'HRSD', desc: 'Transform employee experiences with intelligent HR case management and service delivery.', angle: 72 },
  { name: 'CSM', desc: 'Elevate customer satisfaction with proactive, AI-driven service management and case resolution.', angle: 144 },
  { name: 'SecOps', desc: 'Accelerate threat detection and response with AI-enhanced security operations.', angle: 216 },
  { name: 'GRC / IRM', desc: 'Automate compliance monitoring and risk assessment with continuous AI analysis.', angle: 288 },
];

const OUTER_RING = [
  { name: 'FSO', desc: 'Unlock financial insights with AI-driven analysis, reporting, and operational efficiency.', angle: 36 },
  { name: 'FSM', desc: 'Optimize field operations with intelligent scheduling, dispatching, and real-time tracking.', angle: 108 },
  { name: 'CMDB', desc: 'Maintain a living, accurate picture of your IT estate with AI-powered discovery and mapping.', angle: 180 },
  { name: 'Now Assist', desc: 'Deploy generative AI agents across your Now Platform for instant, intelligent support.', angle: 252 },
  { name: 'Service Portal', desc: 'Build intelligent, self-service portals that anticipate user needs with AI suggestions.', angle: 324 },
];

function OrbitalNode({
  name,
  desc,
  angle,
  radius,
  isHovered,
  isDimmed,
  onHoverChange,
  ring,
}: {
  name: string;
  desc: string;
  angle: number;
  radius: number;
  isHovered: boolean;
  isDimmed: boolean;
  onHoverChange: (hovered: boolean) => void;
  ring: 'inner' | 'outer';
}) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;
  const tipId = `orbit-tip-${name.replace(/\s|\//g, '-')}`;

  return (
    <div
      className={cn(
        'absolute pointer-events-auto transition-opacity duration-300',
        isDimmed && 'opacity-[0.35]',
        isHovered && 'z-30',
      )}
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onFocus={() => onHoverChange(true)}
      onBlur={() => onHoverChange(false)}
    >
      <div className={cn('node-counter-rotate', ring === 'outer' && 'node-counter-rotate--outer')}>
        <button
          type="button"
          className={cn(
            'landing-orbit-label group relative cursor-pointer border-0 bg-transparent p-0 outline-none',
            'whitespace-nowrap font-display',
            'focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]/50',
            isHovered ? 'landing-orbit-label--active' : 'landing-orbit-label--idle',
          )}
          aria-describedby={isHovered ? tipId : undefined}
        >
          <span className="landing-orbit-label-text">{name}</span>
          <span
            className={cn(
              'landing-orbit-label-underline absolute -bottom-1 left-1/2 h-px w-0 -translate-x-1/2 rounded-full transition-all duration-300',
              isHovered && 'w-full',
            )}
            aria-hidden
          />
        </button>

        <div
          id={tipId}
          role="tooltip"
          className={cn(
            'landing-orbit-tooltip absolute left-1/2 top-full z-50 mt-4 w-60 -translate-x-1/2 rounded-xl px-4 py-3.5 text-left transition-all duration-300',
            isHovered
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-1.5 opacity-0',
          )}
        >
          <p className="landing-orbit-tooltip-title mb-1.5 text-[13px] font-semibold tracking-wide">
            {name}
          </p>
          <p className="text-[12px] leading-relaxed text-white/65">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export function LandingAnimatedBeam() {
  const design = useLandingDesign();
  const isV1 = design === 'v1';
  const isV2 = design === 'v2';
  const innerRadius = 200;
  const outerRadius = 310;
  const midRadius = 255;
  const [activeName, setActiveName] = useState<string | null>(null);
  const isPaused = activeName != null;

  return (
    <section
      id="ecosystem"
      className={cn(
        'relative overflow-hidden px-6 py-24 md:py-32',
        isV2 ? 'landing-band-violet' : 'landing-section-surface',
      )}
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          {isV1 ? (
            <LandingTextReveal delay={0.04}>
              <LandingTextLine as="h2" className="landing-v1-section-title">
                AI-Implementation Across<br />ServiceNow Landscape
              </LandingTextLine>
            </LandingTextReveal>
          ) : (
            <h2 className="font-display text-3xl font-medium text-white md:text-5xl">
              AI-Implementation Across<br />ServiceNow Landscape
            </h2>
          )}
        </div>

        <div
          className={cn('landing-orbit-stage relative mx-auto', isPaused && 'landing-orbit-stage--paused')}
          style={{ width: '750px', height: '750px', maxWidth: '100%' }}
        >
          {/* Concentric rings — outer softest, mid accent, inner brightest */}
          <div
            className="landing-orbit-ring landing-orbit-ring--outer absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: `${outerRadius * 2}px`,
              height: `${outerRadius * 2}px`,
              transform: 'translate(-50%, -50%)',
            }}
            aria-hidden
          />
          <div
            className="landing-orbit-ring landing-orbit-ring--mid absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: `${midRadius * 2}px`,
              height: `${midRadius * 2}px`,
              transform: 'translate(-50%, -50%)',
            }}
            aria-hidden
          />
          <div
            className="landing-orbit-ring landing-orbit-ring--inner absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: `${innerRadius * 2}px`,
              height: `${innerRadius * 2}px`,
              transform: 'translate(-50%, -50%)',
            }}
            aria-hidden
          />

          <div
            className="landing-orbit-glow absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: '380px',
              height: '380px',
              transform: 'translate(-50%, -50%)',
            }}
            aria-hidden
          />

          <div className="orbital-rotate inner-ring absolute inset-0 pointer-events-none">
            {INNER_RING.map((cat) => (
              <OrbitalNode
                key={cat.name}
                name={cat.name}
                desc={cat.desc}
                angle={cat.angle}
                radius={innerRadius}
                ring="inner"
                isHovered={activeName === cat.name}
                isDimmed={activeName != null && activeName !== cat.name}
                onHoverChange={(hovered) => setActiveName(hovered ? cat.name : null)}
              />
            ))}
          </div>

          <div className="orbital-rotate outer-ring absolute inset-0 pointer-events-none">
            {OUTER_RING.map((cat) => (
              <OrbitalNode
                key={cat.name}
                name={cat.name}
                desc={cat.desc}
                angle={cat.angle}
                radius={outerRadius}
                ring="outer"
                isHovered={activeName === cat.name}
                isDimmed={activeName != null && activeName !== cat.name}
                onHoverChange={(hovered) => setActiveName(hovered ? cat.name : null)}
              />
            ))}
          </div>

          <div
            className="absolute left-1/2 top-1/2 z-20"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <div className="relative">
              <div className="landing-orbit-core-glow absolute inset-0 -m-6 rounded-full" aria-hidden />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full">
                <IlluminaiteLogo className="h-7 w-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes orbital-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes counter-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes counter-spin-outer {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .inner-ring {
          animation: orbital-spin 60s linear infinite;
        }
        .outer-ring {
          animation: orbital-spin 100s linear infinite reverse;
        }
        .node-counter-rotate {
          animation: counter-spin 60s linear infinite;
        }
        .node-counter-rotate--outer {
          animation-name: counter-spin-outer;
          animation-duration: 100s;
        }
        .landing-orbit-stage--paused .inner-ring,
        .landing-orbit-stage--paused .outer-ring,
        .landing-orbit-stage--paused .node-counter-rotate {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
