import { useState } from 'react';
import { Search, FolderOpen } from 'lucide-react';
import { Solution, ResolvedTheme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { ProjectFolder } from '../data/folders';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchViewProps {
  theme: ResolvedTheme;
  solutions: Solution[];
  folders: ProjectFolder[];
  onSelectSolution: (solutionId: string) => void;
}

export function SearchView({
  theme,
  solutions,
  folders,
  onSelectSolution,
}: SearchViewProps) {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();

  const folderNameById = Object.fromEntries(folders.map((f) => [f.id, f.name]));

  const results = normalized
    ? solutions.filter((sol) => {
        const folderName = sol.folderId ? folderNameById[sol.folderId] ?? '' : '';
        return (
          sol.name.toLowerCase().includes(normalized) ||
          sol.description.toLowerCase().includes(normalized) ||
          folderName.toLowerCase().includes(normalized)
        );
      })
    : solutions;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className={cn(
          'shrink-0 border-b px-6 py-5',
          isDarkTheme(theme) ? 'border-neutral-800' : 'border-slate-200',
        )}
      >
        <h1
          className={cn(
            'mb-4 text-xl font-semibold tracking-tight',
            isDarkTheme(theme) ? 'text-white' : 'text-slate-900',
          )}
        >
          Search
        </h1>
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects and threads…"
            className="h-10 pl-9"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {normalized ? `No results for “${query.trim()}”.` : 'No projects yet.'}
          </p>
        ) : (
          <ul className="max-w-xl space-y-1">
            {results.map((sol) => (
              <li key={sol.id}>
                <button
                  type="button"
                  onClick={() => onSelectSolution(sol.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                    isDarkTheme(theme)
                      ? 'hover:bg-neutral-900'
                      : 'hover:bg-slate-100',
                  )}
                >
                  <FolderOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block truncate text-sm font-medium',
                        isDarkTheme(theme) ? 'text-white' : 'text-slate-900',
                      )}
                    >
                      {sol.name}
                    </span>
                    {sol.folderId && folderNameById[sol.folderId] && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {folderNameById[sol.folderId]}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
