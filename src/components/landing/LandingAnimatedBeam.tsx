import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { IlluminaiteLogo } from '../IlluminaiteLogo';
import { useLandingDesign } from './LandingDesignContext';

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
}: {
  name: string;
  desc: string;
  angle: number;
  radius: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="node-counter-rotate">
        <span className={cn(
          'whitespace-nowrap text-[16px] font-extrabold tracking-wide transition-all duration-300 cursor-pointer',
          isHovered ? 'text-emerald-400 scale-110' : 'text-white/60',
        )}>
          {name}
        </span>

        <div
          className={cn(
            'absolute left-1/2 top-full -translate-x-1/2 mt-3 w-56 rounded-xl border border-white/10 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-sm transition-all duration-200 z-50',
            isHovered ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none',
          )}
        >
          <h4 className="mb-1 text-sm font-semibold text-emerald-400">{name}</h4>
          <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
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

  return (
    <section
      id="ecosystem"
      className={cn(
        'overflow-hidden px-6 py-24 md:py-32',
        isV2 ? 'landing-band-violet' : 'landing-section-surface',
      )}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2
            className={cn(
              'font-display text-white',
              isV1 && 'landing-v1-section-title',
              !isV1 && 'text-3xl font-medium md:text-5xl',
            )}
          >
            AI-Implementation Across<br />ServiceNow Landscape
          </h2>
        </div>

        <div
          className="relative mx-auto"
          style={{ width: '750px', height: '750px', maxWidth: '100%' }}
        >
          {[innerRadius, outerRadius].map((r) => (
            <div
              key={r}
              className="absolute left-1/2 top-1/2 rounded-full border border-white/[0.1]"
              style={{
                width: `${r * 2}px`,
                height: `${r * 2}px`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          <div
            className="absolute left-1/2 top-1/2 rounded-full bg-emerald-500/8 blur-[120px]"
            style={{
              width: '350px',
              height: '350px',
              transform: 'translate(-50%, -50%)',
            }}
          />

          <div className="orbital-rotate inner-ring absolute inset-0 pointer-events-none">
            {INNER_RING.map((cat) => (
              <OrbitalNode key={cat.name} name={cat.name} desc={cat.desc} angle={cat.angle} radius={innerRadius} />
            ))}
          </div>

          <div className="orbital-rotate outer-ring absolute inset-0 pointer-events-none">
            {OUTER_RING.map((cat) => (
              <OrbitalNode key={cat.name} name={cat.name} desc={cat.desc} angle={cat.angle} radius={outerRadius} />
            ))}
          </div>

          <div
            className="absolute left-1/2 top-1/2 z-20"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <div className="relative">
              <div className="absolute inset-0 -m-5 rounded-full bg-emerald-500/15 blur-[40px]" />
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
        .inner-ring {
          animation: orbital-spin 60s linear infinite;
        }
        .outer-ring {
          animation: orbital-spin 100s linear infinite reverse;
        }
        @keyframes counter-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .node-counter-rotate {
          animation: counter-spin 60s linear infinite;
        }
        .outer-ring .node-counter-rotate {
          animation-name: counter-spin-outer;
          animation-duration: 100s;
        }
        @keyframes counter-spin-outer {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
