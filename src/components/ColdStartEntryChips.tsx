import { HOME_ACTIONS } from '../data/homeActions';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';

interface ColdStartEntryChipsProps {
  theme: Theme;
  disabled?: boolean;
  onSelect: (prompt: string) => void;
  onTemplateNavigate?: () => void;
}

const CHIP_LABELS: Record<(typeof HOME_ACTIONS)[number]['id'], string> = {
  describe: 'New application',
  template: 'Industry template',
  import: 'Import Requirements',
  analyze: 'Improve What You Have',
};

export function ColdStartEntryChips({
  theme,
  disabled,
  onSelect,
  onTemplateNavigate,
}: ColdStartEntryChipsProps) {
  const isDark = isDarkTheme(theme);

  const chipClass = isDark
    ? 'bg-mitra-surface/50 border-mitra-border text-foreground hover:bg-mitra-highlight hover:text-foreground hover:border-brand-green/30'
    : 'bg-card border-border text-foreground hover:bg-accent hover:text-foreground hover:border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)]';

  return (
    <div className="w-full max-w-xl mx-auto text-center flex flex-col items-center">
      <p className={`text-[12px] mb-2.5 text-muted-foreground`}>
        Choose an entry mode
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {HOME_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (action.id === 'template' && onTemplateNavigate) {
                onTemplateNavigate();
                return;
              }
              onSelect(action.prompt);
            }}
            className={`inline-flex items-center px-3.5 py-2 rounded-full border text-[13px] font-medium transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${chipClass}`}
          >
            {CHIP_LABELS[action.id]}
          </button>
        ))}
      </div>
    </div>
  );
}
