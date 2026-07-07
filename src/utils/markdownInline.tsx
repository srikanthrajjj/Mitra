import React from 'react';

export function parseInlineMarkdown(text: string, isDark: boolean): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[0].startsWith('**')) {
      parts.push(
        <strong
          key={match.index}
          className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
        >
          {match[2]}
        </strong>,
      );
    } else {
      parts.push(
        <code
          key={match.index}
          className={`rounded px-1 font-mono text-[11px] ${
            isDark ? 'bg-white/5 text-brand-green/90' : 'bg-slate-100 text-emerald-800'
          }`}
        >
          {match[3]}
        </code>,
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : text;
}
