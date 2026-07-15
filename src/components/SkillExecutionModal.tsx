import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Eye,
  SlidersHorizontal,
  Server,
  Link2,
  Play,
  Activity,
  Monitor,
  FileOutput,
  ScrollText,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { Skill } from '../data/skills';
import {
  SERVICE_NOW_INSTANCES,
  instanceHostname,
} from '../data/serviceNowInstances';
import { cn } from '@/lib/utils';
import { Button } from '@/src/components/ui/button';
import { Switch } from '@/src/components/ui/switch';

type StepId =
  | 'preview'
  | 'parameters'
  | 'instance'
  | 'connection'
  | 'run'
  | 'progress'
  | 'status'
  | 'results'
  | 'logs'
  | 'errors';

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

const STEPS: { id: StepId; label: string; icon: React.ElementType }[] = [
  { id: 'preview', label: 'Preview Skill', icon: Eye },
  { id: 'parameters', label: 'Edit Parameters', icon: SlidersHorizontal },
  { id: 'instance', label: 'Select Instance', icon: Server },
  { id: 'connection', label: 'Select Connection', icon: Link2 },
  { id: 'run', label: 'Run Skill', icon: Play },
  { id: 'progress', label: 'Track Progress', icon: Activity },
  { id: 'status', label: 'Execution Status', icon: Monitor },
  { id: 'results', label: 'View Results', icon: FileOutput },
  { id: 'logs', label: 'View Logs', icon: ScrollText },
  { id: 'errors', label: 'Error Handling', icon: AlertTriangle },
];

const MOCK_CONNECTIONS = [
  { id: 'conn-1', name: 'POC RAVI', tag: 'PDI', active: true },
  { id: 'conn-2', name: 'Staging Instance', tag: 'STAGE', active: true },
  { id: 'conn-3', name: 'QA Automation', tag: 'QA', active: false },
  { id: 'conn-4', name: 'Production Sync', tag: 'PROD', active: true },
];

export default function SkillExecutionModal({
  theme,
  skill,
  isOpen,
  onClose,
  onRun,
}: SkillExecutionModalProps) {
  const isDark = isDarkTheme(theme);
  const [activeStep, setActiveStep] = useState<StepId>('preview');
  const [params, setParams] = useState<Record<string, string>>({});
  const [selectedInstance, setSelectedInstance] = useState('');
  const [selectedConnection, setSelectedConnection] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [results, setResults] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [autoApprove, setAutoApprove] = useState(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (skill) {
      const defaults: Record<string, string> = {};
      skill.parameters.forEach((p) => {
        defaults[p.id] = p.defaultValue ?? '';
      });
      setParams(defaults);
      setActiveStep('preview');
      setIsRunning(false);
      setProgress(0);
      setExecutionStatus('idle');
      setResults('');
      setLogs([]);
      setErrors([]);
    }
  }, [skill]);

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  if (!isOpen || !skill) return null;

  const Icon = skill.icon;

  const addLog = (level: LogEntry['level'], message: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [...prev, { time, level, message }]);
  };

  const handleRun = () => {
    setIsRunning(true);
    setExecutionStatus('running');
    setProgress(0);
    setErrors([]);
    setLogs([]);
    setResults('');
    setActiveStep('progress');

    addLog('info', `Skill "${skill.name}" execution started`);
    addLog('info', `Target instance: ${selectedInstance || 'Default'}`);
    addLog('info', `Connection: ${selectedConnection || 'Default'}`);

    let prog = 0;
    progressInterval.current = setInterval(() => {
      prog += Math.random() * 15 + 5;
      if (prog >= 100) {
        prog = 100;
        clearInterval(progressInterval.current);
        setProgress(100);
        setIsRunning(false);

        const hasError = Math.random() < 0.15;
        if (hasError) {
          setExecutionStatus('failed');
          setErrors([
            'Connection timeout after 30s — instance may be unreachable.',
            'API rate limit exceeded. Retry after 60 seconds.',
          ]);
          addLog('error', 'Execution failed — connection timeout');
          addLog('error', 'API rate limit exceeded');
          setActiveStep('errors');
        } else {
          setExecutionStatus('completed');
          setResults(
            JSON.stringify(
              {
                status: 'success',
                skill: skill.name,
                executedAt: new Date().toISOString(),
                instance: selectedInstance || 'POC RAVI',
                connection: selectedConnection || 'conn-1',
                output: {
                  summary: `"${skill.name}" completed successfully. Generated output is ready for review.`,
                  artifacts: [
                    { type: 'document', name: `${skill.name.replace(/\s+/g, '_')}_output.md`, size: '2.4 KB' },
                    { type: 'json', name: 'execution_metadata.json', size: '1.1 KB' },
                  ],
                  metrics: {
                    duration: '3.2s',
                    tokensUsed: 1247,
                    apiCalls: 3,
                  },
                },
              },
              null,
              2,
            ),
          );
          addLog('info', 'Execution completed successfully');
          addLog('info', 'Output artifacts generated');
          setActiveStep('results');
        }
      } else {
        setProgress(prog);
        if (prog > 20 && prog < 25) addLog('info', 'Connecting to ServiceNow instance...');
        if (prog > 40 && prog < 45) addLog('info', 'Validating parameters...');
        if (prog > 60 && prog < 65) addLog('info', 'Executing skill logic...');
        if (prog > 80 && prog < 85) addLog('info', 'Generating output artifacts...');
      }
    }, 400);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'preview':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10">
                <Icon className="h-6 w-6 text-brand-green" />
              </div>
              <div>
                <h3 className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
                  {skill.name}
                </h3>
                <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {skill.category}
                </span>
              </div>
            </div>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>
              {skill.description}
            </p>
            <div
              className={cn(
                'rounded-xl border p-4',
                isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-border bg-muted/40',
              )}
            >
              <h4 className={`mb-1.5 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>
                What it helps with
              </h4>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-foreground'}`}>
                {skill.whatItHelpsWith}
              </p>
            </div>
            <div
              className={cn(
                'rounded-xl border p-4',
                isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-border bg-muted/40',
              )}
            >
              <h4 className={`mb-1.5 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>
                Example prompt
              </h4>
              <p className={`text-sm italic leading-relaxed ${isDark ? 'text-white/60' : 'text-muted-foreground'}`}>
                "{skill.examplePrompt}"
              </p>
            </div>
          </div>
        );

      case 'parameters':
        return (
          <div className="space-y-4">
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
              Configure the parameters for this skill before execution.
            </p>
            {skill.parameters.map((param) => (
              <div key={param.id} className="space-y-1.5">
                <label className={`text-xs font-semibold ${isDark ? 'text-white/70' : 'text-foreground'}`}>
                  {param.label}
                  {param.required && <span className="ml-1 text-red-400">*</span>}
                </label>
                {param.type === 'select' ? (
                  <select
                    value={params[param.id] ?? ''}
                    onChange={(e) => setParams((prev) => ({ ...prev, [param.id]: e.target.value }))}
                    className={cn(
                      'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all',
                      isDark
                        ? 'border-white/[0.06] bg-white/[0.03] text-white focus:border-brand-green/50'
                        : 'border-border bg-background text-foreground focus:border-brand-green/50',
                    )}
                  >
                    {param.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : param.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    placeholder={param.placeholder}
                    value={params[param.id] ?? ''}
                    onChange={(e) => setParams((prev) => ({ ...prev, [param.id]: e.target.value }))}
                    className={cn(
                      'w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none transition-all',
                      isDark
                        ? 'border-white/[0.06] bg-white/[0.03] text-white placeholder:text-white/30 focus:border-brand-green/50'
                        : 'border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-brand-green/50',
                    )}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={param.placeholder}
                    value={params[param.id] ?? ''}
                    onChange={(e) => setParams((prev) => ({ ...prev, [param.id]: e.target.value }))}
                    className={cn(
                      'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all',
                      isDark
                        ? 'border-white/[0.06] bg-white/[0.03] text-white placeholder:text-white/30 focus:border-brand-green/50'
                        : 'border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-brand-green/50',
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        );

      case 'instance':
        return (
          <div className="space-y-3">
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
              Choose the ServiceNow instance to execute this skill against.
            </p>
            {SERVICE_NOW_INSTANCES.map((inst) => (
              <button
                key={inst.id}
                type="button"
                disabled={!inst.active}
                onClick={() => setSelectedInstance(inst.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                  selectedInstance === inst.id
                    ? isDark
                      ? 'border-brand-green/40 bg-brand-green/10'
                      : 'border-brand-green/40 bg-brand-green/5'
                    : isDark
                      ? 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                      : 'border-border bg-background hover:bg-muted',
                  !inst.active && 'opacity-40',
                )}
              >
                <Server className={cn('h-4 w-4 shrink-0', selectedInstance === inst.id ? 'text-brand-green' : 'text-muted-foreground')} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>{inst.name}</span>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">{inst.tag}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{instanceHostname(inst.url)}</p>
                </div>
                {selectedInstance === inst.id && <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-green" />}
              </button>
            ))}
          </div>
        );

      case 'connection':
        return (
          <div className="space-y-3">
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
              Select the connection to use for this execution.
            </p>
            {MOCK_CONNECTIONS.map((conn) => (
              <button
                key={conn.id}
                type="button"
                disabled={!conn.active}
                onClick={() => setSelectedConnection(conn.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                  selectedConnection === conn.id
                    ? isDark
                      ? 'border-brand-green/40 bg-brand-green/10'
                      : 'border-brand-green/40 bg-brand-green/5'
                    : isDark
                      ? 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                      : 'border-border bg-background hover:bg-muted',
                  !conn.active && 'opacity-40',
                )}
              >
                <Link2 className={cn('h-4 w-4 shrink-0', selectedConnection === conn.id ? 'text-brand-green' : 'text-muted-foreground')} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>{conn.name}</span>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">{conn.tag}</span>
                  </div>
                </div>
                {selectedConnection === conn.id && <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-green" />}
              </button>
            ))}
            <div className="flex items-center justify-between rounded-xl border px-4 py-3">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>Auto-approve</p>
                <p className={`text-[11px] ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>Skip confirmation on execution</p>
              </div>
              <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
            </div>
          </div>
        );

      case 'run':
        return (
          <div className="space-y-4">
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
              Review your configuration and run the skill.
            </p>
            <div
              className={cn(
                'space-y-2 rounded-xl border p-4',
                isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-border bg-muted/40',
              )}
            >
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-white/50' : 'text-muted-foreground'}>Skill</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>{skill.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-white/50' : 'text-muted-foreground'}>Instance</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>
                  {SERVICE_NOW_INSTANCES.find((i) => i.id === selectedInstance)?.name || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-white/50' : 'text-muted-foreground'}>Connection</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>
                  {MOCK_CONNECTIONS.find((c) => c.id === selectedConnection)?.name || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-white/50' : 'text-muted-foreground'}>Parameters</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>
                  {Object.keys(params).length} configured
                </span>
              </div>
            </div>
            <Button
              variant="cta"
              onClick={handleRun}
              disabled={isRunning}
              className="w-full gap-2"
            >
              <Play className="h-4 w-4" />
              Run Skill
            </Button>
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {isRunning ? (
                <Loader2 className="h-5 w-5 animate-spin text-brand-green" />
              ) : executionStatus === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-brand-green" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400" />
              )}
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>
                {isRunning ? 'Executing skill...' : executionStatus === 'completed' ? 'Execution complete' : 'Execution failed'}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className={isDark ? 'text-white/50' : 'text-muted-foreground'}>Progress</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>{Math.round(progress)}%</span>
              </div>
              <div className={`h-2 w-full overflow-hidden rounded-full ${isDark ? 'bg-white/[0.06]' : 'bg-muted'}`}>
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    executionStatus === 'failed' ? 'bg-red-400' : 'bg-brand-green',
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            {isRunning && (
              <p className={`text-xs ${isDark ? 'text-white/30' : 'text-muted-foreground'}`}>
                This may take a few moments...
              </p>
            )}
          </div>
        );

      case 'status':
        return (
          <div className="space-y-4">
            <div
              className={cn(
                'flex items-center gap-3 rounded-xl border p-4',
                executionStatus === 'completed'
                  ? isDark ? 'border-brand-green/30 bg-brand-green/5' : 'border-brand-green/30 bg-brand-green/5'
                  : executionStatus === 'failed'
                    ? 'border-red-500/30 bg-red-500/5'
                    : isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-border bg-muted/40',
              )}
            >
              {executionStatus === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-green" />
              ) : executionStatus === 'failed' ? (
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
              ) : executionStatus === 'running' ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand-green" />
              ) : (
                <Monitor className="h-5 w-5 shrink-0 text-muted-foreground" />
              )}
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>
                  {executionStatus === 'completed' ? 'Completed' : executionStatus === 'failed' ? 'Failed' : executionStatus === 'running' ? 'Running' : 'Idle'}
                </p>
                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
                  {executionStatus === 'completed'
                    ? 'Skill executed successfully'
                    : executionStatus === 'failed'
                      ? 'Execution encountered errors'
                      : executionStatus === 'running'
                        ? 'Skill is currently executing'
                        : 'No execution in progress'}
                </p>
              </div>
            </div>
            {executionStatus !== 'idle' && (
              <div
                className={cn(
                  'space-y-2 rounded-xl border p-4',
                  isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-border bg-muted/40',
                )}
              >
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-white/50' : 'text-muted-foreground'}>Duration</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>
                    {executionStatus === 'completed' || executionStatus === 'failed' ? '3.2s' : '...'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-white/50' : 'text-muted-foreground'}>API Calls</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>
                    {executionStatus === 'completed' || executionStatus === 'failed' ? '3' : '...'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-white/50' : 'text-muted-foreground'}>Tokens Used</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>
                    {executionStatus === 'completed' || executionStatus === 'failed' ? '1,247' : '...'}
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 'results':
        return (
          <div className="space-y-4">
            {results ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-green" />
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>
                    Execution completed successfully
                  </p>
                </div>
                <pre
                  className={cn(
                    'max-h-64 overflow-auto rounded-xl border p-4 text-xs leading-relaxed',
                    isDark ? 'border-white/[0.06] bg-white/[0.02] text-white/70' : 'border-border bg-muted/40 text-foreground',
                  )}
                >
                  {results}
                </pre>
              </>
            ) : (
              <p className={`text-sm ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
                No results yet. Run the skill to see output.
              </p>
            )}
          </div>
        );

      case 'logs':
        return (
          <div className="space-y-3">
            {logs.length > 0 ? (
              <div
                className={cn(
                  'max-h-64 overflow-auto rounded-xl border p-3',
                  isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-border bg-muted/40',
                )}
              >
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2 py-1 text-xs font-mono">
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
            ) : (
              <p className={`text-sm ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
                No logs yet. Run the skill to see execution logs.
              </p>
            )}
          </div>
        );

      case 'errors':
        return (
          <div className="space-y-4">
            {errors.length > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>
                    {errors.length} error{errors.length > 1 ? 's' : ''} encountered
                  </p>
                </div>
                <div className="space-y-2">
                  {errors.map((err, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3"
                    >
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                      <p className="text-xs text-red-300">{err}</p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setErrors([]);
                    setActiveStep('run');
                  }}
                  className="w-full text-xs"
                >
                  Retry Execution
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="mb-3 h-8 w-8 text-brand-green" />
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>
                  No errors
                </p>
                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
                  All clear — no errors detected.
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative z-10 flex w-full max-w-3xl overflow-hidden rounded-2xl border shadow-2xl transition-all',
          isDark
            ? 'border-white/[0.08] bg-[#111111]'
            : 'border-border bg-card',
        )}
        style={{ maxHeight: '85vh' }}
      >
        {/* Sidebar */}
        <div
          className={cn(
            'w-52 shrink-0 overflow-y-auto border-r py-4',
            isDark ? 'border-white/[0.06]' : 'border-border',
          )}
        >
          <div className="px-4 pb-3">
            <h2 className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
              Skill Runner
            </h2>
          </div>
          <nav className="space-y-0.5 px-2">
            {STEPS.map((step) => {
              const StepIcon = step.icon;
              const isActive = activeStep === step.id;
              const isCompleted =
                (step.id === 'preview' && activeStep !== 'preview') ||
                (step.id === 'parameters' && ['instance', 'connection', 'run', 'progress', 'status', 'results', 'logs', 'errors'].includes(activeStep)) ||
                (step.id === 'instance' && ['connection', 'run', 'progress', 'status', 'results', 'logs', 'errors'].includes(activeStep)) ||
                (step.id === 'connection' && ['run', 'progress', 'status', 'results', 'logs', 'errors'].includes(activeStep)) ||
                (step.id === 'run' && ['progress', 'status', 'results', 'logs', 'errors'].includes(activeStep)) ||
                (step.id === 'progress' && ['status', 'results', 'logs', 'errors'].includes(activeStep)) ||
                (step.id === 'status' && ['results', 'logs', 'errors'].includes(activeStep));

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors',
                    isActive
                      ? isDark
                        ? 'bg-brand-green/10 text-brand-green'
                        : 'bg-brand-green/10 text-brand-green'
                      : isDark
                        ? 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                >
                  <StepIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{step.label}</span>
                  {isCompleted && !isActive && (
                    <CheckCircle2 className="ml-auto h-3 w-3 shrink-0 text-brand-green/60" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className={`font-display text-base font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
              {STEPS.find((s) => s.id === activeStep)?.label}
            </h2>
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
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {renderStepContent()}
          </div>
          <div
            className={cn(
              'flex items-center justify-between border-t px-6 py-3',
              isDark ? 'border-white/[0.06]' : 'border-border',
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const idx = STEPS.findIndex((s) => s.id === activeStep);
                if (idx > 0) setActiveStep(STEPS[idx - 1].id);
              }}
              disabled={activeStep === 'preview'}
              className="text-xs"
            >
              Back
            </Button>
            <Button
              variant="cta"
              size="sm"
              onClick={() => {
                if (activeStep === 'run') {
                  handleRun();
                } else {
                  const idx = STEPS.findIndex((s) => s.id === activeStep);
                  if (idx < STEPS.length - 1) setActiveStep(STEPS[idx + 1].id);
                }
              }}
              disabled={isRunning}
              className="text-xs"
            >
              {activeStep === 'run' ? 'Execute' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
