import { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileStack,
  GitBranch,
  Loader2,
  Share2,
} from 'lucide-react';
import { SolutionArtifact, SolutionBlueprint } from '../types';
import { ArtifactTypeIcon, ArtifactFormatBadge } from '../utils/artifactDisplay';
import { cn } from '@/lib/utils';

interface RightSidebarProps {
  blueprint: SolutionBlueprint | null;
  isGeneratingMessage: boolean;
  chatHistory: { sender: string; text: string }[];
  artifacts: SolutionArtifact[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onShareArtifact?: (artifact: SolutionArtifact) => void;
}

type SidebarTab = 'artifacts' | 'status';

const WORKFLOW_STEPS = [
  { label: 'Define', description: 'Capture structured requirements' },
  { label: 'Design & Develop', description: 'Configure & build on platform' },
  { label: 'Test', description: 'Validate with integrated testing' },
  { label: 'Document', description: 'Auto-generate training materials' },
  { label: 'Deploy', description: 'Release to production seamlessly' },
];

function getCompletedMitraCount(
  chatHistory: { sender: string; text: string }[],
  isGenerating: boolean,
): number {
  const withText = chatHistory.filter(
    (m) => m.sender === 'mitra' && m.text.trim().length > 0,
  );

  if (!isGenerating) return withText.length;

  const last = chatHistory[chatHistory.length - 1];
  if (last?.sender !== 'mitra') return withText.length;

  return chatHistory.filter(
    (m, i) => m.sender === 'mitra' && m.text.trim().length > 0 && i < chatHistory.length - 1,
  ).length;
}

function getActiveStepIndex(
  status: SolutionBlueprint['status'] | undefined,
  completedMitraCount: number,
  isGenerating: boolean,
): number {
  if (status === 'completed') return WORKFLOW_STEPS.length;
  if (status === 'not_started' && completedMitraCount === 0 && !isGenerating) return -1;

  if (isGenerating) {
    return Math.min(completedMitraCount, WORKFLOW_STEPS.length - 1);
  }

  return Math.min(completedMitraCount, WORKFLOW_STEPS.length);
}

type StepState = 'completed' | 'in-progress' | 'pending';

function getStepState(stepIndex: number, activeIndex: number): StepState {
  if (activeIndex < 0) return 'pending';
  if (activeIndex >= WORKFLOW_STEPS.length) return 'completed';
  if (stepIndex < activeIndex) return 'completed';
  if (stepIndex === activeIndex) return 'in-progress';
  return 'pending';
}

function getStepTime(state: StepState): string {
  if (state === 'in-progress') return 'Running';
  if (state === 'completed') return 'Done';
  return '—';
}

function StepNode({ state }: { state: StepState }) {
  if (state === 'completed') {
    return (
      <div
        className={cn(
          'workflow-stepper-node workflow-stepper-node--complete',
          'flex h-5 w-5 items-center justify-center rounded-full border border-border bg-muted text-brand-green',
        )}
      >
        <Check className="h-3 w-3 stroke-[2.5]" aria-hidden />
      </div>
    );
  }

  if (state === 'in-progress') {
    return (
      <div className="relative flex h-5 w-5 items-center justify-center">
        <div
          className={cn(
            'workflow-stepper-node workflow-stepper-node--active',
            'relative flex h-5 w-5 items-center justify-center rounded-full border border-brand-green/40 bg-brand-green/10 text-brand-green',
          )}
        >
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'workflow-stepper-node workflow-stepper-node--pending',
        'flex h-4 w-4 items-center justify-center rounded-full border border-border bg-transparent',
      )}
      aria-hidden
    />
  );
}

function WorkflowStepRow({
  step,
  state,
  isLast,
}: {
  step: (typeof WORKFLOW_STEPS)[number];
  state: StepState;
  isLast: boolean;
}) {
  const isActive = state === 'in-progress';
  const isComplete = state === 'completed';
  const statusLabel = getStepTime(state);

  return (
    <div className="workflow-stepper-row">
      {!isLast && (
        <div
          className={cn(
            'workflow-stepper-connector',
            isComplete ? 'bg-brand-green/35' : 'bg-border',
          )}
          aria-hidden
        />
      )}

      <div className="relative z-10 shrink-0 pt-0.5">
        <StepNode state={state} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p
            className={cn(
              'min-w-0 flex-1 text-[12px] leading-snug',
              isActive && 'font-semibold text-foreground',
              isComplete && 'font-medium text-foreground/85',
              state === 'pending' && 'font-medium text-muted-foreground',
            )}
          >
            {step.label}
          </p>
          {state !== 'pending' && (
            <span
              className={cn(
                'shrink-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wide',
                isActive
                  ? 'text-brand-green'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {statusLabel}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">
          {step.description}
        </p>
      </div>
    </div>
  );
}

function downloadArtifact(artifact: SolutionArtifact) {
  const content = [
    `ServiceNow Studio Artifact`,
    `Name: ${artifact.name}`,
    `Filing: ${artifact.filingName}`,
    `Format: ${artifact.artifactFormat}`,
    `Stage: ${artifact.buildStage}`,
    `Status: ${artifact.status}`,
    `Version: ${artifact.version ?? '1.0'}`,
    ``,
    `Generated by Mitra — AI Agents powered implementations`,
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${artifact.filingName}.${artifact.artifactFormat.toLowerCase()}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ArtifactsTab({
  artifacts,
  onShare,
}: {
  artifacts: SolutionArtifact[];
  onShare?: (artifact: SolutionArtifact) => void;
}) {
  if (artifacts.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <FileStack className="mb-2 h-5 w-5 text-muted-foreground/50" strokeWidth={1.5} />
        <p className="text-[12px] font-medium text-foreground/80">No artifacts yet</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Mitra generates ServiceNow Studio files as your blueprint takes shape.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2.5 py-3">
      <div className="flex flex-col gap-1">
        {artifacts.map((artifact) => (
          <div
            key={artifact.id}
            className="group flex items-center gap-2.5 rounded-lg border border-transparent bg-mitra-surface/30 px-2.5 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-mitra-highlight hover:shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
          >
            <ArtifactTypeIcon type={artifact.type} className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green/80" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-foreground" title={artifact.name}>
                {artifact.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <ArtifactFormatBadge format={artifact.artifactFormat} />
                <span className="truncate font-mono text-[8px] text-muted-foreground/70" title={artifact.filingName}>
                  {artifact.filingName}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => downloadArtifact(artifact)}
                aria-label={`Download ${artifact.name}`}
                title="Download file"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-brand-green"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onShare?.(artifact)}
                aria-label={`Share ${artifact.name}`}
                title="Share artifact"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-brand-green"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusTab({
  blueprint,
  isGeneratingMessage,
  chatHistory,
}: {
  blueprint: SolutionBlueprint | null;
  isGeneratingMessage: boolean;
  chatHistory: { sender: string; text: string }[];
}) {
  const completedMitraCount = getCompletedMitraCount(chatHistory, isGeneratingMessage);
  const activeIndex = getActiveStepIndex(
    blueprint?.status,
    completedMitraCount,
    isGeneratingMessage,
  );
  const phaseLabel = activeIndex < 0 ? '—' : Math.min(activeIndex + 1, 5);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5">
      <ol className="workflow-stepper" aria-label="Implementation workflow steps">
        {WORKFLOW_STEPS.map((step, idx) => {
          const state = getStepState(idx, activeIndex);

          return (
            <li key={step.label}>
              <WorkflowStepRow
                step={step}
                state={state}
                isLast={idx === WORKFLOW_STEPS.length - 1}
              />
            </li>
          );
        })}
      </ol>

      <div className="mt-6 border-t border-border pt-3 text-center">
        <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          Phase {phaseLabel} / 5
        </span>
      </div>
    </div>
  );
}

function TabButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof FileStack;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
        active ? 'bg-accent text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
      <span>{label}</span>
    </button>
  );
}

export default function RightSidebar({
  blueprint,
  isGeneratingMessage,
  chatHistory,
  artifacts,
  isCollapsed,
  onToggleCollapse,
  onShareArtifact,
}: RightSidebarProps) {
  const [tab, setTab] = useState<SidebarTab>('status');

  const completedMitraCount = getCompletedMitraCount(chatHistory, isGeneratingMessage);
  const activeIndex = getActiveStepIndex(
    blueprint?.status,
    completedMitraCount,
    isGeneratingMessage,
  );
  const hasActivePipeline = activeIndex >= 0;

  const sidebarShell = 'bg-mitra-bg';

  if (isCollapsed) {
    return (
      <div
        onClick={onToggleCollapse}
        className={`pipeline-sidebar h-full w-11 shrink-0 cursor-pointer flex flex-col items-center py-3 transition-all duration-300 group ${
          hasActivePipeline ? 'bg-mitra-bg' : sidebarShell
        }`}
        title="Expand panel"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className="relative z-10 p-1.5 rounded-md transition-colors cursor-pointer text-muted-foreground group-hover:text-brand-green"
          aria-label="Expand panel"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center py-3 relative min-h-0">
          <div
            className={`absolute top-3 bottom-3 left-1/2 -translate-x-1/2 w-px rounded-full ${
              hasActivePipeline
                ? 'bg-border'
                : 'bg-mitra-border/30'
            }`}
          />

          <div className="relative z-10 flex flex-col items-center gap-3">
            {WORKFLOW_STEPS.map((step, idx) => {
              const state = getStepState(idx, activeIndex);

              return (
                <div key={step.label} title={step.label} className="flex items-center justify-center">
                  {state === 'completed' && <div className="w-2 h-2 rounded-full bg-brand-green/50" />}
                  {state === 'in-progress' && (
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-3.5 h-3.5 rounded-full animate-ping opacity-30 bg-brand-green" />
                      <div className="relative w-2.5 h-2.5 rounded-full border bg-brand-green/80 border-brand-green shadow-[0_0_8px_rgba(50,215,75,0.5)]" />
                    </div>
                  )}
                  {state === 'pending' && (
                    <div className="w-2 h-2 rounded-full bg-mitra-border/40" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {hasActivePipeline && (
          <span className="relative z-10 text-[9px] font-mono tabular-nums pb-1 text-brand-green/70">
            {Math.min(activeIndex + 1, 5)}/5
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full lg:w-[300px] xl:w-[320px] shrink-0 h-full overflow-hidden flex flex-col ${sidebarShell}`}
    >
      {/* Tab bar + collapse */}
      <div className="flex items-center gap-2 border-b border-mitra-border px-2.5 py-2">
        <div className="flex min-w-0 flex-1 gap-0.5 rounded-lg bg-muted/30 p-0.5">
          <TabButton
            active={tab === 'artifacts'}
            label="Artifacts"
            icon={FileStack}
            onClick={() => setTab('artifacts')}
          />
          <TabButton
            active={tab === 'status'}
            label="Status"
            icon={GitBranch}
            onClick={() => setTab('status')}
          />
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-mitra-surface hover:text-brand-green"
          title="Collapse panel"
          aria-label="Collapse panel"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      {tab === 'artifacts' ? (
        <ArtifactsTab artifacts={artifacts} onShare={onShareArtifact} />
      ) : (
        <StatusTab
          blueprint={blueprint}
          isGeneratingMessage={isGeneratingMessage}
          chatHistory={chatHistory}
        />
      )}
    </div>
  );
}
