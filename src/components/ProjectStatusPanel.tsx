import type { ReactNode } from 'react';
import { Check, Circle, Loader2, Ban, UserCog, Building2, Users, Code2, Shield } from 'lucide-react';
import { Theme, UserRole, WorkflowSnapshot, WorkflowStep, WorkflowStepStatus } from '../types';
import { isDarkTheme } from '../utils/theme';
import { ROLE_LABELS } from '../constants/role';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const PERSONA_ICONS: Record<UserRole, ReactNode> = {
  architect: <UserCog className="h-3.5 w-3.5" aria-hidden />,
  business_owner: <Building2 className="h-3.5 w-3.5" aria-hidden />,
  stakeholder: <Users className="h-3.5 w-3.5" aria-hidden />,
  admin: <Shield className="h-3.5 w-3.5" aria-hidden />,
  developer: <Code2 className="h-3.5 w-3.5" aria-hidden />,
  security: <Shield className="h-3.5 w-3.5" aria-hidden />,
  sponsor: <Users className="h-3.5 w-3.5" aria-hidden />,
};

const STATUS_LABELS: Record<WorkflowStepStatus, string> = {
  complete: 'Complete',
  active: 'In progress',
  pending: 'Pending',
  blocked: 'Blocked',
};

interface ProjectStatusPanelProps {
  snapshot: WorkflowSnapshot | null;
  solutionTitle: string;
  theme?: Theme;
}

function StepNode({ status, isDark }: { status: WorkflowStepStatus; isDark: boolean }) {
  if (status === 'complete') {
    return (
      <div
        className={cn(
          'workflow-stepper-node workflow-stepper-node--complete flex h-5 w-5 items-center justify-center rounded-full border',
          isDark
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            : 'border-emerald-300 bg-emerald-50 text-emerald-600',
        )}
      >
        <Check className="h-3 w-3 stroke-[3]" aria-hidden />
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="relative flex h-5 w-5 items-center justify-center">
        <span
          className={cn(
            'absolute h-5 w-5 animate-ping rounded-full opacity-25',
            isDark ? 'bg-brand-green' : 'bg-emerald-400',
          )}
          aria-hidden
        />
        <div
          className={cn(
            'workflow-stepper-node workflow-stepper-node--active relative flex h-5 w-5 items-center justify-center rounded-full border',
            isDark
              ? 'border-brand-green/40 bg-brand-green/15 text-brand-green'
              : 'border-emerald-400 bg-emerald-50 text-emerald-700',
          )}
        >
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        </div>
      </div>
    );
  }

  if (status === 'blocked') {
    return (
      <div
        className={cn(
          'workflow-stepper-node workflow-stepper-node--blocked flex h-5 w-5 items-center justify-center rounded-full border',
          isDark
            ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
            : 'border-amber-300 bg-amber-50 text-amber-700',
        )}
      >
        <Ban className="h-3 w-3" aria-hidden />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'workflow-stepper-node workflow-stepper-node--pending flex h-4 w-4 items-center justify-center rounded-full border',
        isDark ? 'border-white/12 bg-transparent' : 'border-slate-300 bg-slate-100',
      )}
    >
      <Circle className="h-1.5 w-1.5 fill-current text-muted-foreground/35" aria-hidden />
    </div>
  );
}

function WorkflowStepRow({
  step,
  isLast,
  isDark,
}: {
  step: WorkflowStep;
  isLast: boolean;
  isDark: boolean;
}) {
  const isActive = step.status === 'active' || step.status === 'blocked';

  return (
    <div className="workflow-stepper-row">
      {!isLast && (
        <div
          className={cn(
            'workflow-stepper-connector',
            step.status === 'complete'
              ? isDark
                ? 'bg-emerald-500/25'
                : 'bg-emerald-300/70'
              : isDark
                ? 'bg-white/[0.06]'
                : 'bg-slate-200',
          )}
          aria-hidden
        />
      )}

      <div className="relative z-10 shrink-0 pt-0.5">
        <StepNode status={step.status} isDark={isDark} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-1.5 py-px text-[10px] font-medium leading-tight',
              isActive
                ? isDark
                  ? 'border-brand-green/25 bg-brand-green/10 text-brand-green'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : isDark
                  ? 'border-white/[0.06] bg-white/[0.03] text-muted-foreground'
                  : 'border-slate-200 bg-slate-50 text-slate-600',
            )}
          >
            {PERSONA_ICONS[step.personaRole]}
            {ROLE_LABELS[step.personaRole]}
          </span>
          <span
            className={cn(
              'text-[10px] font-medium tabular-nums',
              step.status === 'complete' && (isDark ? 'text-emerald-400/80' : 'text-emerald-600'),
              step.status === 'active' && (isDark ? 'text-brand-green' : 'text-emerald-700'),
              step.status === 'blocked' && (isDark ? 'text-amber-400' : 'text-amber-700'),
              step.status === 'pending' && 'text-muted-foreground/60',
            )}
          >
            {STATUS_LABELS[step.status]}
          </span>
        </div>

        <p
          className={cn(
            'workflow-stepper-title artifact-row-title text-[12px] font-medium',
            isActive ? 'text-foreground' : step.status === 'complete' ? 'text-foreground/75' : 'text-muted-foreground/70',
          )}
        >
          {step.label}
        </p>
      </div>
    </div>
  );
}

export function ProjectStatusPanel({
  snapshot,
  solutionTitle,
  theme = 'dark',
}: ProjectStatusPanelProps) {
  const isDark = isDarkTheme(theme);

  if (!snapshot) {
    return (
      <div className="artifact-panel flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
        <p className="artifact-row-title font-medium text-foreground/75">No project selected</p>
        <p className="artifact-row-meta mt-1 max-w-[200px] text-muted-foreground">
          Open a solution to track workflow status across personas.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="min-w-0 flex-1">
      <div className="px-4 py-3">
        <p className="artifact-row-meta text-[10px] uppercase tracking-wide text-muted-foreground/70">
          {solutionTitle}
        </p>

        <ol className="workflow-stepper mt-2" aria-label="Project workflow steps">
          {snapshot.steps.map((step, index) => (
            <li key={step.id}>
              <WorkflowStepRow
                step={step}
                isLast={index === snapshot.steps.length - 1}
                isDark={isDark}
              />
            </li>
          ))}
        </ol>
      </div>
    </ScrollArea>
  );
}
