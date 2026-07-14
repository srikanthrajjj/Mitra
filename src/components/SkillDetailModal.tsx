import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { Skill } from '../data/skills';
import { cn } from '@/lib/utils';
import { Button } from '@/src/components/ui/button';

interface SkillDetailModalProps {
  theme: Theme;
  skill: Skill | null;
  onClose: () => void;
  onRun: (skill: Skill) => void;
}

export default function SkillDetailModal({ theme, skill, onClose, onRun }: SkillDetailModalProps) {
  const isDark = isDarkTheme(theme);

  if (!skill) return null;

  const Icon = skill.icon;

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
        {/* Close button */}
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

        {/* Icon */}
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10">
          <Icon className="h-6 w-6 text-brand-green" />
        </div>

        {/* Title */}
        <h2 className={`mb-1 font-display text-xl font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
          {skill.name}
        </h2>
        <span className="mb-4 inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {skill.category}
        </span>

        {/* Description */}
        <p className={`mb-4 text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>
          {skill.description}
        </p>

        {/* What it helps with */}
        <div
          className={cn(
            'mb-4 rounded-xl border p-4',
            isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-border bg-muted/40',
          )}
        >
          <h3 className={`mb-1.5 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>
            What it helps with
          </h3>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-foreground'}`}>
            {skill.whatItHelpsWith}
          </p>
        </div>

        {/* Example prompt */}
        <div
          className={cn(
            'mb-6 rounded-xl border p-4',
            isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-border bg-muted/40',
          )}
        >
          <h3 className={`mb-1.5 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>
            Example prompt
          </h3>
          <p className={`text-sm italic leading-relaxed ${isDark ? 'text-white/60' : 'text-muted-foreground'}`}>
            "{skill.examplePrompt}"
          </p>
        </div>

        {/* Run button */}
        <Button
          variant="cta"
          onClick={() => onRun(skill)}
          className="w-full"
        >
          Run Skill
        </Button>
      </div>
    </div>,
    document.body,
  );
}
