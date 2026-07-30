import { Input } from '@/src/components/ui/input';
import type { SignupDraft } from '../../utils/signupStorage';
import { SignupFieldGroup } from './SignupFieldGroup';

const FREE_MAIL =
  /@(gmail|yahoo|hotmail|outlook|icloud|aol|protonmail|mail)\./i;
const signupInputClass =
  'border-border bg-mitra-input focus-visible:ring-ring/50';

interface SignupAccountStepProps {
  draft: SignupDraft;
  errors: Partial<Record<keyof SignupDraft | 'password' | 'terms', string>>;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
  onChange: (patch: Partial<SignupDraft>) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onAcceptedTermsChange: (value: boolean) => void;
}

export function SignupAccountStep({
  draft,
  errors,
  password,
  confirmPassword,
  acceptedTerms,
  onChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onAcceptedTermsChange,
}: SignupAccountStepProps) {
  const freeMailHint =
    draft.email.includes('@') && FREE_MAIL.test(draft.email)
      ? 'Work email preferred — you can still continue with this address.'
      : undefined;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold text-foreground">Create your account</h2>
        <p className="text-sm text-muted-foreground">
          Next you’ll open Organization Settings to create your org and invite users.
        </p>
      </div>

      <SignupFieldGroup label="Full name" htmlFor="signup-name" error={errors.fullName}>
        <Input
          id="signup-name"
          className={signupInputClass}
          value={draft.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          placeholder="Jordan Lee"
          autoComplete="name"
        />
      </SignupFieldGroup>

      <SignupFieldGroup
        label="Work email"
        htmlFor="signup-email"
        error={errors.email}
        hint={freeMailHint}
      >
        <Input
          id="signup-email"
          type="email"
          className={signupInputClass}
          value={draft.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="you@company.com"
          autoComplete="email"
        />
      </SignupFieldGroup>

      <SignupFieldGroup
        label="Password (optional)"
        htmlFor="signup-password"
        error={errors.password}
        hint="UI only for this demo — not stored or sent."
      >
        <Input
          id="signup-password"
          type="password"
          className={signupInputClass}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </SignupFieldGroup>

      {password.length > 0 && (
        <SignupFieldGroup
          label="Confirm password"
          htmlFor="signup-password-confirm"
          error={errors.password}
        >
          <Input
            id="signup-password-confirm"
            type="password"
            className={signupInputClass}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </SignupFieldGroup>
      )}

      <label className="flex items-start gap-2.5 text-[12px] text-muted-foreground">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => onAcceptedTermsChange(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 rounded border-border accent-[hsl(var(--brand-green))]"
        />
        <span>
          I agree to try Mitra in demo mode and understand this signup is for evaluation.
          {errors.terms && (
            <span className="mt-1 block text-destructive" role="alert">
              {errors.terms}
            </span>
          )}
        </span>
      </label>
    </div>
  );
}
