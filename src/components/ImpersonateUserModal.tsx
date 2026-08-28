import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, VenetianMask, X } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Button } from '@/src/components/ui/button';
import { InternalTeamMember } from '../data/internalTeamMembers';

interface ImpersonateUserModalProps {
  theme: Theme;
  isOpen: boolean;
  members: InternalTeamMember[];
  currentImpersonation: InternalTeamMember | null;
  onClose: () => void;
  onImpersonate: (member: InternalTeamMember) => void;
}

function initialsFor(name: string): string {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export default function ImpersonateUserModal({
  theme,
  isOpen,
  members,
  currentImpersonation,
  onClose,
  onImpersonate,
}: ImpersonateUserModalProps) {
  const isDark = isDarkTheme(theme);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setSelectedId(currentImpersonation?.id ?? null);
  }, [isOpen, currentImpersonation]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = members.filter((member) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return member.name.toLowerCase().includes(q) || member.email.toLowerCase().includes(q);
  });

  const selectedMember = members.find((member) => member.id === selectedId) ?? null;

  const handleConfirm = () => {
    if (!selectedMember) return;
    onImpersonate(selectedMember);
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
            <VenetianMask className="w-4 h-4 text-amber-500" />
            <h2 className={`font-display font-semibold text-[15px] ${isDark ? 'text-white' : 'text-foreground'}`}>
              Impersonate user
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
              Select a user
            </label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-muted-foreground'}`} />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a user"
                className={`w-full h-9 pl-8 pr-3 rounded-lg border text-[13px] outline-none transition-colors ${
                  isDark
                    ? 'bg-mitra-input border-white/[0.06] text-illuminate-text placeholder:text-illuminate-muted focus:border-brand-green/40'
                    : 'bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-brand-green'
                }`}
              />
            </div>
          </div>

          <div className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-muted-foreground'}`}>
            Team members
          </div>

          <div className="max-h-64 overflow-y-auto -mx-1.5 px-1.5 space-y-1">
            {filtered.length === 0 && (
              <p className={`py-6 text-center text-[12px] ${isDark ? 'text-slate-500' : 'text-muted-foreground'}`}>
                No matching users.
              </p>
            )}
            {filtered.map((member) => {
              const selected = member.id === selectedId;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedId(member.id)}
                  className={`w-full flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                    selected
                      ? 'border-brand-green bg-brand-green/10'
                      : isDark
                        ? 'border-transparent hover:bg-white/5'
                        : 'border-transparent hover:bg-accent/60'
                  }`}
                >
                  <Avatar className="h-8 w-8 shrink-0 rounded-full">
                    <AvatarFallback className="rounded-full bg-muted text-[10px] font-medium text-foreground">
                      {initialsFor(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-[13px] font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>
                      {member.name}
                    </div>
                    <div className={`truncate text-[11px] ${isDark ? 'text-slate-500' : 'text-muted-foreground'}`}>
                      {member.email}
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
            disabled={!selectedMember}
            className="h-9 px-4 text-[13px]"
          >
            Impersonate user
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
