import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SignupFieldGroup({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-[12px] font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function SignupChipMulti({
  options,
  value,
  onChange,
  error,
}: {
  options: readonly { value: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
}) {
  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors',
                selected
                  ? 'border-brand-green/40 bg-brand-green/10 text-brand-green'
                  : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-[11px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
