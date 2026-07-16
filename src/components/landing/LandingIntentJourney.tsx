import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { PLATFORM_SECTION, WHAT_WE_DO_BLOCKS, type WhatWeDoBlock } from './echelonLandingData';

const BLOCK_COUNT = WHAT_WE_DO_BLOCKS.length;

function WhatWeDoItemRow({
  title,
  desc,
  isActive,
}: {
  title: string;
  desc: string;
  isActive: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <li className="py-3.5 md:py-4">
      <motion.p
        className="text-[15px] font-medium leading-snug md:text-base"
        animate={{ color: isActive || reduceMotion ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)' }}
        transition={{ duration: 0.35 }}
      >
        {title}
      </motion.p>
      <motion.p
        className="mt-1.5 text-sm font-light leading-relaxed"
        animate={{ color: isActive || reduceMotion ? 'rgba(255,255,255,0.48)' : 'rgba(255,255,255,0.22)' }}
        transition={{ duration: 0.35 }}
      >
        {desc}
      </motion.p>
    </li>
  );
}

function WhatWeDoTimelineSection({
  block,
  index,
  isActive,
  registerRef,
}: {
  block: WhatWeDoBlock;
  index: number;
  isActive: boolean;
  registerRef: (id: string, el: HTMLElement | null) => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      ref={(el) => registerRef(block.id, el)}
      id={block.id}
      animate={
        reduceMotion
          ? { opacity: 1 }
          : { opacity: isActive ? 1 : 0.28 }
      }
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="landing-wwd-timeline-section flex min-h-[72vh] scroll-mt-28 items-center py-10 md:min-h-[78vh] md:py-14 lg:scroll-mt-36"
    >
      <div className="w-full max-w-2xl">
        <p className="text-[11px] font-medium tabular-nums tracking-[0.28em] text-white/22">
          {String(index + 1).padStart(2, '0')}
        </p>
        <h3 className="mt-3 font-display text-2xl font-medium leading-tight tracking-tight text-white md:text-3xl lg:text-[2rem]">
          {block.title}
        </h3>
        <p className="mt-3 text-sm font-light leading-relaxed text-white/45 md:text-base">
          {block.subtitle}
        </p>
        <ul className="mt-8 md:mt-10">
          {block.items.map((item) => (
            <WhatWeDoItemRow
              key={item.title}
              title={item.title}
              desc={item.desc}
              isActive={isActive}
            />
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export function LandingIntentJourney() {
  const headerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());
  const reduceMotion = useReducedMotion();
  const headerInView = useInView(headerRef, { once: true, margin: '-10% 0px', amount: 0.4 });

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
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setActiveId(id);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const updateActive = () => {
      const marker = window.innerHeight * 0.42;
      let closestId = WHAT_WE_DO_BLOCKS[0].id;
      let closestDistance = Number.POSITIVE_INFINITY;

      WHAT_WE_DO_BLOCKS.forEach((block) => {
        const el = blockRefs.current.get(block.id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const anchor = rect.top + rect.height * 0.32;
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
  }, [reduceMotion]);

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
      className="landing-what-we-do relative scroll-mt-24 bg-[#050608]"
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
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={headerInView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl pt-20 text-center md:max-w-3xl md:pt-28"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.38em] text-[#8BEA3C]/80">
            {PLATFORM_SECTION.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-white md:text-[2.75rem]">
            {PLATFORM_SECTION.title}
          </h2>
          <p className="mt-4 text-base font-light leading-relaxed text-white/45">
            {PLATFORM_SECTION.subtitle}
          </p>
        </motion.header>

        {/* Mobile stepper */}
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
                  {WHAT_WE_DO_BLOCKS.map((block, index) => {
                    const Icon = block.icon;
                    const isActive = block.id === activeId;
                    const isPast = index < activeIndex;

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
                          <span
                            className={cn(
                              'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-all duration-300',
                              isActive
                                ? 'left-0 h-1.5 w-1.5 bg-[#8BEA3C]'
                                : isPast
                                  ? 'left-0 h-1 w-1 bg-[#8BEA3C]/35'
                                  : 'left-0 h-1 w-1 bg-white/15',
                            )}
                          />
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

          <div className="landing-wwd-timeline-track pb-24 md:pb-32">
            {WHAT_WE_DO_BLOCKS.map((block, index) => (
              <WhatWeDoTimelineSection
                key={block.id}
                block={block}
                index={index}
                isActive={block.id === activeId}
                registerRef={registerRef}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
