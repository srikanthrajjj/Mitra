import { WorkflowStepper, DotStepper, type StepperStep } from '../../../MitraStepper';
import { DevShowcaseShell } from '../../shared/DevShowcaseShell';
import { STEPPER_CSS, STEPPER_HTML, STEPPER_REACT } from './snippets';
import './stepper.css';

const DEMO_STEPS: StepperStep[] = [
  {
    id: 'business_owner',
    label: 'Business Owner',
    status: 'complete',
    description: 'Requirements captured and signed off.',
  },
  {
    id: 'architect',
    label: 'Architect',
    status: 'active',
    description: 'Solution design and artifact generation underway.',
  },
  {
    id: 'security',
    label: 'Security',
    status: 'blocked',
    description: 'Waiting on ACL coverage review.',
  },
  {
    id: 'sponsor',
    label: 'Sponsor',
    status: 'pending',
    description: 'Executive sign-off, not yet started.',
  },
];

export function StepperShowcase() {
  return (
    <DevShowcaseShell
      title="Stepper"
      description="Progress indicators for multi-phase flows. Vertical variant mirrors the project workflow stepper in the artifact panel's Status tab; the dot variant mirrors the onboarding tour's step counter."
      notes={
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Vertical stepper statuses match{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">WorkflowStepStatus</code>:{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">complete</code>,{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">active</code>,{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">blocked</code>,{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">pending</code>.
          </li>
          <li>Always pass <code className="rounded bg-muted px-1 font-mono text-xs">isDark</code> — light mode needs the <code className="rounded bg-muted px-1 font-mono text-xs">--light</code> modifier class applied.</li>
          <li>
            Production reference:{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">ProjectStatusPanel</code> (vertical) and{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">OnboardingTour</code> (dots).
          </li>
        </ul>
      }
      previews={[
        {
          label: 'Vertical · Workflow',
          content: (theme) => (
            <WorkflowStepper steps={DEMO_STEPS} isDark={theme === 'dark'} className="w-full max-w-xs" />
          ),
        },
        {
          label: 'Horizontal · Dots',
          content: (theme) => <DotStepper totalSteps={4} currentIndex={1} isDark={theme === 'dark'} />,
        },
      ]}
      snippets={{ html: STEPPER_HTML, css: STEPPER_CSS, react: STEPPER_REACT }}
    />
  );
}
