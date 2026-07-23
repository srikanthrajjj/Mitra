import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Search, Plus, Zap, Trash2, MoreVertical, Pencil, LayoutGrid, List } from 'lucide-react';
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
import AddSkillModal, { type CustomSkill } from './AddSkillModal';
import SkillExecutionModal from './SkillExecutionModal';

const CUSTOM_SKILLS_KEY = 'mitra-custom-skills';
const DELETED_SKILLS_KEY = 'mitra-deleted-skills';
const BUILTIN_OVERRIDES_KEY = 'mitra-builtin-overrides';

type ViewMode = 'grid' | 'list';
type SkillCard = Skill & { isCustom?: boolean; customData?: CustomSkill };

function loadCustomSkills(): CustomSkill[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SKILLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomSkills(skills: CustomSkill[]) {
  localStorage.setItem(CUSTOM_SKILLS_KEY, JSON.stringify(skills));
}

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

function loadBuiltinOverrides(): Record<string, Partial<CustomSkill>> {
  try {
    const raw = localStorage.getItem(BUILTIN_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveBuiltinOverrides(overrides: Record<string, Partial<CustomSkill>>) {
  localStorage.setItem(BUILTIN_OVERRIDES_KEY, JSON.stringify(overrides));
}

interface SkillsViewProps {
  theme: Theme;
  onRunSkill: (skill: Skill) => void;
}

function SkillOverflowMenu({
  isDark,
  onEdit,
  onDelete,
}: {
  isDark: boolean;
  onEdit: () => void;
  onDelete: () => void;
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
          onClick={onEdit}
          className={cn(
            'gap-2 rounded-lg text-xs',
            isDark ? 'focus:bg-accent' : 'focus:bg-muted',
          )}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator className={isDark ? 'bg-mitra-border' : 'bg-border'} />
        <DropdownMenuItem
          onClick={onDelete}
          className="gap-2 rounded-lg text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function SkillsView({ theme, onRunSkill }: SkillsViewProps) {
  const isDark = isDarkTheme(theme);
  const [search, setSearch] = useState('');
  const [hasScrolled, setHasScrolled] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [customSkills, setCustomSkills] = useState<CustomSkill[]>(loadCustomSkills);
  const [deletedSkillIds, setDeletedSkillIds] = useState<string[]>(loadDeletedSkillIds);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<CustomSkill | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [builtinOverrides, setBuiltinOverrides] = useState<Record<string, Partial<CustomSkill>>>(loadBuiltinOverrides);

  useEffect(() => {
    saveCustomSkills(customSkills);
  }, [customSkills]);

  useEffect(() => {
    saveDeletedSkillIds(deletedSkillIds);
  }, [deletedSkillIds]);

  useEffect(() => {
    saveBuiltinOverrides(builtinOverrides);
  }, [builtinOverrides]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setHasScrolled(scrollRef.current.scrollTop > 0);
    }
  }, []);

  const buildSkillForModal = (custom: CustomSkill): Skill => ({
    id: custom.id,
    name: custom.name,
    description: custom.description,
    category: custom.category,
    icon: Zap,
    whatItHelpsWith: custom.instructions,
    examplePrompt: custom.instructions,
    parameters: [],
    createdBy: custom.createdBy,
    instanceId: custom.instanceId,
  });

  const builtinSkills = useMemo(() => {
    let list = SKILLS.filter((s) => !deletedSkillIds.includes(s.id)).map((s) => {
      const o = builtinOverrides[s.id];
      if (!o) return s;
      return {
        ...s,
        name: o.name ?? s.name,
        description: o.description ?? s.description,
        category: o.category ?? s.category,
        whatItHelpsWith: o.instructions ?? s.whatItHelpsWith,
        instanceId: o.instanceId ?? s.instanceId,
      };
    });
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    if (selectedCategory) {
      list = list.filter((s) => s.category === selectedCategory);
    }
    return list;
  }, [search, deletedSkillIds, selectedCategory, builtinOverrides]);

  const filteredCustom = useMemo(() => {
    let list = customSkills;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    if (selectedCategory) {
      list = list.filter((s) => s.category === selectedCategory);
    }
    return list;
  }, [search, customSkills, selectedCategory]);

  const allSkills = useMemo((): SkillCard[] => {
    return [
      ...filteredCustom.map((cs) => ({
        ...buildSkillForModal(cs),
        isCustom: true,
        customData: cs,
      })),
      ...builtinSkills,
    ];
  }, [filteredCustom, builtinSkills]);

  const handleAddSkill = (skill: CustomSkill) => {
    setCustomSkills((prev) => [...prev, skill]);
  };

  const handleUpdateSkill = (updated: CustomSkill) => {
    setCustomSkills((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditingSkill(null);
  };

  const handleDeleteSkill = (id: string) => {
    setCustomSkills((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDeleteBuiltinSkill = (id: string) => {
    setDeletedSkillIds((prev) => [...prev, id]);
  };

  const handleUpdateBuiltinSkill = (updated: CustomSkill) => {
    setBuiltinOverrides((prev) => ({
      ...prev,
      [updated.id]: {
        name: updated.name,
        description: updated.description,
        category: updated.category,
        instructions: updated.instructions,
        instanceId: updated.instanceId,
      },
    }));
    setEditingSkill(null);
  };

  const skillToCustomSkill = (skill: Skill): CustomSkill => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    instructions: skill.whatItHelpsWith,
    enabled: true,
    createdBy: skill.createdBy,
    instanceId: skill.instanceId ?? '',
  });

  const handleToggleSkill = (id: string) => {
    setCustomSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  const openEdit = (skill: SkillCard) => {
    if (skill.isCustom && skill.customData) {
      setEditingSkill(skill.customData);
    } else {
      setEditingSkill(skillToCustomSkill(skill));
    }
  };

  const handleDelete = (skill: SkillCard) => {
    if (skill.isCustom && skill.customData) {
      handleDeleteSkill(skill.id);
    } else {
      handleDeleteBuiltinSkill(skill.id);
    }
  };

  const isDisabled = (skill: SkillCard) =>
    Boolean(skill.isCustom && skill.customData && !skill.customData.enabled);

  const viewToggleBtn = (mode: ViewMode) =>
    cn(
      'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
      viewMode === mode
        ? 'border-brand-green bg-brand-green/10 text-brand-green'
        : isDark
          ? 'border-mitra-border text-muted-foreground hover:bg-accent hover:text-foreground'
          : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
    );

  const categoryPill = (active: boolean) =>
    cn(
      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
      active
        ? 'border-brand-green bg-brand-green/10 text-brand-green'
        : isDark
          ? 'border-mitra-border bg-mitra-surface text-muted-foreground hover:bg-accent hover:text-foreground'
          : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
    );

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <div className="shrink-0">
        <div className="px-4 pb-4 pt-8 md:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h1 className="font-display text-2xl font-bold text-foreground">Skills</h1>
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
                <Button
                  variant="cta"
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add a new skill
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
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allSkills.map((skill) => {
                const custom = skill.isCustom;
                const customData = skill.customData;
                const disabled = isDisabled(skill);

                return (
                  <div
                    key={skill.id}
                    className={cn(
                      'group flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 hover:shadow-md',
                      disabled && 'opacity-60',
                      isDark
                        ? 'border-mitra-border bg-card hover:border-brand-green/30'
                        : 'border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-brand-green/30',
                    )}
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10">
                          <skill.icon className="h-5 w-5 text-brand-green" />
                        </div>
                        <SkillOverflowMenu
                          isDark={isDark}
                          onEdit={() => openEdit(skill)}
                          onDelete={() => handleDelete(skill)}
                        />
                      </div>
                      <h3 className="mb-1 text-sm font-semibold text-foreground">{skill.name}</h3>
                      <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                        {skill.description}
                      </p>
                      <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {skill.category}
                      </span>
                      <p className="mt-1.5 text-[10px] text-muted-foreground/70">
                        Created by {skill.createdBy}
                      </p>
                    </div>
                    <div className="mt-4">
                      {custom && customData ? (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={customData.enabled}
                            onCheckedChange={() => handleToggleSkill(customData.id)}
                          />
                          <span className="text-[11px] text-muted-foreground">
                            {customData.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ) : (
                        <Button
                          variant="cta"
                          size="sm"
                          onClick={() => setSelectedSkill(skill)}
                          className="w-full text-xs"
                        >
                          Run Skill
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {allSkills.map((skill) => {
                const custom = skill.isCustom;
                const customData = skill.customData;
                const disabled = isDisabled(skill);

                return (
                  <article
                    key={skill.id}
                    className={cn(
                      'sn-list-row flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors',
                      disabled && 'opacity-60',
                      isDark
                        ? 'border-mitra-border bg-mitra-surface hover:bg-mitra-highlight'
                        : 'border-border bg-card hover:bg-accent/40',
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-green/10">
                      <skill.icon className="h-4 w-4 text-brand-green" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-[13px] font-semibold text-foreground">
                          {skill.name}
                        </h3>
                        <span className="rounded-full bg-muted px-2 py-px text-[10px] font-medium text-muted-foreground">
                          {skill.category}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">
                        {skill.description}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        Created by {skill.createdBy}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {custom && customData ? (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={customData.enabled}
                            onCheckedChange={() => handleToggleSkill(customData.id)}
                          />
                          <span className="hidden text-[11px] text-muted-foreground sm:inline">
                            {customData.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ) : (
                        <Button
                          variant="cta"
                          size="sm"
                          onClick={() => setSelectedSkill(skill)}
                          className="h-8 text-xs"
                        >
                          Run Skill
                        </Button>
                      )}
                      <SkillOverflowMenu
                        isDark={isDark}
                        onEdit={() => openEdit(skill)}
                        onDelete={() => handleDelete(skill)}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddSkillModal
        theme={theme}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSkill}
      />

      <AddSkillModal
        theme={theme}
        isOpen={editingSkill !== null}
        onClose={() => setEditingSkill(null)}
        onAdd={editingSkill && editingSkill.id.startsWith('custom-') ? handleUpdateSkill : handleUpdateBuiltinSkill}
        initialSkill={editingSkill}
      />

      <SkillExecutionModal
        theme={theme}
        skill={selectedSkill}
        isOpen={selectedSkill !== null}
        onClose={() => setSelectedSkill(null)}
        onRun={(skill) => {
          onRunSkill(skill);
          setSelectedSkill(null);
        }}
      />
    </div>
  );
}
