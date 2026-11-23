import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import {
  ArrowUp,
  Bell,
  Check,
  Headset,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Package,
  Search,
  Server,
  Shield,
  Sparkles,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { IlluminaiteLogo } from '../IlluminaiteLogo';
import { cn } from '@/lib/utils';

const EMAIL = 'alex.morgan@acme.com';
const PASSWORD_LEN = 11;
const ASK = 'Build a vendor intake app with a risk checklist';
const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/* Sample portal data (illustrative)                                   */
/* ------------------------------------------------------------------ */

type Tone = 'build' | 'review' | 'done' | 'draft';

interface Activity {
  text: string;
  when: string;
  tone: Tone;
}
interface Build {
  name: string;
  stage: string;
  pct: number;
}
interface Category {
  key: string;
  label: string;
  icon: LucideIcon;
  pending: number;
  activity: Activity[];
  builds: Build[];
}

const CATEGORIES: Category[] = [
  {
    key: 'itsm',
    label: 'ITSM',
    icon: Headset,
    pending: 3,
    activity: [
      { text: 'Incident triage flow moved to Test', when: '2m', tone: 'build' },
      { text: 'Major incident runbook drafted', when: '14m', tone: 'draft' },
      { text: 'Assignment rules approved by M. Chen', when: '1h', tone: 'done' },
      { text: 'SLA definitions need your review', when: '3h', tone: 'review' },
    ],
    builds: [
      { name: 'Incident triage', stage: 'Test', pct: 62 },
      { name: 'Change approval flow', stage: 'Develop', pct: 38 },
      { name: 'Knowledge article agent', stage: 'Define', pct: 18 },
    ],
  },
  {
    key: 'itom',
    label: 'ITOM',
    icon: Server,
    pending: 1,
    activity: [
      { text: 'Event rules mapped to 24 services', when: '6m', tone: 'build' },
      { text: 'Discovery schedule sent for review', when: '32m', tone: 'review' },
      { text: 'Alert enrichment flow published', when: '2h', tone: 'done' },
      { text: 'CMDB health report drafted', when: '5h', tone: 'draft' },
    ],
    builds: [
      { name: 'Alert enrichment', stage: 'Deploy', pct: 92 },
      { name: 'Service mapping', stage: 'Develop', pct: 47 },
      { name: 'Runbook automation', stage: 'Define', pct: 22 },
    ],
  },
  {
    key: 'itam',
    label: 'ITAM',
    icon: Package,
    pending: 2,
    activity: [
      { text: 'Asset intake catalog item published', when: '9m', tone: 'done' },
      { text: 'Software licence report drafted', when: '41m', tone: 'draft' },
      { text: 'Hardware refresh workflow in Test', when: '2h', tone: 'build' },
      { text: 'Disposal approval rules need review', when: '4h', tone: 'review' },
    ],
    builds: [
      { name: 'Asset intake', stage: 'Deploy', pct: 88 },
      { name: 'Hardware refresh', stage: 'Test', pct: 58 },
      { name: 'Licence tracker', stage: 'Develop', pct: 34 },
    ],
  },
  {
    key: 'hrsd',
    label: 'HRSD',
    icon: Users,
    pending: 4,
    activity: [
      { text: 'Employee onboarding app awaiting approval', when: '4m', tone: 'review' },
      { text: 'Offboarding task template generated', when: '27m', tone: 'draft' },
      { text: 'HR case routing moved to Develop', when: '1h', tone: 'build' },
      { text: 'Benefits request form approved', when: '3h', tone: 'done' },
    ],
    builds: [
      { name: 'Employee onboarding', stage: 'Document', pct: 81 },
      { name: 'Offboarding', stage: 'Develop', pct: 44 },
      { name: 'HR case routing', stage: 'Develop', pct: 36 },
    ],
  },
  {
    key: 'csm',
    label: 'CSM',
    icon: Wrench,
    pending: 2,
    activity: [
      { text: 'Case routing rules moved to Test', when: '11m', tone: 'build' },
      { text: 'SLA escalation flow approved', when: '58m', tone: 'done' },
      { text: 'Customer portal page drafted', when: '2h', tone: 'draft' },
      { text: 'Entitlement checks need your review', when: '6h', tone: 'review' },
    ],
    builds: [
      { name: 'Case routing', stage: 'Test', pct: 66 },
      { name: 'SLA escalation', stage: 'Deploy', pct: 90 },
      { name: 'Customer portal', stage: 'Define', pct: 24 },
    ],
  },
  {
    key: 'secops',
    label: 'SecOps',
    icon: Shield,
    pending: 5,
    activity: [
      { text: 'Access review process built', when: '7m', tone: 'done' },
      { text: 'Vulnerability response flow in Develop', when: '36m', tone: 'build' },
      { text: 'Audit trail report generated', when: '2h', tone: 'draft' },
      { text: 'Exception policy sent for sign-off', when: '5h', tone: 'review' },
    ],
    builds: [
      { name: 'Access reviews', stage: 'Deploy', pct: 95 },
      { name: 'Vulnerability response', stage: 'Develop', pct: 41 },
      { name: 'Exception handling', stage: 'Define', pct: 15 },
    ],
  },
];

const TONE: Record<Tone, { label: string; cls: string }> = {
  build: { label: 'Building', cls: 'bg-brand-green/15 text-brand-green' },
  review: { label: 'Review', cls: 'bg-muted text-foreground' },
  done: { label: 'Approved', cls: 'bg-brand-green/15 text-brand-green' },
  draft: { label: 'Drafted', cls: 'bg-muted text-muted-foreground' },
};

/* ------------------------------------------------------------------ */
/* Login: wave field                                                   */
/* ------------------------------------------------------------------ */

const WAVES = [
  { amp: 26, base: 150, phase: 0, dur: 18, opacity: 0.6, w: 1.4, fill: true },
  { amp: 18, base: 172, phase: 1.2, dur: 26, opacity: 0.42, w: 1.2, fill: false },
  { amp: 34, base: 128, phase: 2.4, dur: 32, opacity: 0.3, w: 1.2, fill: false },
  { amp: 14, base: 192, phase: 3.6, dur: 14, opacity: 0.5, w: 1, fill: false },
  { amp: 22, base: 108, phase: 4.8, dur: 40, opacity: 0.22, w: 1, fill: false },
];
const PERIOD = 800;

function wavePath(amp: number, base: number, phase: number, closed: boolean): string {
  const pts: string[] = [];
  for (let x = 0; x <= 2400; x += 20) {
    const y = base + amp * Math.sin((x / PERIOD) * Math.PI * 2 + phase);
    pts.push(`${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`);
  }
  return closed ? `${pts.join('')}L2400 300L0 300Z` : pts.join('');
}

const DOTS = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37 + 8) % 96}%`,
  top: `${(i * 53 + 12) % 80}%`,
  size: 2 + (i % 3),
  delay: (i % 7) * 0.7,
  dur: 5 + (i % 5),
}));

function WaveField() {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, color-mix(in srgb, var(--color-foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--color-foreground) 6%, transparent) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 70% 65% at 50% 45%, black, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 45%, black, transparent 78%)',
        }}
      />
      <div
        className="absolute left-1/2 top-[38%] h-[26rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-green blur-[130px]"
        style={{ opacity: 0.13 }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[58%] overflow-hidden">
        {WAVES.map((w, i) => (
          <motion.svg
            key={i}
            width={2400}
            height={300}
            viewBox="0 0 2400 300"
            className="absolute bottom-0 left-0"
            style={{ opacity: w.opacity }}
            animate={reduce ? undefined : { x: [0, -PERIOD] }}
            transition={{ duration: w.dur, repeat: Infinity, ease: 'linear' }}
          >
            <defs>
              <linearGradient id={`wave-s-${i}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="2400" y2="0">
                <stop offset="0" stopColor="var(--color-brand-green)" stopOpacity="0" />
                <stop offset="0.5" stopColor="var(--color-brand-green)" stopOpacity="1" />
                <stop offset="1" stopColor="var(--color-brand-green)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`wave-f-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--color-brand-green)" stopOpacity="0.1" />
                <stop offset="1" stopColor="var(--color-brand-green)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {w.fill && <path d={wavePath(w.amp, w.base, w.phase, true)} fill={`url(#wave-f-${i})`} />}
            <path d={wavePath(w.amp, w.base, w.phase, false)} fill="none" stroke={`url(#wave-s-${i})`} strokeWidth={w.w} />
          </motion.svg>
        ))}
      </div>
      {DOTS.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-brand-green"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size }}
          animate={reduce ? { opacity: 0.25 } : { opacity: [0, 0.6, 0], y: [0, -26, -52] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Login screen                                                        */
/* ------------------------------------------------------------------ */

function Field({
  label,
  icon: Icon,
  focused,
  children,
  aside,
}: {
  label: string;
  icon: LucideIcon;
  focused: boolean;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
        {aside}
      </div>
      <div
        className={cn(
          'flex h-11 items-center gap-2.5 rounded-lg border bg-mitra-input px-3 text-[14px] transition-colors duration-300',
          focused ? 'border-brand-green/70 ring-4 ring-brand-green/10' : 'border-border',
        )}
      >
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{children}</span>
      </div>
    </div>
  );
}

function Caret() {
  return <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] animate-pulse bg-brand-green" />;
}

function LoginScreen({ emailN, pwN, signing }: { emailN: number; pwN: number; signing: boolean }) {
  const emailFocus = emailN > 0 && emailN < EMAIL.length && pwN === 0;
  const pwFocus = pwN > 0 && !signing;
  return (
    <motion.div
      key="login"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="absolute inset-0 flex items-center justify-center px-4"
    >
      <WaveField />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
        className="relative w-full max-w-[22.5rem] rounded-2xl border border-mitra-border bg-mitra-surface/95 p-6 backdrop-blur-xl"
      >
        <IlluminaiteLogo className="h-[22px] w-auto" />
        <h3 className="mt-6 font-display text-[1.65rem] font-semibold leading-tight tracking-[-0.03em]">Sign in</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">Welcome back. Pick up where your agents left off.</p>

        <div className="mt-5 space-y-3.5">
          <Field label="Work email" icon={Mail} focused={emailFocus}>
            {emailN > 0 ? (
              <>
                {EMAIL.slice(0, emailN)}
                {emailFocus && <Caret />}
              </>
            ) : (
              <span className="text-muted-foreground">you@company.com</span>
            )}
          </Field>
          <Field
            label="Password"
            icon={Lock}
            focused={pwFocus}
            aside={<span className="text-[12px] text-brand-green">Forgot password?</span>}
          >
            {pwN > 0 ? (
              <>
                <span className="tracking-[0.2em]">{'•'.repeat(pwN)}</span>
                {pwFocus && <Caret />}
              </>
            ) : (
              <span className="text-muted-foreground">Enter your password</span>
            )}
          </Field>
        </div>

        <motion.div
          animate={signing ? { scale: 0.975 } : { scale: 1 }}
          transition={{ duration: 0.18 }}
          className="mt-5 flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-green text-[14px] font-semibold text-background"
        >
          {signing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </motion.div>

        <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border text-[14px] font-medium">
          <KeyRound className="h-4 w-4 text-brand-green" aria-hidden /> Continue with SSO
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">Protected by your organisation&apos;s identity provider</p>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Portal                                                              */
/* ------------------------------------------------------------------ */

function Donut({ value }: { value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 88 88" className="h-24 w-24 -rotate-90" aria-hidden>
      <circle cx="44" cy="44" r={r} fill="none" strokeWidth="7" className="stroke-border" />
      <motion.circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        strokeWidth="7"
        strokeLinecap="round"
        className="stroke-brand-green"
        strokeDasharray={c}
        initial={false}
        animate={{ strokeDashoffset: c * (1 - value) }}
        transition={{ duration: 0.9, ease: EASE }}
      />
    </svg>
  );
}

function Card({ title, aside, children, className }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold">{title}</p>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Portal({ cat, ask, asked }: { cat: number; ask: number; asked: boolean }) {
  const c = CATEGORIES[cat];
  const typing = ask > 0 && !asked;
  const approvedShare = [0.57, 0.78, 0.66, 0.5, 0.72, 0.64][cat];
  return (
    <motion.div
      key="portal"
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="absolute inset-0 flex"
    >
      {/* rail */}
      <nav className="hidden w-[10.5rem] shrink-0 flex-col border-r border-border bg-mitra-sidebar p-3 md:flex" aria-hidden>
        <IlluminaiteLogo className="mb-4 ml-1 mt-1 h-[18px] w-auto self-start" />
        <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Workspaces</p>
        <ul className="space-y-0.5">
          {CATEGORIES.map((k, i) => {
            const Icon = k.icon;
            const on = i === cat;
            return (
              <li
                key={k.key}
                className={cn(
                  'relative flex items-center gap-2.5 rounded-md px-2 py-2 text-[13px] transition-colors duration-500',
                  on ? 'bg-brand-green/10 text-foreground' : 'text-muted-foreground',
                )}
              >
                <span className={cn('absolute inset-y-1 left-0 w-0.5 rounded-full bg-brand-green transition-opacity duration-500', on ? 'opacity-100' : 'opacity-0')} />
                <Icon className={cn('h-4 w-4 transition-colors duration-500', on && 'text-brand-green')} />
                <span className="flex-1">{k.label}</span>
                <span className="rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">{k.pending}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto flex items-center gap-2 px-1 pt-3">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-[11px] font-semibold">AM</span>
          <span className="text-[12px] text-muted-foreground">Alex Morgan</span>
        </div>
      </nav>

      {/* main */}
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
          <div className="flex gap-1 md:hidden" aria-hidden>
            {CATEGORIES.map((k, i) => (
              <span
                key={k.key}
                className={cn('rounded-md px-2 py-1 font-mono text-[10px] transition-colors', i === cat ? 'bg-brand-green/15 text-brand-green' : 'text-muted-foreground')}
              >
                {k.label}
              </span>
            ))}
          </div>
          <p className="hidden text-[12px] text-muted-foreground md:block">
            Workspace <span className="px-1">/</span> <span className="text-foreground">{c.label}</span>
          </p>
          <div className="flex items-center gap-3 text-muted-foreground" aria-hidden>
            <span className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-brand-green" />
            </span>
          </div>
        </div>

        <div className="space-y-5 p-5 md:p-6">
          <div>
            <h3 className="flex items-center gap-2 font-display text-[clamp(1.3rem,2.4vw,1.9rem)] font-semibold tracking-[-0.03em]">
              <Sparkles className="h-5 w-5 text-brand-green" aria-hidden />
              Good morning, Alex. Let&apos;s get to work.
            </h3>
            <div
              className={cn(
                'mt-4 flex h-11 items-center gap-3 rounded-xl border bg-mitra-input px-4 text-[14px] transition-colors duration-300',
                typing ? 'border-brand-green/60 ring-4 ring-brand-green/10' : 'border-border',
              )}
            >
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                {ask > 0 ? (
                  <>
                    {asked ? ASK : ASK.slice(0, ask)}
                    {typing && <Caret />}
                  </>
                ) : (
                  <span className="text-muted-foreground">Ask IlluminAIte, &ldquo;What is waiting on my approval?&rdquo;</span>
                )}
              </span>
              <span className={cn('grid h-7 w-7 place-items-center rounded-full transition-colors duration-300', asked || ask === ASK.length ? 'bg-brand-green text-background' : 'bg-muted text-muted-foreground')}>
                <ArrowUp className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2" aria-hidden>
              {['Review pending approvals', 'Show builds in progress', 'Summarise this week'].map((t) => (
                <span key={t} className="rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr_0.8fr]">
            <Card title="Recent activity" aside={<span className="text-[11px] text-brand-green">View all</span>}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.ul
                  key={c.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="space-y-2.5"
                >
                  {c.activity.map((a, i) => (
                    <motion.li
                      key={a.text}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.07, duration: 0.35 }}
                      className="flex items-start gap-2.5"
                    >
                      <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', a.tone === 'review' ? 'bg-foreground' : 'bg-brand-green')} />
                      <span className="min-w-0 flex-1 text-[12.5px] leading-snug">{a.text}</span>
                      <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px]', TONE[a.tone].cls)}>{TONE[a.tone].label}</span>
                      <span className="w-6 shrink-0 text-right font-mono text-[10px] text-muted-foreground">{a.when}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </Card>

            <Card title="Builds in progress" className="hidden md:block">
              <AnimatePresence mode="wait" initial={false}>
                <motion.ul
                  key={c.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3.5"
                >
                  {c.builds.map((b, i) => (
                    <li key={b.name}>
                      <div className="flex items-baseline justify-between text-[12.5px]">
                        <span className="font-medium">{b.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{b.stage}</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
                        <motion.div
                          className="h-full rounded-full bg-brand-green"
                          initial={{ width: 0 }}
                          animate={{ width: `${b.pct}%` }}
                          transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: EASE }}
                        />
                      </div>
                    </li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </Card>

            <Card title="Approvals" className="hidden lg:block">
              <div className="relative flex items-center justify-center">
                <Donut value={approvedShare} />
                <div className="absolute text-center">
                  <p className="font-display text-xl font-semibold leading-none tracking-[-0.03em]">{c.pending}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">waiting</p>
                </div>
              </div>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">{Math.round(approvedShare * 100)}% of stages approved</p>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
            <Card title="Waiting on you" aside={<span className="font-mono text-[10px] text-muted-foreground">{c.pending} items</span>}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.ul
                  key={c.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="space-y-2"
                >
                  {c.builds.map((b) => {
                    const Icon = c.icon;
                    return (
                      <li key={b.name} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted text-brand-green">
                          <Icon className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-medium">{b.name}</span>
                          <span className="block text-[11px] text-muted-foreground">{b.stage} stage ready for approval</span>
                        </span>
                        <span className="rounded-md bg-brand-green px-2.5 py-1 text-[11px] font-semibold text-background">Review</span>
                      </li>
                    );
                  })}
                </motion.ul>
              </AnimatePresence>
            </Card>

            <Card title="This week" className="hidden md:block">
              <dl className="space-y-3">
                {[
                  ['Builds shipped', [4, 2, 3, 5, 3, 6][cat]],
                  ['Approvals given', [11, 6, 8, 14, 9, 17][cat]],
                  ['Skills run', [38, 21, 27, 45, 30, 52][cat]],
                ].map(([label, n]) => (
                  <div key={label as string} className="flex items-baseline justify-between border-b border-border pb-2.5 last:border-b-0 last:pb-0">
                    <dt className="text-[12.5px] text-muted-foreground">{label}</dt>
                    <dd className="font-display text-xl font-semibold tabular-nums tracking-[-0.03em]">{n}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>

        <AnimatePresence>
          {asked && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="absolute bottom-4 right-4 flex items-center gap-3 rounded-xl border border-brand-green/40 bg-mitra-surface px-4 py-3 text-[13px]"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-green text-background">
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">Plan ready</span>
                <span className="block text-[12px] text-muted-foreground">6 tasks queued for your review</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Scripted sequence                                                   */
/* ------------------------------------------------------------------ */

/**
 * Showcase loop: a sign-in screen over animated waves (email and password type themselves),
 * then a ServiceNow-style workspace that moves through ITSM, ITOM, ITAM, HRSD, CSM and SecOps,
 * each with its own recent activity, and finally an ask that returns a ready plan. Sample data.
 */
export function PortalDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.35 });
  const [stage, setStage] = useState<'login' | 'portal'>('login');
  const [emailN, setEmailN] = useState(0);
  const [pwN, setPwN] = useState(0);
  const [signing, setSigning] = useState(false);
  const [cat, setCat] = useState(0);
  const [ask, setAsk] = useState(0);
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage('portal');
      setAsk(ASK.length);
      setAsked(true);
      return;
    }
    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) => setTimeout(() => (cancelled ? reject(new Error('cancelled')) : resolve()), ms));
    const run = async () => {
      try {
        for (;;) {
          setStage('login');
          setEmailN(0);
          setPwN(0);
          setSigning(false);
          setCat(0);
          setAsk(0);
          setAsked(false);
          await wait(1500);
          for (let i = 1; i <= EMAIL.length; i++) {
            setEmailN(i);
            await wait(46);
          }
          await wait(380);
          for (let i = 1; i <= PASSWORD_LEN; i++) {
            setPwN(i);
            await wait(70);
          }
          await wait(500);
          setSigning(true);
          await wait(1300);
          setStage('portal');
          await wait(1500);
          for (let i = 0; i < CATEGORIES.length; i++) {
            setCat(i);
            await wait(2300);
          }
          setCat(0);
          await wait(900);
          for (let i = 1; i <= ASK.length; i++) {
            setAsk(i);
            await wait(32);
          }
          await wait(450);
          setAsked(true);
          await wait(4200);
        }
      } catch {
        /* cancelled */
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [inView]);

  return (
    <div
      ref={rootRef}
      className="relative h-[clamp(34rem,84dvh,47rem)] overflow-hidden text-foreground"
      role="img"
      aria-label="Animated demo: signing in to IlluminAIte and browsing the ITSM, ITOM, ITAM, HRSD, CSM and SecOps workspaces"
    >
      <AnimatePresence mode="wait" initial={false}>
        {stage === 'login' ? (
          <LoginScreen key="login" emailN={emailN} pwN={pwN} signing={signing} />
        ) : (
          <Portal key="portal" cat={cat} ask={ask} asked={asked} />
        )}
      </AnimatePresence>
      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
        Sample data
      </p>
    </div>
  );
}
