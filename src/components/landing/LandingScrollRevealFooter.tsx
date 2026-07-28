import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';
import './landing-scroll-reveal-footer.css';

interface LandingScrollRevealLayoutProps {
  children: ReactNode;
  footer: ReactNode;
  className?: string;
}

export function LandingScrollRevealLayout({
  children,
  footer,
  className,
}: LandingScrollRevealLayoutProps) {
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(420);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const measure = () => setFooterHeight(el.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ['start start', 'end end'],
  });

  const reveal = useTransform(scrollYProgress, [0.82, 1], [0, 1]);
  const footerY = useSpring(useTransform(reveal, [0, 1], [56, 0]), {
    stiffness: 110,
    damping: 26,
    mass: 0.85,
  });
  const footerOpacity = useTransform(reveal, [0, 1], [0.35, 1]);
  const contentLift = useSpring(useTransform(reveal, [0, 1], [0, -12]), {
    stiffness: 90,
    damping: 22,
  });

  return (
    <div className={cn('landing-scroll-reveal', className)}>
      <motion.div
        ref={contentRef}
        className="landing-scroll-reveal__content"
        style={{
          marginBottom: footerHeight,
          y: prefersReducedMotion ? 0 : contentLift,
        }}
      >
        {children}
      </motion.div>

      <footer ref={footerRef} className="landing-scroll-reveal__footer">
        <motion.div
          className="landing-scroll-reveal__footer-inner"
          style={
            prefersReducedMotion
              ? undefined
              : {
                  y: footerY,
                  opacity: footerOpacity,
                }
          }
        >
          {footer}
        </motion.div>
      </footer>
    </div>
  );
}
