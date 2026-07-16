import { useState, useEffect, useRef } from 'react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';
import { Button } from '@/src/components/ui/button';
import {
  Users,
  Code2,
  MessageSquare,
  Zap,
  TrendingUp,
  Clock,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardViewProps {
  theme: Theme;
}

const TABS = [
  'Executive Adoption & ROI',
  'Developer Productivity',
  'AI Token Utilization & Model Analytics',
  'Quality, Reliability & Improvement',
] as const;

type TabId = typeof TABS[number];

interface StatCard {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  change: string;
  changeUp: boolean;
  icon: React.ElementType;
}

const EXECUTIVE_STATS: StatCard[] = [
  { label: 'Total Active Users', value: 247, change: '+12% vs last month', changeUp: true, icon: Users },
  { label: 'Monthly Active Developers', value: 89, change: '+8% vs last month', changeUp: true, icon: Code2 },
  { label: 'Total Conversations', value: 1842, change: '+23% vs last month', changeUp: true, icon: MessageSquare },
  { label: 'Estimated Hours Saved', value: 342, suffix: 'hrs', change: '+18% vs last month', changeUp: true, icon: Clock },
];

const PRODUCTIVITY_STATS: StatCard[] = [
  { label: 'Avg Response Time', value: 2.3, suffix: 's', change: '-15% vs last month', changeUp: true, icon: Activity },
  { label: 'Tasks Completed', value: 1247, change: '+31% vs last month', changeUp: true, icon: TrendingUp },
  { label: 'Code Generations', value: 856, change: '+22% vs last month', changeUp: true, icon: Code2 },
  { label: 'Skills Executed', value: 423, change: '+45% vs last month', changeUp: true, icon: Zap },
];

const TOKEN_STATS: StatCard[] = [
  { label: 'Total Tokens Used', value: 2.4, suffix: 'M', change: '+18% vs last month', changeUp: true, icon: Zap },
  { label: 'Avg Tokens/Conversation', value: 1247, change: '-5% vs last month', changeUp: true, icon: MessageSquare },
  { label: 'Estimated Cost', value: 84, prefix: '$', change: '+12% vs last month', changeUp: false, icon: TrendingUp },
  { label: 'Cache Hit Rate', value: 67, suffix: '%', change: '+8% vs last month', changeUp: true, icon: Activity },
];

const QUALITY_STATS: StatCard[] = [
  { label: 'Success Rate', value: 94, suffix: '%', change: '+2% vs last month', changeUp: true, icon: Activity },
  { label: 'Error Rate', value: 2.1, suffix: '%', change: '-0.5% vs last month', changeUp: true, icon: Activity },
  { label: 'Avg Quality Score', value: 8.7, suffix: '/10', change: '+0.3 vs last month', changeUp: true, icon: TrendingUp },
  { label: 'User Satisfaction', value: 92, suffix: '%', change: '+4% vs last month', changeUp: true, icon: Users },
];

const MONTHLY_DATA = [
  { month: 'Jan', users: 120, conversations: 450, tokens: 0.8 },
  { month: 'Feb', users: 145, conversations: 580, tokens: 1.1 },
  { month: 'Mar', users: 168, conversations: 720, tokens: 1.4 },
  { month: 'Apr', users: 192, conversations: 890, tokens: 1.7 },
  { month: 'May', users: 218, conversations: 1120, tokens: 2.0 },
  { month: 'Jun', users: 247, conversations: 1420, tokens: 2.4 },
];

const USE_CASE_DATA = [
  { label: 'Code Generation', value: 35 },
  { label: 'Documentation', value: 25 },
  { label: 'Troubleshooting', value: 20 },
  { label: 'Architecture', value: 12 },
  { label: 'Testing', value: 8 },
];

function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1500;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(current);
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 },
    );

    if (el) observer.observe(el);
    return () => { observer.disconnect(); };
  }, [value, hasAnimated]);

  const display = value % 1 !== 0 ? count.toFixed(1) : Math.round(count).toLocaleString();

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  );
}

function MiniBarChart({ data, maxVal }: { data: number[]; maxVal: number }) {
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((val, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-brand-green transition-all duration-500"
          style={{
            height: `${(val / maxVal) * 100}%`,
            opacity: 0.4 + (i / data.length) * 0.6,
          }}
        />
      ))}
    </div>
  );
}

function HorizontalBarChart({ data, isDark }: { data: typeof USE_CASE_DATA; isDark: boolean }) {
  return (
    <div className="space-y-3">
      {data.map((item, idx) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium text-foreground">{item.value}%</span>
          </div>
          <div className={cn('h-2 overflow-hidden rounded-full', isDark ? 'bg-mitra-surface' : 'bg-muted')}>
            <div
              className="h-full rounded-full bg-brand-green transition-all duration-700"
              style={{ width: `${item.value}%`, opacity: 1 - idx * 0.15 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartDefs({ gradId, colorVar }: { gradId: string; colorVar: string }) {
  return (
    <defs>
      <linearGradient id={`${gradId}-fill`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={colorVar} stopOpacity="0.3" />
        <stop offset="100%" stopColor={colorVar} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${gradId}-stroke`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={colorVar} stopOpacity="0.5" />
        <stop offset="100%" stopColor={colorVar} stopOpacity="1" />
      </linearGradient>
    </defs>
  );
}

function AreaChart({ data, isDark }: { data: typeof MONTHLY_DATA; isDark: boolean }) {
  const maxUsers = Math.max(...data.map((d) => d.users));
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const dotStroke = isDark ? 'hsl(var(--card))' : 'hsl(var(--card))';
  const brandGreen = 'hsl(88, 65%, 49%)';

  return (
    <div className="relative">
      <svg viewBox="0 0 400 120" className="w-full h-32">
        <ChartDefs gradId="area" colorVar={brandGreen} />
        {[0, 30, 60, 90, 120].map((y) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke={gridColor} strokeWidth="1" />
        ))}
        <path
          d={`M ${data.map((d, i) => `${(i / (data.length - 1)) * 400},${120 - (d.users / maxUsers) * 100}`).join(' L ')} L 400,120 L 0,120 Z`}
          fill="url(#area-fill)"
        />
        <path
          d={`M ${data.map((d, i) => `${(i / (data.length - 1)) * 400},${120 - (d.users / maxUsers) * 100}`).join(' L ')}`}
          fill="none"
          stroke="url(#area-stroke)"
          strokeWidth="2"
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * 400}
            cy={120 - (d.users / maxUsers) * 100}
            r="3"
            fill={brandGreen}
            stroke={dotStroke}
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d) => (
          <span key={d.month} className="text-[10px] text-muted-foreground">{d.month}</span>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data, isDark }: { data: typeof MONTHLY_DATA; isDark: boolean }) {
  const maxTokens = Math.max(...data.map((d) => d.tokens));
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const dotStroke = isDark ? 'hsl(var(--card))' : 'hsl(var(--card))';
  const tokenColor = 'hsl(217, 70%, 60%)';

  return (
    <div className="relative">
      <svg viewBox="0 0 400 100" className="w-full h-28">
        <defs>
          <linearGradient id="token-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={tokenColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={tokenColor} stopOpacity="1" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((y) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke={gridColor} strokeWidth="1" />
        ))}
        <path
          d={`M ${data.map((d, i) => `${(i / (data.length - 1)) * 400},${100 - (d.tokens / maxTokens) * 80}`).join(' L ')}`}
          fill="none"
          stroke="url(#token-stroke)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * 400}
            cy={100 - (d.tokens / maxTokens) * 80}
            r="3"
            fill={tokenColor}
            stroke={dotStroke}
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d) => (
          <span key={d.month} className="text-[10px] text-muted-foreground">{d.month}</span>
        ))}
      </div>
    </div>
  );
}

export default function DashboardView({ theme }: DashboardViewProps) {
  const isDark = isDarkTheme(theme);
  const [activeTab, setActiveTab] = useState<TabId>('Executive Adoption & ROI');

  const stats = activeTab === 'Executive Adoption & ROI'
    ? EXECUTIVE_STATS
    : activeTab === 'Developer Productivity'
      ? PRODUCTIVITY_STATS
      : activeTab === 'AI Token Utilization & Model Analytics'
        ? TOKEN_STATS
        : QUALITY_STATS;

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <div className="shrink-0 px-4 pt-8 md:px-8 lg:px-12 pb-4">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Mitra Insights
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform analytics and usage insights
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <Button
                key={tab}
                type="button"
                variant={activeTab === tab ? 'cta' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  activeTab === tab && 'shadow-sm',
                )}
              >
                {tab}
              </Button>
            ))}
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green/10">
                      <Icon className="h-4 w-4 text-brand-green" />
                    </div>
                    <span className={cn(
                      'flex items-center gap-0.5 text-[11px] font-medium',
                      stat.changeUp ? 'text-brand-green' : 'text-foreground/60',
                    )}>
                      <ArrowUpRight className="h-3 w-3" />
                      {stat.change}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-foreground">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Active Users Over Time
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand-green" />
                  <span className="text-[10px] text-muted-foreground">Users</span>
                </div>
              </div>
              <AreaChart data={MONTHLY_DATA} isDark={isDark} />
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Token Utilization (Millions)
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand-green/60" />
                  <span className="text-[10px] text-muted-foreground">Tokens</span>
                </div>
              </div>
              <LineChart data={MONTHLY_DATA} isDark={isDark} />
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Conversations by Use Case
              </h3>
              <HorizontalBarChart data={USE_CASE_DATA} isDark={isDark} />
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Weekly Activity
              </h3>
              <MiniBarChart data={[65, 78, 82, 91, 74, 88, 95]} maxVal={100} />
              <div className="flex justify-between mt-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <span key={d} className="text-[10px] text-muted-foreground">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
