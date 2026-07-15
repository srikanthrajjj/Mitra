import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Search, Plus, Zap, Trash2, MoreVertical, Pencil } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { SKILLS, SKILL_CATEGORIES, type Skill, type SkillCategory } from '../data/skills';
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

interface SkillsViewProps {
  theme: Theme;
  onRunSkill: (skill: Skill) => void;
}

type Filter = 'All' | SkillCategory;

export default function SkillsView({ theme, onRunSkill }: SkillsViewProps) {
  const isDark = isDarkTheme(theme);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [customSkills, setCustomSkills] = useState<CustomSkill[]>(loadCustomSkills);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<CustomSkill | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    saveCustomSkills(customSkills);
  }, [customSkills]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setHasScrolled(scrollRef.current.scrollTop > 0);
    }
  }, []);

  const filtered = useMemo(() => {
    let list = SKILLS;
    if (filter !== 'All') {
      list = list.filter((s) => s.category === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, filter]);

  const filteredCustom = useMemo(() => {
    let list = customSkills;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.instructions.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, customSkills]);

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

  const handleToggleSkill = (id: string) => {
    setCustomSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  const buildSkillForModal = (custom: CustomSkill): Skill => ({
    id: custom.id,
    name: custom.name,
    description: custom.instructions,
    category: 'Documentation' as SkillCategory,
    icon: Zap,
    whatItHelpsWith: custom.instructions,
    examplePrompt: custom.instructions,
    parameters: [],
  });

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

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {(['All', ...SKILL_CATEGORIES] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-medium transition-all',
                    filter === f
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : isDark
                        ? 'bg-white/[0.06] text-foreground hover:bg-white/[0.10] hover:text-foreground'
                        : 'bg-muted text-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  {f}
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

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-8 md:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          {/* Custom Skills */}
          {filteredCustom.length > 0 && (
            <div className="mb-6">
              <h2 className={`mb-3 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
                Custom Skills
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCustom.map((skill) => (
                  <div
                    key={skill.id}
                    className={cn(
                      'group flex flex-col justify-between rounded-xl border p-5 transition-all duration-200',
                      skill.enabled
                        ? isDark
                          ? 'border-brand-green/20 bg-card hover:border-brand-green/40'
                          : 'border-brand-green/20 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-brand-green/40'
                        : isDark
                          ? 'border-white/[0.04] bg-card/50 opacity-60'
                          : 'border-border bg-card/50 opacity-60',
                    )}
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10">
                          <Zap className="h-5 w-5 text-brand-green" />
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
                              onClick={() => setEditingSkill(skill)}
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
                              onClick={() => handleDeleteSkill(skill.id)}
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
                        {skill.instructions}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Switch
                        checked={skill.enabled}
                        onCheckedChange={() => handleToggleSkill(skill.id)}
                      />
                      <span className={`text-[11px] ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
                        {skill.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="cta"
                        size="sm"
                        onClick={() => setSelectedSkill(buildSkillForModal(skill))}
                        className="w-full text-xs"
                      >
                        Run Skill
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Built-in Skills */}
          {filtered.length === 0 && filteredCustom.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className={`text-sm ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>
                No skills match your search.
              </p>
            </div>
          ) : filtered.length > 0 ? (
            <>
              {filteredCustom.length > 0 && (
                <h2 className={`mb-3 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
                  Built-in Skills
                </h2>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((skill) => {
                  const Icon = skill.icon;
                  return (
                    <div
                      key={skill.id}
                      className={cn(
                        'group flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 hover:shadow-md',
                        isDark
                          ? 'border-border bg-card hover:border-brand-green/30'
                          : 'border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-brand-green/30',
                      )}
                    >
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10">
                            <Icon className="h-5 w-5 text-brand-green" />
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
                              disabled
                              className={cn(
                                'gap-2 rounded-lg text-xs',
                                isDark ? 'focus:bg-white/[0.06]' : 'focus:bg-muted',
                              )}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <h3 className={`mb-1 text-sm font-semibold ${isDark ? 'text-white' : 'text-foreground'}`}>
                          {skill.name}
                        </h3>
                        <p className="text-[12px] leading-relaxed text-muted-foreground">
                          {skill.description}
                        </p>
                        <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {skill.category}
                        </span>
                      </div>
                      <div className="mt-4">
                        <Button
                          variant="cta"
                          size="sm"
                          onClick={() => setSelectedSkill(skill)}
                          className="w-full text-xs"
                        >
                          Run Skill
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
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
