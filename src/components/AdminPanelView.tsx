import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Rocket } from 'lucide-react';
import { AdminChecklistItem, Solution, Theme } from '../types';
import { getSolutionTitle } from '../data/solutionArtifacts';
import { canCompleteChecklistItem, isChecklistFullyComplete } from '../utils/projectWorkflow';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminPanelViewProps {
  theme: Theme;
  solutions: Solution[];
  checklist: AdminChecklistItem[];
  selectedSolutionId: string | null;
  connectedInstances: string[];
  onSelectSolution: (solutionId: string) => void;
  onMarkChecklistComplete: (itemId: string) => void;
  onDeploy: (solutionId: string, instanceUrl: string) => void;
}

export function AdminPanelView({
  solutions,
  checklist,
  selectedSolutionId,
  connectedInstances,
  onSelectSolution,
  onMarkChecklistComplete,
  onDeploy,
}: AdminPanelViewProps) {
  const needsAttention = solutions.filter(
    (s) => s.projectStatus === 'ready_to_deploy' || s.projectStatus === 'in_review',
  );
  const activeId = selectedSolutionId ?? needsAttention[0]?.id ?? null;
  const activeSolution = solutions.find((s) => s.id === activeId);
  const activeChecklist = checklist.filter((c) => c.solutionId === activeId);
  const allComplete = isChecklistFullyComplete(activeChecklist);
  const [deployInstance, setDeployInstance] = useState(connectedInstances[0] ?? '');

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Admin control panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Deployment checklist, dependency validation, and instance promotion.
          </p>
        </div>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Needs attention</h2>
          {needsAttention.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects awaiting deployment.</p>
          ) : (
            <div className="space-y-2">
              {needsAttention.map((sol) => (
                <button
                  key={sol.id}
                  type="button"
                  onClick={() => onSelectSolution(sol.id)}
                  className={cn(
                    'w-full rounded-xl border px-4 py-3 text-left transition-colors',
                    activeId === sol.id ? 'border-primary/35 bg-primary/5' : 'border-border/60 hover:bg-muted/20',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{sol.name}</p>
                      <p className="text-xs text-muted-foreground">{getSolutionTitle(sol.id)}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {sol.projectStatus === 'ready_to_deploy' ? 'Ready to deploy' : 'In review'}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {activeSolution && activeChecklist.length > 0 && (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Deployment checklist</CardTitle>
              <CardDescription>
                Mitra-generated go-live steps for {getSolutionTitle(activeSolution.id)}. Steps must be completed in order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeChecklist
                .sort((a, b) => a.order - b.order)
                .map((item) => {
                  const { allowed, blockedBy } = canCompleteChecklistItem(item, activeChecklist);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border px-3 py-3',
                        item.completed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border/50',
                      )}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                        {!item.completed && !allowed && blockedBy && (
                          <p className="mt-1 text-[10px] text-amber-500">Complete &quot;{blockedBy}&quot; first</p>
                        )}
                      </div>
                      {!item.completed && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!allowed}
                          onClick={() => onMarkChecklistComplete(item.id)}
                        >
                          Mark complete
                        </Button>
                      )}
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}

        {activeSolution?.projectStatus === 'ready_to_deploy' && allComplete && (
          <Card className="border-primary/25 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Rocket className="h-4 w-4" />
                Deploy to instance
              </CardTitle>
              <CardDescription>All checklist items complete. Select target ServiceNow instance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <select
                value={deployInstance}
                onChange={(e) => setDeployInstance(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {connectedInstances.map((url) => (
                  <option key={url} value={url}>{url}</option>
                ))}
              </select>
              <Button
                className="w-full"
                onClick={() => activeId && onDeploy(activeId, deployInstance)}
              >
                Deploy to instance
              </Button>
            </CardContent>
          </Card>
        )}

        {activeSolution?.projectStatus === 'deployed' && (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-sm">
            <strong>{activeSolution.name}</strong> deployed. Blueprint locked as permanent record. Team notified.
          </div>
        )}
      </div>
    </div>
  );
}