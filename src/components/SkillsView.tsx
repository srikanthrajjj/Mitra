import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Search, Plus, Zap, Trash2, MoreVertical, Pencil, LayoutGrid, List, Play } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { SKILLS, SKILL_CATEGORIES, type Skill } from '../data/skills';
import { cn } from '@/lib/utils';
import { Button } from '@/src/components/ui/button';
import { Switch } from '@/src/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import SkillExecutionModal from './SkillExecutionModal';
import SkillEditorPage, {
  ensureInitialVersion,
  skillToManagedDraft,
  type SkillEditorMode,
} from './SkillEditorPage';
import {
  type ManagedSkill,
  type SkillVersion,
  loadManagedSkills,
  loadSkillVersions,
  saveManagedSkills,
  saveSkillVersions,
  SKILL_STATUS_LABELS,
  getVersionsForSkill,
} from '../data/skillManagement';

const DELETED_SKILLS_KEY = 'mitra-deleted-skills';

type ViewMode = 'grid' | 'list';

type SkillCard = Skill & {
  managed: ManagedSkill;
  disabled?: boolean;
};

function loadDeletedSkillIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_SKILLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDeletedSkillIds(ids: string[]) {
  localStorage.setItem(DELETED_SKILLS_KEY, JSON.stringify(ids));
}

interface SkillsViewProps {
  theme: Theme;
  onRunSkill: (skill: Skill) => void;
}

function SkillOverflowMenu({
  isDark,
  onEdit,
  onDelete,
  onRun,
}: {
  isDark: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRun: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'rounded-lg p-1.5 transition-colors',
            isDark
              ? 'text-muted-foreground hover:bg-accent hover:text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
          aria-label="Skill options"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          'w-40 rounded-xl border p-1',
          isDark ? 'border-mitra-border bg-mitra-surface' : 'border-border bg-card',
        )}
      >
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className={cn('gap-2 rounded-lg text-xs', isDark ? 'focus:bg-accent' : 'focus:bg-muted')}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onRun();
          }}
          className={cn('gap-2 rounded-lg text-xs', isDark ? 'focus:bg-accent' : 'focus:bg-muted')}
        >
          <Play className="h-3.5 w-3.5" />
          Run
        </DropdownMenuItem>
        <DropdownMenuSeparator className={isDark ? 'bg-mitra-border' : 'bg-border'} />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="gap-2 rounded-lg text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function toSkillCard(managed: ManagedSkill, builtin?: Skill): SkillCard {
  return {
    id: managed.id,
    name: managed.name,
    description: managed.description,
    category: managed.category,
    icon: builtin?.icon ?? Zap,
    whatItHelpsWith: managed.instructions,
    examplePrompt: managed.instructions,
    parameters: builtin?.parameters ?? [],
    createdBy: managed.createdBy,
    instanceId: managed.instanceId,
    managed,
    disabled: !managed.enabled,
  };
}

export default function SkillsView({ theme, onRunSkill }: SkillsViewProps) {
  const isDark = isDarkTheme(theme);
  const [search, setSearch] = useState('');
  const [hasScrolled, setHasScrolled] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [deletedSkillIds, setDeletedSkillIds] = useState<string[]>(loadDeletedSkillIds);
  const [managedSkills, setManagedSkills] = useState<ManagedSkill[]>(loadManagedSkills);
  const [versions, setVersions] = useState<SkillVersion[]>(loadSkillVersions);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<SkillEditorMode>('create');
  const [editingManaged, setEditingManaged] = useState<ManagedSkill | null>(null);
  const [runSkill, setRunSkill] = useState<Skill | null>(null);

  useEffect(() => {
    saveManagedSkills(managedSkills);
  }, [managedSkills]);

  useEffect(() => {
    saveSkillVersions(versions);
  }, [versions]);

  useEffect(() => {
    saveDeletedSkillIds(deletedSkillIds);
  }, [deletedSkillIds]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setHasScrolled(scrollRef.current.scrollTop > 0);
    }
  }, []);

  const allSkills = useMemo((): SkillCard[] => {
    const managedById = new Map(managedSkills.map((m) => [m.id, m]));
    const cards: SkillCard[] = [];

    // Builtins (unless deleted), overlay managed edits when present
    for (const builtin of SKILLS) {
      if (deletedSkillIds.includes(builtin.id)) continue;
      const managed = managedById.get(builtin.id);
      if (managed) {
        cards.push(toSkillCard(managed, builtin));
        managedById.delete(builtin.id);
      } else {
        cards.push(toSkillCard(skillToManagedDraft(builtin), builtin));
      }
    }

    // Remaining managed (user-created)
    for (const managed of managedById.values()) {
      cards.push(toSkillCard(managed));
    }

    let list = cards;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
      );
    }
    if (selectedCategory) {
      list = list.filter((s) => s.category === selectedCategory);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [managedSkills, deletedSkillIds, search, selectedCategory]);

  const openCreate = () => {
    setEditorMode('create');
    setEditingManaged(null);
    setEditorOpen(true);
  };

  const openEdit = (card: SkillCard) => {
    const existing = managedSkills.find((m) => m.id === card.managed.id);
    const managed = existing ?? card.managed;
    if (!existing && card.managed.isBuiltin) {
      // Seed first version when opening a builtin for the first time
      setManagedSkills((prev) => [...prev, managed]);
      setVersions((prev) => {
        if (prev.some((v) => v.skillId === managed.id)) return prev;
        return [ensureInitialVersion(managed), ...prev];
      });
    }
    setEditorMode('edit');
    setEditingManaged(managed);
    setEditorOpen(true);
  };

  const handleDelete = (card: SkillCard) => {
    const id = card.id;
    setManagedSkills((prev) => prev.filter((m) => m.id !== id));
    setVersions((prev) => prev.filter((v) => v.skillId !== id));
    if (card.managed.isBuiltin || SKILLS.some((s) => s.id === id)) {
      setDeletedSkillIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
    if (editingManaged?.id === id) {
      setEditorOpen(false);
      setEditingManaged(null);
    }
  };

  const handleToggle = (card: SkillCard, enabled: boolean) => {
    const existing = managedSkills.find((m) => m.id === card.id);
    if (existing) {
      setManagedSkills((prev) =>
        prev.map((m) => (m.id === card.id ? { ...m, enabled, updatedAt: new Date().toISOString() } : m)),
      );
      return;
    }
    // First toggle on a builtin — persist as managed
    setManagedSkills((prev) => [...prev, { ...card.managed, enabled }]);
    setVersions((prev) => {
      if (prev.some((v) => v.skillId === card.id)) return prev;
      return [ensureInitialVersion({ ...card.managed, enabled }), ...prev];
    });
  };

  const editingVersions = editingManaged
    ? getVersionsForSkill(editingManaged.id, versions)
    : [];

  const viewToggleBtn = (mode: ViewMode) =>
    cn(
      'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
      viewMode === mode
        ? 'border-border bg-muted text-brand-green'
        : isDark
          ? 'border-mitra-border text-muted-foreground hover:bg-accent hover:text-foreground'
          : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
    );

  const categoryPill = (active: boolean) =>
    cn(
      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
      active
        ? 'border-border bg-muted text-brand-green'
        : isDark
          ? 'border-mitra-border bg-mitra-surface text-muted-foreground hover:bg-accent hover:text-foreground'
          : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
    );

  if (editorOpen) {
    return (
      <SkillEditorPage
        theme={theme}
        mode={editorMode}
        skill={editingManaged}
        versions={editingVersions}
        onBack={() => {
          setEditorOpen(false);
          setEditingManaged(null);
        }}
        onSaved={({ skill, version, isNew }) => {
          setManagedSkills((prev) => {
            if (isNew || !prev.some((m) => m.id === skill.id)) return [skill, ...prev];
            return prev.map((m) => (m.id === skill.id ? skill : m));
          });
          setVersions((prev) => [version, ...prev]);
          setEditingManaged(skill);
          setEditorMode('edit');
        }}
        onDelete={(id) => {
          const card = allSkills.find((s) => s.id === id);
          if (card) handleDelete(card);
          else {
            setManagedSkills((prev) => prev.filter((m) => m.id !== id));
            setVersions((prev) => prev.filter((v) => v.skillId !== id));
            setEditorOpen(false);
            setEditingManaged(null);
          }
        }}
      />
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <div className="shrink-0">
        <div className="px-4 pb-4 pt-8 md:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">Skills</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click a skill to edit, version, or run. Add new skills anytime.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1" role="group" aria-label="View mode">
                  <button
                    type="button"
                    title="Grid view"
                    aria-pressed={viewMode === 'grid'}
                    className={viewToggleBtn('grid')}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="List view"
                    aria-pressed={viewMode === 'list'}
                    className={viewToggleBtn('list')}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Button variant="cta" size="sm" onClick={openCreate} className="h-8 gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Add skill
                </Button>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  'w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors',
                  isDark
                    ? 'border-mitra-border bg-mitra-input text-foreground placeholder:text-muted-foreground focus:border-brand-green/40'
                    : 'border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-brand-green/50',
                )}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={categoryPill(selectedCategory === null)}
              >
                All
              </button>
              {SKILL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={categoryPill(selectedCategory === cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div
          className={cn(
            'border-b transition-opacity duration-200',
            hasScrolled ? 'border-border opacity-100' : 'border-transparent opacity-0',
          )}
        />
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4 md:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          {allSkills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-sm text-muted-foreground">No skills match your search.</p>
              <Button variant="cta" size="sm" className="mt-4 gap-1.5" onClick={openCreate}>
                <Plus className="h-3.5 w-3.5" />
                Add skill
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allSkills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => openEdit(skill)}
                  className={cn(
                    'group flex flex-col rounded-xl border p-4 text-left transition-colors',
                    skill.disabled && 'opacity-60',
                    isDark
                      ? 'border-mitra-border bg-mitra-surface hover:bg-mitra-highlight'
                      : 'border-border bg-card hover:bg-accent/40',
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                        {skill.category}
                      </span>
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase',
                          skill.managed.status === 'published'
                            ? 'border-border bg-brand-green/10 text-brand-green'
                            : 'border-border bg-muted text-muted-foreground',
                        )}
                      >
                        {SKILL_STATUS_LABELS[skill.managed.status]}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        v{skill.managed.version}
                      </span>
                    </div>
                    <SkillOverflowMenu
                      isDark={isDark}
                      onEdit={() => openEdit(skill)}
                      onDelete={() => handleDelete(skill)}
                      onRun={() => setRunSkill(skill)}
                    />
                  </div>
                  <h3 className="text-[15px] font-semibold text-foreground">{skill.name}</h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-xs text-muted-foreground">{skill.description}</p>
                  <div
                    className="mt-3 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!skill.disabled}
                        onCheckedChange={(checked) => handleToggle(skill, checked)}
                      />
                      <span className="text-[11px] text-muted-foreground">
                        {skill.disabled ? 'Off' : 'Active'}
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRunSkill(skill);
                      }}
                    >
                      <Play className="h-3.5 w-3.5" />
                      Run
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {allSkills.map((skill) => (
                <article
                  key={skill.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openEdit(skill)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openEdit(skill);
                    }
                  }}
                  className={cn(
                    'sn-list-row flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors',
                    skill.disabled && 'opacity-60',
                    isDark
                      ? 'border-mitra-border bg-mitra-surface hover:bg-mitra-highlight'
                      : 'border-border bg-card hover:bg-accent/40',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="truncate text-[15px] font-semibold text-foreground">{skill.name}</h3>
                      <span className="rounded-full bg-muted px-2 py-px text-[10px] font-medium text-muted-foreground">
                        {skill.category}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        v{skill.managed.version}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{skill.description}</p>
                  </div>
                  <div
                    className="flex shrink-0 items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <Switch
                      checked={!skill.disabled}
                      onCheckedChange={(checked) => handleToggle(skill, checked)}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => setRunSkill(skill)}
                    >
                      <Play className="h-3.5 w-3.5" />
                      Run
                    </Button>
                    <SkillOverflowMenu
                      isDark={isDark}
                      onEdit={() => openEdit(skill)}
                      onDelete={() => handleDelete(skill)}
                      onRun={() => setRunSkill(skill)}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <SkillExecutionModal
        theme={theme}
        skill={runSkill}
        isOpen={runSkill !== null}
        onClose={() => setRunSkill(null)}
        onRun={(skill) => {
          onRunSkill(skill);
          setRunSkill(null);
        }}
      />
    </div>
  );
}
