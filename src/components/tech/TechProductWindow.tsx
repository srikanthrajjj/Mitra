import { useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

type Mode = 'light' | 'dark';

interface TechProductWindowProps {
  src: string;
  srcLight?: string;
  alt: string;
  title: string;
  className?: string;
  /** Theme the window opens in; the viewer can flip it. */
  defaultMode?: Mode;
}

/** Browser-style frame around a real product screenshot, with a light/dark switch. */
export function TechProductWindow({
  src,
  srcLight,
  alt,
  title,
  className,
  defaultMode = 'dark',
}: TechProductWindowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>(srcLight ? defaultMode : 'dark');
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [8, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [48, 0]);

  return (
    <div ref={ref} className={cn('[perspective:1400px]', className)}>
      <motion.div
        style={{ rotateX, scale, y, transformOrigin: '50% 100%' }}
        className={cn(
          mode,
          'relative overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-500',
          mode === 'dark'
            ? 'shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]'
            : 'shadow-[0_40px_110px_-30px_color-mix(in_srgb,var(--color-brand-green-deep)_55%,transparent)]',
        )}
      >
        <div className="flex items-center gap-3 border-b border-border bg-mitra-surface px-4 py-3 transition-colors duration-500">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-muted" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          </div>
          <div className="mx-auto max-w-xs flex-1 truncate rounded-md bg-background px-3 py-1 text-center font-mono text-[11px] text-muted-foreground transition-colors duration-500">
            {title}
          </div>
          {srcLight ? (
            <div className="flex rounded-full border border-border bg-background p-0.5" role="group" aria-label="Preview theme">
              {(['light', 'dark'] as const).map((m) => {
                const Icon = m === 'light' ? Sun : Moon;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    aria-pressed={mode === m}
                    aria-label={`${m} theme`}
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                      mode === m ? 'bg-brand-green text-background' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="w-10" aria-hidden />
          )}
        </div>
        <div className="relative">
          <img
            src={src}
            alt={alt}
            width={2368}
            height={1800}
            loading="lazy"
            decoding="async"
            className={cn('block w-full transition-opacity duration-500', mode === 'light' && srcLight ? 'opacity-0' : 'opacity-100')}
          />
          {srcLight && (
            <img
              src={srcLight}
              alt=""
              aria-hidden
              width={2368}
              height={1800}
              loading="lazy"
              decoding="async"
              className={cn(
                'absolute inset-0 block h-full w-full transition-opacity duration-500',
                mode === 'light' ? 'opacity-100' : 'opacity-0',
              )}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
