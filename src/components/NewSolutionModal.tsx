import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';

interface NewSolutionModalProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  onCreateSolution: (solutionData: {
    name: string;
    category: 'ITSM' | 'HR' | 'CSM' | 'Custom';
    extendsTable: string;
    description: string;
  }) => void;
}

export default function NewSolutionModal({ theme, isOpen, onClose, onCreateSolution }: NewSolutionModalProps) {
  const isDark = isDarkTheme(theme);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'ITSM' | 'HR' | 'CSM' | 'Custom'>('ITSM');
  const [extendsTable, setExtendsTable] = useState('task');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateSolution({
        name: name.trim(),
        category,
        extendsTable,
        description: description.trim() || `An AI-architected solution for ${name}.`
      });
      // clear
      setName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      
      {/* Modal Card frame */}
      <div className={`w-full max-w-lg rounded-2xl border p-6 overflow-hidden relative shadow-2xl transition-all duration-300 ${
        isDark ? 'glass-panel-dark border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-200'
      }`}>
        
        {/* Glow ambient circle */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-emerald-500/10 blur-xl rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/20 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-green animate-pulse" />
            <h2 className={`font-display font-bold text-lg ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Draft New ServiceNow Solution
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg border ${
              isDark ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900' : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Solution Name */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-750'}`}>
              Solution / Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Facilities Desk Request Counter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all ${
                isDark 
                  ? 'bg-mitra-input border-white/[0.06] focus:border-brand-green focus:active-glow-dark text-illuminate-text placeholder:text-illuminate-muted focus:bg-mitra-surface' 
                  : 'bg-white border-slate-200 focus:border-brand-green text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Grid Category & Table inheritance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-750'}`}>
                Business Capability Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all ${
                  isDark 
                    ? 'bg-mitra-input border-white/[0.06] text-illuminate-text focus:border-brand-green focus:bg-mitra-surface' 
                    : 'bg-white border-slate-200 text-slate-700 focus:border-brand-green'
                }`}
              >
                <option value="ITSM">ITSM (IT Service Management)</option>
                <option value="HR">HR (Human Resources)</option>
                <option value="CSM">CSM (Customer Service)</option>
                <option value="Custom">Custom Scope</option>
              </select>
            </div>

            {/* Extends base Table */}
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-755'}`}>
                Extends Base ServiceNow Table
              </label>
              <select
                value={extendsTable}
                onChange={(e) => setExtendsTable(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all ${
                  isDark 
                    ? 'bg-mitra-input border-white/[0.06] text-illuminate-text focus:border-brand-green focus:bg-mitra-surface' 
                    : 'bg-white border-slate-200 text-slate-700 focus:border-brand-green'
                }`}
              >
                <option value="task">task (Recommended - inherits SLAs, priority, assignments)</option>
                <option value="alm_asset">alm_asset (Asset / hardware item profiles)</option>
                <option value="core_company">core_company (Organization / supplier details)</option>
                <option value="sys_user">sys_user (Corporate identity / user extension)</option>
                <option value="none">None (Stand-alone empty table)</option>
              </select>
            </div>

          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-755'}`}>
              Description of Capabilities
            </label>
            <textarea
              placeholder="What problems should this ServiceNow solution address? e.g. managers need to book physical desks..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none resize-none transition-all ${
                isDark 
                  ? 'bg-mitra-input border-white/[0.06] focus:border-brand-green focus:active-glow-dark text-illuminate-text placeholder:text-illuminate-muted focus:bg-mitra-surface' 
                  : 'bg-white border-slate-200 focus:border-brand-green text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Inheritance warning hint */}
          {extendsTable === 'task' && (
            <div className={`p-3 rounded-lg flex items-start gap-2 border ${
              isDark ? 'bg-mitra-surface/60 border-white/[0.06]' : 'bg-emerald-50/10 border-emerald-100'
            }`}>
              <AlertCircle className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Extending the <strong>task</strong> table is an official ServiceNow best practice. Your new table will automatically inherit standard states, task numbers, priority matrix, activities log, SLA tracking and active work lists.
              </p>
            </div>
          )}

          {/* Footer controls */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/10">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary cursor-pointer px-4 py-2 text-xs transition-all hover:-translate-y-0.5 active:translate-y-px active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-cta cursor-pointer px-5 py-2.5 text-xs flex items-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Draft Solution Architecture
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
