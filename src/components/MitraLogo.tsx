import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const mitraLogo = `${import.meta.env.BASE_URL}mitra-logo-static.png`;

/** Nav logo pulse interval - use 10_000 in dev to test quickly. */
const NAV_LOGO_INTERVAL_MS = 4 * 60 * 1000;
const NAV_LOGO_ANIMATION_MS = 2500;

interface MitraLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  animated?: boolean;
}

export function MitraLogo({
  animated = false,
  className,
  alt = 'Mitra',
  ...props
}: MitraLogoProps) {
  return (
    <span
      className={cn(
        'mitra-logo inline-flex shrink-0 bg-transparent',
        animated && 'mitra-logo--animated',
      )}
    >
      <img
        src={mitraLogo}
        alt={alt}
        className={cn('bg-transparent object-contain transition-transform duration-300 hover:rotate-6 hover:scale-110 cursor-pointer', className)}
        {...props}
      />
    </span>
  );
}

/** Plays the nav logo animation briefly every 4 minutes. */
export function useNavLogoPulse() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    let pulseTimeoutId: number | undefined;

    const intervalId = window.setInterval(() => {
      setAnimated(true);
      pulseTimeoutId = window.setTimeout(() => setAnimated(false), NAV_LOGO_ANIMATION_MS);
    }, NAV_LOGO_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      if (pulseTimeoutId !== undefined) {
        window.clearTimeout(pulseTimeoutId);
      }
    };
  }, []);

  return animated;
}
