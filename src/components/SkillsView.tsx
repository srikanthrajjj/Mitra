import { useMemo, useRef, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { SKILLS, SKILL_CATEGORIES, type Skill, type SkillCategory } from '../data/skills';
import { cn } from '@/lib/utils';
import { Button } from '@/src/components/ui/button';

interface SkillsViewProps {
  theme: Theme;
  onRunSkill: (skill: Skill) => void;
}

type Filter = 'All' | SkillCategory;

export default function SkillsView({ theme, onRunSkill }: SkillsViewProps) {
  const isDark = isDarkTheme(theme);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setHasScrolled(scrollRef.current.scrollTop > 0);
    }
  }, []);

  const filtered = useMemo(() => {
    let list = SKILLS;
    if (filter !== 'All') {
      list = list.filter((s) => s.category === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, filter]);

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      {/* Sticky header — full width */}
      <div className="shrink-0">
        <div className="px-4 pt-8 md:px-8 lg:px-12 pb-4">
          <div className="mx-auto max-w-5xl">
            <h1 className={`mb-4 font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
              Skills
            </h1>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  'w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all',
                  isDark
                    ? 'border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/40 focus:border-white/[0.15]'
                    : 'border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-border',
                )}
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {(['All', ...SKILL_CATEGORIES] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-medium transition-all',
                    filter === f
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : isDark
                        ? 'bg-white/[0.06] text-foreground hover:bg-white/[0.10] hover:text-foreground'
                        : 'bg-muted text-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Full-width separator — only when scrolled */}
        <div
          className={cn(
            'border-b transition-opacity duration-200',
            hasScrolled ? 'border-border opacity-100' : 'border-transparent opacity-0',
          )}
        />
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-8 md:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className={`text-sm ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>
                No skills match your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((skill) => {
                const Icon = skill.icon;
                return (
                  <div
                    key={skill.id}
                    className={cn(
                      'group flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 hover:shadow-md',
                      isDark
                        ? 'border-border bg-card hover:border-brand-green/30'
                        : 'border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-brand-green/30',
                    )}
                  >
                    <div>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10">
                        <Icon className="h-5 w-5 text-brand-green" />
                      </div>
                      <h3 className={`mb-1 text-sm font-semibold ${isDark ? 'text-white' : 'text-foreground'}`}>
                        {skill.name}
                      </h3>
                      <p className="text-[12px] leading-relaxed text-muted-foreground">
                        {skill.description}
                      </p>
                      <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {skill.category}
                      </span>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="cta"
                        size="sm"
                        onClick={() => onRunSkill(skill)}
                        className="w-full text-xs"
                      >
                        Use Skill
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
