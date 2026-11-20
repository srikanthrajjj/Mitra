import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Bot } from 'lucide-react';
import { ARCH_NODES } from './techData';

const W = 960;
const H = 460;
const HUB = { x: W / 2, y: H / 2 };
const NODE_W = 188;
const NODE_H = 52;

// Agents fan out on an arc above and below the orchestrator.
const POSITIONS = [
  { x: 170, y: 70 },
  { x: 480, y: 50 },
  { x: 790, y: 70 },
  { x: 250, y: 390 },
  { x: 710, y: 390 },
];

function curve(x: number, y: number) {
  const my = (y + HUB.y) / 2;
  return `M ${x} ${y} C ${x} ${my}, ${HUB.x} ${my}, ${HUB.x} ${HUB.y}`;
}

/** Orchestrator-and-agents diagram; connectors draw in, then pulses travel along them. */
export function TechArchitecture() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="architecture" className="border-t border-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Architecture</p>
        <h2 className="mt-4 max-w-3xl font-display text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.04em] md:text-7xl">
          One orchestrator. Specialised agents. Your ServiceNow instance.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          IlluminAIte routes work to the right agent, keeps context shared across stages, and pauses for human approval
          before anything is promoted.
        </p>

        <div className="mt-14 overflow-x-auto">
          <svg
            ref={ref}
            viewBox={`0 0 ${W} ${H}`}
            className="mx-auto min-w-[640px] w-full"
            role="img"
            aria-label="IlluminAIte orchestrator coordinating requirements, build, test, documentation and deployment agents"
          >
            {ARCH_NODES.map((n, i) => {
              const p = POSITIONS[i];
              const d = curve(p.x, p.y);
              return (
                <g key={n.id}>
                  <path d={d} fill="none" className="stroke-border" strokeWidth={1.5} />
                  <motion.path
                    d={d}
                    fill="none"
                    className="stroke-brand-green"
                    strokeWidth={1.5}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={inView ? { pathLength: 1, opacity: 0.9 } : undefined}
                    transition={{ duration: 1.1, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
                  />
                  {inView && (
                    <circle r={3.5} className="fill-brand-green">
                      <animateMotion dur={`${3 + i * 0.4}s`} begin={`${1.4 + i * 0.3}s`} repeatCount="indefinite" path={d} />
                    </circle>
                  )}
                </g>
              );
            })}

            {ARCH_NODES.map((n, i) => {
              const p = POSITIONS[i];
              const Icon = n.icon;
              return (
                <motion.g
                  key={n.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={inView ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <rect
                    x={p.x - NODE_W / 2}
                    y={p.y - NODE_H / 2}
                    width={NODE_W}
                    height={NODE_H}
                    rx={14}
                    className="fill-card stroke-border"
                  />
                  <foreignObject x={p.x - NODE_W / 2} y={p.y - NODE_H / 2} width={NODE_W} height={NODE_H}>
                    <div className="flex h-full items-center gap-3 px-4 text-foreground">
                      <Icon className="h-4 w-4 shrink-0 text-brand-green" />
                      <span className="text-[13px] font-medium">{n.label}</span>
                    </div>
                  </foreignObject>
                </motion.g>
              );
            })}

            <motion.g
              initial={{ scale: 0.9, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : undefined}
              style={{ transformOrigin: `${HUB.x}px ${HUB.y}px` }}
              transition={{ duration: 0.6 }}
            >
              <circle cx={HUB.x} cy={HUB.y} r={64} className="fill-card" />
              <circle cx={HUB.x} cy={HUB.y} r={64} className="fill-brand-green/10 stroke-brand-green" strokeWidth={1.5} />
              <circle cx={HUB.x} cy={HUB.y} r={64} className="fill-none stroke-brand-green/40" strokeWidth={1}>
                <animate attributeName="r" values="64;92" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0" dur="3s" repeatCount="indefinite" />
              </circle>
              <foreignObject x={HUB.x - 64} y={HUB.y - 40} width={128} height={80}>
                <div className="flex h-full flex-col items-center justify-center text-center text-foreground">
                  <Bot className="h-6 w-6 text-brand-green" />
                  <span className="mt-1 font-display text-sm font-bold">IlluminAIte</span>
                  <span className="font-mono text-[10px] text-muted-foreground">orchestrator</span>
                </div>
              </foreignObject>
            </motion.g>
          </svg>
        </div>
      </div>
    </section>
  );
}
