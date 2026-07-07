import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, Link2, Mail, X, Zap } from 'lucide-react';
import { SharePermission, SolutionArtifact, Theme, UserRole } from '../types';
import { isDarkTheme } from '../utils/theme';
import { buildGuestReviewUrl } from '../utils/projectWorkflow';
import {
  getDefaultReviewerEmail,
  getPersonaShareLabel,
  getRequiredApprover,
} from '../utils/approvalFlow';
import { ARCHITECT_DISPLAY_NAME } from '../constants/role';
import { EmailNotificationPreview } from './EmailNotificationPreview';
import { cn } from '@/lib/utils';

interface ShareArtifactModalProps {
  theme: Theme;
  isOpen: boolean;
  artifact: SolutionArtifact | null;
  solutionTitle: string;
  onClose: () => void;
  onShare: (params: { email: string; permission: SharePermission; autoApprove?: boolean }) => void;
  onPreviewGuest?: (reviewId: string) => void;
  pendingReviewId?: string | null;
  defaultAutoApprove?: boolean;
}

const PERMISSIONS: { value: SharePermission; label: string; desc: string }[] = [
  { value: 'view', label: 'View only', desc: 'Read artifact — no actions' },
  { value: 'comment', label: 'Comment', desc: 'Read + inline section comments' },
  { value: 'approve', label: 'Approve', desc: 'Read, comment, approve or request changes' },
];

export function ShareArtifactModal({
  theme,
  isOpen,
  artifact,
  solutionTitle,
  onClose,
  onShare,
  onPreviewGuest,
  pendingReviewId,
  defaultAutoApprove = false,
}: ShareArtifactModalProps) {
  const isDark = isDarkTheme(theme);
  const approverRole: UserRole = artifact ? getRequiredApprover(artifact) : 'stakeholder';
  const personaLabel = getPersonaShareLabel(approverRole);
  const defaultEmail = getDefaultReviewerEmail(approverRole);

  const [email, setEmail] = useState(defaultEmail);
  const [permission, setPermission] = useState<SharePermission>('approve');
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastRecipientEmail, setLastRecipientEmail] = useState(defaultEmail);
  const [autoApprove, setAutoApprove] = useState(defaultAutoApprove);

  useEffect(() => {
    if (!isOpen) {
      setSent(false);
      setCopied(false);
      setEmail(defaultEmail);
      setPermission('approve');
      setLastRecipientEmail(defaultEmail);
      setAutoApprove(defaultAutoApprove);
    }
  }, [isOpen, defaultEmail, defaultAutoApprove]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen || !artifact) return null;

  const guestUrl = pendingReviewId ? buildGuestReviewUrl(pendingReviewId) : '';

  const handleSend = () => {
    const trimmed = email.trim();
    setLastRecipientEmail(trimmed);
    onShare({ email: trimmed, permission, autoApprove });
    setSent(true);
  };

  const openGuestReview = () => {
    if (!guestUrl) return;
    window.open(guestUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    if (!guestUrl) return;
    navigator.clipboard.writeText(guestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div className={cn(theme, 'text-foreground')}>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <button type="button" aria-label="Close" className="absolute inset-0 bg-background/75 backdrop-blur-sm" onClick={onClose} />
        <div
          className={cn(
            'relative w-full max-w-md rounded-2xl border p-6 shadow-2xl',
            isDark
              ? 'glass-panel-dark border-border shadow-[0_24px_60px_rgba(0,0,0,0.45)]'
              : 'border-slate-200 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.12)]',
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className={cn('text-[10px] font-medium uppercase tracking-wide', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Share for approval
              </p>
              <h2 className={cn('mt-1 text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                {artifact.name}
              </h2>
              <p className={cn('mt-0.5 font-mono text-[11px]', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {artifact.filingName}
              </p>
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>{solutionTitle}</p>
              <p className={cn('mt-1.5 text-[11px] font-medium', isDark ? 'text-brand-green/80' : 'text-primary')}>
                Gate: {personaLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'rounded-lg p-1 transition-colors',
                isDark ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-slate-500 hover:bg-slate-100',
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!sent ? (
            <div className="space-y-4">
              <div>
                <label className={cn('mb-1.5 block text-xs font-medium', isDark ? 'text-slate-300' : 'text-slate-600')}>
                  {personaLabel} email
                </label>
                <div className="relative">
                  <Mail className={cn('pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2', isDark ? 'text-slate-500' : 'text-slate-400')} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="reviewer@company.com"
                    className={cn(
                      'h-9 w-full rounded-md border pl-8 pr-3 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring',
                      isDark
                        ? 'border-border bg-mitra-input text-foreground placeholder:text-muted-foreground focus:border-brand-green/40'
                        : 'border-input bg-background text-slate-900 placeholder:text-slate-400',
                    )}
                  />
                </div>
              </div>

              <div>
                <label className={cn('mb-2 block text-xs font-medium', isDark ? 'text-slate-300' : 'text-slate-600')}>
                  Permission
                </label>
                <div className="space-y-1.5">
                  {PERMISSIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPermission(p.value)}
                      className={cn(
                        'w-full rounded-lg border px-3 py-2 text-left transition-colors',
                        permission === p.value
                          ? isDark
                            ? 'border-brand-green/35 bg-brand-green/10'
                            : 'border-primary/40 bg-primary/5'
                          : isDark
                            ? 'border-border hover:bg-muted/50'
                            : 'border-border/60 hover:bg-muted/30',
                      )}
                    >
                      <p className={cn('text-sm font-medium', isDark ? 'text-slate-100' : 'text-slate-900')}>{p.label}</p>
                      <p className={cn('text-[11px]', isDark ? 'text-slate-400' : 'text-slate-500')}>{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <label
                className={cn(
                  'flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors',
                  autoApprove
                    ? isDark
                      ? 'border-brand-green/35 bg-brand-green/10'
                      : 'border-primary/40 bg-primary/5'
                    : isDark
                      ? 'border-border hover:bg-muted/50'
                      : 'border-border/60 hover:bg-muted/30',
                )}
              >
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-primary"
                />
                <span>
                  <span className={cn('flex items-center gap-1.5 text-sm font-medium', isDark ? 'text-slate-100' : 'text-slate-900')}>
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    Auto-approve for demo
                  </span>
                  <span className={cn('mt-0.5 block text-[11px]', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Approves automatically after 30 seconds (demo presentations)
                  </span>
                </span>
              </label>

              <button
                type="button"
                onClick={handleSend}
                disabled={!email.trim()}
                className="btn-cta inline-flex h-9 w-full items-center justify-center text-sm transition-all disabled:pointer-events-none disabled:opacity-50"
              >
                Send to {personaLabel.split(' ')[0]}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                {autoApprove
                  ? `Shared with ${personaLabel}. Auto-approving in 30 seconds — notification will land live.`
                  : `Guest review link sent to ${personaLabel}. Copy or open below — no login required.`}
              </p>

              {guestUrl && (
                <EmailNotificationPreview
                  theme={theme}
                  senderName={ARCHITECT_DISPLAY_NAME}
                  artifactName={artifact.name}
                  recipientEmail={lastRecipientEmail}
                  guestUrl={guestUrl}
                  onReview={openGuestReview}
                  compact
                />
              )}

              {guestUrl && (
                <div
                  className={cn(
                    'rounded-lg border p-3',
                    isDark ? 'border-border bg-muted/40' : 'border-border/60 bg-muted/20',
                  )}
                >
                  <p className={cn('mb-2 flex items-center gap-1.5 text-[11px] font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    <Link2 className="h-3 w-3" />
                    Guest review link (no login)
                  </p>
                  <p className={cn('break-all text-[11px]', isDark ? 'text-slate-300' : 'text-slate-700')}>{guestUrl}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="btn-secondary inline-flex h-8 flex-1 items-center justify-center gap-1.5 text-xs transition-colors"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copied' : 'Copy link'}
                    </button>
                    {onPreviewGuest && pendingReviewId && (
                      <button
                        type="button"
                        onClick={() => onPreviewGuest(pendingReviewId)}
                        className="btn-cta inline-flex h-8 flex-1 items-center justify-center text-xs transition-all"
                      >
                        Review (same tab)
                      </button>
                    )}
                  </div>
                </div>
              )}

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
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
