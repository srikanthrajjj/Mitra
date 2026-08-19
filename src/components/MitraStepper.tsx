import { Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StepStatus = 'complete' | 'active' | 'blocked' | 'pending';

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
  status: StepStatus;
}

const STATUS_LABEL: Record<StepStatus, string> = {
  complete: 'Complete',
  active: 'In progress',
  blocked: 'Blocked',
  pending: 'Pending',
};

function StepNode({ status }: { status: StepStatus }) {
  if (status === 'complete') {
    return (
      <div className="mitra-stepper__node mitra-stepper__node--complete">
        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
      </div>
    );
  }
  if (status === 'active') {
    return (
      <div className="mitra-stepper__node mitra-stepper__node--active">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
      </div>
    );
  }
  if (status === 'blocked') {
    return (
      <div className="mitra-stepper__node mitra-stepper__node--blocked">
        <X className="h-3 w-3" aria-hidden="true" />
      </div>
    );
  }
  return <div className="mitra-stepper__node mitra-stepper__node--pending" aria-hidden="true" />;
}

interface WorkflowStepperProps {
  steps: StepperStep[];
  isDark?: boolean;
  className?: string;
}

/** Vertical progress stepper — mirrors the project workflow stepper in the artifact panel's Status tab. */
export function WorkflowStepper({ steps, isDark = true, className }: WorkflowStepperProps) {
  return (
    <ol className={cn('mitra-stepper', !isDark && 'mitra-stepper--light', className)} aria-label="Progress steps">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.id} className="mitra-stepper__row">
            {!isLast && (
              <div
                className={cn(
                  'mitra-stepper__connector',
                  step.status === 'complete' && 'mitra-stepper__connector--complete',
                )}
                aria-hidden="true"
              />
            )}
            <div className="mitra-stepper__node-slot">
              <StepNode status={step.status} />
            </div>
            <div className="mitra-stepper__content">
              <div className="mitra-stepper__meta">
                <span className={cn('mitra-stepper__label', `mitra-stepper__label--${step.status}`)}>
                  {step.label}
                </span>
                <span className={cn('mitra-stepper__status', `mitra-stepper__status--${step.status}`)}>
                  {STATUS_LABEL[step.status]}
                </span>
              </div>
              {step.description && <p className="mitra-stepper__description">{step.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

interface DotStepperProps {
  totalSteps: number;
  currentIndex: number;
  isDark?: boolean;
  className?: string;
}

/** Horizontal compact stepper — mirrors the "Step X of Y" dots in the onboarding tour. */
export function DotStepper({ totalSteps, currentIndex, isDark = true, className }: DotStepperProps) {
  return (
    <div className={cn('mitra-stepper-dots', !isDark && 'mitra-stepper-dots--light', className)}>
      <p className="mitra-stepper-dots__label">
        Step {currentIndex + 1} of {totalSteps}
      </p>
      <div
        className="mitra-stepper-dots__track"
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
      >
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            className={cn(
              'mitra-stepper-dots__node',
              i === currentIndex && 'mitra-stepper-dots__node--active',
              i < currentIndex && 'mitra-stepper-dots__node--done',
            )}
          />
        ))}
      </div>
    </div>
  );
}
