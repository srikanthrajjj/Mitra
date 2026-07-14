import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, X } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';
import { Button } from '@/src/components/ui/button';

export interface AlertDialogProps {
  theme: Theme;
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'info' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AlertDialog({
  theme,
  isOpen,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel,
}: AlertDialogProps) {
  const isDark = isDarkTheme(theme);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const Icon = variant === 'info' ? Info : AlertTriangle;
  const iconColor =
    variant === 'danger'
      ? 'text-red-400'
      : variant === 'warning'
        ? 'text-amber-400'
        : 'text-brand-green';
  const accentGlow =
    variant === 'danger'
      ? 'bg-red-500/10'
      : variant === 'warning'
        ? 'bg-amber-500/10'
        : 'bg-emerald-500/10';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-dialog-title"
    >
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div
        className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
          isDark
            ? 'glass-panel-dark border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.55)]'
            : 'bg-card border-border shadow-[0_24px_60px_rgba(0,0,0,0.12)]'
        }`}
      >
        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 ${accentGlow} blur-2xl rounded-full pointer-events-none`} />

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isDark ? 'bg-mitra-surface/80 border-white/[0.08]' : 'bg-muted border-border'
              }`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="min-w-0">
              <h2
                id="alert-dialog-title"
                className={`font-display font-semibold text-[16px] leading-snug ${
                  isDark ? 'text-white' : 'text-foreground'
                }`}
              >
                {title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
              isDark
                ? 'border-neutral-800 text-slate-400 hover:text-white hover:bg-neutral-900'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className={`text-[13px] leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-muted-foreground'}`}>
          {message}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="px-4 py-2 text-[13px]"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'cta'}
            onClick={onConfirm}
            className="px-4 py-2 text-[13px] font-semibold"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
