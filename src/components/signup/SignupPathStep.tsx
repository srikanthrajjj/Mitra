import { Building2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SignupPath } from '../../utils/signupStorage';

interface SignupPathStepProps {
  selected: SignupPath | null;
  onSelect: (path: SignupPath) => void;
  onGuest: () => void;
}

export function SignupPathStep({ selected, onSelect, onGuest }: SignupPathStepProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Create your Mitra account
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose how you want to get started — you can invite your team after signup.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect('admin')}
          className={cn(
            'flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors',
            selected === 'admin'
              ? 'border-brand-green/40 bg-brand-green/10'
              : 'border-border bg-card hover:bg-accent',
          )}
        >
          <span className="inline-flex items-center gap-2 rounded-md bg-brand-green/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-green">
            Recommended
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-brand-green">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Set up for my organization</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              Answer a few org questions, then create your workspace and invite users.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect('try')}
          className={cn(
            'flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors',
            selected === 'try'
              ? 'border-brand-green/40 bg-brand-green/10'
              : 'border-border bg-card hover:bg-accent',
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-brand-green">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Try Mitra</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              Tell us about your ServiceNow focus, then set up a workspace to explore.
            </p>
          </div>
        </button>
      </div>

      <p className="text-center text-[12px] text-muted-foreground">
        <button
          type="button"
          onClick={onGuest}
          className="font-medium text-brand-green hover:text-brand-green-hover"
        >
          Just explore as a guest
        </button>
        {' '}
        — skip signup for now
      </p>
    </div>
  );
}
