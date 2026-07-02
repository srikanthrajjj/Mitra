import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Key, Lock, Shield, Eye, EyeOff, CheckCircle, Trash2 } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';

const PERSONAL_KEY_STORAGE = 'GEMINI_API_KEY';

interface ApiKeyModalProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  onRemove?: () => void;
}

export default function ApiKeyModal({
  theme,
  isOpen,
  onClose,
  onSave,
  onRemove,
}: ApiKeyModalProps) {
  const isDark = isDarkTheme(theme);
  const [personalKey, setPersonalKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasPersonalKey, setHasPersonalKey] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPersonalKey('');
    setShowKey(false);
    setSavedSuccess(false);
    setHasPersonalKey(Boolean(localStorage.getItem(PERSONAL_KEY_STORAGE)?.trim()));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = personalKey.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setHasPersonalKey(true);
    setPersonalKey('');
    setShowKey(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1400);
  };

  const handleRemovePersonal = () => {
    onRemove?.();
    setHasPersonalKey(false);
    setPersonalKey('');
    setSavedSuccess(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
          isDark
            ? 'glass-panel-dark border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.55)]'
            : 'bg-white border-slate-200 shadow-[0_24px_60px_rgba(0,0,0,0.12)]'
        }`}
      >
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-emerald-500/10 blur-xl rounded-full pointer-events-none" />

        <div className="flex items-center justify-between border-b border-slate-800/20 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-green" />
            <h2 className={`font-display font-bold text-lg ${isDark ? 'text-white' : 'text-slate-950'}`}>
              API access
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark
                ? 'border-neutral-800 text-slate-400 hover:text-white hover:bg-neutral-900'
                : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Built-in private API — never viewable or copyable */}
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Mitra API (private)
              </label>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'text-brand-green border-brand-green/30 bg-brand-green/10'
                    : 'text-emerald-700 border-emerald-200 bg-emerald-50'
                }`}
              >
                Active
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              This workspace uses a private hosted API key. It cannot be viewed, copied, or exported.
            </p>
            <div
              className={`flex items-center gap-3 h-11 px-4 rounded-xl border select-none ${
                isDark
                  ? 'bg-mitra-surface/40 border-white/[0.06] text-slate-500'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
              aria-hidden
            >
              <Lock className="w-4 h-4 shrink-0 opacity-70" />
              <span className="font-mono text-[13px] tracking-widest flex-1">
                ••••••••••••••••••••••••
              </span>
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                Hidden
              </span>
            </div>
          </section>

          {/* Optional personal key */}
          <section className="space-y-2 pt-1 border-t border-white/[0.06]">
            <label
              className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Your personal API key (optional)
            </label>
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Add your own Gemini key to route requests through your Google account. Your key is stored only on this
              device and is never shown again after saving.
            </p>

            {hasPersonalKey && (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] ${
                  isDark
                    ? 'bg-brand-green/10 border-brand-green/25 text-brand-green'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Personal key saved — enter a new key below to replace it.</span>
              </div>
            )}

            <form onSubmit={handleSavePersonal} className="space-y-3">
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={personalKey}
                  onChange={(e) => setPersonalKey(e.target.value)}
                  placeholder="Paste your Gemini API key (AIzaSy…)"
                  autoComplete="off"
                  spellCheck={false}
                  className={`w-full h-11 pl-4 pr-10 rounded-xl border outline-none text-[13.5px] transition-all duration-200 ${
                    isDark
                      ? 'bg-mitra-input border-white/[0.06] text-illuminate-text placeholder:text-illuminate-muted focus:border-brand-green/40 focus:bg-mitra-surface'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-brand-green'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                    isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title={showKey ? 'Hide key' : 'Show key while typing'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!personalKey.trim() || savedSuccess}
                  className={`flex-1 h-10 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    savedSuccess
                      ? 'bg-brand-green text-[#030d0a]'
                      : isDark
                        ? 'btn-dark-primary active:scale-[0.98]'
                        : 'bg-brand-green text-[#030d0a] hover:bg-brand-green-hover active:scale-[0.98]'
                  }`}
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    'Save personal key'
                  )}
                </button>
                {hasPersonalKey && (
                  <button
                    type="button"
                    onClick={handleRemovePersonal}
                    className={`h-10 px-3 rounded-xl border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${
                      isDark
                        ? 'border-red-500/25 text-red-400 hover:bg-red-500/10'
                        : 'border-red-200 text-red-600 hover:bg-red-50'
                    }`}
                    title="Remove personal key and use Mitra private API only"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>
            </form>
          </section>

          <div
            className={`p-3.5 rounded-xl border text-[11.5px] leading-relaxed flex gap-3 ${
              isDark
                ? 'bg-mitra-surface/60 border-white/[0.06] text-illuminate-muted'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              The private Mitra key stays on the server. Your personal key is saved in{' '}
              <code className="font-mono text-emerald-500 text-[10px]">localStorage</code> on this browser only — it
              is not displayed after you save.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-full h-10 rounded-xl border text-[13px] font-semibold transition-all ${
              isDark
                ? 'border-neutral-800 text-slate-300 hover:bg-neutral-900 hover:text-white'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
