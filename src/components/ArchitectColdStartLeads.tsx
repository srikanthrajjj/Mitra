import { ARCHITECT_COLD_START_LEADS } from '../constants/discoverySuggestions';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';

interface ArchitectColdStartLeadsProps {
  theme: Theme;
  disabled?: boolean;
  onSelect: (message: string) => void;
}

export function ArchitectColdStartLeads({
  theme,
  disabled,
  onSelect,
}: ArchitectColdStartLeadsProps) {
  const isDark = isDarkTheme(theme);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <p
        className={`text-[11px] font-medium uppercase tracking-wide mb-3 text-center ${
          isDark ? 'text-slate-500' : 'text-slate-500'
        }`}
      >
        Or start from a scenario
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {ARCHITECT_COLD_START_LEADS.map((lead) => (
          <button
            key={lead.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(lead.message)}
            className={`architect-cold-start-lead group text-left rounded-xl border px-3.5 py-3 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
              isDark
                ? 'bg-mitra-surface/40 border-white/[0.07] hover:bg-mitra-highlight hover:border-brand-green/25'
                : 'bg-white border-slate-200 hover:bg-emerald-50/80 hover:border-emerald-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
            }`}
          >
            <span
              className={`block text-[13px] font-semibold leading-snug mb-1 transition-colors ${
                isDark
                  ? 'text-slate-100 group-hover:text-illuminate-text'
                  : 'text-slate-800 group-hover:text-emerald-900'
              }`}
            >
              {lead.label}
            </span>
            <span
              className={`block text-[11px] leading-relaxed ${
                isDark ? 'text-slate-500 group-hover:text-slate-400' : 'text-slate-500'
              }`}
            >
              {lead.scope}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
