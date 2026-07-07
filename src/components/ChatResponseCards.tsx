import React from 'react';
import { Check } from 'lucide-react';
import { parseInlineMarkdown } from '../utils/markdownInline';

export function stripMarkdownLabel(text: string): string {
  return text.replace(/\*\*|`|_/g, '').trim();
}

export function ActionPillList({
  items,
  isDark,
  numbered = false,
  disabled = false,
  selectedItem,
  onSelect,
  renderLabel,
}: {
  items: { text: string; raw: string }[];
  isDark: boolean;
  numbered?: boolean;
  disabled?: boolean;
  selectedItem?: string;
  onSelect: (raw: string) => void;
  renderLabel: (text: string) => React.ReactNode;
}) {
  const anySelected = selectedItem !== undefined;

  return (
    <div className="flex flex-col gap-2 mt-1">
      {items.map((item, i) => {
        const isSelected = selectedItem === item.raw;
        return (
          <button
            key={`${item.raw}-${i}`}
            type="button"
            disabled={disabled || (anySelected && !isSelected)}
            title={stripMarkdownLabel(item.text)}
            onClick={() => onSelect(item.raw)}
            className={`w-full text-left inline-flex items-start gap-3 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-all duration-200 disabled:cursor-not-allowed ${
              isSelected
                ? isDark
                  ? 'bg-brand-green/15 border-brand-green/40 text-brand-green shadow-[0_0_14px_rgba(50,215,75,0.18)]'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                : anySelected
                  ? isDark
                    ? 'bg-mitra-surface/30 border-white/[0.04] text-slate-600 opacity-40'
                    : 'bg-slate-50 border-slate-100 text-slate-400 opacity-40'
                  : isDark
                    ? 'bg-mitra-surface/60 border-white/[0.1] text-slate-200 hover:bg-mitra-highlight hover:border-brand-green/35 hover:text-white hover:shadow-[0_0_12px_rgba(50,215,75,0.12)] cursor-pointer active:scale-[0.99]'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md cursor-pointer active:scale-[0.99]'
            }`}
          >
            {numbered ? (
              isSelected ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <span
                  className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 ${
                    isDark
                      ? 'bg-brand-green/15 text-brand-green border border-brand-green/30'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {i + 1}
                </span>
              )
            ) : isSelected ? (
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${
                  isDark ? 'bg-brand-green/70' : 'bg-emerald-500'
                }`}
              />
            )}
            <span className="leading-snug">{renderLabel(item.text)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SimpleFacts({
  items,
  isDark,
}: {
  items: { key: string; value: string }[];
  isDark: boolean;
}) {
  return (
    <p className={`text-[13px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
      {items.map((item) => item.value).join(' ')}
    </p>
  );
}

export function BulletList({
  items,
  isDark,
  renderItem,
}: {
  items: string[];
  isDark: boolean;
  renderItem: (text: string) => React.ReactNode;
}) {
  return (
    <ul className={`space-y-1 list-disc pl-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
      {items.map((item, i) => (
        <li key={i} className="text-[13px] leading-relaxed">
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

export function SimpleTaskList({
  items,
  isDark,
}: {
  items: { text: string; done?: boolean }[];
  isDark: boolean;
}) {
  return (
    <ol className={`space-y-0.5 list-none ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
      {items.map((item, i) => (
        <li key={i} className={`text-[13px] leading-snug flex gap-2 ${item.done ? 'opacity-50 line-through' : ''}`}>
          <span className={`shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{i + 1}.</span>
          <span>{item.text}</span>
        </li>
      ))}
    </ol>
  );
}

export function SimpleNext({
  children,
  isDark,
}: {
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <p className={`text-[13px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
      {children}
    </p>
  );
}

export function SectionLabel({
  children,
  isDark,
}: {
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <p className={`text-[12px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
      {children}
    </p>
  );
}

export function DataTable({
  headers,
  rows,
  isDark,
}: {
  headers: string[];
  rows: string[][];
  isDark: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white/80 dark:border-white/[0.06] dark:bg-white/[0.015]">
      <table className="w-full text-left text-[12px]">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/[0.06]">
            {headers.map((h, i) => (
              <th
                key={i}
                className="whitespace-nowrap px-3 py-1.5 font-semibold text-slate-600 dark:text-slate-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-slate-100 last:border-0 dark:border-white/[0.04]"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-3 py-1.5 align-top text-slate-800 dark:text-slate-200"
                >
                  {parseInlineMarkdown(cell, isDark)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QuoteBlock({
  children,
  isDark,
}: {
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <blockquote
      className={`border-l-2 pl-3 text-[13px] leading-relaxed ${
        isDark ? 'border-white/15 text-slate-400' : 'border-slate-300 text-slate-500'
      }`}
    >
      {children}
    </blockquote>
  );
}

export function ActionChip({
  label,
  value,
  isDark,
}: {
  label: string;
  value: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <span className={`text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
      <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{label}: </span>
      {value}
    </span>
  );
}

// Legacy exports kept for compatibility
export function SummaryGrid({ rows, isDark }: { rows: { key: string; value: string }[]; isDark: boolean }) {
  return <SimpleFacts items={rows} isDark={isDark} />;
}

export function GroupPanel({ title, children, isDark }: { title: React.ReactNode; children: React.ReactNode; isDark: boolean }) {
  const t = String(title).toLowerCase();
  if (t === 'summary' || t === 'your tasks') return <>{children}</>;
  return (
    <div className="space-y-1.5">
      <SectionLabel isDark={isDark}>{title}</SectionLabel>
      {children}
    </div>
  );
}

export function NextStepBanner({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return <SimpleNext isDark={isDark}>{children}</SimpleNext>;
}

export function VerticalStepper({
  items,
  isDark,
  renderLabel,
}: {
  items: { text: string; raw: string; done: boolean }[];
  isDark: boolean;
  disabled?: boolean;
  onStepClick?: (raw: string) => void;
  renderLabel: (text: string) => React.ReactNode;
}) {
  return (
    <SimpleTaskList
      isDark={isDark}
      items={items.map((item) => ({
        text: String(renderLabel(item.text)),
        done: item.done,
      }))}
    />
  );
}

export function StatusList({
  items,
  isDark,
}: {
  items: { label: string; status: string }[];
  isDark: boolean;
}) {
  return (
    <SimpleFacts
      isDark={isDark}
      items={items.map((i) => ({ key: i.label, value: i.status }))}
    />
  );
}

export function ActionCard({
  children,
  onClick,
  disabled,
  isDark,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isDark: boolean;
}) {
  const className = `text-left text-[13px] ${isDark ? 'text-slate-300 hover:text-slate-100' : 'text-slate-600 hover:text-slate-900'} ${disabled ? 'opacity-40' : ''} ${onClick ? 'cursor-pointer' : ''}`;

  if (onClick) {
    return (
      <button type="button" disabled={disabled} onClick={onClick} className={className}>
        · {children}
      </button>
    );
  }
  return <div className={className}>{children}</div>;
}

export function TaskRow({
  index,
  label,
  done,
  onClick,
  disabled,
  isDark,
}: {
  index: number;
  label: React.ReactNode;
  done?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  isDark: boolean;
}) {
  const content = (
    <span className={`text-[13px] flex gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'} ${done ? 'line-through opacity-50' : ''}`}>
      <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{index}.</span>
      {label}
    </span>
  );
  if (onClick && !done) {
    return (
      <button type="button" disabled={disabled} onClick={onClick} className="text-left">
        {content}
      </button>
    );
  }
  return content;
}
