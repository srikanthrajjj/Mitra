import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-brand-green text-[#030d0a] font-semibold shadow-[0_0_12px_rgba(0,255,102,0.35)] hover:bg-brand-green-hover hover:shadow-[0_0_16px_rgba(0,255,102,0.45)] active:scale-[0.98]',
        cta:
          'bg-brand-green text-[#030d0a] font-semibold shadow-[0_0_12px_rgba(0,255,102,0.35)] hover:bg-brand-green-hover hover:shadow-[0_0_16px_rgba(0,255,102,0.45)] active:scale-[0.98]',
        destructive:
          'rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]',
        outline:
          'rounded-full border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'rounded-full bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'rounded-full hover:bg-accent hover:text-accent-foreground',
        link: 'rounded-full text-brand-green underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-full px-3 text-xs',
        lg: 'h-10 rounded-full px-8',
        icon: 'h-9 w-9 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
