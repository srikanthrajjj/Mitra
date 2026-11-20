import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechProductWindow } from './TechProductWindow';
import { TechMarquee } from './TechMarquee';
import { DOT_GRID, GLOW_TOP, GRADIENT_TEXT_ON_LIGHT, ORB } from './techStyles';
import { TECH_FEATURES } from './techData';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Light-theme feature section. Green orbs drift at different speeds as you scroll and
 * every screenshot opens in light theme, with a switch to flip it to dark.
 */
export function TechShowcase() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const orbA = useTransform(scrollYProgress, [0, 1], [-160, 420]);
  const orbB = useTransform(scrollYProgress, [0, 1], [260, -380]);
  const orbC = useTransform(scrollYProgress, [0, 1], [0, 220]);

  return (
    <section
      ref={ref}
      id="product"
      className="light relative overflow-hidden bg-background text-foreground"
    >
      <div className={cn('pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]', DOT_GRID)} aria-hidden />
      <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-[40rem]', GLOW_TOP)} aria-hidden />
      <motion.div style={{ y: orbA }} className={cn('pointer-events-none absolute -left-60 top-[8%] h-[46rem] w-[46rem] rounded-full blur-3xl', ORB)} aria-hidden />
      <motion.div style={{ y: orbB }} className={cn('pointer-events-none absolute -right-72 top-[40%] h-[52rem] w-[52rem] rounded-full blur-3xl', ORB)} aria-hidden />
      <motion.div style={{ y: orbC }} className={cn('pointer-events-none absolute -left-40 bottom-[4%] h-[40rem] w-[40rem] rounded-full blur-3xl', ORB)} aria-hidden />

      <TechMarquee />

      <div className="relative mx-auto max-w-6xl px-6 pt-28 md:pt-40">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-green-deep">Inside the product</p>
        <h2 className="mt-5 max-w-4xl font-display text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.04em] md:text-7xl">
          See the work <span className={GRADIENT_TEXT_ON_LIGHT}>before</span> it ships.
        </h2>
      </div>

      <div className="relative mt-20 space-y-28 pb-28 md:mt-28 md:space-y-44 md:pb-44">
        {TECH_FEATURES.map((f, i) => {
          const flip = i % 2 === 1;
          return (
            <div key={f.id} className="mx-auto max-w-6xl px-6">
              <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: EASE }}
                  className={cn('lg:col-span-4', flip && 'lg:order-2')}
                >
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-green-deep">{f.kicker}</p>
                  <h3 className="mt-4 font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] md:text-5xl">
                    {f.title}
                  </h3>
                  <p className="mt-5 text-base leading-relaxed text-muted-foreground">{f.desc}</p>
                  <ul className="mt-7 space-y-2.5">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-3 text-sm font-medium">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-background">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <TechProductWindow
                  src={f.image}
                  srcLight={f.imageLight}
                  alt={f.alt}
                  title={f.windowTitle}
                  defaultMode="light"
                  className={cn('lg:col-span-8', flip && 'lg:order-1')}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
