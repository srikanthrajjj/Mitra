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
    <div id="tour-actions" data-tour="quick-start" className="mx-auto w-full max-w-2xl space-y-6 text-center">
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
                'group cursor-pointer rounded-xl border p-4 transition-colors duration-200 active:scale-[0.99]',
                isDark
                  ? 'border-mitra-border bg-mitra-surface/70 hover:border-brand-green/40 hover:bg-mitra-surface'
                  : 'border-border/70 bg-card/80 hover:border-brand-green/30 hover:bg-card',
              )}
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/60 transition-colors group-hover:bg-brand-green/10">
                  <Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-brand-green" strokeWidth={1.75} />
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
        <span className="text-xs font-medium text-muted-foreground">Start with an example</span>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl px-2">
          {SERVICENOW_SUGGESTIONS.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => onExampleClick(ex.actionId, ex.prompt)}
              className={cn(
                'cursor-pointer rounded-full border px-3.5 py-1.5 text-xs transition-colors duration-200 hover:border-brand-green/30 hover:text-brand-green',
                isDark
                  ? 'border-mitra-border bg-mitra-surface/50 text-muted-foreground hover:bg-accent'
                  : 'border-border bg-card/75 text-muted-foreground hover:bg-accent',
              )}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

