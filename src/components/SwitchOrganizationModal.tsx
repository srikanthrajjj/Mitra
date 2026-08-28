import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRightLeft, Search, X } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { Button } from '@/src/components/ui/button';
import { Organization } from '../data/orgSettings';

interface SwitchOrganizationModalProps {
  theme: Theme;
  isOpen: boolean;
  organizations: Organization[];
  currentOrgId: string;
  onClose: () => void;
  onSwitch: (org: Organization) => void;
}

export default function SwitchOrganizationModal({
  theme,
  isOpen,
  organizations,
  currentOrgId,
  onClose,
  onSwitch,
}: SwitchOrganizationModalProps) {
  const isDark = isDarkTheme(theme);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setSelectedId(currentOrgId);
  }, [isOpen, currentOrgId]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = organizations.filter((org) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return org.name.toLowerCase().includes(q) || org.industry.toLowerCase().includes(q);
  });

  const selectedOrg = organizations.find((org) => org.id === selectedId) ?? null;

  const handleConfirm = () => {
    if (!selectedOrg) return;
    onSwitch(selectedOrg);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl ${
          isDark
            ? 'bg-mitra-surface shadow-[0_24px_60px_rgba(0,0,0,0.55)]'
            : 'bg-card shadow-[0_24px_60px_rgba(0,0,0,0.16)]'
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-brand-green" />
            <h2 className={`font-display font-semibold text-[15px] ${isDark ? 'text-white' : 'text-foreground'}`}>
              Switch organization
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`p-1 rounded-md transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-2 space-y-3">
          <div className="space-y-1.5">
            <label className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
              Select an organization
            </label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-muted-foreground'}`} />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for an organization"
                className={`w-full h-9 pl-8 pr-3 rounded-lg border text-[13px] outline-none transition-colors ${
                  isDark
                    ? 'bg-mitra-input border-white/[0.06] text-illuminate-text placeholder:text-illuminate-muted focus:border-brand-green/40'
                    : 'bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-brand-green'
                }`}
              />
            </div>
          </div>

          <div className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-muted-foreground'}`}>
            You work with
          </div>

          <div className="max-h-64 overflow-y-auto -mx-1.5 px-1.5 space-y-1">
            {filtered.length === 0 && (
              <p className={`py-6 text-center text-[12px] ${isDark ? 'text-slate-500' : 'text-muted-foreground'}`}>
                No matching organizations.
              </p>
            )}
            {filtered.map((org) => {
              const selected = org.id === selectedId;
              const isCurrent = org.id === currentOrgId;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => setSelectedId(org.id)}
                  className={`w-full flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                    selected
                      ? 'border-brand-green bg-brand-green/10'
                      : isDark
                        ? 'border-transparent hover:bg-white/5'
                        : 'border-transparent hover:bg-accent/60'
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] font-semibold text-foreground">
                    {org.logoInitials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-[13px] font-medium flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-foreground'}`}>
                      {org.name}
                      {isCurrent && (
                        <span className="shrink-0 rounded-full bg-brand-green/15 px-1.5 py-0.5 text-[9px] font-semibold text-brand-green">
                          Current
                        </span>
                      )}
                    </div>
                    <div className={`truncate text-[11px] ${isDark ? 'text-slate-500' : 'text-muted-foreground'}`}>
                      {org.industry} · {org.plan}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`flex items-center justify-end gap-2 px-5 py-4 mt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-border'}`}>
          <Button variant="secondary" type="button" onClick={onClose} className="h-9 px-4 text-[13px]">
            Cancel
          </Button>
          <Button
            variant="cta"
            type="button"
            onClick={handleConfirm}
            disabled={!selectedOrg}
            className="h-9 px-4 text-[13px]"
          >
            Switch organization
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
