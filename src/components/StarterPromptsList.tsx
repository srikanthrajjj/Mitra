import { STARTER_PROMPTS } from '../data/starterPrompts';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';

interface StarterPromptsListProps {
  theme: Theme;
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export default function StarterPromptsList({ theme, onSelect, disabled }: StarterPromptsListProps) {
  const isDark = isDarkTheme(theme);

  const chipClass = isDark
    ? 'bg-mitra-surface/50 border-white/[0.08] text-slate-400 hover:bg-mitra-highlight hover:text-illuminate-text hover:border-white/[0.12]'
    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]';

  return (
    <div className="w-full max-w-xl mx-auto text-center flex flex-col items-center">
      <p className={`text-[12px] mb-2.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
        Try an example
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {STARTER_PROMPTS.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(item.prompt)}
            className={`inline-flex items-center px-3.5 py-2 rounded-full border text-[13px] font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer ${chipClass}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
