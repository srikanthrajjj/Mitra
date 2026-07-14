import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { Button } from '@/src/components/ui/button';

interface NewProjectModalProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (data: { name: string; description: string }) => void;
}

export default function NewProjectModal({ theme, isOpen, onClose, onCreateProject }: NewProjectModalProps) {
  const isDark = isDarkTheme(theme);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateProject({ name: name.trim(), description: description.trim() });
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all duration-300 ${
          isDark
            ? 'glass-panel-dark border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
            : 'bg-card border-border'
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-green" />
            <h2 className={`font-display font-bold text-lg ${isDark ? 'text-white' : 'text-foreground'}`}>
              New Project
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg border ${
              isDark
                ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-foreground'}`}>
              Project Name
            </label>
            <input
              type="text"
              required
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all ${
                isDark
                  ? 'bg-mitra-input border-white/[0.06] focus:border-brand-green focus:active-glow-dark text-illuminate-text placeholder:text-illuminate-muted focus:bg-mitra-surface'
                  : 'bg-card border-border focus:border-brand-green text-foreground placeholder:text-muted-foreground'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-foreground'}`}>
              Describe what you want to build
            </label>
            <textarea
              rows={3}
              placeholder="e.g. A ServiceNow app that helps employees book meeting rooms and equipment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none resize-none transition-all ${
                isDark
                  ? 'bg-mitra-input border-white/[0.06] focus:border-brand-green focus:active-glow-dark text-illuminate-text placeholder:text-illuminate-muted focus:bg-mitra-surface'
                  : 'bg-card border-border focus:border-brand-green text-foreground placeholder:text-muted-foreground'
              }`}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
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
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
