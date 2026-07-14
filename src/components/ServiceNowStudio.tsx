import React, { useState, useMemo } from 'react';
import {
  Check, ChevronLeft, ChevronRight, Database, FileInput, List,
  Code2, Workflow, Package, LayoutGrid, Copy, Play, Loader2,
  Box, Table2, Shield,
} from 'lucide-react';
import { SolutionBlueprint, ServiceNowTable, Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { Button } from '@/src/components/ui/button';
import {
  STUDIO_STEPS,
  enrichBlueprintStudio,
  studioStepIndex,
} from '../utils/studioHelpers';

type StudioTab = 'overview' | 'tables' | 'form' | 'list' | 'scripts' | 'rules' | 'update_set';

interface ServiceNowStudioProps {
  theme: Theme;
  blueprint: SolutionBlueprint | null;
  isGeneratingMessage: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function CopyBtn({ text, isDark }: { text: string; isDark: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={`p-1 rounded transition-colors text-muted-foreground hover:text-foreground`}
    >
      {copied ? <Check className="w-3 h-3 text-brand-green" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function StudioStepper({ stage, isDark }: { stage: string; isDark: boolean }) {
  const idx = studioStepIndex(stage as typeof STUDIO_STEPS[number]['id']);
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto pb-1 scrollbar-none">
      {STUDIO_STEPS.map((step, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <React.Fragment key={step.id}>
            <div
              title={step.label}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium whitespace-nowrap shrink-0 ${
                done
                  ? isDark ? 'text-brand-green/80' : 'text-brand-green'
                  : active
                    ? isDark ? 'bg-brand-green/12 text-brand-green border border-brand-green/25' : 'bg-brand-green/10 text-brand-green border border-brand-green/30'
                    : 'text-muted-foreground'
              }`}
            >
              {done ? <Check className="w-2.5 h-2.5" /> : <span className="w-2.5 text-center">{i + 1}</span>}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STUDIO_STEPS.length - 1 && (
              <span className={`text-[8px] shrink-0 text-muted-foreground`}>›</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function FormPreview({ table, isDark }: { table: ServiceNowTable; isDark: boolean }) {
  const fields = table.fields.slice(0, 8);
  return (
    <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-white/[0.08]' : 'border-border'}`}>
      <div className={`px-3 py-2 border-b flex items-center justify-between ${isDark ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-muted border-border'}`}>
        <span className={`text-[11px] font-semibold text-foreground`}>
          {table.label} — Default
        </span>
        <span className={`text-[9px] font-mono text-muted-foreground`}>{table.name}</span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
        {fields.map((f) => (
          <div key={f.name} className="space-y-0.5">
            <label className={`text-[10px] font-medium text-muted-foreground`}>
              {f.label}{f.mandatory ? ' *' : ''}
            </label>
            <div className={`h-7 rounded border px-2 flex items-center text-[11px] font-mono ${
              isDark ? 'border-white/[0.08] bg-white/[0.02] text-muted-foreground' : 'border-border bg-card text-muted-foreground'
            }`}>
              {f.type === 'Reference' ? '🔍 ' : ''}{f.type}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListPreview({ table, isDark }: { table: ServiceNowTable; isDark: boolean }) {
  const cols = ['Number', ...table.fields.slice(0, 4).map((f) => f.label), 'Updated'];
  return (
    <div className={`rounded-lg border overflow-x-auto ${isDark ? 'border-white/[0.08]' : 'border-border'}`}>
      <table className="w-full text-left text-[10px]">
        <thead>
          <tr className={isDark ? 'bg-white/[0.04] border-b border-white/[0.06]' : 'bg-muted border-b border-border'}>
            {cols.map((c) => (
              <th key={c} className={`px-2 py-1.5 font-semibold whitespace-nowrap text-muted-foreground`}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((row) => (
            <tr key={row} className={isDark ? 'border-b border-white/[0.04]' : 'border-b border-border'}>
              {cols.map((c, i) => (
                <td key={c} className={`px-2 py-1.5 text-muted-foreground`}>
                  {i === 0 ? `${table.name.toUpperCase().slice(0, 3)}000${row}` : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ServiceNowStudio({
  theme,
  blueprint: rawBlueprint,
  isGeneratingMessage,
  isCollapsed,
  onToggleCollapse,
}: ServiceNowStudioProps) {
  const isDark = isDarkTheme(theme);
  const [tab, setTab] = useState<StudioTab>('overview');
  const [selectedTable, setSelectedTable] = useState(0);
  const [selectedScript, setSelectedScript] = useState(0);
  const [selectedRule, setSelectedRule] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const blueprint = useMemo(
    () => (rawBlueprint ? enrichBlueprintStudio(rawBlueprint) : null),
    [rawBlueprint],
  );

  const shell = isDark
    ? 'border-white/[0.06] bg-[#0a0a0a]/90'
    : 'border-border bg-muted/90';

  const tabs: { id: StudioTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'App', icon: LayoutGrid },
    { id: 'tables', label: 'Tables', icon: Database },
    { id: 'form', label: 'Form', icon: FileInput },
    { id: 'list', label: 'List', icon: List },
    { id: 'scripts', label: 'Scripts', icon: Code2 },
    { id: 'rules', label: 'Rules', icon: Workflow },
    { id: 'update_set', label: 'Update Set', icon: Package },
  ];

  if (isCollapsed) {
    const stage = blueprint?.buildStage ?? 'scope';
    const idx = studioStepIndex(stage);
    return (
      <div
        onClick={onToggleCollapse}
        className={`h-full w-11 shrink-0 cursor-pointer flex flex-col items-center py-3 border-l transition-all ${shell}`}
        title="Open ServiceNow Studio"
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}
          className={`p-1.5 rounded-md text-muted-foreground hover:text-brand-green`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-2">
          <Box className={`w-4 h-4 ${isDark ? 'text-brand-green/60' : 'text-brand-green'}`} />
          {STUDIO_STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`w-1.5 h-1.5 rounded-full ${
                i <= idx
                  ? isDark ? 'bg-brand-green/50' : 'bg-brand-green'
                  : isDark ? 'bg-white/10' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <span className={`text-[8px] font-mono text-muted-foreground`}>
          {idx + 1}/7
        </span>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className={`relative w-full lg:w-[400px] xl:w-[440px] shrink-0 h-full border-l flex flex-col ${shell}`}>
        <StudioChrome isDark={isDark} onCollapse={onToggleCollapse} scope="—" appName="ServiceNow Studio" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Database className={`w-10 h-10 mb-3 text-muted-foreground`} />
          <p className={`text-[13px] font-medium mb-1 text-muted-foreground`}>No application yet</p>
          <p className={`text-[11px] text-muted-foreground`}>
            Start a chat to create a scoped ServiceNow app — tables, forms, and scripts will appear here live.
          </p>
        </div>
      </div>
    );
  }

  const app = blueprint.scopedApp!;
  const table = blueprint.tables[selectedTable];
  const scripts = blueprint.clientScripts ?? [];
  const rules = blueprint.businessRules ?? [];
  const updateItems = blueprint.updateSet?.items ?? [];

  return (
    <div className={`relative w-full lg:w-[400px] xl:w-[440px] shrink-0 h-full border-l flex flex-col min-h-0 ${shell}`}>
      <StudioChrome
        isDark={isDark}
        onCollapse={onToggleCollapse}
        scope={app.scope}
        appName={app.name}
        version={app.version}
      />

      <div className={`px-3 py-2 border-b shrink-0 ${isDark ? 'border-white/[0.06]' : 'border-border'}`}>
        <StudioStepper stage={blueprint.buildStage ?? 'scope'} isDark={isDark} />
      </div>

      <div className={`flex gap-0.5 px-2 py-1.5 border-b overflow-x-auto shrink-0 ${isDark ? 'border-white/[0.06]' : 'border-border'}`}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors ${
              tab === id
                ? isDark ? 'bg-white/[0.08] text-foreground' : 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        {isGeneratingMessage && (
          <div className={`flex items-center gap-2 mb-3 px-2.5 py-1.5 rounded-lg text-[11px] ${
            isDark ? 'bg-brand-green/8 text-brand-green border border-brand-green/15' : 'bg-brand-green/10 text-brand-green border border-brand-green/30'
          }`}>
            <Loader2 className="w-3 h-3 animate-spin" />
            Building application artifacts…
          </div>
        )}

        {tab === 'overview' && (
          <div className="space-y-3">
            <div className={`rounded-xl border p-3 ${isDark ? 'border-white/[0.08] bg-white/[0.02]' : 'border-border bg-card'}`}>
              <div className="flex items-start gap-2.5 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-green/20 text-brand-green'}`}>
                  <Box className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-[13px] font-semibold truncate text-foreground`}>{app.name}</h3>
                  <p className={`text-[10px] font-mono mt-0.5 text-muted-foreground`}>{app.scope}</p>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium text-muted-foreground ${isDark ? 'bg-white/[0.06]' : 'bg-muted'}`}>
                  v{app.version}
                </span>
              </div>
              <p className={`text-[11px] leading-snug mb-3 text-muted-foreground`}>{app.shortDescription}</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Tables', value: blueprint.tables.length },
                  { label: 'Scripts', value: scripts.length },
                  { label: 'Rules', value: rules.length },
                ].map((s) => (
                  <div key={s.label} className={`rounded-lg px-2 py-1.5 text-center ${isDark ? 'bg-white/[0.03]' : 'bg-muted'}`}>
                    <p className={`text-[14px] font-semibold text-foreground`}>{s.value}</p>
                    <p className={`text-[9px] uppercase tracking-wide text-muted-foreground`}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <ArtifactSection title="Application Menu" isDark={isDark}>
              {blueprint.applicationMenu?.length ? (
                <div className="space-y-1">
                  {blueprint.applicationMenu.map((mod) => (
                    <div key={mod.title} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] ${isDark ? 'bg-white/[0.03]' : 'bg-card border border-border'}`}>
                      <Table2 className="w-3 h-3 text-brand-green shrink-0" />
                      <span className="text-foreground">{mod.title}</span>
                      <span className={`ml-auto font-mono text-[9px] text-muted-foreground`}>{mod.table}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyHint isDark={isDark}>Tables will auto-create navigation modules</EmptyHint>
              )}
            </ArtifactSection>

            <ArtifactSection title="Roles" isDark={isDark}>
              <div className="flex flex-wrap gap-1.5">
                {['admin', 'itil', `${app.scope}.user`].map((r) => (
                  <span key={r} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-muted-foreground ${isDark ? 'bg-white/[0.04]' : 'bg-muted'}`}>
                    <Shield className="w-2.5 h-2.5" />{r}
                  </span>
                ))}
              </div>
            </ArtifactSection>
          </div>
        )}

        {tab === 'tables' && (
          <div className="space-y-2">
            {blueprint.tables.length === 0 ? (
              <EmptyHint isDark={isDark}>Ask Mitra to define your first table</EmptyHint>
            ) : (
              blueprint.tables.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => { setSelectedTable(i); setTab('form'); }}
                  className={`w-full text-left rounded-xl border p-2.5 transition-colors ${
                    selectedTable === i
                      ? isDark ? 'border-brand-green/25 bg-brand-green/5' : 'border-brand-green/30 bg-brand-green/10'
                      : isDark ? 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]' : 'border-border bg-card hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[12px] font-semibold text-foreground`}>{t.label}</span>
                    <span className={`text-[9px] font-mono text-muted-foreground`}>{t.name}</span>
                  </div>
                  {t.extendsTable && (
                    <p className={`text-[10px] mt-1 text-muted-foreground`}>extends {t.extendsTable}</p>
                  )}
                  <p className={`text-[10px] mt-1 text-brand-green`}>{t.fields.length} fields</p>
                </button>
              ))
            )}
          </div>
        )}

        {tab === 'form' && (
          table ? <FormPreview table={table} isDark={isDark} /> : <EmptyHint isDark={isDark}>Create a table first</EmptyHint>
        )}

        {tab === 'list' && (
          table ? <ListPreview table={table} isDark={isDark} /> : <EmptyHint isDark={isDark}>Create a table first</EmptyHint>
        )}

        {tab === 'scripts' && (
          scripts.length === 0 ? (
            <EmptyHint isDark={isDark}>Ask Mitra to add a Client Script</EmptyHint>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                {scripts.map((s, i) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSelectedScript(i)}
                    className={`px-2 py-1 rounded text-[10px] font-medium ${
                      selectedScript === i
                        ? isDark ? 'bg-brand-green/15 text-brand-green' : 'bg-brand-green/20 text-brand-green'
                        : isDark ? 'bg-white/[0.04] text-muted-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              {scripts[selectedScript] && (
                <ScriptPanel script={scripts[selectedScript]} isDark={isDark} />
              )}
            </div>
          )
        )}

        {tab === 'rules' && (
          rules.length === 0 ? (
            <EmptyHint isDark={isDark}>Ask Mitra to add a Business Rule</EmptyHint>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                {rules.map((r, i) => (
                  <button
                    key={r.name}
                    type="button"
                    onClick={() => setSelectedRule(i)}
                    className={`px-2 py-1 rounded text-[10px] font-medium ${
                      selectedRule === i
                        ? isDark ? 'bg-brand-green/15 text-brand-green' : 'bg-brand-green/20 text-brand-green'
                        : isDark ? 'bg-white/[0.04] text-muted-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
              {rules[selectedRule] && (
                <RulePanel rule={rules[selectedRule]} isDark={isDark} />
              )}
            </div>
          )
        )}

        {tab === 'update_set' && (
          <div className="space-y-3">
            <div className={`rounded-lg border px-3 py-2 flex items-center justify-between ${isDark ? 'border-white/[0.08] bg-white/[0.02]' : 'border-border bg-card'}`}>
              <div>
                <p className={`text-[11px] font-semibold text-foreground`}>{blueprint.updateSet?.name}</p>
                <p className={`text-[10px] text-muted-foreground`}>{updateItems.length} artifacts</p>
              </div>
              <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                blueprint.updateSet?.state === 'complete'
                  ? isDark ? 'bg-brand-green/12 text-brand-green' : 'bg-brand-green/20 text-brand-green'
                  : isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'
              }`}>
                {blueprint.updateSet?.state}
              </span>
            </div>

            <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-white/[0.08]' : 'border-border'}`}>
              <table className="w-full text-left text-[10px]">
                <thead>
                  <tr className={isDark ? 'bg-white/[0.04] border-b border-white/[0.06]' : 'bg-muted border-b border-border'}>
                    <th className={`px-2 py-1.5 font-semibold text-muted-foreground`}>Type</th>
                    <th className={`px-2 py-1.5 font-semibold text-muted-foreground`}>Name</th>
                    <th className={`px-2 py-1.5 font-semibold text-muted-foreground`}>State</th>
                  </tr>
                </thead>
                <tbody>
                  {updateItems.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={`px-2 py-4 text-center text-muted-foreground`}>
                        Artifacts appear as you build
                      </td>
                    </tr>
                  ) : (
                    updateItems.slice(0, 12).map((item, i) => (
                      <tr key={i} className={isDark ? 'border-b border-white/[0.04]' : 'border-b border-border'}>
                        <td className={`px-2 py-1.5 font-mono text-muted-foreground`}>{item.type}</td>
                        <td className={`px-2 py-1.5 text-foreground`}>{item.name}</td>
                        <td className={`px-2 py-1.5 ${item.state === 'Committed' ? 'text-brand-green' : isDark ? 'text-amber-400/80' : 'text-amber-600'}`}>{item.state}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

              <Button
                variant="cta"
                type="button"
                disabled={publishing || updateItems.length === 0 || blueprint.buildStage === 'published'}
                onClick={() => {
                  setPublishing(true);
                  setTimeout(() => setPublishing(false), 2200);
                }}
                className="w-full py-2 text-[12px]"
              >
                {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {blueprint.buildStage === 'published' ? 'Published to instance' : publishing ? 'Publishing…' : 'Publish to instance'}
              </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StudioChrome({
  isDark, onCollapse, scope, appName, version,
}: {
  isDark: boolean;
  onCollapse: () => void;
  scope: string;
  appName: string;
  version?: string;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 border-b shrink-0 ${isDark ? 'border-white/[0.08] bg-white/[0.03]' : 'border-border bg-card'}`}>
      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${isDark ? 'bg-[#4FCF36]/15' : 'bg-[#4FCF36]/20'}`}>
        <span className="text-[11px] font-bold text-[#4FCF36]">SN</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-semibold truncate text-foreground`}>{appName}</p>
        <p className={`text-[9px] font-mono truncate text-muted-foreground`}>
          {scope}{version ? ` · v${version}` : ''}
        </p>
      </div>
      <button
        type="button"
        onClick={onCollapse}
        className={`p-1 rounded text-muted-foreground hover:text-foreground`}
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ArtifactSection({ title, children, isDark }: { title: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div>
      <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground`}>{title}</p>
      {children}
    </div>
  );
}

function EmptyHint({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <p className={`text-[11px] text-center py-8 text-muted-foreground`}>{children}</p>
  );
}

function ScriptPanel({ script, isDark }: { script: NonNullable<SolutionBlueprint['clientScripts']>[0]; isDark: boolean }) {
  return (
    <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-white/[0.08]' : 'border-border'}`}>
      <div className={`px-2.5 py-1.5 border-b flex items-center justify-between ${isDark ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-muted border-border'}`}>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold text-foreground`}>{script.name}</span>
          <span className={`text-[9px] px-1 py-0.5 rounded font-mono ${isDark ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-green/20 text-brand-green'}`}>{script.type}</span>
        </div>
        <CopyBtn text={script.script} isDark={isDark} />
      </div>
      <pre className={`p-2.5 text-[10px] font-mono leading-relaxed overflow-x-auto max-h-48 bg-mitra-bg text-foreground`}>
        {script.script}
      </pre>
    </div>
  );
}

function RulePanel({ rule, isDark }: { rule: NonNullable<SolutionBlueprint['businessRules']>[0]; isDark: boolean }) {
  const when = `${rule.when} · ${rule.insert ? 'insert' : ''}${rule.update ? ' update' : ''}`.trim();
  return (
    <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-white/[0.08]' : 'border-border'}`}>
      <div className={`px-2.5 py-1.5 border-b flex items-center justify-between ${isDark ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-muted border-border'}`}>
        <div>
          <span className={`text-[10px] font-semibold text-foreground`}>{rule.name}</span>
          <p className={`text-[9px] font-mono mt-0.5 text-muted-foreground`}>{rule.table} · {when}</p>
        </div>
        <CopyBtn text={rule.script} isDark={isDark} />
      </div>
      <pre className={`p-2.5 text-[10px] font-mono leading-relaxed overflow-x-auto max-h-48 bg-mitra-bg text-foreground`}>
        {rule.script}
      </pre>
    </div>
  );
}
