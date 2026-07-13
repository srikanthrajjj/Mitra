import React, { useState } from 'react';
import {
  Palette, Type, LayoutGrid, Sparkles, Code, Layers, Database,
  Copy, Check, ArrowLeft, Zap, Bell, AlertCircle, CheckCircle2,
  Info, X, ChevronRight, Star, Loader2, Eye, EyeOff, Moon, Sun,
  Search, Settings, User, Shield, FileText, Tag, ToggleLeft,
  Folder, HelpCircle, Key, LogOut, ChevronDown, Plus, Pencil, Trash2,
  Mic, Image
} from 'lucide-react';
import { DevComponentsList } from './dev/DevComponentsList';
import {
  DEV_COMPONENT_SHOWCASES,
  DEV_COMPONENTS,
  type DevComponentId,
  isDevComponentId,
} from './dev/components';
import { Solution, Theme } from '../types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { Switch } from '@/src/components/ui/switch';
import { Separator } from '@/src/components/ui/separator';

interface DeveloperSpecsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeSolution: Solution | null;
  theme: Theme;
}

type Section =
  | 'overview'
  | 'components'
  | DevComponentId
  | 'colors'
  | 'typography'
  | 'spacing'
  | 'buttons'
  | 'badges'
  | 'inputs'
  | 'switches'
  | 'cards'
  | 'code'
  | 'icons';

const NAV_SECTIONS: { id: Section; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'overview',    label: 'Overview',    icon: Sparkles },
  { id: 'components',  label: 'Components',  icon: Layers },
  { id: 'colors',      label: 'Colors',      icon: Palette },
  { id: 'typography',  label: 'Typography',  icon: Type },
  { id: 'spacing',     label: 'Spacing',     icon: LayoutGrid },
  { id: 'buttons',     label: 'Buttons',     icon: Zap },
  { id: 'badges',      label: 'Badges',      icon: Tag },
  { id: 'inputs',      label: 'Inputs',      icon: Search },
  { id: 'switches',    label: 'Switches',    icon: ToggleLeft },
  { id: 'cards',       label: 'Cards',       icon: Layers },
  { id: 'code',        label: 'Code Specs',  icon: Code },
  { id: 'icons',       label: 'Icons',       icon: Image },
];

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.FC<{className?:string}>; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/10 border border-brand-green/20">
          <Icon className="h-4.5 w-4.5 text-brand-green" />
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-muted-foreground pl-12">{subtitle}</p>}
    </div>
  );
}

function TokenRow({ name, value, preview }: { name: string; value: string; preview?: React.ReactNode; key?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border/40 last:border-0">
      {preview}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs font-mono text-muted-foreground mt-0.5">{value}</p>
      </div>
      <button
        onClick={copy}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-green transition-colors cursor-pointer"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-brand-green" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full border border-brand-green/20 bg-brand-green/5 text-brand-green text-[11px] font-medium">
      {label}
    </span>
  );
}

// ─── Section Components ───────────────────────────────────────────────────────

function OverviewSection() {
  return (
    <div className="space-y-8">
      <SectionHeader icon={Sparkles} title="Mitra Design System" subtitle="A comprehensive guide to every token, component, and pattern used across the Mitra workspace." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Design Tokens', count: '24', icon: Palette, desc: 'Colors, spacing, radius, shadows' },
          { label: 'Components',    count: '13', icon: Layers,  desc: 'Buttons, badges, inputs, cards' },
          { label: 'Personas',      count: '7',  icon: User,    desc: 'Role-based UI theming' },
        ].map(({ label, count, icon: Icon, desc }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Icon className="h-5 w-5 text-brand-green" />
              <span className="font-display text-3xl font-bold text-foreground">{count}</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-brand-green/20 bg-brand-green/5 p-6">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-brand-green" /> Stack & Fonts
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Framework', 'React 19 + Vite 6'],
            ['CSS Engine', 'Tailwind CSS v4'],
            ['Icons', 'Lucide React'],
            ['Animation', 'Motion (Framer)'],
            ['Font — UI', 'Rethink Sans (body/chrome)'],
            ['Font — Display', 'Rethink Sans (headings)'],
            ['Font — Code', 'Rethink Sans (mono/code)'],
            ['Components', 'Radix UI primitives'],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span className="text-muted-foreground shrink-0">{k}:</span>
              <span className="font-medium text-foreground font-mono text-xs">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ColorsSection() {
  // Each swatch uses a CSS var() so the preview renders the exact live token
  const swatches: { name: string; varName: string; fallback: string; note: string }[] = [
    { name: 'brand-green',       varName: '--color-brand-green',       fallback: '#32d74b', note: 'Primary accent, CTAs, active states' },
    { name: 'brand-green-hover', varName: '--color-brand-green-hover', fallback: '#28c840', note: 'Hover variant of primary' },
    { name: 'vr-cyan',           varName: '--color-vr-cyan',           fallback: '#00c9a0', note: 'Secondary accent, connection states' },
    { name: 'mitra-bg',          varName: '--color-mitra-bg',          fallback: '#06080a', note: 'App root background' },
    { name: 'mitra-sidebar',     varName: '--color-mitra-sidebar',     fallback: '#0a0e12', note: 'Left sidebar background' },
    { name: 'mitra-surface',     varName: '--color-mitra-surface',     fallback: '#10161c', note: 'Panel / card surfaces' },
    { name: 'mitra-border',      varName: '--color-mitra-border',      fallback: '#1c242c', note: 'Default border color' },
    { name: 'mitra-input',       varName: '--color-mitra-input',       fallback: '#0c1014', note: 'Input field background' },
    { name: 'destructive',       varName: '--color-destructive',       fallback: 'hsl(0 62% 50%)', note: 'Error, delete, warning states' },
  ];

  // Semantic tokens — previews use var() so they reflect the real computed value
  const semanticTokens: { name: string; varRef: string }[] = [
    { name: '--background',       varRef: 'var(--background)' },
    { name: '--foreground',       varRef: 'var(--foreground)' },
    { name: '--card',             varRef: 'var(--card)' },
    { name: '--muted',            varRef: 'var(--muted)' },
    { name: '--muted-foreground', varRef: 'var(--muted-foreground)' },
    { name: '--border',           varRef: 'var(--border)' },
    { name: '--primary',          varRef: 'var(--primary)' },
    { name: '--ring',             varRef: 'var(--ring)' },
  ];

  return (
    <div className="space-y-10">
      <SectionHeader icon={Palette} title="Colors" subtitle="Design tokens and their usage. Dark mode by default — light overrides available." />

      <div>
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Brand & Custom Colors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {swatches.map(({ name, varName, fallback, note }) => (
            <div key={name} className="rounded-xl overflow-hidden border border-border bg-card">
              {/* Preview uses the live CSS variable — no hardcoded hex */}
              <div
                className="h-16 w-full"
                style={{ backgroundColor: `var(${varName}, ${fallback})` }}
              />
              <div className="p-3 space-y-1">
                <p className="text-sm font-semibold text-foreground font-mono">{name}</p>
                <p className="text-[10px] font-mono text-brand-green/80">var({varName})</p>
                <p className="text-[11px] text-muted-foreground">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">CSS Semantic Tokens</h3>
        <div className="rounded-xl border border-border bg-card divide-y divide-border/40">
          {semanticTokens.map(({ name, varRef }) => (
            <TokenRow
              key={name}
              name={name}
              value={varRef}
              preview={
                <div
                  className="h-8 w-8 rounded-lg border border-border/60 shrink-0"
                  style={{ background: `hsl(${varRef.replace('var(', '').replace(')', '')})` }}
                />
              }
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Color Shades</h3>
        <p className="text-xs text-muted-foreground mb-5">8-shade scales for Primary, Secondary, and Dark. Use these Tailwind classes for consistent shading across the UI.</p>
        <div className="space-y-8">
          {shadePalettes.map((palette) => (
            <div key={palette.name}>
              <p className="text-sm font-semibold text-foreground mb-3">{palette.label} <span className="text-muted-foreground font-normal text-xs">({palette.note})</span></p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {palette.shades.map((shade) => (
                  <div key={shade.token} className="rounded-lg overflow-hidden border border-border bg-card">
                    <div className="h-12 w-full" style={{ backgroundColor: shade.hsl }} />
                    <div className="p-2 space-y-0.5">
                      <p className="text-[10px] font-mono font-semibold text-foreground leading-tight">{shade.token}</p>
                      <p className="text-[9px] font-mono text-brand-green/70 leading-tight">{shade.hsl}</p>
                      <p className="text-[9px] text-muted-foreground leading-tight">{shade.tailwind}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const shadePalettes = [
  {
    name: 'primary',
    label: 'Primary',
    note: 'Green accent scale ~140° hue',
    shades: [
      { token: 'primary-50',   hsl: 'hsl(140 60% 97%)',  tailwind: 'bg-primary-50',   usage: 'Ultra-light tints' },
      { token: 'primary-100',  hsl: 'hsl(140 60% 93%)',  tailwind: 'bg-primary-100',  usage: 'Light backgrounds' },
      { token: 'primary-200',  hsl: 'hsl(140 60% 85%)',  tailwind: 'bg-primary-200',  usage: 'Soft accents' },
      { token: 'primary-300',  hsl: 'hsl(140 80% 70%)',  tailwind: 'bg-primary-300',  usage: 'Medium-light' },
      { token: 'primary-400',  hsl: 'hsl(140 90% 58%)',  tailwind: 'bg-primary-400',  usage: 'Icons, indicators' },
      { token: 'primary-500',  hsl: 'hsl(140 100% 50%)', tailwind: 'bg-primary-500',  usage: 'Base primary' },
      { token: 'primary-600',  hsl: 'hsl(140 100% 40%)', tailwind: 'bg-primary-600',  usage: 'Hover / active' },
      { token: 'primary-700',  hsl: 'hsl(140 100% 28%)', tailwind: 'bg-primary-700',  usage: 'Deepest green' },
    ],
  },
  {
    name: 'secondary',
    label: 'Secondary',
    note: 'Neutral gray scale ~210° hue',
    shades: [
      { token: 'secondary-50',   hsl: 'hsl(210 40% 98%)',  tailwind: 'bg-secondary-50',   usage: 'Near-white' },
      { token: 'secondary-100',  hsl: 'hsl(210 40% 96%)',  tailwind: 'bg-secondary-100',  usage: 'Card backgrounds' },
      { token: 'secondary-200',  hsl: 'hsl(210 30% 90%)',  tailwind: 'bg-secondary-200',  usage: 'Borders, dividers' },
      { token: 'secondary-300',  hsl: 'hsl(210 20% 80%)',  tailwind: 'bg-secondary-300',  usage: 'Muted borders' },
      { token: 'secondary-400',  hsl: 'hsl(210 15% 60%)',  tailwind: 'bg-secondary-400',  usage: 'Muted text' },
      { token: 'secondary-500',  hsl: 'hsl(210 15% 40%)',  tailwind: 'bg-secondary-500',  usage: 'Mid-tone text' },
      { token: 'secondary-600',  hsl: 'hsl(210 20% 25%)',  tailwind: 'bg-secondary-600',  usage: 'Dark surfaces' },
      { token: 'secondary-700',  hsl: 'hsl(210 30% 14%)',  tailwind: 'bg-secondary-700',  usage: 'Darkest gray' },
    ],
  },
  {
    name: 'dark',
    label: 'Dark',
    note: 'Neutral black scale 0° hue',
    shades: [
      { token: 'dark-50',   hsl: 'hsl(0 0% 22%)', tailwind: 'bg-dark-50',   usage: 'Lightest dark' },
      { token: 'dark-100',  hsl: 'hsl(0 0% 20%)', tailwind: 'bg-dark-100',  usage: 'Dark borders' },
      { token: 'dark-200',  hsl: 'hsl(0 0% 17%)', tailwind: 'bg-dark-200',  usage: 'Raised surfaces' },
      { token: 'dark-300',  hsl: 'hsl(0 0% 14%)', tailwind: 'bg-dark-300',  usage: 'Card surfaces' },
      { token: 'dark-400',  hsl: 'hsl(0 0% 12%)', tailwind: 'bg-dark-400',  usage: 'Sidebar bg' },
      { token: 'dark-500',  hsl: 'hsl(0 0% 9%)',  tailwind: 'bg-dark-500',  usage: 'Main sidebar' },
      { token: 'dark-600',  hsl: 'hsl(0 0% 7%)',  tailwind: 'bg-dark-600',  usage: 'App background' },
      { token: 'dark-700',  hsl: 'hsl(0 0% 4%)',  tailwind: 'bg-dark-700',  usage: 'Deepest black' },
    ],
  },
];

function TypographySection() {
  return (
    <div className="space-y-10">
      <SectionHeader icon={Type} title="Typography" subtitle="Rethink Sans is used across UI, display, and code." />

      <div className="space-y-6">
        {/* UI body */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Rethink Sans — UI Sans</h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">--font-sans · var(--font-sans)</p>
            </div>
            <Chip label="body" />
          </div>
          <Separator className="bg-border/40" />
          {[
            { label: 'text-xs / 12px',   cls: 'text-xs',   sample: 'Metadata, captions, helper text' },
            { label: 'text-sm / 14px',   cls: 'text-sm',   sample: 'Body text, labels, list items' },
            { label: 'text-base / 16px', cls: 'text-base', sample: 'Primary reading size' },
            { label: 'text-lg / 18px',   cls: 'text-lg',   sample: 'Large UI copy, subtitles' },
            { label: 'text-xl / 20px',   cls: 'text-xl',   sample: 'Section headings (inner)' },
          ].map(({ label, cls, sample }) => (
            <div key={label} className="flex items-baseline justify-between gap-4">
              <span className={`${cls} text-foreground flex-1`}>{sample}</span>
              <code className="text-[10px] font-mono text-muted-foreground shrink-0">{label}</code>
            </div>
          ))}
        </div>

        {/* Display */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Rethink Sans — Display</h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">--font-display · font-display class</p>
            </div>
            <Chip label="headings" />
          </div>
          <Separator className="bg-border/40" />
          {[
            { label: 'text-2xl', sample: 'Panel Heading' },
            { label: 'text-3xl', sample: 'Page Title' },
            { label: 'text-4xl', sample: 'Hero Sub' },
            { label: 'text-5xl', sample: 'Hero' },
          ].map(({ label, sample }) => (
            <div key={label} className="flex items-baseline justify-between gap-4">
              <span className={`font-display ${label} font-bold text-foreground leading-tight`}>{sample}</span>
              <code className="text-[10px] font-mono text-muted-foreground shrink-0">{label} bold</code>
            </div>
          ))}
        </div>

        {/* Code / mono */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Rethink Sans — Code</h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">--font-mono · font-mono class</p>
            </div>
            <Chip label="code" />
          </div>
          <Separator className="bg-border/40" />
          <div className="space-y-2">
            <p className="font-mono text-sm text-brand-green">x_snc_u_hrsd_onboarding_case</p>
            <p className="font-mono text-xs text-muted-foreground">{"{ \"solutionId\": \"hr-ticketing\", \"status\": \"active\" }"}</p>
            <p className="font-mono text-[10px] text-emerald-400/70">SELECT * FROM sys_db_object WHERE name LIKE 'x_snc_%'</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpacingSection() {
  const scale = [
    { token: 'space-1',  px: '4px',  tw: 'p-1' },
    { token: 'space-2',  px: '8px',  tw: 'p-2' },
    { token: 'space-3',  px: '12px', tw: 'p-3' },
    { token: 'space-4',  px: '16px', tw: 'p-4' },
    { token: 'space-5',  px: '20px', tw: 'p-5' },
    { token: 'space-6',  px: '24px', tw: 'p-6' },
    { token: 'space-8',  px: '32px', tw: 'p-8' },
    { token: 'space-10', px: '40px', tw: 'p-10' },
    { token: 'space-12', px: '48px', tw: 'p-12' },
  ];
  const radii = [
    { name: 'radius-sm', value: 'calc(var(--radius) - 4px)', cls: 'rounded-sm', px: '~6px' },
    { name: 'radius-md', value: 'calc(var(--radius) - 2px)', cls: 'rounded-md', px: '~8px' },
    { name: 'radius-lg', value: 'var(--radius)',              cls: 'rounded-lg', px: '10px' },
    { name: 'radius-xl', value: 'calc(var(--radius) + 4px)', cls: 'rounded-xl', px: '~14px' },
    { name: 'rounded-full', value: '9999px',                 cls: 'rounded-full', px: 'pill' },
  ];
  const layout = [
    ['Sidebar (expanded)',  '240px'],
    ['Sidebar (collapsed)', '48px'],
    ['Panel header height', '52px'],
    ['Right panel width',   'min(720px, 50vw)'],
    ['Chat max-width',      '760px'],
    ['Content max-width',   '1152px (max-w-6xl)'],
  ];

  return (
    <div className="space-y-10">
      <SectionHeader icon={LayoutGrid} title="Spacing & Layout" subtitle="Base-4 spacing scale, border radii, and key layout dimensions." />

      <div>
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Spacing Scale (base 4px)</h3>
        <div className="space-y-2">
          {scale.map(({ token, px, tw }) => (
            <div key={token} className="flex items-center gap-4">
              <code className="text-[11px] font-mono text-muted-foreground w-20 shrink-0">{tw}</code>
              <div className="bg-brand-green/20 border border-brand-green/30 rounded" style={{ height: '20px', width: px }} />
              <span className="text-xs text-muted-foreground">{px}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Border Radius</h3>
        <div className="flex flex-wrap gap-4">
          {radii.map(({ name, cls, px }) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div className={`h-12 w-12 bg-brand-green/15 border border-brand-green/30 ${cls}`} />
              <div className="text-center">
                <p className="text-[10px] font-mono text-foreground">{cls}</p>
                <p className="text-[10px] text-muted-foreground">{px}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Layout Dimensions</h3>
        <div className="rounded-xl border border-border bg-card divide-y divide-border/40">
          {layout.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">{k}</span>
              <code className="text-xs font-mono text-foreground bg-muted px-2 py-0.5 rounded">{v}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ButtonsSection() {
  const [loading, setLoading] = useState(false);
  const [clicked, setClicked] = useState<string | null>(null);

  const click = (label: string) => {
    setClicked(label);
    setTimeout(() => setClicked(null), 800);
  };

  return (
    <div className="space-y-10">
      <SectionHeader icon={Zap} title="Buttons" subtitle="All button variants, sizes, and states — all interactive." />

      {/* Variants */}
      <div>
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Variants</h3>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          {(['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const).map((v) => (
            <div key={v} className="flex items-center gap-4">
              <Button variant={v} onClick={() => click(v)}>
                {clicked === v ? <><Check className="h-4 w-4" /> Clicked!</> : <>{v.charAt(0).toUpperCase() + v.slice(1)}</>}
              </Button>
              <code className="text-xs font-mono text-muted-foreground">variant="{v}"</code>
            </div>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Sizes</h3>
        <div className="rounded-xl border border-border bg-card p-6 flex flex-wrap items-center gap-4">
          <Button size="sm" onClick={() => click('sm')}>Small</Button>
          <Button size="default" onClick={() => click('default')}>Default</Button>
          <Button size="lg" onClick={() => click('lg')}>Large</Button>
          <Button size="icon" onClick={() => click('icon')}><Star className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* States */}
      <div>
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">States</h3>
        <div className="rounded-xl border border-border bg-card p-6 flex flex-wrap items-center gap-4">
          <Button disabled>Disabled</Button>
          <Button
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}
            disabled={loading}
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</> : 'Click to Load'}
          </Button>
          <Button className="rounded-full">Pill Button</Button>
          <Button variant="outline" className="border-brand-green/40 text-brand-green hover:bg-brand-green/10">
            <Sparkles className="h-4 w-4" /> Brand CTA
          </Button>
        </div>
      </div>
    </div>
  );
}

function BadgesSection() {
  return (
    <div className="space-y-10">
      <SectionHeader icon={Tag} title="Badges" subtitle="Status indicators and label chips. All variants live below." />

      <div>
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Variants</h3>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="approved">Approved</Badge>
            <Badge variant="review">In Review</Badge>
            <Badge variant="pending">Pending</Badge>
            <Badge variant="draft">Draft</Badge>
            <Badge variant="muted">Muted</Badge>
          </div>
          <Separator className="bg-border/40 mb-6" />
          <div className="space-y-3">
            {[
              { variant: 'default' as const,     label: 'Default',     code: 'variant="default"' },
              { variant: 'approved' as const,     label: 'Approved',    code: 'variant="approved"' },
              { variant: 'review' as const,       label: 'In Review',   code: 'variant="review"' },
              { variant: 'pending' as const,      label: 'Pending',     code: 'variant="pending"' },
              { variant: 'draft' as const,        label: 'Draft',       code: 'variant="draft"' },
              { variant: 'destructive' as const,  label: 'Error',       code: 'variant="destructive"' },
              { variant: 'muted' as const,        label: 'Muted',       code: 'variant="muted"' },
            ].map(({ variant, label, code }) => (
              <div key={variant} className="flex items-center justify-between">
                <Badge variant={variant}>{label}</Badge>
                <code className="text-[10px] font-mono text-muted-foreground">{`<Badge ${code}>`}</code>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">With Icons</h3>
        <div className="rounded-xl border border-border bg-card p-6 flex flex-wrap gap-3">
          <Badge variant="approved" className="gap-1.5"><CheckCircle2 className="h-3 w-3" /> Deployed</Badge>
          <Badge variant="review" className="gap-1.5"><Eye className="h-3 w-3" /> Under Review</Badge>
          <Badge variant="pending" className="gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Processing</Badge>
          <Badge variant="destructive" className="gap-1.5"><AlertCircle className="h-3 w-3" /> Failed</Badge>
          <Badge variant="draft" className="gap-1.5"><FileText className="h-3 w-3" /> Draft</Badge>
          <Badge variant="default" className="gap-1.5"><Shield className="h-3 w-3" /> Secure</Badge>
        </div>
      </div>
    </div>
  );
}

function InputsSection() {
  const [val, setVal] = useState('');
  const [show, setShow] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  return (
    <div className="space-y-10">
      <SectionHeader icon={Search} title="Inputs" subtitle="All input field states and variants — fully interactive." />

      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Default Input</label>
          <Input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Type something…"
          />
          <p className="text-xs text-muted-foreground">Value: <code className="font-mono">"{val}"</code></p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">With Leading Icon</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search solutions…"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Password Field</label>
          <div className="relative">
            <Input type={show ? 'text' : 'password'} placeholder="Enter password" className="pr-10" />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Disabled</label>
          <Input disabled placeholder="Cannot edit" value="Read-only value" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Monospace / Code Input</label>
          <Input className="font-mono text-xs text-brand-green" defaultValue="https://dev12345.service-now.com" />
        </div>
      </div>
    </div>
  );
}

function SwitchesSection() {
  const [states, setStates] = useState({
    notifications: true,
    autoApprove: false,
    highContrast: false,
    ambientMusic: true,
    syncEnabled: false,
  });

  const toggle = (key: keyof typeof states) =>
    setStates((s) => ({ ...s, [key]: !s[key] }));

  const items: { key: keyof typeof states; label: string; desc: string }[] = [
    { key: 'notifications', label: 'Notifications',   desc: 'Receive alerts when artifacts are ready' },
    { key: 'autoApprove',   label: 'Auto-approve',    desc: 'Automatically approve stakeholder reviews in demo mode' },
    { key: 'highContrast',  label: 'High contrast',   desc: 'Increase contrast for accessibility' },
    { key: 'ambientMusic',  label: 'Ambient music',   desc: 'Play background audio while working' },
    { key: 'syncEnabled',   label: 'Role matrix sync', desc: 'Sync persona roles with ServiceNow groups' },
  ];

  return (
    <div className="space-y-10">
      <SectionHeader icon={ToggleLeft} title="Switches" subtitle="Boolean toggle controls — click any to toggle." />

      <div className="rounded-xl border border-border bg-card divide-y divide-border/40">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between px-5 py-4 gap-6">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <Switch
              checked={states[key]}
              onCheckedChange={() => toggle(key)}
            />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3">Live State</h4>
        <pre className="font-mono text-xs text-brand-green bg-black/30 rounded-lg p-4 overflow-x-auto">
          {JSON.stringify(states, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function CardsSection() {
  return (
    <div className="space-y-10">
      <SectionHeader icon={Layers} title="Cards & Surfaces" subtitle="Container components and their elevation levels." />

      <div className="space-y-4">
        {/* Basic Card */}
        <div>
          <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">Basic Card</h3>
          <div className="rounded-xl border border-border bg-card p-5">
            <h4 className="font-semibold text-foreground mb-1">Card Title</h4>
            <p className="text-sm text-muted-foreground">Standard card using <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">bg-card border-border rounded-xl</code></p>
          </div>
        </div>

        {/* Elevated / Glow */}
        <div>
          <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">Brand Glow Card</h3>
          <div className="rounded-xl border border-brand-green/20 bg-brand-green/5 p-5 shadow-[0_0_20px_rgba(50,215,75,0.08)]">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-brand-green/15 border border-brand-green/25 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-brand-green" />
              </div>
              <h4 className="font-semibold text-foreground">Highlighted Action</h4>
            </div>
            <p className="text-sm text-muted-foreground">Used for featured CTAs and active solution cards.</p>
          </div>
        </div>

        {/* Info / Alert Cards */}
        <div>
          <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">Alert / Status Cards</h3>
          <div className="space-y-3">
            {[
              { icon: CheckCircle2, label: 'Success', color: 'emerald', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', text: 'text-emerald-400', msg: 'Artifact deployed successfully.' },
              { icon: AlertCircle,  label: 'Warning', color: 'amber',   border: 'border-amber-500/20',   bg: 'bg-amber-500/5',   text: 'text-amber-400',   msg: 'Review approval is pending.' },
              { icon: Info,         label: 'Info',    color: 'blue',    border: 'border-blue-500/20',    bg: 'bg-blue-500/5',    text: 'text-blue-400',    msg: 'Update set sync in progress.' },
              { icon: X,            label: 'Error',   color: 'red',     border: 'border-red-500/20',     bg: 'bg-red-500/5',     text: 'text-red-400',     msg: 'Conflict detected in schema.' },
            ].map(({ icon: Icon, label, border, bg, text, msg }) => (
              <div key={label} className={`flex items-start gap-3 rounded-xl border ${border} ${bg} p-4`}>
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${text}`} />
                <div>
                  <p className={`text-sm font-semibold ${text}`}>{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metric Card */}
        <div>
          <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">Metric Cards</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Solutions',   val: '12',   delta: '+3 this week',  up: true },
              { label: 'Artifacts',   val: '48',   delta: '+7 today',      up: true },
              { label: 'Conflicts',   val: '2',    delta: '-5 resolved',   up: false },
              { label: 'Reviews',     val: '5',    delta: '3 pending',     up: false },
            ].map(({ label, val, delta, up }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="font-display text-2xl font-bold text-foreground">{val}</p>
                <p className={`text-[11px] mt-1 ${up ? 'text-brand-green' : 'text-muted-foreground'}`}>{delta}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeSection() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const snippets = [
    {
      key: 'button',
      label: 'Button — primary CTA',
      lang: 'tsx',
      code: `<Button
  size="lg"
  className="rounded-full px-10"
  onClick={handleAction}
>
  Enter workspace
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>`,
    },
    {
      key: 'badge',
      label: 'Badge — status chip',
      lang: 'tsx',
      code: `<Badge variant="approved" className="gap-1.5">
  <CheckCircle2 className="h-3 w-3" />
  Deployed
</Badge>`,
    },
    {
      key: 'card',
      label: 'Card — brand glow',
      lang: 'tsx',
      code: `<div className="rounded-xl border border-brand-green/20
  bg-brand-green/5 p-5
  shadow-[0_0_20px_rgba(50,215,75,0.08)]">
  {/* content */}
</div>`,
    },
    {
      key: 'tokens',
      label: 'CSS — design tokens',
      lang: 'css',
      code: `--color-brand-green: #32d74b;
--color-vr-cyan: #00c9a0;
--color-mitra-bg: #06080a;
--color-mitra-surface: #10161c;
--color-mitra-border: #1c242c;
--radius: 0.625rem;`,
    },
    {
      key: 'sn-snippet',
      label: 'ServiceNow — Client Script',
      lang: 'js',
      code: `function onLoad() {
  var dept = g_form.getValue('u_department');
  if (dept === '') {
    g_form.setMandatory('u_manager', true);
    g_form.showFieldMsg(
      'u_manager',
      'Manager required without dept.',
      'info'
    );
  }
}`,
    },
  ];

  return (
    <div className="space-y-10">
      <SectionHeader icon={Code} title="Code Snippets" subtitle="Copy-ready code examples for common patterns used across the codebase." />
      <div className="space-y-4">
        {snippets.map(({ key, label, lang, code }) => (
          <div key={key} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-2">
                <Code className="h-3.5 w-3.5 text-brand-green" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">{lang}</span>
                <button
                  onClick={() => copy(key, code)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-green transition-colors cursor-pointer"
                >
                  {copiedKey === key
                    ? <><Check className="h-3.5 w-3.5 text-brand-green" /> Copied</>
                    : <><Copy className="h-3.5 w-3.5" /> Copy</>
                  }
                </button>
              </div>
            </div>
            <pre className="p-4 text-[12px] font-mono text-zinc-300 overflow-x-auto leading-relaxed bg-black/20">
              <code>{code}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function IconsSection() {
  const [copiedName, setCopiedName] = useState<string | null>(null);
  
  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(`<${name} className="h-5 w-5" />`);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 1500);
  };

  const projectIcons = [
    { name: 'Sparkles', icon: Sparkles },
    { name: 'Palette', icon: Palette },
    { name: 'Type', icon: Type },
    { name: 'LayoutGrid', icon: LayoutGrid },
    { name: 'Code', icon: Code },
    { name: 'Layers', icon: Layers },
    { name: 'Database', icon: Database },
    { name: 'Copy', icon: Copy },
    { name: 'Check', icon: Check },
    { name: 'ArrowLeft', icon: ArrowLeft },
    { name: 'Zap', icon: Zap },
    { name: 'Bell', icon: Bell },
    { name: 'AlertCircle', icon: AlertCircle },
    { name: 'CheckCircle2', icon: CheckCircle2 },
    { name: 'Info', icon: Info },
    { name: 'X', icon: X },
    { name: 'ChevronRight', icon: ChevronRight },
    { name: 'Star', icon: Star },
    { name: 'Loader2', icon: Loader2 },
    { name: 'Eye', icon: Eye },
    { name: 'EyeOff', icon: EyeOff },
    { name: 'Moon', icon: Moon },
    { name: 'Sun', icon: Sun },
    { name: 'Search', icon: Search },
    { name: 'Settings', icon: Settings },
    { name: 'User', icon: User },
    { name: 'Shield', icon: Shield },
    { name: 'FileText', icon: FileText },
    { name: 'Tag', icon: Tag },
    { name: 'ToggleLeft', icon: ToggleLeft },
    { name: 'Folder', icon: Folder },
    { name: 'HelpCircle', icon: HelpCircle },
    { name: 'Key', icon: Key },
    { name: 'LogOut', icon: LogOut },
    { name: 'ChevronDown', icon: ChevronDown },
    { name: 'Plus', icon: Plus },
    { name: 'Pencil', icon: Pencil },
    { name: 'Trash2', icon: Trash2 },
    { name: 'Mic', icon: Mic },
    { name: 'Image', icon: Image }
  ];

  return (
    <div className="space-y-10">
      <SectionHeader
        icon={Image}
        title="Iconography Specification"
        subtitle="Consistent and scalable visual symbols used across the Mitra workspace."
      />

      {/* Guide Card */}
      <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">Icon Library: Lucide React</h4>
            <p className="text-xs text-muted-foreground">
              Mitra leverages the open-source Lucide community icon family for all interface states.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono px-3 py-1.5 rounded-lg border border-border bg-black/20 text-brand-green">
              npm install lucide-react
            </code>
          </div>
        </div>

        <div className="border-t border-border/40 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <span className="font-semibold text-foreground">Primary Resource</span>
            <p className="text-muted-foreground">
              Browse all 1000+ available icons on the official <a href="https://lucide.dev" target="_blank" rel="noreferrer" className="text-brand-green hover:underline">Lucide Website</a>.
            </p>
          </div>
          <div className="space-y-1.5">
            <span className="font-semibold text-foreground">Alternative Suggestion Stacks</span>
            <p className="text-muted-foreground leading-normal">
              For other spatial design directions, try: <a href="https://icons.radix-ui.com" target="_blank" rel="noreferrer" className="text-brand-green hover:underline">Radix Icons</a> (minimal outline), <a href="https://phosphoricons.com" target="_blank" rel="noreferrer" className="text-brand-green hover:underline">Phosphor</a>, or <a href="https://tabler.io/icons" target="_blank" rel="noreferrer" className="text-brand-green hover:underline">Tabler</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Icons */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Active Workspace Icons ({projectIcons.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {projectIcons.map(({ name, icon: IconComp }) => (
            <div
              key={name}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card/45 hover:border-brand-green/20 transition-all group"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.02] border border-border/60 mb-3 group-hover:bg-brand-green/5 group-hover:border-brand-green/20 transition-all">
                <IconComp className="h-5 w-5 text-foreground group-hover:text-brand-green transition-colors" />
              </div>
              <span className="text-[11px] font-medium text-foreground/80 mb-2 truncate max-w-full px-1">{name}</span>
              <button
                type="button"
                onClick={() => handleCopy(name)}
                className="text-[10px] text-muted-foreground hover:text-brand-green bg-white/[0.02] border border-border/60 hover:border-brand-green/25 rounded-md px-2.5 py-1 flex items-center gap-1 transition-all cursor-pointer"
              >
                {copiedName === name ? (
                  <>
                    <Check className="h-3 w-3 text-brand-green" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy tag</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DeveloperSpecsPanel({ isOpen, onClose, theme }: DeveloperSpecsPanelProps) {
  const [activeSection, setActiveSection] = useState<Section>('overview');

  if (!isOpen) return null;

  const renderSection = () => {
    if (isDevComponentId(activeSection)) {
      const Showcase = DEV_COMPONENT_SHOWCASES[activeSection];
      return (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setActiveSection('components')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-brand-green cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to components
          </button>
          <Showcase theme={theme} />
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':   return <OverviewSection />;
      case 'components':
        return <DevComponentsList onSelect={(id) => setActiveSection(id)} />;
      case 'colors':     return <ColorsSection />;
      case 'typography': return <TypographySection />;
      case 'spacing':    return <SpacingSection />;
      case 'buttons':    return <ButtonsSection />;
      case 'badges':     return <BadgesSection />;
      case 'inputs':     return <InputsSection />;
      case 'switches':   return <SwitchesSection />;
      case 'cards':      return <CardsSection />;
      case 'code':       return <CodeSection />;
      case 'icons':      return <IconsSection />;
      default:           return null;
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* ── Left Nav ── */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-[#0a0e12]">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border/60">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green/10 border border-brand-green/20">
            <Code className="h-3.5 w-3.5 text-brand-green" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground leading-none">Dev Specs</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Mitra Design System</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_SECTIONS.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer text-left',
                  active
                    ? 'bg-brand-green/10 text-brand-green font-semibold border border-brand-green/20'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
                {active && <ChevronRight className="h-3 w-3 ml-auto shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/60 p-3">
          <button
            onClick={onClose}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Back to app
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-border/60 bg-[#0a0e12] px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isDevComponentId(activeSection) ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSection('components')}
                  className="transition-colors hover:text-foreground cursor-pointer"
                >
                  Components
                </button>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-medium">
                  {DEV_COMPONENTS.find((c) => c.id === activeSection)?.name}
                </span>
              </>
            ) : (
              <span className="text-foreground font-medium">
                {NAV_SECTIONS.find((s) => s.id === activeSection)?.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px] gap-1 border-brand-green/20 text-brand-green/80">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />
              v1.4.3
            </Badge>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable section */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="max-w-3xl mx-auto px-8 py-10">
            {renderSection()}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// Keep the DevModeToggle export so nothing breaks
interface DevModeToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}
export function DevModeToggle({ isEnabled, onToggle }: DevModeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'fixed bottom-6 right-[172px] z-[9000] px-3.5 py-2 rounded-full border text-xs font-semibold tracking-wide flex items-center gap-2 cursor-pointer shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95',
        isEnabled
          ? 'bg-primary border-brand-green text-zinc-950 shadow-[0_0_20px_rgba(50,215,75,0.45)]'
          : 'bg-zinc-900/90 border-white/[0.08] text-zinc-400 hover:text-white',
      )}
    >
      <Code className={cn('h-3.5 w-3.5', isEnabled ? 'animate-pulse' : '')} />
      <span>{isEnabled ? 'Dev Mode: ON' : 'Dev Mode: OFF'}</span>
    </button>
  );
}
