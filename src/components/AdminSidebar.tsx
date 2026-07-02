import { LayoutDashboard, Server } from 'lucide-react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@/src/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onOpenPanel: () => void;
  onOpenConnections: () => void;
}

export function AdminSidebar({ activeTab, onOpenPanel, onOpenConnections }: AdminSidebarProps) {
  return (
    <div className="flex flex-col gap-1 px-2 py-3">
      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-[10px] font-normal uppercase tracking-[0.12em] text-muted-foreground/60">
          Control panel
        </SidebarGroupLabel>
        <SidebarGroupContent className="mt-1 space-y-0.5 px-1">
          <button
            type="button"
            onClick={onOpenPanel}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[12px] transition-colors',
              activeTab === 'admin-panel'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/40',
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Needs attention
          </button>
          <button
            type="button"
            onClick={onOpenConnections}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[12px] transition-colors',
              activeTab === 'connections' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/40',
            )}
          >
            <Server className="h-4 w-4" />
            Connected instances
          </button>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}
