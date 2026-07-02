import { useState } from 'react';
import { SERVICE_TEMPLATES } from '../data/templates';
import { ServiceTemplate, Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { Search, ListFilter, ArrowRight, Heart } from 'lucide-react';

interface TemplatesViewProps {
  theme: Theme;
  onUseTemplate: (template: ServiceTemplate) => void;
}

type TemplateCategory = ServiceTemplate['category'];
type FilterCategory = 'ALL' | TemplateCategory;

const CATEGORY_LABELS: Record<FilterCategory, string> = {
  ALL: 'All',
  Programs: 'Programs',
  Fundraising: 'Fundraising',
  Volunteers: 'Volunteers',
  Grants: 'Grants',
  Operations: 'Operations',
};

export default function TemplatesView({ theme, onUseTemplate }: TemplatesViewProps) {
  const isDark = isDarkTheme(theme);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('ALL');

  const filteredTemplates = SERVICE_TEMPLATES.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || tpl.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories: FilterCategory[] = ['ALL', 'Programs', 'Fundraising', 'Volunteers', 'Grants', 'Operations'];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full">

      <div className="mb-6">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full border ${
          isDark
            ? 'text-brand-green bg-mitra-surface border-white/[0.06]'
            : 'text-emerald-700 bg-emerald-50 border-emerald-200/60'
        }`}>
          <Heart className="w-3 h-3" />
          Nonprofit templates
        </span>
        <h1 className={`text-2xl md:text-3xl font-display font-bold mt-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Start from a proven blueprint
        </h1>
        <p className={`text-sm mt-1.5 max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Pick a template for your programs, donors, volunteers, or grants — then customize it for your mission.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className={`flex-1 rounded-xl border flex items-center px-3.5 py-2.5 ${
          isDark
            ? 'bg-mitra-surface/50 border-white/[0.06] focus-within:border-brand-green/40'
            : 'bg-white border-slate-200 focus-within:border-emerald-400'
        } transition-colors`}>
          <Search className={`w-4 h-4 mr-2 shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search templates…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-transparent outline-none text-sm ${
              isDark ? 'text-slate-100 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer px-3.5 py-2 rounded-full text-xs font-medium border transition-colors duration-200 whitespace-nowrap ${
                  isSelected
                    ? isDark
                      ? 'bg-brand-green/15 text-brand-green border-brand-green/30'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : isDark
                      ? 'border-white/[0.06] bg-mitra-surface/40 text-slate-400 hover:text-slate-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className={`text-center py-16 border rounded-2xl border-dashed ${
          isDark ? 'border-white/[0.08]' : 'border-slate-200'
        }`}>
          <ListFilter className="w-10 h-10 text-slate-500 mb-2 mx-auto" />
          <p className="text-slate-400 text-sm">No templates match &ldquo;{searchTerm}&rdquo;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((tpl) => (
            <article
              key={tpl.id}
              className={`rounded-xl border flex flex-col h-full overflow-hidden transition-colors duration-200 ${
                isDark
                  ? 'bg-mitra-surface/50 border-white/[0.06] hover:border-white/[0.1]'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex-1 px-5 pt-5 pb-4 flex flex-col gap-2 min-w-0">
                <p className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  {tpl.category}
                </p>

                <h3 className={`font-display font-semibold text-[15px] leading-snug ${
                  isDark ? 'text-slate-50' : 'text-slate-900'
                }`}>
                  {tpl.title}
                </h3>

                <p className={`text-[13px] leading-[1.65] line-clamp-3 flex-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {tpl.description}
                </p>
              </div>

              <div className="px-5 pb-5 pt-0">
                <button
                  type="button"
                  onClick={() => onUseTemplate(tpl)}
                  className={`w-full py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors duration-200 ${
                    isDark
                      ? 'bg-brand-green text-slate-950 hover:bg-brand-green-hover'
                      : 'bg-brand-green text-slate-950 hover:bg-brand-green-hover'
                  }`}
                >
                  Use template
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
