import { type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const illuminaiteLogo = `${import.meta.env.BASE_URL}illuminaite-logo.png`;

interface IlluminaiteLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {}

export function IlluminaiteLogo({
  className,
  alt = 'IlluminAIte',
  ...props
}: IlluminaiteLogoProps) {
  return (
    <span className="illuminaite-logo inline-flex shrink-0 bg-transparent">
      <img
        src={illuminaiteLogo}
        alt={alt}
        className={cn(
          'bg-transparent object-contain transition-transform duration-300 hover:scale-110 cursor-pointer',
          className,
        )}
        {...props}
      />
    </span>
  );
}
