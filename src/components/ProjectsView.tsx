import { useMemo, useState } from 'react';
import { Search, Plus, FolderOpen, LayoutGrid, List } from 'lucide-react';
import { Solution, Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  building: { label: 'Building', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  ready_to_deploy: { label: 'Ready', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  deployed: { label: 'Active', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

type Filter = 'all' | 'mine' | 'shared' | 'organisational';
type ViewMode = 'list' | 'grid';

interface ProjectsViewProps {
  theme: Theme;
  solutions: Solution[];
  activeSolutionId?: string;
  onSelectSolution: (solutionId: string) => void;
  onNewProject: () => void;
}

function getStatus(sol: Solution) {
  const status = sol.projectStatus ?? (sol.blueprint?.status === 'discovering' ? 'building' : 'building');
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.building;
}

export default function ProjectsView({
  theme,
  solutions,
  activeSolutionId,
  onSelectSolution,
  onNewProject,
}: ProjectsViewProps) {
  const isDark = isDarkTheme(theme);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const filtered = useMemo(() => {
    let list = solutions;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [solutions, search]);

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-y-auto px-4 py-8 md:px-8 lg:px-12">
      <div className={cn('mx-auto w-full', viewMode === 'grid' ? 'max-w-5xl' : 'max-w-3xl')}>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Projects
          </h1>
          <button
            type="button"
            onClick={onNewProject}
            className="btn-cta cursor-pointer flex items-center gap-2 px-4 py-2 text-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {/* Search + View toggle */}
        <div className="relative mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all',
                isDark
                  ? 'border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/40 focus:border-white/[0.15]'
                  : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-300',
              )}
            />
          </div>
          <div className={cn(
            'flex rounded-lg border p-0.5',
            isDark ? 'border-white/[0.08] bg-white/[0.03]' : 'border-slate-200 bg-slate-50',
          )}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-md p-1.5 transition-all',
                viewMode === 'list'
                  ? isDark ? 'bg-white/[0.1] text-white' : 'bg-white text-slate-900 shadow-sm'
                  : isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600',
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-md p-1.5 transition-all',
                viewMode === 'grid'
                  ? isDark ? 'bg-white/[0.1] text-white' : 'bg-white text-slate-900 shadow-sm'
                  : isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600',
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="mb-6 flex gap-2">
          {(['all', 'mine', 'shared', 'organisational'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition-all',
                filter === f
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : isDark
                    ? 'bg-white/[0.06] text-white/60 hover:bg-white/[0.10] hover:text-white/80'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800',
              )}
            >
              {f === 'all' ? 'All' : f === 'mine' ? 'Mine' : f === 'shared' ? 'Shared' : 'Organisational'}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className={cn(
                'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl',
                isDark ? 'bg-white/[0.06]' : 'bg-slate-100',
              )}
            >
              <FolderOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className={`mb-1 text-sm font-medium ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
              No projects yet
            </p>
            <p className={`mb-5 text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              Create your first project to get started.
            </p>
            <button
              type="button"
              onClick={onNewProject}
              className="btn-cta cursor-pointer flex items-center gap-2 px-5 py-2.5 text-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* List view */
          <div className="flex flex-col gap-2">
            {filtered.map((sol) => {
              const config = getStatus(sol);
              const isActive = sol.id === activeSolutionId;
              return (
                <button
                  key={sol.id}
                  type="button"
                  onClick={() => onSelectSolution(sol.id)}
                  className={cn(
                    'w-full rounded-xl border px-4 py-3.5 text-left transition-all',
                    isActive
                      ? isDark
                        ? 'border-primary/30 bg-primary/[0.06]'
                        : 'border-emerald-200 bg-emerald-50/60'
                      : isDark
                        ? 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/60',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {sol.name}
                      </p>
                      <p className={`mt-0.5 truncate text-xs ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                        {sol.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className={`whitespace-nowrap text-[11px] ${isDark ? 'text-white/35' : 'text-slate-400'}`}>
                        {sol.timeLabel || sol.createdAt}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Grid / Card view */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((sol) => {
              const config = getStatus(sol);
              const isActive = sol.id === activeSolutionId;
              return (
                <button
                  key={sol.id}
                  type="button"
                  onClick={() => onSelectSolution(sol.id)}
                  className={cn(
                    'group flex flex-col rounded-2xl border p-5 text-left transition-all',
                    isActive
                      ? isDark
                        ? 'border-primary/30 bg-primary/[0.06]'
                        : 'border-emerald-200 bg-emerald-50/60'
                      : isDark
                        ? 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.05] hover:shadow-lg hover:shadow-black/10'
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/60',
                  )}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${config.color}`}>
                      {config.label}
                    </span>
                    <span className={`whitespace-nowrap text-[11px] ${isDark ? 'text-white/35' : 'text-slate-400'}`}>
                      {sol.timeLabel || sol.createdAt}
                    </span>
                  </div>
                  <p className={`mb-1 truncate text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {sol.name}
                  </p>
                  <p className={`line-clamp-2 text-xs leading-relaxed ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                    {sol.description || 'No description'}
                  </p>
                  <div className={cn(
                    'mt-auto pt-4 text-xs font-medium transition-all',
                    isDark
                      ? 'text-white/30 group-hover:text-primary/80'
                      : 'text-slate-300 group-hover:text-emerald-600',
                  )}>
                    Open project →
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
