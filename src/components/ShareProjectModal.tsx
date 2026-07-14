import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, UserPlus, Users, X } from 'lucide-react';
import { ProjectCollaborator, ProjectSharePermission, Solution, Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { ARCHITECT_DISPLAY_NAME } from '../constants/role';
import { USER_DISPLAY_NAME, USER_EMAIL } from '../constants/user';
import { getAvailableTeamMembers } from '../data/internalTeamMembers';
import { SelectNative } from '@/src/components/ui/select-native';
import { cn } from '@/lib/utils';
import { Button } from '@/src/components/ui/button';

interface ShareProjectModalProps {
  theme: Theme;
  isOpen: boolean;
  solution: Solution | null;
  collaborators: ProjectCollaborator[];
  onClose: () => void;
  onAddMember: (params: { memberId: string; permission: ProjectSharePermission }) => void;
  onRemove: (collaboratorId: string) => void;
}

const PERMISSIONS: { value: ProjectSharePermission; label: string; desc: string }[] = [
  { value: 'view', label: 'Can view', desc: 'Read project files and conversation' },
  { value: 'edit', label: 'Can edit', desc: 'View, comment, and update artifacts' },
];

function initialsFromEmail(email: string, name?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  const local = email.split('@')[0] ?? email;
  const chunks = local.split(/[._-]/).filter(Boolean);
  if (chunks.length >= 2) return `${chunks[0][0]}${chunks[1][0]}`.toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

function formatAddedAt(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function ShareProjectModal({
  theme,
  isOpen,
  solution,
  collaborators,
  onClose,
  onAddMember,
  onRemove,
}: ShareProjectModalProps) {
  const isDark = isDarkTheme(theme);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [permission, setPermission] = useState<ProjectSharePermission>('view');
  const [addError, setAddError] = useState('');

  const availableMembers = useMemo(
    () => getAvailableTeamMembers(collaborators, USER_EMAIL),
    [collaborators],
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedMemberId('');
      setPermission('view');
      setAddError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!availableMembers.some((member) => member.id === selectedMemberId)) {
      setSelectedMemberId('');
    }
  }, [availableMembers, selectedMemberId]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !solution) return null;

  const projectTitle = solution.blueprint.title || solution.name;

  const handleAddMember = () => {
    if (!selectedMemberId) {
      setAddError('Select a team member to share with.');
      return;
    }
    onAddMember({ memberId: selectedMemberId, permission });
    setSelectedMemberId('');
    setPermission('view');
    setAddError('');
  };

  return createPortal(
    <div className={cn(theme, 'text-foreground')}>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <button type="button" aria-label="Close" className="absolute inset-0 bg-background/75 backdrop-blur-sm" onClick={onClose} />
        <div
          className={cn(
            'relative flex max-h-[min(90vh,640px)] w-full max-w-md flex-col rounded-2xl border shadow-2xl',
            isDark
              ? 'glass-panel-dark border-border shadow-[0_24px_60px_rgba(0,0,0,0.45)]'
              : 'border-border bg-card shadow-[0_24px_60px_rgba(0,0,0,0.12)]',
          )}
        >
          <div className="shrink-0 border-b border-border/60 p-6 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={cn('text-[10px] font-medium uppercase tracking-wide', isDark ? 'text-slate-400' : 'text-muted-foreground')}>
                  Share project
                </p>
                <h2 className={cn('mt-1 text-lg font-semibold', isDark ? 'text-white' : 'text-foreground')}>
                  {projectTitle}
                </h2>
                <p className={cn('mt-1 text-xs', isDark ? 'text-slate-400' : 'text-muted-foreground')}>
                  Share with teammates already on this instance.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'rounded-lg p-1 transition-colors',
                  isDark ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-muted-foreground hover:bg-accent',
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-6 pt-4">
            <div className="space-y-3">
              <label
                htmlFor="share-team-member"
                className={cn('block text-xs font-medium', isDark ? 'text-slate-300' : 'text-muted-foreground')}
              >
                Team member
              </label>
              <SelectNative
                id="share-team-member"
                value={selectedMemberId}
                onChange={(e) => {
                  setSelectedMemberId(e.target.value);
                  if (addError) setAddError('');
                }}
                disabled={availableMembers.length === 0}
                className={cn(
                  isDark
                    ? 'border-border bg-mitra-input text-foreground focus-visible:ring-brand-green/30'
                    : 'border-input bg-background text-foreground',
                )}
              >
                <option value="" disabled>
                  {availableMembers.length === 0 ? 'All team members already added' : 'Select a team member'}
                </option>
                {availableMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} · {member.role}
                  </option>
                ))}
              </SelectNative>

              <div className="grid grid-cols-2 gap-2">
                {PERMISSIONS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPermission(p.value)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-left transition-colors',
                      permission === p.value
                        ? isDark
                          ? 'border-brand-green/35 bg-brand-green/10'
                          : 'border-primary/40 bg-primary/5'
                        : isDark
                          ? 'border-border hover:bg-muted/50'
                          : 'border-border/60 hover:bg-muted/30',
                    )}
                  >
                    <p className={cn('text-sm font-medium', isDark ? 'text-slate-100' : 'text-foreground')}>{p.label}</p>
                    <p className={cn('text-[10px] leading-snug', isDark ? 'text-slate-400' : 'text-muted-foreground')}>{p.desc}</p>
                  </button>
                ))}
              </div>

              {addError && (
                <p className="text-[11px] text-destructive">{addError}</p>
              )}

              <Button
                variant="cta"
                type="button"
                onClick={handleAddMember}
                disabled={!selectedMemberId || availableMembers.length === 0}
                className="h-9 w-full"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add to project
              </Button>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <Users className={cn('h-3.5 w-3.5', isDark ? 'text-slate-500' : 'text-muted-foreground')} />
                <span className={cn('text-xs font-medium', isDark ? 'text-slate-300' : 'text-muted-foreground')}>
                  People with access ({collaborators.length + 1})
                </span>
              </div>

              <div className="space-y-1.5">
                <div
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg border px-3 py-2.5',
                    isDark ? 'border-border bg-muted/25' : 'border-border/60 bg-muted/15',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                      isDark ? 'bg-brand-green/20 text-brand-green' : 'bg-emerald-100 text-brand-green',
                    )}
                  >
                    {USER_DISPLAY_NAME.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-sm font-medium', isDark ? 'text-slate-100' : 'text-foreground')}>
                      {USER_DISPLAY_NAME}
                    </p>
                    <p className={cn('truncate text-[11px]', isDark ? 'text-slate-400' : 'text-muted-foreground')}>
                      Owner · {ARCHITECT_DISPLAY_NAME}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                      isDark ? 'bg-brand-green/15 text-brand-green' : 'bg-emerald-100 text-brand-green',
                    )}
                  >
                    Owner
                  </span>
                </div>

                {collaborators.length === 0 ? (
                  <p className={cn('py-3 text-center text-[11px]', isDark ? 'text-slate-500' : 'text-muted-foreground')}>
                    No collaborators yet. Add a team member above.
                  </p>
                ) : (
                  collaborators.map((collab) => (
                    <div
                      key={collab.id}
                      className={cn(
                        'group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors',
                        isDark ? 'border-border hover:bg-muted/30' : 'border-border/60 hover:bg-muted/20',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                          isDark ? 'bg-muted text-slate-300' : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {initialsFromEmail(collab.email, collab.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn('truncate text-sm font-medium', isDark ? 'text-slate-100' : 'text-foreground')}>
                          {collab.name || collab.email}
                        </p>
                        <p className={cn('truncate text-[11px]', isDark ? 'text-slate-400' : 'text-muted-foreground')}>
                          {collab.name ? collab.email : ''}
                          {collab.name ? ' · ' : ''}
                          Added {formatAddedAt(collab.invitedAt)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                          isDark ? 'bg-muted text-slate-300' : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {collab.permission}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemove(collab.id)}
                        className={cn(
                          'shrink-0 rounded-md p-1.5 opacity-70 transition-all hover:opacity-100',
                          isDark
                            ? 'text-slate-400 hover:bg-destructive/15 hover:text-destructive'
                            : 'text-muted-foreground hover:bg-red-50 hover:text-red-600',
                        )}
                        aria-label={`Remove ${collab.name || collab.email}`}
                        title="Remove access"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-border/60 p-4">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'inline-flex h-9 w-full items-center justify-center rounded-md border text-sm font-medium transition-colors',
                isDark
                  ? 'border-white/[0.08] text-slate-200 hover:bg-neutral-800'
                  : 'border-input bg-background hover:bg-accent',
              )}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
