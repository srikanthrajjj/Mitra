import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  CheckCircle2,
  History,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
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

interface SkillEditorModalProps {
  theme: Theme;
  isOpen: boolean;
  mode: SkillEditorMode;
  /** Existing managed skill when editing. */
  skill?: ManagedSkill | null;
  /** Known versions for this skill (newest first). */
  versions?: SkillVersion[];
  /** Run target for catalog skills. */
  runSkill?: Skill | null;
  onClose: () => void;
  onSaved: (result: SkillEditorResult) => void;
  onDelete?: (skillId: string) => void;
  onRun?: (skill: Skill) => void;
}

const inputClass = (isDark: boolean) =>
  cn(
    'w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors',
    isDark
      ? 'border-mitra-border bg-mitra-input text-foreground placeholder:text-muted-foreground focus:border-brand-green/40'
      : 'border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-brand-green/50',
  );

export default function SkillEditorModal({
  theme,
  isOpen,
  mode,
  skill = null,
  versions = [],
  runSkill = null,
  onClose,
  onSaved,
  onDelete,
  onRun,
}: SkillEditorModalProps) {
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
    if (!isOpen) return;
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
  }, [isOpen, skill]);

  useEffect(() => {
    if (!saveSuccess) return;
    const t = window.setTimeout(() => setSaveSuccess(''), 3500);
    return () => window.clearTimeout(t);
  }, [saveSuccess]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

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
      setSaveSuccess('Draft filled in — review fields, then Save.');
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

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close skill editor"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-editor-title"
        className={cn(
          'relative z-10 flex max-h-[min(90vh,820px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border shadow-lg',
          isDark ? 'border-mitra-border bg-mitra-surface' : 'border-border bg-card',
        )}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 id="skill-editor-title" className="font-display text-lg font-semibold text-foreground">
              {isCreate ? 'Add skill' : 'Edit skill'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isCreate
                ? 'Create, then run from the Skills list.'
                : `v${skill?.version ?? 1} · Update creates a new version`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isCreate && runSkill && onRun && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => onRun(runSkill)}
              >
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
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
                isDark
                  ? 'border-mitra-border text-muted-foreground hover:bg-accent hover:text-foreground'
                  : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {(saveSuccess || saveError) && (
          <div
            role="status"
            className={cn(
              'mx-4 mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm',
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

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-4 border-b border-border p-4 md:p-5 lg:border-b-0 lg:border-r">
              <div className="rounded-xl border border-border p-3">
                <button
                  type="button"
                  onClick={() => setShowMitra((v) => !v)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Sparkles className="h-4 w-4 text-brand-green" />
                    Ask Mitra
                  </span>
                  <span className="text-[11px] text-muted-foreground">{showMitra ? 'Hide' : 'Show'}</span>
                </button>
                {showMitra && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      rows={3}
                      value={plainPrompt}
                      onChange={(e) => setPlainPrompt(e.target.value)}
                      placeholder="Describe the skill in plain language…"
                      className={cn(inputClass(isDark), 'resize-y')}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={builderBusy}
                        onClick={handleMitraGenerate}
                        className="gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {builderBusy ? 'Drafting…' : 'Generate draft'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Title</label>
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
                    <label className="text-xs font-semibold text-foreground">Instance</label>
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
                    rows={7}
                    className={cn(inputClass(isDark), 'resize-y font-mono text-[13px]')}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="How Mitra should behave…"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">Enabled</p>
                      <p className="text-[11px] text-muted-foreground">Show as active in the list</p>
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
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Change note</label>
                  <input
                    className={inputClass(isDark)}
                    value={changeNote}
                    onChange={(e) => setChangeNote(e.target.value)}
                    placeholder="Optional — what changed?"
                  />
                </div>
              </div>
            </div>

            <aside className={cn('p-4', isDark ? 'bg-background/50' : 'bg-muted/30')}>
              <div className="mb-3 flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold text-foreground">Versions</p>
              </div>
              {isCreate || sortedVersions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-3 py-5 text-center">
                  <p className="text-xs font-medium text-foreground">No versions yet</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Saving creates v1. Later saves add history you can restore.
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
                              ? 'border-mitra-border'
                              : 'border-border bg-card',
                        )}
                      >
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => setCompareVersionId(v.id)}
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
                          <p className="mt-1 line-clamp-3 text-[11px] text-muted-foreground">
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
      </div>
    </div>,
    document.body,
  );
}

/** Convert a catalog Skill into a ManagedSkill shape for first-time edit. */
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
