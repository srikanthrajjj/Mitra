import { ArrowLeft } from 'lucide-react';
import { Solution, Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';

interface ProjectDetailViewProps {
  theme: Theme;
  solution: Solution;
  onBack: () => void;
}

export default function ProjectDetailView({ theme, solution, onBack }: ProjectDetailViewProps) {
  const isDark = isDarkTheme(theme);
  const bp = solution.blueprint;

  const requirements = bp.discoveredRequirements ?? [];
  const architecture = bp.architectureSteps ?? [];
  const tasks = solution.chatHistory.filter((m) => m.sender === 'user');

  const sections = [
    {
      label: 'Overview',
      count: null as number | null,
      items: [
        { label: 'Name', value: bp.title || solution.name },
        { label: 'Description', value: bp.description || solution.description || '—' },
        { label: 'Created', value: solution.timeLabel || solution.createdAt },
      ],
    },
    {
      label: 'Requirements',
      count: requirements.length,
      items: requirements.map((r) => ({ label: '', value: r })),
    },
    {
      label: 'Architecture',
      count: architecture.length,
      items: architecture.map((a) => ({ label: '', value: a })),
    },
    {
      label: 'Tasks',
      count: tasks.length,
      items: tasks.map((t) => ({ label: '', value: t.text })),
    },
  ];

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-y-auto px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-3xl">
        {/* Back + Title */}
        <div className="mb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all',
              isDark
                ? 'border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white'
                : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className={`font-display text-2xl font-bold truncate ${isDark ? 'text-white' : 'text-foreground'}`}>
            {solution.name}
          </h1>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <div
              key={section.label}
              className={cn(
                'rounded-xl border p-5',
                isDark
                  ? 'bg-card border-border'
                  : 'bg-card border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-foreground'}`}>
                  {section.label}
                </h2>
                {section.count != null && (
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                    isDark ? 'bg-white/[0.08] text-white/60' : 'bg-muted text-muted-foreground',
                  )}>
                    {section.count} {section.count === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>

              {section.label === 'Overview' ? (
                <div className="flex flex-col gap-2">
                  {section.items.map((item) => (
                    <div key={item.label} className="flex gap-2">
                      <span className={`shrink-0 text-xs font-medium ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
                        {item.label}:
                      </span>
                      <span className={`text-xs ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : section.items.length === 0 ? (
                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
                  No items yet.
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {section.items.map((item, i) => (
                    <li
                      key={i}
                      className={cn(
                        'rounded-lg px-3 py-2 text-xs leading-relaxed',
                        isDark ? 'bg-white/[0.03] text-white/70' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {item.value}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
