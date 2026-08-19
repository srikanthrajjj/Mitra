import { useRef, useState, type FC } from 'react';
import { Check, ChevronRight, Code, Download, ListTodo, MessageSquare, MessagesSquare, Milestone, Sparkles, Type, LayoutGrid } from 'lucide-react';
import { DEV_COMPONENTS, type DevComponentId, type DevComponentMeta } from './components';

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
  stepper: Milestone,
};

/** Serialize a rendered lucide <svg> to a standalone, downloadable SVG file. */
function downloadSvgFromElement(svg: SVGSVGElement | null, fileName: string) {
  if (!svg) return;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.removeAttribute('class');
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', '24');
  clone.setAttribute('height', '24');

  const source = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}\n`;
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

interface ComponentCardProps {
  component: DevComponentMeta;
  Icon: FC<{ className?: string }>;
  onSelect: (id: DevComponentId) => void;
}

const ComponentCard: FC<ComponentCardProps> = ({ component, Icon, onSelect }) => {
  const iconRef = useRef<HTMLSpanElement>(null);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const svg = iconRef.current?.querySelector('svg') ?? null;
    downloadSvgFromElement(svg, `${component.id}.svg`);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 1600);
  };

  return (
    <div className="group flex w-full items-start gap-4 rounded-xl bg-card p-5 transition-colors hover:bg-muted/20">
      <span
        ref={iconRef}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/10"
      >
        <Icon className="h-4.5 w-4.5 text-brand-green" />
      </span>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onSelect(component.id)}
          className="flex items-center gap-2 text-left cursor-pointer"
        >
          <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-brand-green">
            {component.name}
          </h3>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-green" />
        </button>
        <p className="mt-1 text-sm text-muted-foreground">{component.description}</p>

        <div className="mt-3">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green/5 px-2.5 py-1 text-[11px] font-medium text-brand-green transition-colors hover:bg-brand-green/10 cursor-pointer"
            aria-label={`Download ${component.name} icon as SVG`}
          >
            {downloaded ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
            {downloaded ? 'Downloaded' : 'Download SVG'}
          </button>
        </div>
      </div>
    </div>
  );
};

export function DevComponentsList({ onSelect }: DevComponentsListProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Components</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Available Mitra UI components. Select one to view its live preview and copy-paste HTML, CSS, and React code —
          or download the component icon as an SVG.
        </p>
      </div>

      <div className="grid gap-3">
        {DEV_COMPONENTS.map((component) => (
          <ComponentCard
            key={component.id}
            component={component}
            Icon={COMPONENT_ICONS[component.id] ?? Code}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
