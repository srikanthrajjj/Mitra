import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Pencil } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { Button } from '@/src/components/ui/button';
import { Switch } from '@/src/components/ui/switch';
import { cn } from '@/lib/utils';

export interface CustomSkill {
  id: string;
  name: string;
  instructions: string;
  enabled: boolean;
}

interface AddSkillModalProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (skill: CustomSkill) => void;
  initialSkill?: CustomSkill | null;
}

export default function AddSkillModal({ theme, isOpen, onClose, onAdd, initialSkill }: AddSkillModalProps) {
  const isDark = isDarkTheme(theme);
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [enabled, setEnabled] = useState(true);

  const isEditing = initialSkill !== null && initialSkill !== undefined;

  useEffect(() => {
    if (initialSkill) {
      setName(initialSkill.name);
      setInstructions(initialSkill.instructions);
      setEnabled(initialSkill.enabled);
    } else {
      setName('');
      setInstructions('');
      setEnabled(true);
    }
  }, [initialSkill, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !instructions.trim()) return;
    onAdd({
      id: isEditing ? initialSkill!.id : `custom-${Date.now()}`,
      name: name.trim(),
      instructions: instructions.trim(),
      enabled,
    });
    setName('');
    setInstructions('');
    setEnabled(true);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative z-10 w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all',
          isDark
            ? 'border-white/[0.08] bg-[#111111]'
            : 'border-border bg-card',
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute right-4 top-4 rounded-lg p-1.5 transition-colors',
            isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          )}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10">
          {isEditing ? (
            <Pencil className="h-6 w-6 text-brand-green" />
          ) : (
            <Plus className="h-6 w-6 text-brand-green" />
          )}
        </div>

        <h2 className={`mb-1 font-display text-xl font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
          {isEditing ? 'Edit Skill' : 'Add a New Skill'}
        </h2>
        <p className={`mb-5 text-sm ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>
          {isEditing ? 'Update your custom skill.' : 'Create a custom skill for your UNICEF workspace.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isDark ? 'text-white/70' : 'text-foreground'}`}>
              Skill Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. UNICEF Procurement Review"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                'w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all',
                isDark
                  ? 'border-white/[0.06] bg-white/[0.03] text-white placeholder:text-white/30 focus:border-brand-green/50'
                  : 'border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-brand-green/50',
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isDark ? 'text-white/70' : 'text-foreground'}`}>
              Instructions
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe what this skill does and how it should behave..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className={cn(
                'w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all',
                isDark
                  ? 'border-white/[0.06] bg-white/[0.03] text-white placeholder:text-white/30 focus:border-brand-green/50'
                  : 'border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-brand-green/50',
              )}
            />
          </div>

          <div className="flex items-center justify-between px-1 py-1">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>
                Enabled
              </p>
              <p className={`text-[11px] ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
                Toggle to activate or deactivate this skill
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="cta"
              type="submit"
              className="px-5 py-2.5 text-xs"
            >
              {isEditing ? 'Save Changes' : 'Add Skill'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
