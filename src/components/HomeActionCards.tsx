import { HOME_ACTIONS, type HomeActionType } from '../data/homeActions';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { Card } from '@/src/components/ui/card';
import { cn } from '@/lib/utils';

const SERVICENOW_SUGGESTIONS = [
  {
    actionId: 'describe' as const,
    label: 'Employee Onboarding Scoped App',
    prompt: 'I want to build a scoped app for employee onboarding with table extensions and catalog items.',
  },
  {
    actionId: 'describe' as const,
    label: 'ITSM Service Portal Widget',
    prompt: 'Create a custom service portal widget that interacts with ServiceNow incidents API.',
  },
  {
    actionId: 'describe' as const,
    label: 'HR Case SLA Workflow',
    prompt: 'Configure an HR case management solution with customized SLAs and assignment rules.',
  },
  {
    actionId: 'describe' as const,
    label: 'CMDB CI Class Extension',
    prompt: 'Extend the CMDB CI class model for tracking proprietary IoT hardware devices.',
  },
  {
    actionId: 'describe' as const,
    label: 'SecOps Threat Playbook',
    prompt: 'Create a security incident flow to automatically triage phishing alerts.',
  },
  {
    actionId: 'describe' as const,
    label: 'IntegrationHub REST Spoke',
    prompt: 'Build an IntegrationHub spoke to synchronize user records from an external HR REST API.',
  },
];

interface HomeActionCardsProps {
  theme: Theme;
  onActionCard: (actionId: HomeActionType, prompt: string) => void;
  onExampleClick: (actionId: HomeActionType, prompt: string) => void;
}

const ACCENT: Record<HomeActionType, string> = {
  describe: 'border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5',
  template: 'border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/5',
  import: 'border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5',
  analyze: 'border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-500/5',
};

const ICON_COLOR: Record<HomeActionType, { dark: string; light: string }> = {
  describe: { dark: 'text-emerald-400', light: 'text-emerald-600' },
  template: { dark: 'text-cyan-400', light: 'text-cyan-600' },
  import: { dark: 'text-amber-400', light: 'text-amber-600' },
  analyze: { dark: 'text-violet-400', light: 'text-violet-600' },
};

const SHORT_LABEL: Record<HomeActionType, string> = {
  describe: 'New application',
  template: 'Industry template',
  import: 'Requirements → solution',
  analyze: 'Analyze existing app',
};

export default function HomeActionCards({
  theme,
  onActionCard,
  onExampleClick,
}: HomeActionCardsProps) {
  const isDark = isDarkTheme(theme);

  return (
    <div id="tour-actions" className="mx-auto w-full max-w-2xl space-y-6 text-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {HOME_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.id}
              role="button"
              tabIndex={0}
              onClick={() => onActionCard(action.id, action.prompt)}
              onKeyDown={(e) => e.key === 'Enter' && onActionCard(action.id, action.prompt)}
              className={cn(
                'group cursor-pointer border bg-card/65 p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]',
                isDark 
                  ? 'border-white/[0.06] hover:border-emerald-500/30 hover:bg-emerald-950/10'
                  : 'border-slate-200/80 hover:border-emerald-500/20 hover:bg-emerald-50/20',
                ACCENT[action.id],
              )}
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 transition-transform group-hover:scale-105">
                  <Icon className={cn('h-5 w-5', isDark ? ICON_COLOR[action.id].dark : ICON_COLOR[action.id].light)} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-semibold leading-snug text-foreground">
                    {SHORT_LABEL[action.id]}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{action.subtitle}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3 pt-3">
        <span className="text-xs font-semibold text-muted-foreground/80 tracking-wider uppercase">What ServiceNow experts can build:</span>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl px-2">
          {SERVICENOW_SUGGESTIONS.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => onExampleClick(ex.actionId, ex.prompt)}
              className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs cursor-pointer ${
                isDark
                  ? 'bg-[#1e293b]/50 border-white/[0.08] text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

