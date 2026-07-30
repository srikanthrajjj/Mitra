import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { MitraLogo } from '../MitraLogo';
import type { ResolvedTheme } from '../../types';
import { cn } from '@/lib/utils';
import { isDarkTheme } from '../../utils/theme';
import {
  emptySignupDraft,
  type SignupDraft,
  type SignupPath,
  type SignupProfile,
} from '../../utils/signupStorage';
import { SignupPathStep } from './SignupPathStep';
import { SignupQuestionsStep } from './SignupQuestionsStep';
import { SignupAccountStep } from './SignupAccountStep';

interface SignupPageProps {
  theme: ResolvedTheme;
  onComplete: (profile: SignupProfile) => void;
  onGuest: () => void;
  onBackToLanding: () => void;
}

type Step = 1 | 2 | 3;

type FieldErrors = Partial<Record<keyof SignupDraft | 'password' | 'terms', string>>;

function validateStep(
  step: Step,
  draft: SignupDraft,
  password: string,
  confirmPassword: string,
  acceptedTerms: boolean,
): FieldErrors {
  const errors: FieldErrors = {};

  if (step === 1) {
    if (!draft.path) errors.path = 'Choose how you want to get started.';
    return errors;
  }

  if (step === 2) {
    if (draft.path === 'admin') {
      if (!draft.companyName.trim()) errors.companyName = 'Company name is required.';
      if (!draft.industry) errors.industry = 'Select an industry.';
      if (!draft.teamSize) errors.teamSize = 'Select a team size.';
      if (!draft.instanceType) errors.instanceType = 'Select an instance type.';
      if (draft.modules.length === 0) errors.modules = 'Pick at least one module.';
      if (!draft.timeline) errors.timeline = 'Select a timeline.';
    } else {
      if (!draft.role) errors.role = 'Select your role.';
      if (!draft.experience) errors.experience = 'Select your experience.';
      if (draft.interests.length === 0) errors.interests = 'Pick at least one interest.';
    }
    return errors;
  }

  if (!draft.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!draft.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (password && password !== confirmPassword) {
    errors.password = 'Passwords do not match.';
  }
  if (!acceptedTerms) errors.terms = 'Please accept to continue.';
  return errors;
}

export function SignupPage({ theme, onComplete, onGuest, onBackToLanding }: SignupPageProps) {
  const isDark = isDarkTheme(theme);
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<SignupDraft>(emptySignupDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const patchDraft = (patch: Partial<SignupDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof SignupDraft)[]) {
        delete next[key];
      }
      return next;
    });
  };

  const selectPath = (path: SignupPath) => {
    patchDraft({ path });
  };

  const goNext = async () => {
    const nextErrors = validateStep(step, draft, password, confirmPassword, acceptedTerms);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (step < 3) {
      setStep((s) => (s + 1) as Step);
      return;
    }

    if (!draft.path) return;
    setSubmitting(true);
    const profile: SignupProfile = {
      ...draft,
      path: draft.path,
      email: draft.email.trim(),
      fullName: draft.fullName.trim(),
      companyName: draft.companyName.trim(),
      completedAt: new Date().toISOString(),
    };

    try {
      void fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: profile.path,
          email: profile.email,
          fullName: profile.fullName,
          companyName: profile.companyName,
          industry: profile.industry,
        }),
      }).catch(() => {});
    } catch {
      /* ignore */
    }

    await new Promise((r) => setTimeout(r, 500));
    onComplete(profile);
  };

  const goBack = () => {
    setErrors({});
    if (step === 1) {
      onBackToLanding();
      return;
    }
    setStep((s) => (s - 1) as Step);
  };

  return (
    <div
      className={cn(
        theme,
        'min-h-screen text-foreground',
        isDark ? 'bg-background' : 'bg-light-canvas',
      )}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-8 sm:px-6">
        <div
          className={cn(
            'rounded-2xl border px-5 py-6 sm:px-6 sm:py-7',
            isDark
              ? 'border-border bg-mitra-surface'
              : 'border-border bg-card',
          )}
        >
        <div className="mb-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {step === 1 ? 'Back to landing' : 'Back'}
          </button>
          <div className="flex items-center gap-2">
            <MitraLogo className="h-6 w-6" />
            <span className="font-display text-sm font-bold tracking-tight">Mitra</span>
          </div>
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Step {step} of 3
          </p>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  n <= step ? 'bg-brand-green' : 'bg-muted',
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex-1">
          {step === 1 && (
            <SignupPathStep
              selected={draft.path}
              onSelect={selectPath}
              onGuest={onGuest}
            />
          )}
          {step === 2 && (
            <SignupQuestionsStep
              draft={draft}
              errors={errors}
              onChange={patchDraft}
            />
          )}
          {step === 3 && (
            <SignupAccountStep
              draft={draft}
              errors={errors}
              password={password}
              confirmPassword={confirmPassword}
              acceptedTerms={acceptedTerms}
              onChange={patchDraft}
              onPasswordChange={(v) => {
                setPassword(v);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.password;
                  return next;
                });
              }}
              onConfirmPasswordChange={(v) => {
                setConfirmPassword(v);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.password;
                  return next;
                });
              }}
              onAcceptedTermsChange={(v) => {
                setAcceptedTerms(v);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.terms;
                  return next;
                });
              }}
            />
          )}
          {errors.path && step === 1 && (
            <p className="mt-3 text-center text-[11px] text-destructive" role="alert">
              {errors.path}
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {step > 1 && (
            <Button type="button" variant="ghost" onClick={goBack} disabled={submitting}>
              Back
            </Button>
          )}
          <Button
            type="button"
            variant="cta"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => void goNext()}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up…
              </>
            ) : step === 3 ? (
              'Create account & continue'
            ) : (
              'Continue'
            )}
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
