import { useEffect, useRef, useState, type ReactNode } from 'react';
import { simplifyResponseText } from '../utils/simplifyResponseText';
import { cn } from '@/lib/utils';

interface SmoothStreamingTextProps {
  text: string;
  isStreaming: boolean;
  cursor: ReactNode;
  className?: string;
}

/** Gradually reveals incoming text with rAF — decouples visual smoothness from chunk size. */
export function SmoothStreamingText({
  text,
  isStreaming,
  cursor,
  className,
}: SmoothStreamingTextProps) {
  const simplified = simplifyResponseText(text);
  const [visibleCount, setVisibleCount] = useState(0);
  const visibleRef = useRef(0);
  const targetRef = useRef(simplified.length);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);

  targetRef.current = simplified.length;

  useEffect(() => {
    if (!isStreaming) {
      visibleRef.current = simplified.length;
      setVisibleCount(simplified.length);
      return;
    }

    visibleRef.current = Math.min(visibleRef.current, simplified.length);
    setVisibleCount(visibleRef.current);
    lastFrameRef.current = 0;

    const tick = (time: number) => {
      const target = targetRef.current;
      let current = visibleRef.current;

      if (!lastFrameRef.current) lastFrameRef.current = time;
      const deltaSec = Math.min(48, time - lastFrameRef.current) / 1000;
      lastFrameRef.current = time;

      if (current < target) {
        const gap = target - current;
        const baseRate = 42;
        const catchUp = Math.ceil(gap * 0.14);
        const step = Math.max(1, Math.min(gap, Math.ceil(baseRate * deltaSec) + catchUp));
        current = Math.min(target, current + step);
        visibleRef.current = current;
        setVisibleCount(current);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastFrameRef.current = 0;
    };
  }, [isStreaming, simplified]);

  const visible = simplified.slice(0, visibleCount);

  return (
    <div
      className={cn(
        'stream-smooth-text',
        isStreaming && 'stream-smooth-text--active',
        className,
      )}
    >
      <span className="stream-smooth-text__body whitespace-pre-wrap">{visible}</span>
      {isStreaming && cursor}
    </div>
  );
}
