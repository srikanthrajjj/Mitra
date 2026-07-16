import type { FC } from 'react';
import { ChevronRight, Code, ListTodo, MessageSquare, MessagesSquare, Sparkles, Type, LayoutGrid } from 'lucide-react';
import { DEV_COMPONENTS, type DevComponentId } from './components';

interface DevComponentsListProps {
  onSelect: (id: DevComponentId) => void;
}

const COMPONENT_ICONS: Record<DevComponentId, FC<{ className?: string }>> = {
  'chat-loader': MessageSquare,
  'todo-card': ListTodo,
  'streaming-text': Type,
  'chat-bubble': MessagesSquare,
  'entry-chips': Sparkles,
  'tab-bar': LayoutGrid,
};

export function DevComponentsList({ onSelect }: DevComponentsListProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Components</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Available Mitra UI components. Select one to view its live preview and copy-paste HTML, CSS, and React code.
        </p>
      </div>

      <div className="grid gap-3">
        {DEV_COMPONENTS.map((component) => {
          const Icon = COMPONENT_ICONS[component.id] ?? Code;
          return (
            <button
              key={component.id}
              type="button"
              onClick={() => onSelect(component.id)}
              className="group flex w-full items-start gap-4 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-brand-green/30 hover:bg-muted/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-green/20 bg-brand-green/10">
                <Icon className="h-4.5 w-4.5 text-brand-green" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{component.name}</h3>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-green" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{component.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {component.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-brand-green/20 bg-brand-green/5 px-2 py-0.5 text-[11px] font-medium text-brand-green"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
