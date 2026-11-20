import { useEffect, useMemo, useRef } from 'react';
import { animate, motionValue } from 'motion/react';
import { cn } from '@/lib/utils';

const WORD = 'IlluminAIte'.split('');

// Pixelation lives in the band around the bot: coarse right at the scan line, finer behind
// it, then the letters resolve back to crisp. Hex-free: only the `black` keyword as alpha.
const MASK_COARSE =
  'linear-gradient(90deg, transparent calc(var(--bx) - 170px), black calc(var(--bx) - 70px), black calc(var(--bx) + 6px), transparent calc(var(--bx) + 64px))';
const MASK_FINE =
  'linear-gradient(90deg, transparent calc(var(--bx) - 340px), black calc(var(--bx) - 150px), black calc(var(--bx) + 20px), transparent calc(var(--bx) + 120px))';

/** Tile-and-dilate pixelation filter: samples one source pixel per tile and grows it. */
function PixelFilter({ id, size }: { id: string; size: number }) {
  return (
    <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feFlood x={size / 2 - 1} y={size / 2 - 1} width="2" height="2" />
      <feComposite width={size} height={size} />
      <feTile result="tiles" />
      <feComposite in="SourceGraphic" in2="tiles" operator="in" />
      <feMorphology operator="dilate" radius={size / 2} />
    </filter>
  );
}

interface TechBotScanProps {
  /** Same font and size classes as the wordmark it sits on, so the letters line up. */
  wordClass: string;
  /** True once the wordmark is on screen. */
  run: boolean;
  /** True while the cursor is over the wordmark; the scan hides so it never fights hover. */
  hovering: React.MutableRefObject<boolean>;
}

/**
 * Pixel bot that sweeps across the wordmark. Behind a scan line, letters pixelate into green
 * blocks and then re-resolve to crisp. The pixel layers are copies of the same text, masked to
 * a band that follows the bot, so alignment is exact and nothing re-renders per frame.
 */
export function TechBotScan({ wordClass, run, hovering }: TechBotScanProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const bx = useMemo(() => motionValue(-300), []);
  const scanning = useRef(false);

  useEffect(() => {
    const unsub = bx.on('change', (v) => {
      const root = rootRef.current;
      if (!root) return;
      root.style.setProperty('--bx', `${v}px`);
      if (botRef.current) botRef.current.style.transform = `translate3d(${v - 24}px,0,0)`;
      if (beamRef.current) beamRef.current.style.transform = `translate3d(${v - 1}px,0,0)`;
      root.style.visibility = hovering.current ? 'hidden' : 'visible';
    });
    return unsub;
  }, [bx, hovering]);

  useEffect(() => {
    if (!run) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = rootRef.current;
    if (!root) return;

    const scan = () => {
      if (scanning.current || hovering.current) return;
      scanning.current = true;
      const w = root.clientWidth;
      root.style.opacity = '1';
      bx.set(-80);
      animate(bx, w + 120, { duration: Math.max(2.4, w / 520), ease: [0.45, 0, 0.55, 1] }).then(() => {
        root.style.opacity = '0';
        scanning.current = false;
      });
    };

    const first = setTimeout(scan, 900);
    const every = setInterval(scan, 8000);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, [run, bx, hovering]);

  const letters = (
    <>
      {WORD.map((ch, i) => (
        <span key={`${ch}-${i}`} className="inline-block">
          <span className="relative inline-block">{ch}</span>
        </span>
      ))}
    </>
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
      style={{ ['--bx' as string]: '-300px' }}
    >
      <svg width="0" height="0" className="absolute" focusable="false">
        <defs>
          <PixelFilter id="tech-px-fine" size={6} />
          <PixelFilter id="tech-px-coarse" size={16} />
        </defs>
      </svg>

      <p
        className={cn('absolute inset-0 flex justify-center text-brand-green', wordClass)}
        style={{ filter: 'url(#tech-px-fine)', maskImage: MASK_FINE, WebkitMaskImage: MASK_FINE, opacity: 0.75 }}
      >
        {letters}
      </p>
      <p
        className={cn('absolute inset-0 flex justify-center text-foreground', wordClass)}
        style={{ filter: 'url(#tech-px-coarse) blur(0.6px)', maskImage: MASK_COARSE, WebkitMaskImage: MASK_COARSE, opacity: 0.92 }}
      >
        {letters}
      </p>

      {/* scan line */}
      <div
        ref={beamRef}
        className="absolute -top-3 bottom-0 w-[2px] bg-brand-green shadow-[0_0_14px_2px_var(--color-brand-green)]"
      />

      {/* the bot */}
      <div ref={botRef} className="absolute -top-[3.6rem] left-0 will-change-transform">
        <svg
          width="48"
          height="39"
          viewBox="0 0 15 12"
          shapeRendering="crispEdges"
          className="tech-bot-bob overflow-visible drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
        >
          <rect x="7" y="0" width="1" height="2" className="fill-brand-green" />
          <rect x="6" y="0" width="3" height="1" className="fill-brand-green tech-bot-blink-antenna" />
          <rect x="0" y="5" width="1" height="3" className="fill-foreground" />
          <rect x="14" y="5" width="1" height="3" className="fill-foreground" />
          <rect x="1" y="2" width="13" height="9" className="fill-foreground" />
          <rect x="2" y="3" width="11" height="7" className="fill-card" />
          <g className="tech-bot-eyes fill-brand-green">
            <rect x="4" y="5" width="2" height="2" />
            <rect x="9" y="5" width="2" height="2" />
          </g>
          <rect x="5" y="8" width="5" height="1" className="fill-brand-green" opacity="0.6" />
        </svg>
      </div>

      <style>{`
        .tech-bot-bob { animation: tech-bot-bob 1.4s ease-in-out infinite; }
        @keyframes tech-bot-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .tech-bot-eyes { transform-box: fill-box; transform-origin: center; animation: tech-bot-blink 3.2s infinite; }
        @keyframes tech-bot-blink { 0%,92%,100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
        .tech-bot-blink-antenna { animation: tech-bot-ant 1s steps(2) infinite; }
        @keyframes tech-bot-ant { 0% { opacity: 1; } 50% { opacity: 0.2; } }
        @media (prefers-reduced-motion: reduce) { .tech-bot-bob, .tech-bot-eyes, .tech-bot-blink-antenna { animation: none; } }
      `}</style>
    </div>
  );
}
