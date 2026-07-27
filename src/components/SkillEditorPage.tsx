import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  History,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';
import { Button } from '@/src/components/ui/button';
import { Switch } from '@/src/components/ui/switch';
import { SERVICE_NOW_INSTANCES, loadSelectedInstanceId } from '../data/serviceNowInstances';
import { SKILL_CATEGORIES, type Skill, type SkillCategory } from '../data/skills';
import {
  SKILL_STATUS_LABELS,
  type ManagedSkill,
  type SkillPublishStatus,
  type SkillVersion,
  applySkillUpdate,
  createManagedSkill,
  diffSkillVersions,
  formatSkillDate,
  generateSkillFromPlainLanguage,
  restoreFromVersion,
  snapshotFromSkill,
} from '../data/skillManagement';

export type SkillEditorMode = 'create' | 'edit';

export interface SkillEditorResult {
  skill: ManagedSkill;
  version: SkillVersion;
  isNew: boolean;
}

interface SkillEditorPageProps {
  theme: Theme;
  mode: SkillEditorMode;
  skill?: ManagedSkill | null;
  versions?: SkillVersion[];
  runSkill?: Skill | null;
  onBack: () => void;
  onSaved: (result: SkillEditorResult) => void;
  onDelete?: (skillId: string) => void;
  onRun?: (skill: Skill) => void;
}

const inputClass = (isDark: boolean) =>
  cn(
    'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
    isDark
      ? 'border-mitra-border bg-mitra-input text-foreground placeholder:text-muted-foreground focus:border-brand-green/40'
      : 'border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-brand-green/50',
  );

export default function SkillEditorPage({
  theme,
  mode,
  skill = null,
  versions = [],
  runSkill = null,
  onBack,
  onSaved,
  onDelete,
  onRun,
}: SkillEditorPageProps) {
  const isDark = isDarkTheme(theme);
  const isCreate = mode === 'create' || !skill;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SkillCategory>('Documentation');
  const [instructions, setInstructions] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [status, setStatus] = useState<SkillPublishStatus>('draft');
  const [instanceId, setInstanceId] = useState(loadSelectedInstanceId());
  const [changeNote, setChangeNote] = useState('');
  const [plainPrompt, setPlainPrompt] = useState('');
  const [showMitra, setShowMitra] = useState(true);
  const [builderBusy, setBuilderBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);

  useEffect(() => {
    if (skill) {
      setName(skill.name);
      setDescription(skill.description);
      setCategory(skill.category);
      setInstructions(skill.instructions);
      setEnabled(skill.enabled);
      setStatus(skill.status);
      setInstanceId(skill.instanceId || loadSelectedInstanceId());
      setShowMitra(false);
    } else {
      setName('');
      setDescription('');
      setCategory('Documentation');
      setInstructions('');
      setEnabled(true);
      setStatus('draft');
      setInstanceId(loadSelectedInstanceId());
      setShowMitra(true);
    }
    setChangeNote('');
    setPlainPrompt('');
    setSaveError('');
    setSaveSuccess('');
    setCompareVersionId(null);
  }, [skill, mode]);

  useEffect(() => {
    if (!saveSuccess) return;
    const t = window.setTimeout(() => setSaveSuccess(''), 4000);
    return () => window.clearTimeout(t);
  }, [saveSuccess]);

  const sortedVersions = useMemo(
    () => [...versions].sort((a, b) => b.version - a.version),
    [versions],
  );

  const compareVersion = useMemo(() => {
    if (!sortedVersions.length) return null;
    if (compareVersionId) return sortedVersions.find((v) => v.id === compareVersionId) ?? null;
    if (!skill) return null;
    return sortedVersions.find((v) => v.version !== skill.version) ?? null;
  }, [sortedVersions, compareVersionId, skill]);

  const diffs = useMemo(() => {
    if (!skill || !compareVersion) return [];
    return diffSkillVersions(compareVersion, skill).filter((d) => d.changed);
  }, [skill, compareVersion]);

  const handleMitraGenerate = () => {
    if (!plainPrompt.trim()) {
      setSaveError('Describe the skill in plain language first.');
      return;
    }
    setBuilderBusy(true);
    setSaveError('');
    window.setTimeout(() => {
      const draft = generateSkillFromPlainLanguage(plainPrompt);
      setName(draft.name);
      setDescription(draft.description);
      setCategory(draft.category);
      setInstructions(draft.instructions);
      setStatus('draft');
      setEnabled(true);
      setChangeNote('Drafted by Mitra from plain language');
      setBuilderBusy(false);
      setShowMitra(false);
      setSaveSuccess('Draft filled in — review, then Save.');
    }, 300);
  };

  const handleSave = () => {
    setSaveSuccess('');
    if (!name.trim() || !description.trim() || !instructions.trim()) {
      setSaveError('Name, description, and instructions are required.');
      return;
    }

    if (isCreate || !skill) {
      const { skill: created, version } = createManagedSkill({
        name,
        description,
        category,
        instructions,
        enabled,
        status,
        instanceId,
        changeNote: changeNote.trim() || 'Created',
      });
      onSaved({ skill: created, version, isNew: true });
      setSaveSuccess(`Saved as v${created.version} (${SKILL_STATUS_LABELS[created.status]}).`);
      return;
    }

    const { skill: updated, version } = applySkillUpdate(
      skill,
      { name, description, category, instructions, enabled, status, instanceId },
      changeNote.trim() || undefined,
    );
    onSaved({ skill: updated, version, isNew: false });
    setSaveSuccess(`Saved new version v${updated.version}.`);
    setChangeNote('');
  };

  const handleRestore = (version: SkillVersion) => {
    if (!skill) return;
    const { skill: updated, version: newVersion } = restoreFromVersion(skill, version);
    onSaved({ skill: updated, version: newVersion, isNew: false });
    setName(updated.name);
    setDescription(updated.description);
    setCategory(updated.category);
    setInstructions(updated.instructions);
    setEnabled(updated.enabled);
    setStatus(updated.status);
    setSaveSuccess(`Restored from v${version.version} → saved as v${updated.version}.`);
    setCompareVersionId(null);
  };

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <div className="shrink-0 border-b border-border px-4 py-4 md:px-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className={cn(
                'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                isDark
                  ? 'border-mitra-border text-muted-foreground hover:bg-accent hover:text-foreground'
                  : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
              aria-label="Back to skills"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display truncate text-2xl font-extrabold tracking-tight text-foreground">
                {isCreate ? 'Add skill' : name || 'Edit skill'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isCreate
                  ? 'Details on the left · Instructions in the center · Versions on the right'
                  : `v${skill?.version ?? 1} · Saving creates a new version`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isCreate && runSkill && onRun && (
              <Button type="button" variant="secondary" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => onRun(runSkill)}>
                <Play className="h-3.5 w-3.5" />
                Run
              </Button>
            )}
            {!isCreate && onDelete && skill && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                onClick={() => onDelete(skill.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
            <Button type="button" variant="cta" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleSave}>
              <Check className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>

        {(saveSuccess || saveError) && (
          <div
            role="status"
            className={cn(
              'mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm',
              saveError
                ? 'border-destructive/30 bg-destructive/10 text-destructive'
                : 'border-border bg-brand-green/10 text-foreground',
            )}
          >
            {!saveError && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />}
            <p className="min-w-0 flex-1 font-medium">{saveError || saveSuccess}</p>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSaveError('');
                setSaveSuccess('');
              }}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Full-page columns: details | instructions | versions */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(240px,320px)_minmax(0,1fr)_minmax(220px,260px)]">
        {/* Left: details */}
        <aside
          className={cn(
            'min-h-0 space-y-3 overflow-y-auto border-b border-border p-4 lg:border-b-0 lg:border-r',
            isDark ? 'border-mitra-border bg-mitra-surface' : 'border-border bg-card',
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Skill details
          </p>

          <div className="rounded-xl border border-border p-3">
            <button
              type="button"
              onClick={() => setShowMitra((v) => !v)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-brand-green" />
                Ask Mitra
              </span>
              <span className="text-[10px] text-muted-foreground">{showMitra ? 'Hide' : 'Show'}</span>
            </button>
            {showMitra && (
              <div className="mt-2 space-y-2">
                <textarea
                  rows={4}
                  value={plainPrompt}
                  onChange={(e) => setPlainPrompt(e.target.value)}
                  placeholder="Describe the skill…"
                  className={cn(inputClass(isDark), 'resize-y text-xs')}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={builderBusy}
                  onClick={handleMitraGenerate}
                  className="w-full gap-1.5 text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {builderBusy ? 'Drafting…' : 'Generate draft'}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Title</label>
            <input className={inputClass(isDark)} value={name} onChange={(e) => setName(e.target.value)} placeholder="Skill name" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Description</label>
            <textarea
              rows={3}
              className={cn(inputClass(isDark), 'resize-y')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Category</label>
            <select className={inputClass(isDark)} value={category} onChange={(e) => setCategory(e.target.value as SkillCategory)}>
              {SKILL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Instance</label>
            <select className={inputClass(isDark)} value={instanceId} onChange={(e) => setInstanceId(e.target.value)}>
              {SERVICE_NOW_INSTANCES.filter((i) => i.active).map((inst) => (
                <option key={inst.id} value={inst.id}>{inst.name} ({inst.tag})</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Enabled</p>
              <p className="text-[11px] text-muted-foreground">Active in list</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Status</label>
            <select className={inputClass(isDark)} value={status} onChange={(e) => setStatus(e.target.value as SkillPublishStatus)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Change note</label>
            <input
              className={inputClass(isDark)}
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="What changed?"
            />
          </div>
        </aside>

        {/* Center: large instructions column */}
        <section className="flex min-h-0 flex-col border-b border-border p-4 lg:border-b-0 lg:border-r">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Instructions
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Full skill prompt — Mitra follows this when the skill runs.
              </p>
            </div>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {instructions.length.toLocaleString()} chars
            </span>
          </div>
          <textarea
            className={cn(
              inputClass(isDark),
              'min-h-[50vh] flex-1 resize-none font-mono text-[13px] leading-relaxed lg:min-h-0',
            )}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Write the full instructions here…"
            spellCheck={false}
          />
        </section>

        {/* Right: versions */}
        <aside className={cn('min-h-0 overflow-y-auto p-4', isDark ? 'bg-background/40' : 'bg-muted/30')}>
          <div className="mb-3 flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Versions
            </p>
          </div>
          {isCreate || sortedVersions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-3 py-5 text-center">
              <p className="text-xs font-medium text-foreground">No versions yet</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Save to create v1. Later saves appear here for compare and restore.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedVersions.map((v) => {
                const isCurrent = skill ? v.version === skill.version : false;
                const isActive = compareVersion?.id === v.id;
                return (
                  <div
                    key={v.id}
                    className={cn(
                      'rounded-xl border px-3 py-2.5',
                      isActive
                        ? 'border-border bg-muted'
                        : isDark
                          ? 'border-mitra-border bg-mitra-surface'
                          : 'border-border bg-card',
                    )}
                  >
                    <button type="button" className="w-full text-left" onClick={() => setCompareVersionId(v.id)}>
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
                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleRestore(v)}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-brand-green hover:text-brand-green-hover"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Restore
                      </button>
                    )}
                  </div>
                );
              })}
              {diffs.length > 0 && compareVersion && (
                <div className="border-t border-border pt-3">
                  <p className="mb-2 text-[11px] font-semibold text-foreground">
                    Changed vs v{compareVersion.version}
                  </p>
                  {diffs.map((d) => (
                    <div key={d.field} className="mb-2 rounded-lg border border-border px-2.5 py-2">
                      <p className="text-[10px] font-semibold uppercase text-muted-foreground">{d.label}</p>
                      <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground">Now: </span>
                        {d.after || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export function skillToManagedDraft(skill: Skill): ManagedSkill {
  const stamp = new Date().toISOString();
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    instructions: skill.whatItHelpsWith,
    enabled: true,
    status: 'published',
    createdBy: skill.createdBy,
    updatedBy: skill.createdBy,
    instanceId: skill.instanceId ?? loadSelectedInstanceId(),
    version: 1,
    createdAt: stamp,
    updatedAt: stamp,
    isBuiltin: !skill.id.startsWith('custom-') && !skill.id.startsWith('skill-'),
  };
}

export function ensureInitialVersion(skill: ManagedSkill): SkillVersion {
  return snapshotFromSkill(skill, 'Initial');
}
