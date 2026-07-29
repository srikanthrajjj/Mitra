import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowLeftRight,
  Check,
  CheckCircle2,
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
  type ManagedSkill,
  type SkillFieldDiff,
  type SkillPublishStatus,
  type SkillVersion,
  applySkillUpdate,
  createManagedSkill,
  diffSkillVersions,
  formatSkillDate,
  generateSkillFromPlainLanguage,
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
  onBack: () => void;
  onSaved: (result: SkillEditorResult) => void;
  onDelete?: (skillId: string) => void;
}

const WORKING_ID = '__working__';

const inputClass = (isDark: boolean) =>
  cn(
    'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
    isDark
      ? 'border-mitra-border bg-mitra-input text-foreground placeholder:text-muted-foreground focus:border-brand-green/40'
      : 'border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-brand-green/50',
  );

const SECTION_LABEL = 'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground';

const panelClass = (isDark: boolean) =>
  cn('rounded-xl border bg-card p-3', isDark ? 'border-mitra-border' : 'border-border');

function ColumnHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border px-4 md:px-5 lg:hidden">
      <h2 className={SECTION_LABEL}>{title}</h2>
      {action}
    </div>
  );
}

const SKILL_EDITOR_COLS =
  'lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(240px,280px)]';

function SkillEditorUnifiedHeader({
  instructionsLength,
  compareMode,
  isCreate,
  hasVersions,
  onCompareToggle,
  onCloseCompare,
  isDark,
}: {
  instructionsLength: number;
  compareMode: boolean;
  isCreate: boolean;
  hasVersions: boolean;
  onCompareToggle: () => void;
  onCloseCompare?: () => void;
  isDark: boolean;
}) {
  return (
    <div
      className={cn(
        'hidden shrink-0 border-b border-border lg:grid',
        SKILL_EDITOR_COLS,
        isDark ? 'bg-mitra-surface' : 'bg-card',
      )}
    >
      <div className="flex h-11 items-center border-r border-border px-4 md:px-5">
        <h2 className={SECTION_LABEL}>Skill details</h2>
      </div>
      <div className="flex h-11 items-center justify-between gap-2 border-r border-border px-4 md:px-5">
        <h2 className={SECTION_LABEL}>{compareMode ? 'Version compare' : 'Instructions'}</h2>
        {compareMode ? (
          onCloseCompare && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-[11px]"
              onClick={onCloseCompare}
            >
              <X className="h-3 w-3" />
              Close
            </Button>
          )
        ) : (
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {instructionsLength.toLocaleString()} chars
          </span>
        )}
      </div>
      <div className="flex h-11 items-center justify-between gap-2 px-4 md:px-5">
        <h2 className={SECTION_LABEL}>Versions</h2>
        {!isCreate && hasVersions && (
          <Button
            type="button"
            variant={compareMode ? 'cta' : 'secondary'}
            size="sm"
            className="h-7 gap-1 px-2 text-[11px]"
            onClick={onCompareToggle}
          >
            <ArrowLeftRight className="h-3 w-3" />
            {compareMode ? 'Editing' : 'Compare'}
          </Button>
        )}
      </div>
    </div>
  );
}

function VersionComparePanel({
  isDark,
  leftLabel,
  rightLabel,
  diffs,
  onClose,
}: {
  isDark: boolean;
  leftLabel: string;
  rightLabel: string;
  diffs: SkillFieldDiff[];
  onClose: () => void;
}) {
  const changed = diffs.filter((d) => d.changed);
  const unchanged = diffs.filter((d) => !d.changed);

  return (
    <section className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r lg:bg-card">
      <ColumnHeader
        title="Version compare"
        action={
          <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px]" onClick={onClose}>
            <X className="h-3 w-3" />
            Close
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">
          {leftLabel} → {rightLabel}
        </p>

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
        <div className={cn('rounded-lg border px-2.5 py-1.5', isDark ? 'border-mitra-border bg-mitra-surface' : 'border-border bg-muted')}>
          {leftLabel}
        </div>
        <div className={cn('rounded-lg border px-2.5 py-1.5', isDark ? 'border-mitra-border bg-mitra-surface' : 'border-border bg-muted')}>
          {rightLabel}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {changed.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm font-medium text-foreground">No differences</p>
            <p className="mt-1 text-xs text-muted-foreground">These two versions match on all tracked fields.</p>
          </div>
        ) : (
          changed.map((d) => (
            <div key={d.field} className="overflow-hidden rounded-xl border border-border">
              <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-1.5">
                <span className={SECTION_LABEL}>
                  {d.label}
                </span>
                <span className="text-[10px] font-semibold text-brand-green">Changed</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className={cn('border-b border-border p-3 sm:border-b-0 sm:border-r', isDark ? 'border-mitra-border' : '')}>
                  <p className="mb-1 text-[10px] font-semibold uppercase text-secondary-foreground">Before</p>
                  <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-muted-foreground">
                    {d.before || '—'}
                  </pre>
                </div>
                <div className="p-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase text-secondary-foreground">After</p>
                  <pre className="whitespace-pre-wrap break-words font-sans text-xs font-medium leading-relaxed text-foreground">
                    {d.after || '—'}
                  </pre>
                </div>
              </div>
            </div>
          ))
        )}

        {unchanged.length > 0 && (
          <details className="rounded-xl border border-border px-3 py-2">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
              Unchanged fields ({unchanged.length})
            </summary>
            <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              {unchanged.map((d) => (
                <li key={d.field}>
                  <span className="font-semibold text-foreground">{d.label}:</span>{' '}
                  <span className="line-clamp-2">{d.after || '—'}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
      </div>
    </section>
  );
}

export default function SkillEditorPage({
  theme,
  mode,
  skill = null,
  versions = [],
  onBack,
  onSaved,
  onDelete,
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
  const [compareMode, setCompareMode] = useState(false);
  const [leftVersionId, setLeftVersionId] = useState<string | null>(null);
  const [rightVersionId, setRightVersionId] = useState<string | null>(null);

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
    setCompareMode(false);
    setLeftVersionId(null);
    setRightVersionId(null);
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

  const workingCopy = useMemo((): SkillVersion => {
    const stamp = new Date().toISOString();
    return {
      id: WORKING_ID,
      skillId: skill?.id ?? 'new',
      version: skill?.version ?? 0,
      name,
      description,
      category,
      instructions,
      status,
      changedBy: 'You',
      changedAt: stamp,
      changeNote: 'Working copy (unsaved)',
    };
  }, [skill, name, description, category, instructions, status]);

  const compareOptions = useMemo(() => {
    const opts: Array<{ id: string; label: string; version: SkillVersion }> = [
      { id: WORKING_ID, label: 'Working copy', version: workingCopy },
      ...sortedVersions.map((v) => ({
        id: v.id,
        label: `v${v.version}${skill && v.version === skill.version ? ' (saved)' : ''}`,
        version: v,
      })),
    ];
    return opts;
  }, [workingCopy, sortedVersions, skill]);

  // Default left = previous saved version, right = working copy
  useEffect(() => {
    if (!compareMode) return;
    if (!leftVersionId) {
      const prev = sortedVersions.find((v) => !skill || v.version !== skill.version) ?? sortedVersions[0];
      setLeftVersionId(prev?.id ?? WORKING_ID);
    }
    if (!rightVersionId) {
      setRightVersionId(WORKING_ID);
    }
  }, [compareMode, leftVersionId, rightVersionId, sortedVersions, skill]);

  const leftVersion = useMemo(
    () => compareOptions.find((o) => o.id === leftVersionId)?.version ?? null,
    [compareOptions, leftVersionId],
  );
  const rightVersion = useMemo(
    () => compareOptions.find((o) => o.id === rightVersionId)?.version ?? null,
    [compareOptions, rightVersionId],
  );

  const compareDiffs = useMemo(() => {
    if (!leftVersion || !rightVersion) return [];
    return diffSkillVersions(leftVersion, rightVersion);
  }, [leftVersion, rightVersion]);

  const openCompare = (preferLeftId?: string) => {
    if (preferLeftId) setLeftVersionId(preferLeftId);
    setRightVersionId(WORKING_ID);
    setCompareMode(true);
  };

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
      setSaveSuccess('Draft filled in — review, then Publish to create a version.');
    }, 300);
  };

  const handlePublish = () => {
    setSaveSuccess('');
    if (!name.trim() || !description.trim() || !instructions.trim()) {
      setSaveError('Name, description, and instructions are required before publishing.');
      return;
    }

    const publishStatus: SkillPublishStatus = 'published';

    if (isCreate || !skill) {
      const { skill: created, version } = createManagedSkill({
        name,
        description,
        category,
        instructions,
        enabled,
        status: publishStatus,
        instanceId,
        changeNote: changeNote.trim() || 'Published',
      });
      onSaved({ skill: created, version, isNew: true });
      setStatus(publishStatus);
      setSaveSuccess(`Published as v${created.version}. This version is now live.`);
      setChangeNote('');
      return;
    }

    const { skill: updated, version } = applySkillUpdate(
      skill,
      {
        name,
        description,
        category,
        instructions,
        enabled,
        status: publishStatus,
        instanceId,
      },
      changeNote.trim() || 'Published',
    );
    onSaved({ skill: updated, version, isNew: false });
    setStatus(publishStatus);
    setSaveSuccess(`Published v${updated.version}. Version history updated.`);
    setChangeNote('');
  };

  const handleRestore = (version: SkillVersion) => {
    if (!skill) return;
    const { skill: restored, version: newVersion } = applySkillUpdate(
      skill,
      {
        name: version.name,
        description: version.description,
        category: version.category,
        instructions: version.instructions,
        status: 'published',
      },
      `Restored from v${version.version} and published`,
    );
    onSaved({ skill: restored, version: newVersion, isNew: false });
    setName(restored.name);
    setDescription(restored.description);
    setCategory(restored.category);
    setInstructions(restored.instructions);
    setEnabled(restored.enabled);
    setStatus(restored.status);
    setSaveSuccess(`Restored from v${version.version} → published as v${restored.version}.`);
    setCompareMode(false);
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
                  ? 'Edit freely — Publish creates v1 and makes it live'
                  : `v${skill?.version ?? 1} · Publish creates the next version`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
            <Button type="button" variant="cta" size="sm" className="h-8 gap-1.5 text-xs" onClick={handlePublish}>
              <Check className="h-3.5 w-3.5" />
              Publish
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
      <SkillEditorUnifiedHeader
        instructionsLength={instructions.length}
        compareMode={compareMode}
        isCreate={isCreate}
        hasVersions={sortedVersions.length > 0}
        onCompareToggle={() => (compareMode ? setCompareMode(false) : openCompare())}
        onCloseCompare={() => setCompareMode(false)}
        isDark={isDark}
      />
      <div className={cn('grid min-h-0 flex-1 grid-cols-1 bg-background', SKILL_EDITOR_COLS)}>
        {/* Left: details */}
        <aside
          className={cn(
            'flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r',
            isDark ? 'bg-mitra-surface' : 'bg-card',
          )}
        >
          <ColumnHeader title="Skill details" />
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-5">
          <div className={panelClass(isDark)}>
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
          <div className={cn('flex items-center justify-between', panelClass(isDark))}>
            <div>
              <p className="text-sm font-medium text-foreground">Enabled</p>
              <p className="text-xs text-muted-foreground">Active in list</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <div className={panelClass(isDark)}>
            <p className={SECTION_LABEL}>Status</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {status === 'published' ? 'Published' : 'Draft — Publish to go live'}
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Publish note</label>
            <input
              className={inputClass(isDark)}
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="What changed in this publish?"
            />
          </div>
          </div>
        </aside>

        {/* Center: instructions OR compare panel */}
        {compareMode && leftVersion && rightVersion ? (
          <VersionComparePanel
            isDark={isDark}
            leftLabel={compareOptions.find((o) => o.id === leftVersionId)?.label ?? 'Before'}
            rightLabel={compareOptions.find((o) => o.id === rightVersionId)?.label ?? 'After'}
            diffs={compareDiffs}
            onClose={() => setCompareMode(false)}
          />
        ) : (
          <section className={cn('flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r', isDark ? 'bg-mitra-surface' : 'bg-card')}>
            <ColumnHeader
              title="Instructions"
              action={
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {instructions.length.toLocaleString()} chars
                </span>
              }
            />
            <div className="flex min-h-0 flex-1 flex-col p-4 md:p-5">
              <p className="mb-3 text-xs text-muted-foreground">
                Full skill prompt — Mitra follows this when the skill runs.
              </p>
            <textarea
              className={cn(
                inputClass(isDark),
                'min-h-[50vh] flex-1 resize-none rounded-xl font-mono text-[13px] leading-relaxed lg:min-h-0',
              )}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Write the full instructions here…"
              spellCheck={false}
            />
            </div>
          </section>
        )}

        {/* Right: versions + compare controls */}
        <aside className={cn('flex min-h-0 flex-col', isDark ? 'bg-mitra-surface' : 'bg-card')}>
          <ColumnHeader
            title="Versions"
            action={
              !isCreate && sortedVersions.length > 0 ? (
                <Button
                  type="button"
                  variant={compareMode ? 'cta' : 'secondary'}
                  size="sm"
                  className="h-7 gap-1 px-2 text-[11px]"
                  onClick={() => (compareMode ? setCompareMode(false) : openCompare())}
                >
                  <ArrowLeftRight className="h-3 w-3" />
                  {compareMode ? 'Editing' : 'Compare'}
                </Button>
              ) : undefined
            }
          />
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
          {compareMode && (
            <div className={cn('mb-3 space-y-2', panelClass(isDark))}>
              <p className={SECTION_LABEL}>Compare</p>
              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-foreground">From</label>
                <select
                  className={inputClass(isDark)}
                  value={leftVersionId ?? ''}
                  onChange={(e) => setLeftVersionId(e.target.value)}
                >
                  {compareOptions.map((o) => (
                    <option key={`l-${o.id}`} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-foreground">To</label>
                <select
                  className={inputClass(isDark)}
                  value={rightVersionId ?? ''}
                  onChange={(e) => setRightVersionId(e.target.value)}
                >
                  {compareOptions.map((o) => (
                    <option key={`r-${o.id}`} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>
              {leftVersion && rightVersion && (
                <p className="text-[11px] text-muted-foreground">
                  {compareDiffs.filter((d) => d.changed).length} field
                  {compareDiffs.filter((d) => d.changed).length === 1 ? '' : 's'} changed
                </p>
              )}
            </div>
          )}

          {isCreate || sortedVersions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-3 py-5 text-center">
              <p className="text-xs font-medium text-foreground">No versions yet</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Publish creates v1. After another publish, use Compare for side-by-side diffs.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedVersions.map((v) => {
                const isCurrent = skill ? v.version === skill.version : false;
                const isLeft = leftVersionId === v.id;
                const isRight = rightVersionId === v.id;
                return (
                  <div
                    key={v.id}
                    className={cn(
                      'rounded-xl border px-3 py-2.5',
                      isLeft || isRight
                        ? 'border-border bg-muted/50'
                        : isDark
                          ? 'border-mitra-border bg-card'
                          : 'border-border bg-card',
                      !isCurrent && !isLeft && !isRight && 'opacity-90',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">v{v.version}</span>
                      <div className="flex items-center gap-1">
                        {isCurrent && (
                          <span className="text-[10px] font-semibold uppercase text-brand-green">Current</span>
                        )}
                        {isLeft && (
                          <span className="rounded bg-muted px-1 text-[9px] font-semibold uppercase text-muted-foreground">From</span>
                        )}
                        {isRight && (
                          <span className="rounded bg-muted px-1 text-[9px] font-semibold uppercase text-muted-foreground">To</span>
                        )}
                      </div>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {v.changedBy} · {formatSkillDate(v.changedAt)}
                    </p>
                    {v.changeNote && (
                      <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{v.changeNote}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openCompare(v.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground hover:text-brand-green"
                      >
                        <ArrowLeftRight className="h-3 w-3" />
                        Compare
                      </button>
                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleRestore(v)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-green hover:text-brand-green-hover"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
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
