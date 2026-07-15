import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Search, Plus, Zap, Trash2, MoreVertical, Pencil } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { SKILLS, type Skill } from '../data/skills';
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

interface SkillsViewProps {
  theme: Theme;
  onRunSkill: (skill: Skill) => void;
}

export default function SkillsView({ theme, onRunSkill }: SkillsViewProps) {
  const isDark = isDarkTheme(theme);
  const [search, setSearch] = useState('');
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [customSkills, setCustomSkills] = useState<CustomSkill[]>(loadCustomSkills);
  const [deletedSkillIds, setDeletedSkillIds] = useState<string[]>(loadDeletedSkillIds);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<CustomSkill | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    saveCustomSkills(customSkills);
  }, [customSkills]);

  useEffect(() => {
    saveDeletedSkillIds(deletedSkillIds);
  }, [deletedSkillIds]);

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
  });

  const builtinSkills = useMemo(() => {
    let list = SKILLS.filter((s) => !deletedSkillIds.includes(s.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, deletedSkillIds]);

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
    return list;
  }, [search, customSkills]);

  const allSkills = useMemo(() => {
    const converted: (Skill & { isCustom?: boolean; customData?: CustomSkill })[] = [
      ...builtinSkills,
      ...filteredCustom.map((cs) => buildSkillForModal(cs)),
    ];
    return converted;
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

  const handleToggleSkill = (id: string) => {
    setCustomSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      {/* Sticky header */}
      <div className="shrink-0">
        <div className="px-4 pt-8 md:px-8 lg:px-12 pb-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex items-center justify-between">
              <h1 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
                Skills
              </h1>
              <Button
                variant="cta"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add a new skill
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  'w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all',
                  isDark
                    ? 'border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/40 focus:border-white/[0.15]'
                    : 'border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-border',
                )}
              />
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

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-8 md:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          {allSkills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className={`text-sm ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>
                No skills match your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allSkills.map((skill) => {
                const custom = skill.isCustom;
                const customData = skill.customData;

                return (
                  <div
                    key={skill.id}
                    className={cn(
                      'group flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 hover:shadow-md',
                      custom && customData && !customData.enabled
                        ? isDark
                          ? 'border-white/[0.04] bg-card/50 opacity-60'
                          : 'border-border bg-card/50 opacity-60'
                        : isDark
                          ? 'border-border bg-card hover:border-brand-green/30'
                          : 'border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-brand-green/30',
                    )}
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10">
                          <skill.icon className="h-5 w-5 text-brand-green" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                'rounded-lg p-1.5 transition-colors',
                                isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/[0.06]' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                              )}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className={cn(
                              'w-40 rounded-xl border p-1',
                              isDark
                                ? 'border-white/[0.08] bg-[#1a1a1a]'
                                : 'border-border bg-card',
                            )}
                          >
                            <DropdownMenuItem
                              onClick={() => custom && customData ? setEditingSkill(customData) : setSelectedSkill(skill)}
                              className={cn(
                                'gap-2 rounded-lg text-xs',
                                isDark ? 'focus:bg-white/[0.06]' : 'focus:bg-muted',
                              )}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className={isDark ? 'bg-white/[0.06]' : 'bg-border'} />
                            <DropdownMenuItem
                              onClick={() => custom && customData ? handleDeleteSkill(skill.id) : handleDeleteBuiltinSkill(skill.id)}
                              className={cn(
                                'gap-2 rounded-lg text-xs text-red-400 focus:bg-red-500/10 focus:text-red-400',
                              )}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <h3 className={`mb-1 text-sm font-semibold ${isDark ? 'text-white' : 'text-foreground'}`}>
                        {skill.name}
                      </h3>
                      <p className="text-[12px] leading-relaxed text-muted-foreground line-clamp-2">
                        {skill.description}
                      </p>
                      <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {skill.category}
                      </span>
                      <p className={`mt-1.5 text-[10px] ${isDark ? 'text-white/30' : 'text-muted-foreground/60'}`}>
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
                          <span className={`text-[11px] ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
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
        onAdd={handleUpdateSkill}
        initialSkill={editingSkill}
      />

      <SkillExecutionModal
        theme={theme}
        skill={selectedSkill}
        isOpen={selectedSkill !== null}
        onClose={() => setSelectedSkill(null)}
        onRun={(skill, params, instanceId, connectionId) => {
          onRunSkill(skill);
          setSelectedSkill(null);
        }}
      />
    </div>
  );
}
