import { Input } from '@/src/components/ui/input';
import { SelectNative } from '@/src/components/ui/select-native';
import {
  SIGNUP_EXPERIENCE,
  SIGNUP_INDUSTRIES,
  SIGNUP_INSTANCE_TYPES,
  SIGNUP_MODULES,
  SIGNUP_ROLES,
  SIGNUP_TEAM_SIZES,
  SIGNUP_TIMELINES,
} from '../../data/signupQuestions';
import type { SignupDraft } from '../../utils/signupStorage';
import { SignupChipMulti, SignupFieldGroup } from './SignupFieldGroup';

const signupInputClass =
  'border-border bg-mitra-input focus-visible:ring-ring/50';

interface SignupQuestionsStepProps {
  draft: SignupDraft;
  errors: Partial<Record<keyof SignupDraft, string>>;
  onChange: (patch: Partial<SignupDraft>) => void;
}

export function SignupQuestionsStep({ draft, errors, onChange }: SignupQuestionsStepProps) {
  if (draft.path === 'admin') {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-foreground">About your organization</h2>
          <p className="text-sm text-muted-foreground">
            We’ll use this to prefill Organization Settings after you sign up.
          </p>
        </div>

        <SignupFieldGroup label="Company name" htmlFor="signup-company" error={errors.companyName}>
          <Input
            id="signup-company"
            className={signupInputClass}
            value={draft.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            placeholder="Acme Corp"
            autoComplete="organization"
          />
        </SignupFieldGroup>

        <SignupFieldGroup label="Industry" htmlFor="signup-industry" error={errors.industry}>
          <SelectNative
            id="signup-industry"
            className={signupInputClass}
            value={draft.industry}
            onChange={(e) => onChange({ industry: e.target.value })}
          >
            <option value="">Select industry</option>
            {SIGNUP_INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </SelectNative>
        </SignupFieldGroup>

        <SignupFieldGroup label="Team size" htmlFor="signup-team-size" error={errors.teamSize}>
          <SelectNative
            id="signup-team-size"
            className={signupInputClass}
            value={draft.teamSize}
            onChange={(e) => onChange({ teamSize: e.target.value })}
          >
            <option value="">Select team size</option>
            {SIGNUP_TEAM_SIZES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectNative>
        </SignupFieldGroup>

        <SignupFieldGroup label="ServiceNow instance" htmlFor="signup-instance" error={errors.instanceType}>
          <SelectNative
            id="signup-instance"
            className={signupInputClass}
            value={draft.instanceType}
            onChange={(e) => onChange({ instanceType: e.target.value })}
          >
            <option value="">Select instance type</option>
            {SIGNUP_INSTANCE_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectNative>
        </SignupFieldGroup>

        <SignupFieldGroup label="Modules in use" error={errors.modules}>
          <SignupChipMulti
            options={SIGNUP_MODULES}
            value={draft.modules}
            onChange={(modules) => onChange({ modules })}
          />
        </SignupFieldGroup>

        <SignupFieldGroup label="Rollout timeline" htmlFor="signup-timeline" error={errors.timeline}>
          <SelectNative
            id="signup-timeline"
            className={signupInputClass}
            value={draft.timeline}
            onChange={(e) => onChange({ timeline: e.target.value })}
          >
            <option value="">Select timeline</option>
            {SIGNUP_TIMELINES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectNative>
        </SignupFieldGroup>

        <SignupFieldGroup
          label="First question for Mitra (optional)"
          htmlFor="signup-first-q"
          hint="Saved for later — you’ll land in Organization Settings first."
        >
          <Input
            id="signup-first-q"
            className={signupInputClass}
            value={draft.firstQuestion}
            onChange={(e) => onChange({ firstQuestion: e.target.value })}
            placeholder="e.g. How should we model HRSD case routing?"
          />
        </SignupFieldGroup>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold text-foreground">ServiceNow focus</h2>
        <p className="text-sm text-muted-foreground">
          A few questions so Mitra can tailor your trial workspace.
        </p>
      </div>

      <SignupFieldGroup label="Your role" htmlFor="signup-role" error={errors.role}>
        <SelectNative
          id="signup-role"
          className={signupInputClass}
          value={draft.role}
          onChange={(e) => onChange({ role: e.target.value })}
        >
          <option value="">Select role</option>
          {SIGNUP_ROLES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </SelectNative>
      </SignupFieldGroup>

      <SignupFieldGroup label="ServiceNow experience" htmlFor="signup-exp" error={errors.experience}>
        <SelectNative
          id="signup-exp"
          className={signupInputClass}
          value={draft.experience}
          onChange={(e) => onChange({ experience: e.target.value })}
        >
          <option value="">Select experience</option>
          {SIGNUP_EXPERIENCE.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </SelectNative>
      </SignupFieldGroup>

      <SignupFieldGroup label="Primary interest" error={errors.interests}>
        <SignupChipMulti
          options={SIGNUP_MODULES}
          value={draft.interests}
          onChange={(interests) => onChange({ interests })}
        />
      </SignupFieldGroup>

      <SignupFieldGroup
        label="First question for Mitra (optional)"
        htmlFor="signup-first-q-try"
        hint="Saved for later — you’ll set up your organization next."
      >
        <Input
          id="signup-first-q-try"
          className={signupInputClass}
          value={draft.firstQuestion}
          onChange={(e) => onChange({ firstQuestion: e.target.value })}
          placeholder="e.g. Help me design an ITSM incident workflow"
        />
      </SignupFieldGroup>
    </div>
  );
}
