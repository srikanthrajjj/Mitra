import { useState, useEffect, useRef } from 'react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';
import {
  Users,
  Code2,
  MessageSquare,
  Zap,
  TrendingUp,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
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
  description?: string;
}

const EXECUTIVE_STATS: StatCard[] = [
  { label: 'Total Active Users', value: 247, change: '+12% vs last month', changeUp: true, icon: Users, description: 'Across all ServiceNow instances' },
  { label: 'Monthly Active Developers', value: 89, change: '+8% vs last month', changeUp: true, icon: Code2, description: 'Building with Mitra this month' },
  { label: 'Total Conversations', value: 1842, change: '+23% vs last month', changeUp: true, icon: MessageSquare, description: 'AI-assisted sessions' },
  { label: 'Estimated Hours Saved', value: 342, suffix: 'hrs', change: '+18% vs last month', changeUp: true, icon: Clock, description: 'Time saved on development tasks' },
];

const PRODUCTIVITY_STATS: StatCard[] = [
  { label: 'Avg Response Time', value: 2.3, suffix: 's', change: '-15% vs last month', changeUp: true, icon: Activity, description: 'Faster than last month' },
  { label: 'Tasks Completed', value: 1247, change: '+31% vs last month', changeUp: true, icon: TrendingUp, description: 'Workflow tasks automated' },
  { label: 'Code Generations', value: 856, change: '+22% vs last month', changeUp: true, icon: Code2, description: 'Scripts & business rules created' },
  { label: 'Skills Executed', value: 423, change: '+45% vs last month', changeUp: true, icon: Zap, description: 'Reusable skill invocations' },
];

const TOKEN_STATS: StatCard[] = [
  { label: 'Total Tokens Used', value: 2.4, suffix: 'M', change: '+18% vs last month', changeUp: true, icon: Zap, description: 'Across all conversations' },
  { label: 'Avg Tokens/Conversation', value: 1247, change: '-5% vs last month', changeUp: true, icon: MessageSquare, description: 'More efficient prompts' },
  { label: 'Estimated Cost', value: 84, prefix: '$', change: '+12% vs last month', changeUp: false, icon: TrendingUp, description: 'Monthly AI spend' },
  { label: 'Cache Hit Rate', value: 67, suffix: '%', change: '+8% vs last month', changeUp: true, icon: Activity, description: 'Reduced redundant calls' },
];

const QUALITY_STATS: StatCard[] = [
  { label: 'Success Rate', value: 94, suffix: '%', change: '+2% vs last month', changeUp: true, icon: Activity, description: 'Tasks completed without errors' },
  { label: 'Error Rate', value: 2.1, suffix: '%', change: '-0.5% vs last month', changeUp: true, icon: Activity, description: 'Failed task attempts' },
  { label: 'Avg Quality Score', value: 8.7, suffix: '/10', change: '+0.3 vs last month', changeUp: true, icon: TrendingUp, description: 'Based on user feedback' },
  { label: 'User Satisfaction', value: 92, suffix: '%', change: '+4% vs last month', changeUp: true, icon: Users, description: 'Positive ratings received' },
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
  { label: 'Incident Management', value: 32, count: 589 },
  { label: 'Catalog Item Creation', value: 24, count: 442 },
  { label: 'Workflow Automation', value: 21, count: 387 },
  { label: 'Script Development', value: 15, count: 276 },
  { label: 'Knowledge Articles', value: 8, count: 148 },
];

const WEEKLY_DATA = [
  { day: 'Mon', conversations: 245, label: '245 chats' },
  { day: 'Tue', conversations: 312, label: '312 chats' },
  { day: 'Wed', conversations: 287, label: '287 chats' },
  { day: 'Thu', conversations: 356, label: '356 chats' },
  { day: 'Fri', conversations: 198, label: '198 chats' },
  { day: 'Sat', conversations: 89, label: '89 chats' },
  { day: 'Sun', conversations: 65, label: '65 chats' },
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

function HorizontalBarChart({ data, isDark }: { data: typeof USE_CASE_DATA; isDark: boolean }) {
  return (
    <div className="space-y-2.5">
      {data.map((item, idx) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">{item.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground">{item.count.toLocaleString()}</span>
              <span className="font-medium text-foreground">{item.value}%</span>
            </div>
          </div>
          <div className={cn('h-1.5 overflow-hidden rounded-full', isDark ? 'bg-mitra-surface' : 'bg-muted')}>
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
        {[0, 1, 2, 3, 4].map((i) => (
          <text key={i} x="-5" y={120 - i * 30 + 3} textAnchor="end" fill="currentColor" fontSize="5" className="text-muted-foreground">
            {Math.round((maxUsers / 4) * i)}
          </text>
        ))}
        <path
          d={`M ${data.map((d, i) => `${(i / (data.length - 1)) * 400},${120 - (d.users / maxUsers) * 100}`).join(' L ')} L 400,120 L 0,120 Z`}
          fill="url(#area-fill)"
        />
        <path
          d={`M ${data.map((d, i) => `${(i / (data.length - 1)) * 400},${120 - (d.users / maxUsers) * 100}`).join(' L ')}`}
          fill="none"
          stroke="url(#area-stroke)"
          strokeWidth="1.5"
        />
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={(i / (data.length - 1)) * 400}
              cy={120 - (d.users / maxUsers) * 100}
              r="2"
              fill={brandGreen}
              stroke={dotStroke}
              strokeWidth="1.5"
            />
            <text
              x={(i / (data.length - 1)) * 400}
              y={120 - (d.users / maxUsers) * 100 - 5}
              textAnchor="middle"
              fill="currentColor"
              fontSize="5"
              className="text-muted-foreground"
            >
              {d.users}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d) => (
          <span key={d.month} className="text-[7px] text-muted-foreground">{d.month}</span>
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
        {[0, 1, 2, 3, 4].map((i) => (
          <text key={i} x="-5" y={100 - i * 25 + 3} textAnchor="end" fill="currentColor" fontSize="5" className="text-muted-foreground">
            {((maxTokens / 4) * i).toFixed(1)}M
          </text>
        ))}
        <path
          d={`M ${data.map((d, i) => `${(i / (data.length - 1)) * 400},${100 - (d.tokens / maxTokens) * 80}`).join(' L ')}`}
          fill="none"
          stroke="url(#token-stroke)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={(i / (data.length - 1)) * 400}
              cy={100 - (d.tokens / maxTokens) * 80}
              r="2"
              fill={tokenColor}
              stroke={dotStroke}
              strokeWidth="1.5"
            />
            <text
              x={(i / (data.length - 1)) * 400}
              y={100 - (d.tokens / maxTokens) * 80 - 5}
              textAnchor="middle"
              fill="currentColor"
              fontSize="5"
              className="text-muted-foreground"
            >
              {d.tokens}M
            </text>
          </g>
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d) => (
          <span key={d.month} className="text-[7px] text-muted-foreground">{d.month}</span>
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
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Tabs */}
          <div className="flex min-w-0 gap-0.5 rounded-lg border border-mitra-border p-0.5">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex min-w-0 flex-1 items-center justify-center rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                  activeTab === tab
                    ? 'bg-brand-green/10 text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span className="truncate">{tab}</span>
              </button>
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
                      {stat.changeUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
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
                    {stat.description && (
                      <p className="mt-1 text-[10px] text-muted-foreground/60">
                        {stat.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3">
                <h3 className="text-xs font-semibold text-foreground">
                  Active Users Over Time
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Monthly unique users across all ServiceNow instances
                </p>
              </div>
              <AreaChart data={MONTHLY_DATA} isDark={isDark} />
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3">
                <h3 className="text-xs font-semibold text-foreground">
                  Token Utilization Trend
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  AI tokens consumed per month (in millions)
                </p>
              </div>
              <LineChart data={MONTHLY_DATA} isDark={isDark} />
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3">
                <h3 className="text-xs font-semibold text-foreground">
                  Top Use Cases
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Most common ServiceNow tasks assisted by Mitra
                </p>
              </div>
              <HorizontalBarChart data={USE_CASE_DATA} isDark={isDark} />
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3">
                <h3 className="text-xs font-semibold text-foreground">
                  Conversations by Day
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Weekly chat volume pattern
                </p>
              </div>
              <div className="space-y-1.5">
                {WEEKLY_DATA.map((d) => (
                  <div key={d.day} className="flex items-center gap-2">
                    <span className="w-7 text-[9px] text-muted-foreground text-right">{d.day}</span>
                    <div className="flex-1 h-5 rounded bg-muted/50 overflow-hidden">
                      <div
                        className="h-full rounded bg-brand-green/80 transition-all duration-500 flex items-center justify-end pr-1.5"
                        style={{ width: `${(d.conversations / 356) * 100}%` }}
                      >
                        <span className="text-[8px] font-medium text-foreground/80">{d.conversations}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
