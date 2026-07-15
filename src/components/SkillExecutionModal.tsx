import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  RotateCw,
} from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { Skill } from '../data/skills';
import { cn } from '@/lib/utils';
import { Button } from '@/src/components/ui/button';

interface LogEntry {
  time: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

interface SkillExecutionModalProps {
  theme: Theme;
  skill: Skill | null;
  isOpen: boolean;
  onClose: () => void;
  onRun: (skill: Skill, params: Record<string, string>, instanceId: string, connectionId: string) => void;
}

function runSimulation(
  skillName: string,
  setProgress: (v: number) => void,
  setPhase: (v: 'running' | 'completed' | 'failed') => void,
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>,
  setResultSummary: (v: string) => void,
  intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  retries = false,
) {
  setPhase('running');
  setProgress(0);
  setLogs([]);
  setResultSummary('');

  const addLog = (level: LogEntry['level'], message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [...prev, { time, level, message }]);
  };

  addLog('info', `${retries ? 'Retrying' : 'Starting'} "${skillName}"...`);

  let prog = 0;
  intervalRef.current = setInterval(() => {
    prog += Math.random() * 18 + 4;
    if (prog >= 100) {
      prog = 100;
      clearInterval(intervalRef.current);
      setProgress(100);

      const hasError = Math.random() < (retries ? 0.05 : 0.12);
      if (hasError) {
        setPhase('failed');
        addLog('error', 'Connection timeout — instance may be unreachable');
        addLog('error', 'API rate limit exceeded. Retry after 60s');
      } else {
        setPhase('completed');
        setResultSummary(`"${skillName}" completed successfully. Generated output is ready for review.`);
        addLog('info', 'Execution completed successfully');
        addLog('info', 'Output artifacts generated');
      }
    } else {
      setProgress(prog);
      if (prog > 15 && prog < 20) addLog('info', 'Connecting to ServiceNow instance...');
      if (prog > 35 && prog < 40) addLog('info', 'Validating parameters...');
      if (prog > 55 && prog < 60) addLog('info', 'Executing skill logic...');
      if (prog > 75 && prog < 80) addLog('info', 'Generating output artifacts...');
    }
  }, 350);
}

export default function SkillExecutionModal({
  theme,
  skill,
  isOpen,
  onClose,
  onRun,
}: SkillExecutionModalProps) {
  const isDark = isDarkTheme(theme);
  const [phase, setPhase] = useState<'running' | 'completed' | 'failed'>('running');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [resultSummary, setResultSummary] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOpen || !skill) return;
    runSimulation(skill.name, setProgress, setPhase, setLogs, setResultSummary, intervalRef);
  }, [isOpen, skill]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!isOpen || !skill) return null;

  const Icon = skill.icon;

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl',
          isDark ? 'border-white/[0.08] bg-[#111111]' : 'border-border bg-card',
        )}
        style={{ maxHeight: '80vh' }}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between border-b px-5 py-4',
            isDark ? 'border-white/[0.06]' : 'border-border',
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10">
              <Icon className="h-5 w-5 text-brand-green" />
            </div>
            <div>
              <h2 className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
                {skill.name}
              </h2>
              <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {skill.category}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'rounded-lg p-1.5 transition-colors',
              isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Status banner */}
          <div
            className={cn(
              'mb-4 flex items-center gap-3 rounded-xl border p-3',
              phase === 'completed'
                ? 'border-brand-green/30 bg-brand-green/5'
                : phase === 'failed'
                  ? 'border-red-500/30 bg-red-500/5'
                  : isDark
                    ? 'border-white/[0.06] bg-white/[0.02]'
                    : 'border-border bg-muted/40',
            )}
          >
            {phase === 'running' && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-green" />}
            {phase === 'completed' && <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-green" />}
            {phase === 'failed' && <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />}
            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>
              {phase === 'running' ? 'Executing skill...' : phase === 'completed' ? 'Execution complete' : 'Execution failed'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className={isDark ? 'text-white/50' : 'text-muted-foreground'}>Progress</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>{Math.round(progress)}%</span>
            </div>
            <div className={`h-2 w-full overflow-hidden rounded-full ${isDark ? 'bg-white/[0.06]' : 'bg-muted'}`}>
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  phase === 'failed' ? 'bg-red-400' : 'bg-brand-green',
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Live logs */}
          <div className={cn('rounded-xl border', isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-border bg-muted/40')}>
            <div className={cn('flex items-center gap-2 border-b px-3 py-2', isDark ? 'border-white/[0.06]' : 'border-border')}>
              <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={`text-[11px] font-medium ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>Logs</span>
            </div>
            <div className="max-h-48 overflow-y-auto p-3">
              {logs.length === 0 ? (
                <p className={`text-xs ${isDark ? 'text-white/30' : 'text-muted-foreground'}`}>Waiting for execution to start...</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-2 text-[11px] font-mono leading-relaxed">
                      <span className="shrink-0 text-muted-foreground">{log.time}</span>
                      <span
                        className={cn(
                          'shrink-0 font-semibold',
                          log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-amber-400' : 'text-brand-green',
                        )}
                      >
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className={isDark ? 'text-white/70' : 'text-foreground'}>{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Result summary */}
          {phase === 'completed' && resultSummary && (
            <div className="mt-4 rounded-xl border border-brand-green/30 bg-brand-green/5 p-3">
              <p className={`text-xs leading-relaxed ${isDark ? 'text-white/70' : 'text-foreground'}`}>{resultSummary}</p>
            </div>
          )}

          {/* Error details */}
          {phase === 'failed' && (
            <div className="mt-4 space-y-2">
              {logs.filter((l) => l.level === 'error').map((log, i) => (
                <div key={i} className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-400" />
                  <p className="text-[11px] text-red-300">{log.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={cn('flex items-center justify-end border-t px-5 py-3', isDark ? 'border-white/[0.06]' : 'border-border')}>
          {phase === 'failed' && (
            <Button
              variant="cta"
              size="sm"
              onClick={() => runSimulation(skill.name, setProgress, setPhase, setLogs, setResultSummary, intervalRef, true)}
              className="gap-1.5 text-xs"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          )}
          {phase === 'completed' && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
