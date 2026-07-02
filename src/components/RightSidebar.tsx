import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { SolutionBlueprint, Theme } from '../types';
import { isDarkTheme } from '../utils/theme';

interface RightSidebarProps {
  theme: Theme;
  blueprint: SolutionBlueprint | null;
  isGeneratingMessage: boolean;
  chatHistory: { sender: string; text: string }[];
  onViewDetails?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const PROCESS_NAME = 'ServiceNow Developer Workspace';
const PROCESS_SUBTITLE = 'AI Agents powered implementations';

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

function StepNode({ state, isDark }: { state: StepState; isDark: boolean }) {
  if (state === 'completed') {
    return (
      <div className={`relative w-5 h-5 rounded-full flex items-center justify-center ${
        isDark
          ? 'bg-white/[0.06] text-slate-400 border border-white/10'
          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
      }`}>
        <Check className="w-3 h-3 stroke-[3]" />
      </div>
    );
  }

  if (state === 'in-progress') {
    return (
      <div className="relative w-5 h-5 flex items-center justify-center">
        <div className={`relative w-5 h-5 rounded-full flex items-center justify-center ${
          isDark
            ? 'accent-neon-glow bg-brand-green/12 text-brand-green border border-brand-green/25'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm'
        }`}>
          <Loader2 className="w-3 h-3 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-4 h-4 rounded-full border ${
      isDark
        ? 'border-white/15 bg-transparent shadow-[inset_0_0_6px_rgba(255,255,255,0.04)]'
        : 'border-slate-300 bg-slate-100'
    }`} />
  );
}

export default function RightSidebar({
  theme,
  blueprint,
  isGeneratingMessage,
  chatHistory,
  isCollapsed,
  onToggleCollapse,
}: RightSidebarProps) {
  const isDark = isDarkTheme(theme);

  const completedMitraCount = getCompletedMitraCount(chatHistory, isGeneratingMessage);
  const activeIndex = getActiveStepIndex(
    blueprint?.status,
    completedMitraCount,
    isGeneratingMessage,
  );
  const phaseLabel = activeIndex < 0 ? '—' : Math.min(activeIndex + 1, 5);

  const sidebarShell = isDark
    ? 'vr-space-environment border-white/[0.04] hover:bg-white/[0.02]'
    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/60';

  const hasActivePipeline = activeIndex >= 0;

  if (isCollapsed) {
    return (
      <div
        onClick={onToggleCollapse}
        className={`pipeline-sidebar h-full w-11 shrink-0 cursor-pointer flex flex-col items-center py-3 transition-all duration-300 border-l group ${
          hasActivePipeline
            ? isDark
              ? 'border-l-brand-green/25 bg-white/[0.02]'
              : 'border-l-emerald-300/80 bg-emerald-50/30'
            : sidebarShell
        }`}
        title="Expand pipeline"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className={`relative z-10 p-1.5 rounded-md transition-colors cursor-pointer ${
            isDark
              ? 'text-slate-500 group-hover:text-brand-green'
              : 'text-slate-400 group-hover:text-emerald-600'
          }`}
          aria-label="Expand pipeline"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center py-3 relative min-h-0">
          <div
            className={`absolute top-3 bottom-3 left-1/2 -translate-x-1/2 w-px rounded-full ${
              hasActivePipeline
                ? isDark
                  ? 'bg-gradient-to-b from-brand-green/40 via-white/10 to-white/5'
                  : 'bg-gradient-to-b from-emerald-400/50 to-slate-200/60'
                : isDark
                  ? 'bg-white/[0.06]'
                  : 'bg-slate-200/80'
            }`}
          />

          <div className="relative z-10 flex flex-col items-center gap-3">
            {WORKFLOW_STEPS.map((step, idx) => {
              const state = getStepState(idx, activeIndex);

              return (
                <div
                  key={step.label}
                  title={step.label}
                  className="flex items-center justify-center"
                >
                  {state === 'completed' && (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isDark ? 'bg-brand-green/50' : 'bg-emerald-400/70'
                      }`}
                    />
                  )}
                  {state === 'in-progress' && (
                    <div className="relative flex items-center justify-center">
                      <span
                        className={`absolute w-3.5 h-3.5 rounded-full animate-ping opacity-30 ${
                          isDark ? 'bg-brand-green' : 'bg-emerald-400'
                        }`}
                      />
                      <div
                        className={`relative w-2.5 h-2.5 rounded-full border ${
                          isDark
                            ? 'bg-brand-green/80 border-brand-green shadow-[0_0_8px_rgba(50,215,75,0.5)]'
                            : 'bg-emerald-500 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.35)]'
                        }`}
                      />
                    </div>
                  )}
                  {state === 'pending' && (
                    <div
                      className={`w-2 h-2 rounded-full border ${
                        isDark ? 'border-white/20 bg-transparent' : 'border-slate-300/80 bg-white'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {hasActivePipeline && (
          <span
            className={`relative z-10 text-[9px] font-mono tabular-nums pb-1 ${
              isDark ? 'text-brand-green/70' : 'text-emerald-600/80'
            }`}
          >
            {phaseLabel}/5
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full lg:w-[300px] xl:w-[320px] shrink-0 h-full overflow-hidden border-l flex flex-col ${sidebarShell}`}>
      <div className="absolute top-3 right-3 z-20">
        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-lg cursor-pointer backdrop-blur-sm ${
            isDark
              ? 'text-slate-400 hover:text-brand-green bg-black/20 border border-white/[0.06]'
              : 'text-slate-500 hover:bg-white/80 border border-slate-200'
          }`}
          title="Collapse panel"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-8">
        <div className={`w-full max-w-[260px] rounded-2xl px-5 py-6 ${
          isDark
            ? 'vr-glass-surface backdrop-blur-[2px]'
            : 'bg-white border border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
        }`}>
          <div className="text-center mb-8">
            <h2 className={`text-[13px] font-semibold leading-snug ${
              isDark ? 'text-illuminate-text' : 'text-slate-900'
            }`}>
              {PROCESS_NAME}
            </h2>
            <p className={`text-[10px] mt-1.5 ${isDark ? 'text-illuminate-muted' : 'text-slate-500'}`}>
              {PROCESS_SUBTITLE}
            </p>
          </div>

          <div className="relative pl-7">
            <div className={`absolute top-3 bottom-3 left-[9px] w-[2px] rounded-full ${
              isDark
                ? 'vr-step-beam'
                : 'bg-gradient-to-b from-emerald-400/60 to-slate-200/80'
            }`} />

            {WORKFLOW_STEPS.map((step, idx) => {
              const state = getStepState(idx, activeIndex);
              const timeLabel = getStepTime(state);

              return (
                <div
                  key={step.label}
                  className={`relative pb-7 last:pb-0 transition-all duration-500 ease-out ${
                    state === 'pending' ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <div className="absolute -left-7 top-0 flex items-center justify-center w-5 h-5 transition-all duration-400">
                    <StepNode state={state} isDark={isDark} />
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className={`text-[12px] font-semibold tracking-wide transition-colors duration-400 ${
                        state === 'in-progress'
                          ? isDark ? 'text-illuminate-text' : 'text-slate-900'
                          : state === 'completed'
                            ? isDark ? 'text-illuminate-muted' : 'text-slate-500'
                            : isDark ? 'text-slate-500' : 'text-slate-600'
                      }`}>
                        {step.label}
                      </div>
                      <p className={`text-[10.5px] mt-0.5 leading-snug ${
                        isDark ? 'text-illuminate-muted/80' : 'text-slate-500'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                    <span className={`text-[9px] font-mono shrink-0 pt-0.5 uppercase tracking-wider transition-colors duration-400 ${
                      state === 'in-progress'
                        ? isDark ? 'text-brand-green' : 'text-emerald-600'
                        : state === 'completed'
                          ? isDark ? 'text-slate-500' : 'text-slate-400'
                          : isDark ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {timeLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`mt-8 pt-4 border-t text-center ${
            isDark ? 'border-white/[0.06]' : 'border-slate-200/60'
          }`}>
            <span className={`text-[9px] font-mono uppercase tracking-[0.18em] ${
              isDark ? 'text-illuminate-muted' : 'text-slate-500'
            }`}>
              Phase {phaseLabel} / 5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
