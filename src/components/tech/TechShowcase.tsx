import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechProductWindow } from './TechProductWindow';
import { TECH_FEATURES } from './techData';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Alternating feature rows, each backed by a real product screenshot. */
export function TechShowcase() {
  return (
    <section id="product" className="relative border-t border-border bg-background py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-green">Inside the product</p>
        <h2 className="mt-5 max-w-4xl font-display text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.04em] md:text-7xl">
          See the work <span className="bg-gradient-to-r from-brand-green to-brand-green-hover bg-clip-text text-transparent">before</span> it ships.
        </h2>
      </div>

      <div className="mt-20 space-y-28 md:mt-28 md:space-y-44">
        {TECH_FEATURES.map((f, i) => {
          const flip = i % 2 === 1;
          return (
            <div key={f.id} className="relative mx-auto max-w-6xl px-6">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-green/[0.07] blur-3xl" />
              <div className={cn('relative grid items-center gap-10 lg:grid-cols-12 lg:gap-14')}>
                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: EASE }}
                  className={cn('lg:col-span-4', flip && 'lg:order-2')}
                >
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-green">{f.kicker}</p>
                  <h3 className="mt-4 font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] md:text-5xl">
                    {f.title}
                  </h3>
                  <p className="mt-5 text-base leading-relaxed text-muted-foreground">{f.desc}</p>
                  <ul className="mt-7 space-y-2.5">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-3 text-sm font-medium">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green/15 text-brand-green">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <TechProductWindow
                  src={f.image}
                  alt={f.alt}
                  url={f.url}
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
