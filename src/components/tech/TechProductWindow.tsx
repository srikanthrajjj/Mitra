import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

interface TechProductWindowProps {
  src: string;
  alt: string;
  url: string;
  className?: string;
  /** Scroll-driven perspective tilt that settles flat as the window reaches centre. */
  tilt?: boolean;
  priority?: boolean;
  /** Replaces the screenshot with live content. */
  children?: React.ReactNode;
}

/** Browser-style frame around a real product screenshot. */
export function TechProductWindow({ src, alt, url, className, tilt = false, priority = false, children }: TechProductWindowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [tilt ? 16 : 6, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [tilt ? 0.88 : 0.95, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  return (
    <div ref={ref} className={cn('[perspective:1400px]', className)}>
      <motion.div
        style={{ rotateX, scale, y, transformOrigin: '50% 100%' }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.03)]"
      >
        <div className="flex items-center gap-3 border-b border-border bg-mitra-surface px-4 py-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-muted" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          </div>
          <div className="mx-auto max-w-xs flex-1 truncate rounded-md bg-background px-3 py-1 text-center font-mono text-[11px] text-muted-foreground">
            {url}
          </div>
          <span className="w-10" aria-hidden />
        </div>
        {children ?? (
        <img
          src={src}
          alt={alt}
          width={2368}
          height={1800}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="block w-full"
        />
        )}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/5" />
      </motion.div>
    </div>
  );
}
