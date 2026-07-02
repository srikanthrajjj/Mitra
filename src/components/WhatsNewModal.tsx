import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Columns2, FileStack, Users, Sparkles, Settings, GitBranch, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Theme } from "../types";
import { isDarkTheme } from "../utils/theme";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export const WHATS_NEW_DISMISSED_KEY = "mitra_whats_new_dismissed_v1";

export function readWhatsNewDismissed(): boolean {
  try {
    return localStorage.getItem(WHATS_NEW_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

function persistWhatsNewDismissed(dismissed: boolean): void {
  try {
    localStorage.setItem(WHATS_NEW_DISMISSED_KEY, String(dismissed));
  } catch {
    /* ignore */
  }
}

const WHATS_NEW_FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Columns2, title: "Resizable sidebars", description: "Drag left and right panel edges to resize; collapse for more workspace." },
  { icon: FileStack, title: "Application files & artifacts", description: "Artifacts and Status tabs with ServiceNow-style file list and share for approval." },
  { icon: Users, title: "Persona-based workspaces", description: "Business Owner, Architect, Stakeholder, Developer, Admin, Security, and Sponsor." },
  { icon: Sparkles, title: "Architect discovery flow", description: "Three focused discovery questions, then a Requirements Document in the artifact panel." },
  { icon: Settings, title: "Themes & settings", description: "ChatGPT-style settings; Light, Dark, Blue, System (default Dark, 14px font)." },
  { icon: GitBranch, title: "Project status tracking", description: "Persona workflow stepper on the Status tab across the pipeline." },
];

interface WhatsNewModalProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsNewModal({ theme, isOpen, onClose }: WhatsNewModalProps) {
  const isDark = isDarkTheme(theme);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleDismiss = () => {
    if (dontShowAgain) persistWhatsNewDismissed(true);
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9500] bg-black/50 backdrop-blur-[2px]" onClick={handleDismiss} aria-hidden />
          <motion.div role="dialog" aria-modal="true" aria-labelledby="whats-new-title" initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ type: "spring", stiffness: 380, damping: 32 }} className={cn("fixed left-1/2 top-1/2 z-[9600] w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 shadow-2xl", isDark ? "glass-panel-dark border-border bg-card/95" : "border-slate-200 bg-white")}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-green">Welcome back</p>
            <h2 id="whats-new-title" className={cn("mt-1 text-xl font-semibold tracking-tight", isDark ? "text-foreground" : "text-slate-900")}>What&apos;s new in Mitra</h2>
            <ul className="mt-5 space-y-3.5">
              {WHATS_NEW_FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-3">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border", isDark ? "border-brand-green/25 bg-brand-green/10 text-brand-green" : "border-emerald-200 bg-emerald-50 text-emerald-600")}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <label className="mt-5 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)} className="rounded border-border" />
              Don&apos;t show again
            </label>
            <div className="mt-4 flex justify-end">
              <Button type="button" onClick={handleDismiss}>Got it</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}