import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DISCOVERY_APP_SUGGESTIONS,
  DISCOVERY_SUGGESTIONS_VISIBLE_COUNT,
} from '../constants/discoverySuggestions';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';

interface DiscoveryAppSuggestionChipsProps {
  theme: Theme;
  disabled?: boolean;
  onSelect: (message: string) => void;
  compact?: boolean;
}

export function DiscoveryAppSuggestionChips({
  theme,
  disabled,
  onSelect,
  compact = false,
}: DiscoveryAppSuggestionChipsProps) {
  const [showMore, setShowMore] = useState(false);
  const isDark = isDarkTheme(theme);

  const chipClass = isDark
    ? 'bg-mitra-surface/50 border-white/[0.08] text-slate-300 hover:bg-mitra-highlight hover:text-illuminate-text hover:border-brand-green/30'
    : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]';

  const moreChipClass = isDark
    ? 'bg-mitra-surface/30 border-white/[0.06] text-slate-400 hover:bg-mitra-highlight hover:text-slate-200 hover:border-white/[0.12]'
    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300';

  const visible = DISCOVERY_APP_SUGGESTIONS.slice(0, DISCOVERY_SUGGESTIONS_VISIBLE_COUNT);
  const hidden = DISCOVERY_APP_SUGGESTIONS.slice(DISCOVERY_SUGGESTIONS_VISIBLE_COUNT);
  const hasMore = hidden.length > 0;

  return (
    <div className={compact ? 'mt-3 flex flex-col items-center' : 'w-full max-w-xl mx-auto text-center flex flex-col items-center'}>
      <p
        className={`${compact ? 'text-[11px] font-medium uppercase tracking-wide mb-2' : 'text-[12px] mb-2.5'} ${
          isDark ? 'text-slate-500' : 'text-slate-500'
        }`}
      >
        Popular apps
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {visible.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(suggestion.message)}
            className={`inline-flex items-center px-3.5 py-2 rounded-full border text-[13px] font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer ${chipClass}`}
          >
            {suggestion.label}
          </button>
        ))}
        {hasMore && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowMore((prev) => !prev)}
            className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-full border text-[13px] font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer ${moreChipClass}`}
          >
            {showMore ? 'Less' : 'More'}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${showMore ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
      {showMore && hasMore && (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {hidden.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(suggestion.message)}
              className={`inline-flex items-center px-3.5 py-2 rounded-full border text-[13px] font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer ${chipClass}`}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
