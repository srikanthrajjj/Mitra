import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBeamProps {
  className?: string;
  containerRef: React.RefObject<HTMLDivElement>;
  fromRef: React.RefObject<HTMLDivElement>;
  toRef: React.RefObject<HTMLDivElement>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  gradientColor?: string;
  gradientStopColor?: string;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 5,
  delay = 0,
  gradientColor = '#00ff66',
  gradientStopColor = '#00ff6600',
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: AnimatedBeamProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathD, setPathD] = useState('');
  const [gradientId] = useState(() => `beam-gradient-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();

      const fromX = fromRect.left + fromRect.width / 2 - containerRect.left + startXOffset;
      const fromY = fromRect.top + fromRect.height / 2 - containerRect.top + startYOffset;
      const toX = toRect.left + toRect.width / 2 - containerRect.left + endXOffset;
      const toY = toRect.top + toRect.height / 2 - containerRect.top + endYOffset;

      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;

      const controlX = midX + curvature;
      const controlY = midY;

      const d = `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
      setPathD(d);
    };

    updatePath();
    const observer = new ResizeObserver(updatePath);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  return (
    <svg
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={gradientColor} stopOpacity="0.8" />
          <stop offset="50%" stopColor={gradientColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {pathD && (
        <>
          <path
            d={pathD}
            fill="none"
            stroke={`${gradientColor}20`}
            strokeWidth="2"
          />
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              strokeDasharray: '200',
              strokeDashoffset: '200',
              animation: `beam-draw ${duration}s linear ${delay}s infinite`,
            }}
          />
        </>
      )}
      <style>{`
        @keyframes beam-draw {
          0% {
            stroke-dashoffset: 200;
          }
          100% {
            stroke-dashoffset: -200;
          }
        }
      `}</style>
    </svg>
  );
}

export const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'z-10 flex size-12 items-center justify-center rounded-full border border-emerald-500/30 bg-zinc-900 p-3 shadow-[0_0_20px_-12px_rgba(0,255,102,0.3)]',
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = 'Circle';
