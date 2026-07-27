import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  History,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';
import { Button } from '@/src/components/ui/button';
import { Switch } from '@/src/components/ui/switch';
import { SERVICE_NOW_INSTANCES, loadSelectedInstanceId } from '../data/serviceNowInstances';
import {
  SKILL_CATEGORIES,
  SKILL_STATUS_LABELS,
  type ManagedSkill,
  type SkillFieldDiff,
  type SkillPublishStatus,
  type SkillVersion,
  applySkillUpdate,
  createManagedSkill,
  diffSkillVersions,
  formatSkillDate,
  generateSkillFromPlainLanguage,
  getVersionsForSkill,
  loadManagedSkills,
  loadSkillVersions,
  restoreFromVersion,
  saveManagedSkills,
  saveSkillVersions,
} from '../data/skillManagement';
import type { SkillCategory } from '../data/skills';

interface SkillsManageViewProps {
  theme: Theme;
  onBack?: () => void;
}

type EditorTab = 'details' | 'versions' | 'mitra';

const inputClass = (isDark: boolean) =>
  cn(
    'w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors',
    isDark
      ? 'border-mitra-border bg-mitra-input text-foreground placeholder:text-muted-foreground focus:border-brand-green/40'
      : 'border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-brand-green/50',
  );

function StatusBadge({ status }: { status: SkillPublishStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        status === 'published'
          ? 'border-border bg-brand-green/10 text-brand-green'
          : 'border-border bg-muted text-muted-foreground',
      )}
    >
      {SKILL_STATUS_LABELS[status]}
    </span>
  );
}

export default function SkillsManageView({ theme, onBack }: SkillsManageViewProps) {
  const isDark = isDarkTheme(theme);
  const [skills, setSkills] = useState<ManagedSkill[]>(loadManagedSkills);
  const [versions, setVersions] = useState<SkillVersion[]>(loadSkillVersions);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SkillPublishStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<EditorTab>('details');
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SkillCategory>('Documentation');
  const [instructions, setInstructions] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [status, setStatus] = useState<SkillPublishStatus>('draft');
  const [instanceId, setInstanceId] = useState(loadSelectedInstanceId());
  const [changeNote, setChangeNote] = useState('');
  const [saveError, setSaveError] = useState('');

  // Mitra builder
  const [plainPrompt, setPlainPrompt] = useState('');
  const [builderBusy, setBuilderBusy] = useState(false);

  // Version compare
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);

  useEffect(() => {
    saveManagedSkills(skills);
  }, [skills]);

  useEffect(() => {
    saveSkillVersions(versions);
  }, [versions]);

  const selected = useMemo(
    () => (selectedId ? skills.find((s) => s.id === selectedId) ?? null : null),
    [skills, selectedId],
  );

  const skillVersions = useMemo(
    () => (selectedId ? getVersionsForSkill(selectedId, versions) : []),
    [selectedId, versions],
  );

  const compareVersion = useMemo(
    () => skillVersions.find((v) => v.id === compareVersionId) ?? skillVersions[1] ?? null,
    [skillVersions, compareVersionId],
  );

  const diffs: SkillFieldDiff[] = useMemo(() => {
    if (!selected || !compareVersion) return [];
    return diffSkillVersions(compareVersion, selected);
  }, [selected, compareVersion]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return skills
      .filter((s) => {
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        if (!q) return true;
        return (
          s.name.toLowerCase().includes(q)
          || s.description.toLowerCase().includes(q)
          || s.instructions.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [skills, search, statusFilter]);

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setCategory('Documentation');
    setInstructions('');
    setEnabled(true);
    setStatus('draft');
    setInstanceId(loadSelectedInstanceId());
    setChangeNote('');
    setSaveError('');
    setPlainPrompt('');
  }, []);

  const loadSkillIntoForm = useCallback((skill: ManagedSkill) => {
    setName(skill.name);
    setDescription(skill.description);
    setCategory(skill.category);
    setInstructions(skill.instructions);
    setEnabled(skill.enabled);
    setStatus(skill.status);
    setInstanceId(skill.instanceId || loadSelectedInstanceId());
    setChangeNote('');
    setSaveError('');
  }, []);

  const openCreate = () => {
    setIsCreating(true);
    setSelectedId(null);
    setEditorTab('mitra');
    resetForm();
  };

  const openEdit = (skill: ManagedSkill) => {
    setIsCreating(false);
    setSelectedId(skill.id);
    setEditorTab('details');
    loadSkillIntoForm(skill);
    setCompareVersionId(null);
  };

  const closeEditor = () => {
    setIsCreating(false);
    setSelectedId(null);
    resetForm();
    setEditorTab('details');
  };

  const handleSave = () => {
    if (!name.trim() || !description.trim() || !instructions.trim()) {
      setSaveError('Name, description, and instructions are required.');
      return;
    }

    if (isCreating || !selected) {
      const { skill, version } = createManagedSkill({
        name,
        description,
        category,
        instructions,
        enabled,
        status,
        instanceId,
        changeNote: changeNote.trim() || 'Created',
      });
      setSkills((prev) => [skill, ...prev]);
      setVersions((prev) => [version, ...prev]);
      setIsCreating(false);
      setSelectedId(skill.id);
      setEditorTab('versions');
      setChangeNote('');
      setSaveError('');
      return;
    }

    const { skill, version } = applySkillUpdate(
      selected,
      { name, description, category, instructions, enabled, status, instanceId },
      changeNote.trim() || undefined,
    );
    setSkills((prev) => prev.map((s) => (s.id === skill.id ? skill : s)));
    setVersions((prev) => [version, ...prev]);
    loadSkillIntoForm(skill);
    setChangeNote('');
    setSaveError('');
  };

  const handleDelete = (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
    setVersions((prev) => prev.filter((v) => v.skillId !== id));
    if (selectedId === id) closeEditor();
  };

  const handleRestore = (version: SkillVersion) => {
    if (!selected) return;
    const { skill, version: newVersion } = restoreFromVersion(selected, version);
    setSkills((prev) => prev.map((s) => (s.id === skill.id ? skill : s)));
    setVersions((prev) => [newVersion, ...prev]);
    loadSkillIntoForm(skill);
    setEditorTab('details');
  };

  const handleMitraGenerate = () => {
    if (!plainPrompt.trim()) {
      setSaveError('Describe the skill in plain language first.');
      return;
    }
    setBuilderBusy(true);
    setSaveError('');
    // Simulate brief processing (prototype stand-in for SN LLM action)
    window.setTimeout(() => {
      const draft = generateSkillFromPlainLanguage(plainPrompt);
      setName(draft.name);
      setDescription(draft.description);
      setCategory(draft.category);
      setInstructions(draft.instructions);
      setStatus('draft');
      setEnabled(true);
      setBuilderBusy(false);
      setEditorTab('details');
      setChangeNote('Drafted by Mitra from plain language');
      if (!isCreating && !selectedId) setIsCreating(true);
    }, 450);
  };

  const showEditor = isCreating || Boolean(selected);
  const pill = (active: boolean) =>
    cn(
      'shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
      active
        ? 'border-border bg-muted text-brand-green'
        : isDark
          ? 'border-mitra-border bg-mitra-surface text-muted-foreground hover:bg-accent hover:text-foreground'
          : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
    );

  const tabBtn = (tab: EditorTab, label: string) => (
    <button
      key={tab}
      type="button"
      onClick={() => setEditorTab(tab)}
      className={cn(
        'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
        editorTab === tab
          ? 'bg-muted text-brand-green'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <div className="shrink-0 px-4 pb-4 pt-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
                    isDark
                      ? 'border-mitra-border text-muted-foreground hover:bg-accent hover:text-foreground'
                      : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                  aria-label="Back to skills"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
                  Manage Skills
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Create, version, and publish skills. Maps to ServiceNow skill + version tables.
                </p>
              </div>
            </div>
            <Button variant="cta" size="sm" className="h-8 gap-1.5 text-xs" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" />
              New skill
            </Button>
          </div>

          {!showEditor && (
            <>
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search managed skills…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(inputClass(isDark), 'pl-10')}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" className={pill(statusFilter === 'all')} onClick={() => setStatusFilter('all')}>
                  All
                </button>
                <button type="button" className={pill(statusFilter === 'draft')} onClick={() => setStatusFilter('draft')}>
                  Draft
                </button>
                <button type="button" className={pill(statusFilter === 'published')} onClick={() => setStatusFilter('published')}>
                  Published
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          {showEditor ? (
            <div
              className={cn(
                'rounded-2xl border',
                isDark ? 'border-mitra-border bg-mitra-surface' : 'border-border bg-card',
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    All skills
                  </button>
                  {selected && (
                    <span className="text-xs text-muted-foreground">
                      · v{selected.version} · {formatSkillDate(selected.updatedAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                  {tabBtn('mitra', 'Ask Mitra')}
                  {tabBtn('details', 'Details')}
                  {!isCreating && tabBtn('versions', 'Versions')}
                </div>
              </div>

              <div className="p-4 md:p-5">
                {editorTab === 'mitra' && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Describe a skill in plain language</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Mitra drafts name, description, category, and instructions. Review, then save as Draft or Publish.
                        </p>
                      </div>
                    </div>
                    <textarea
                      rows={6}
                      value={plainPrompt}
                      onChange={(e) => setPlainPrompt(e.target.value)}
                      placeholder="e.g. When someone asks for a change request risk review, check CMDB impact, CAB policy, and suggest approval path…"
                      className={cn(inputClass(isDark), 'resize-y')}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="cta"
                        size="sm"
                        disabled={builderBusy}
                        onClick={handleMitraGenerate}
                        className="gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {builderBusy ? 'Drafting…' : 'Generate draft'}
                      </Button>
                    </div>
                    {saveError && <p className="text-[11px] text-destructive">{saveError}</p>}
                  </div>
                )}

                {editorTab === 'details' && (
                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Skill title</label>
                      <input className={inputClass(isDark)} value={name} onChange={(e) => setName(e.target.value)} placeholder="Skill name" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Description</label>
                      <input className={inputClass(isDark)} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short summary" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Category</label>
                        <select className={inputClass(isDark)} value={category} onChange={(e) => setCategory(e.target.value as SkillCategory)}>
                          {SKILL_CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Target instance</label>
                        <select className={inputClass(isDark)} value={instanceId} onChange={(e) => setInstanceId(e.target.value)}>
                          {SERVICE_NOW_INSTANCES.filter((i) => i.active).map((inst) => (
                            <option key={inst.id} value={inst.id}>{inst.name} ({inst.tag})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Instructions</label>
                      <textarea
                        rows={8}
                        className={cn(inputClass(isDark), 'resize-y font-mono text-[13px]')}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="How Mitra should behave when this skill runs…"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-foreground">Enabled</p>
                          <p className="text-[11px] text-muted-foreground">Available to run when published</p>
                        </div>
                        <Switch checked={enabled} onCheckedChange={setEnabled} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Publish status</label>
                        <select className={inputClass(isDark)} value={status} onChange={(e) => setStatus(e.target.value as SkillPublishStatus)}>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Change note (optional)</label>
                      <input
                        className={inputClass(isDark)}
                        value={changeNote}
                        onChange={(e) => setChangeNote(e.target.value)}
                        placeholder="What changed in this version?"
                      />
                    </div>
                    {saveError && <p className="text-[11px] text-destructive">{saveError}</p>}
                    <div className="flex justify-end gap-2 border-t border-border pt-4">
                      <Button type="button" variant="ghost" size="sm" onClick={closeEditor}>Cancel</Button>
                      <Button type="button" variant="cta" size="sm" onClick={handleSave} className="gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        {isCreating ? 'Save skill' : 'Save new version'}
                      </Button>
                    </div>
                  </div>
                )}

                {editorTab === 'versions' && selected && (
                  <div className="grid gap-4 lg:grid-cols-5">
                    <div className="lg:col-span-2 space-y-2">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <History className="h-3.5 w-3.5" />
                        Version history
                      </p>
                      {skillVersions.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No versions yet.</p>
                      ) : (
                        skillVersions.map((v) => {
                          const active = (compareVersion?.id ?? skillVersions[1]?.id) === v.id;
                          const isCurrent = v.version === selected.version;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setCompareVersionId(v.id)}
                              className={cn(
                                'w-full rounded-xl border px-3 py-2.5 text-left transition-colors',
                                active
                                  ? 'border-brand-green/40 bg-brand-green/10'
                                  : isDark
                                    ? 'border-mitra-border hover:bg-mitra-highlight'
                                    : 'border-border hover:bg-accent/40',
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-foreground">v{v.version}</span>
                                {isCurrent && (
                                  <span className="text-[10px] font-semibold uppercase text-brand-green">Current</span>
                                )}
                              </div>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {v.changedBy} · {formatSkillDate(v.changedAt)}
                              </p>
                              {v.changeNote && (
                                <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{v.changeNote}</p>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div className="lg:col-span-3 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground">
                          {compareVersion
                            ? `Compare v${compareVersion.version} → current (v${selected.version})`
                            : 'Select a version to compare'}
                        </p>
                        {compareVersion && compareVersion.version !== selected.version && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => handleRestore(compareVersion)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Restore v{compareVersion.version}
                          </Button>
                        )}
                      </div>

                      {compareVersion ? (
                        <div className="space-y-2">
                          {diffs.map((d) => (
                            <div
                              key={d.field}
                              className={cn(
                                'rounded-xl border px-3 py-2.5',
                                d.changed
                                  ? 'border-brand-green/30 bg-brand-green/5'
                                  : isDark
                                    ? 'border-mitra-border'
                                    : 'border-border',
                              )}
                            >
                              <div className="mb-1 flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  {d.label}
                                </span>
                                {d.changed ? (
                                  <span className="text-[10px] font-semibold text-brand-green">Changed</span>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">Same</span>
                                )}
                              </div>
                              {d.changed ? (
                                <div className="grid gap-2 sm:grid-cols-2">
                                  <div>
                                    <p className="mb-0.5 text-[10px] text-muted-foreground">Before</p>
                                    <p className="whitespace-pre-wrap text-xs text-muted-foreground">{d.before || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="mb-0.5 text-[10px] text-muted-foreground">After</p>
                                    <p className="whitespace-pre-wrap text-xs font-medium text-foreground">{d.after || '—'}</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">
                                  {d.after || '—'}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Pick a prior version to see what changed.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div
              className={cn(
                'rounded-2xl border px-6 py-12 text-center',
                isDark ? 'border-mitra-border bg-mitra-surface' : 'border-border bg-card',
              )}
            >
              <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No managed skills yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create one manually or ask Mitra to draft it from plain language.
              </p>
              <Button variant="cta" size="sm" className="mt-4 gap-1.5" onClick={openCreate}>
                <Plus className="h-3.5 w-3.5" />
                New skill
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map((skill) => (
                <article
                  key={skill.id}
                  className={cn(
                    'flex flex-col gap-3 rounded-2xl border p-4 transition-colors sm:flex-row sm:items-start sm:justify-between',
                    isDark
                      ? 'border-mitra-border bg-mitra-surface hover:bg-mitra-highlight'
                      : 'border-border bg-card hover:bg-accent/40',
                  )}
                >
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openEdit(skill)}>
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={skill.status} />
                      <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                        {skill.category}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">v{skill.version}</span>
                      {!skill.enabled && (
                        <span className="text-[10px] font-semibold text-muted-foreground">Disabled</span>
                      )}
                    </div>
                    <p className="text-[15px] font-semibold text-foreground">{skill.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{skill.description}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Updated by {skill.updatedBy} · {formatSkillDate(skill.updatedAt)}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button type="button" variant="secondary" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => openEdit(skill)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <button
                      type="button"
                      aria-label={`Delete ${skill.name}`}
                      onClick={() => handleDelete(skill.id)}
                      className={cn(
                        'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
                        isDark
                          ? 'border-mitra-border text-muted-foreground hover:border-destructive/40 hover:text-destructive'
                          : 'border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive',
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
