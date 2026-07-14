import { useRef, useState, useCallback } from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { Solution, Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';

interface FavouritesViewProps {
  solutions: Solution[];
  theme: Theme;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function FavouritesView({ solutions, theme, onSelect, onToggleFavorite }: FavouritesViewProps) {
  const isDark = isDarkTheme(theme);
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setHasScrolled(scrollRef.current.scrollTop > 0);
    }
  }, []);

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      {/* Sticky header — full width */}
      <div className="shrink-0">
        <div className="px-4 pt-8 md:px-8 lg:px-12 pb-4">
          <div className="mx-auto max-w-5xl">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Favorites
            </h1>
          </div>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {solutions.map((sol) => (
              <div
                key={sol.id}
                onClick={() => onSelect(sol.id)}
                className={cn(
                  'group relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer',
                  isDark
                    ? 'bg-card hover:bg-card/60 border-border text-foreground hover:border-brand-green/30'
                    : 'bg-card hover:bg-accent border-border text-foreground hover:border-brand-green/30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold truncate flex-1 text-foreground">
                      {sol.name}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        title="Open chat"
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(sol.id);
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Unfavorite"
                        className="p-1 rounded hover:bg-muted/40 transition-colors text-brand-green"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(sol.id);
                        }}
                      >
                        <Star className="h-3.5 w-3.5 fill-brand-green text-brand-green" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                    {sol.description}
                  </p>
                </div>
                <div className="text-[10px] text-muted-foreground mt-4 font-medium">
                  {sol.timeLabel || sol.createdAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
