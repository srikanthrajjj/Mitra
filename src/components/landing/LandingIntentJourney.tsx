import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { PLATFORM_SECTION, WHAT_WE_DO_BLOCKS, type WhatWeDoBlock } from './echelonLandingData';
import { useLandingDesign } from './LandingDesignContext';

const BLOCK_COUNT = WHAT_WE_DO_BLOCKS.length;

function WhatWeDoItemRow({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <li className="py-3.5 md:py-4">
      <p className="text-[15px] font-semibold leading-snug text-white/90 md:text-lg">
        {title}
      </p>
      <p className="mt-1.5 text-sm font-medium leading-relaxed text-white/50 md:text-base">
        {desc}
      </p>
    </li>
  );
}

function WhatWeDoTimelineSection({
  block,
  index,
  isActive,
  registerRef,
  isV1,
}: {
  block: WhatWeDoBlock;
  index: number;
  isActive: boolean;
  registerRef: (id: string, el: HTMLElement | null) => void;
  isV1: boolean;
}) {
  return (
    <article
      ref={(el) => registerRef(block.id, el)}
      id={block.id}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'landing-wwd-timeline-section scroll-mt-28 py-14 md:scroll-mt-36 md:py-16 lg:py-20',
        isActive && 'landing-wwd-timeline-section--active',
      )}
    >
      <div className="w-full max-w-2xl">
        <p
          className={cn(
            'text-[11px] font-medium tabular-nums tracking-[0.28em] transition-colors duration-300',
            isActive ? 'text-[var(--landing-accent)]/70' : 'text-white/22',
          )}
        >
          {String(index + 1).padStart(2, '0')}
        </p>
        <h3
          className={cn(
            'mt-3 font-display leading-tight tracking-tight text-white',
            isV1
              ? 'text-3xl font-extrabold md:text-4xl lg:text-[2.75rem]'
              : 'text-2xl font-medium md:text-3xl lg:text-[2rem]',
          )}
        >
          {block.title}
        </h3>
        <p
          className={cn(
            'mt-3 leading-relaxed',
            isV1
              ? 'text-base font-medium text-white/60 md:text-lg'
              : 'text-sm font-light text-white/45 md:text-base',
          )}
        >
          {block.subtitle}
        </p>
        <ul className="mt-8 md:mt-10">
          {block.items.map((item) => (
            <WhatWeDoItemRow
              key={item.title}
              title={item.title}
              desc={item.desc}
            />
          ))}
        </ul>
      </div>
    </article>
  );
}

export function LandingIntentJourney() {
  const design = useLandingDesign();
  const isV1 = design === 'v1';
  const isV2 = design === 'v2';
  const headerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());
  const reduceMotion = useReducedMotion();
  const headerInView = useInView(headerRef, { once: true, margin: '-8% 0px', amount: 0.25 });

  const [activeId, setActiveId] = useState(WHAT_WE_DO_BLOCKS[0].id);
  const [railPin, setRailPin] = useState<'static' | 'fixed' | 'end'>('static');
  const [railBox, setRailBox] = useState({ left: 0, width: 168 });
  const activeIndex = WHAT_WE_DO_BLOCKS.findIndex((b) => b.id === activeId);

  const RAIL_TOP = 112;
  const RAIL_MIN_HEIGHT = 280;

  const registerRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) blockRefs.current.set(id, el);
    else blockRefs.current.delete(id);
  }, []);

  const scrollToBlock = useCallback((id: string) => {
    const el = blockRefs.current.get(id) ?? document.getElementById(id);
    el?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    setActiveId(id);
  }, [reduceMotion]);

  useEffect(() => {
    const updateActive = () => {
      const marker = window.innerHeight * 0.35;
      let closestId = WHAT_WE_DO_BLOCKS[0].id;
      let closestDistance = Number.POSITIVE_INFINITY;

      WHAT_WE_DO_BLOCKS.forEach((block) => {
        const el = blockRefs.current.get(block.id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Prefer the section currently spanning the marker line
        if (rect.top <= marker && rect.bottom >= marker) {
          closestId = block.id;
          closestDistance = 0;
          return;
        }
        const anchor = rect.top + Math.min(rect.height * 0.2, 80);
        const distance = Math.abs(anchor - marker);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = block.id;
        }
      });

      setActiveId(closestId);
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, []);

  useEffect(() => {
    const updateRail = () => {
      const timeline = timelineRef.current;
      const aside = asideRef.current;
      if (!timeline || !aside) return;

      const tl = timeline.getBoundingClientRect();
      const asideRect = aside.getBoundingClientRect();

      setRailBox({ left: asideRect.left, width: asideRect.width });

      if (tl.top > RAIL_TOP) {
        setRailPin('static');
      } else if (tl.bottom <= RAIL_TOP + RAIL_MIN_HEIGHT) {
        setRailPin('end');
      } else {
        setRailPin('fixed');
      }
    };

    updateRail();
    window.addEventListener('scroll', updateRail, { passive: true });
    window.addEventListener('resize', updateRail, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateRail);
      window.removeEventListener('resize', updateRail);
    };
  }, []);

  const progress = BLOCK_COUNT <= 1 ? 100 : (activeIndex / (BLOCK_COUNT - 1)) * 100;

  return (
    <section
      id="platform"
      className={cn(
        'landing-what-we-do relative scroll-mt-24',
        isV2 ? 'landing-band-elevated' : 'landing-section-surface',
      )}
      aria-label={PLATFORM_SECTION.eyebrow}
    >
      <div className="landing-wwd-dot-grid pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_20%_10%,rgba(139,234,60,0.05),transparent_55%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <motion.header
          ref={headerRef}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={headerInView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'mx-auto pt-20 text-center md:pt-28',
            isV1 ? 'max-w-4xl md:max-w-5xl' : 'max-w-2xl md:max-w-3xl',
          )}
        >
          <p
            className={cn(
              'uppercase tracking-[0.38em]',
              isV1
                ? 'text-xs font-bold text-[var(--landing-accent)] md:text-sm'
                : 'text-[11px] font-medium text-[#8BEA3C]/80',
            )}
          >
            {PLATFORM_SECTION.eyebrow}
          </p>
          <h2
            className={cn(
              'mt-4 font-display leading-tight tracking-tight text-white',
              isV1 && 'landing-v1-section-title mt-5',
              !isV1 && 'text-3xl font-medium md:text-[2.75rem]',
            )}
          >
            {isV1 ? (
              <>
                {PLATFORM_SECTION.title}
                <br />
                <span className="landing-v1-accent-word">{PLATFORM_SECTION.titleAccent}</span>
              </>
            ) : (
              <>
                {PLATFORM_SECTION.title} {PLATFORM_SECTION.titleAccent}
              </>
            )}
          </h2>
          <p
            className={cn(
              'mx-auto mt-5 max-w-2xl leading-relaxed',
              isV1 ? 'landing-v1-lead mt-6 max-w-3xl' : 'text-base font-light text-white/45',
            )}
          >
            {PLATFORM_SECTION.subtitle}
          </p>
        </motion.header>

        <nav
          className="landing-wwd-mobile-nav sticky top-[4.5rem] z-20 -mx-2 mt-10 overflow-x-auto px-2 py-3 lg:hidden"
          aria-label="What we do topics"
        >
          <div className="flex min-w-max gap-4">
            {WHAT_WE_DO_BLOCKS.map((block) => {
              const isActive = block.id === activeId;
              return (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => scrollToBlock(block.id)}
                  className={cn(
                    'text-xs font-medium transition-colors',
                    isActive ? 'text-[#8BEA3C]' : 'text-white/35',
                  )}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {block.navLabel}
                </button>
              );
            })}
          </div>
        </nav>

        <div
          ref={timelineRef}
          className="landing-wwd-timeline mt-10 lg:mt-16 lg:grid lg:grid-cols-[10.5rem_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[12rem_minmax(0,1fr)] xl:gap-20"
        >
          <aside ref={asideRef} className="relative hidden lg:block">
            <nav
              className={cn(
                'landing-wwd-rail z-30',
                railPin === 'static' && 'relative',
                railPin === 'end' && 'absolute bottom-0 left-0 w-full',
              )}
              style={
                railPin === 'fixed'
                  ? {
                      position: 'fixed',
                      top: RAIL_TOP,
                      left: railBox.left,
                      width: railBox.width,
                    }
                  : undefined
              }
              aria-label="What we do topics"
            >
              <div className="relative pl-5">
                <div
                  className="absolute bottom-1 left-[5px] top-1 w-px overflow-hidden bg-white/[0.06]"
                  aria-hidden
                >
                  <div
                    className="w-full bg-[#8BEA3C]/70 transition-all duration-500 ease-out"
                    style={{ height: `${progress}%` }}
                  />
                </div>

                <ul className="relative space-y-5">
                  {WHAT_WE_DO_BLOCKS.map((block) => {
                    const Icon = block.icon;
                    const isActive = block.id === activeId;

                    return (
                      <li key={block.id}>
                        <button
                          type="button"
                          onClick={() => scrollToBlock(block.id)}
                          className={cn(
                            'group relative flex w-full items-center gap-2.5 py-1 text-left transition-colors duration-300',
                            isActive ? 'text-white' : 'text-white/30 hover:text-white/55',
                          )}
                          aria-current={isActive ? 'true' : undefined}
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4 shrink-0 transition-colors duration-300',
                              isActive ? 'text-[#8BEA3C]' : 'text-white/25 group-hover:text-white/45',
                            )}
                            strokeWidth={1.75}
                          />
                          <span className="text-sm font-medium leading-tight">{block.navLabel}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>
          </aside>

          <div className="landing-wwd-timeline-track space-y-2 pb-20 md:pb-28">
            {WHAT_WE_DO_BLOCKS.map((block, index) => (
              <WhatWeDoTimelineSection
                key={block.id}
                block={block}
                index={index}
                isActive={block.id === activeId}
                registerRef={registerRef}
                isV1={isV1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
