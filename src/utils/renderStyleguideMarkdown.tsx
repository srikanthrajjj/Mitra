import { Fragment, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { resolveStyleguideLink } from './styleguideContent';

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; lang: string; text: string }
  | { type: 'table'; rows: string[][] }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'blockquote'; text: string }
  | { type: 'hr' };

function parseInline(
  text: string,
  onSectionLink?: (sectionId: string) => void,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={`${match.index}-b`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      nodes.push(
        <code
          key={`${match.index}-c`}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const sectionId = resolveStyleguideLink(href);
        if (sectionId && onSectionLink) {
          nodes.push(
            <button
              key={`${match.index}-l`}
              type="button"
              onClick={() => onSectionLink(sectionId)}
              className="text-primary underline-offset-4 hover:underline"
            >
              {label}
            </button>,
          );
        } else if (href.startsWith('http')) {
          nodes.push(
            <a
              key={`${match.index}-a`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              {label}
            </a>,
          );
        } else {
          nodes.push(label);
        }
      }
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

function splitBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: 'code', lang, text: codeLines.join('\n') });
      i += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] });
      i += 1;
      continue;
    }

    if (/^[-*_]{3,}$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i += 1;
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join('\n') });
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length && /^[|:\-\s]+$/.test(lines[i + 1])) {
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        const cells = lines[i]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        if (!/^[:\-\s|]+$/.test(lines[i])) {
          tableRows.push(cells);
        }
        i += 1;
      }
      if (tableRows.length > 0) {
        blocks.push({ type: 'table', rows: tableRows });
      }
      continue;
    }

    const isOrdered = /^\d+\.\s/.test(line);
    const isUnordered = /^[-*]\s/.test(line);
    if (isOrdered || isUnordered) {
      const items: string[] = [];
      while (i < lines.length) {
        const listLine = lines[i];
        if (isOrdered && /^\d+\.\s/.test(listLine)) {
          items.push(listLine.replace(/^\d+\.\s/, ''));
          i += 1;
        } else if (isUnordered && /^[-*]\s/.test(listLine)) {
          items.push(listLine.replace(/^[-*]\s/, ''));
          i += 1;
        } else if (!listLine.trim()) {
          i += 1;
          break;
        } else {
          break;
        }
      }
      blocks.push({ type: 'list', ordered: isOrdered, items });
      continue;
    }

    const paraLines: string[] = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('```') && !lines[i].startsWith('> ') && !/^[-*]\s/.test(lines[i]) && !/^\d+\.\s/.test(lines[i])) {
      paraLines.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: 'paragraph', text: paraLines.join('\n') });
  }

  return blocks;
}

function renderBlock(block: Block, onSectionLink?: (sectionId: string) => void, key?: string) {
  switch (block.type) {
    case 'heading': {
      const Tag = (`h${Math.min(block.level, 4)}` as 'h1' | 'h2' | 'h3' | 'h4');
      const sizes: Record<number, string> = {
        1: 'text-2xl font-semibold tracking-tight',
        2: 'text-xl font-semibold tracking-tight mt-8 first:mt-0',
        3: 'text-lg font-medium mt-6',
        4: 'text-base font-medium mt-4',
      };
      return (
        <Tag key={key} className={cn(sizes[block.level], 'text-foreground scroll-mt-24')}>
          {parseInline(block.text, onSectionLink)}
        </Tag>
      );
    }
    case 'paragraph':
      return (
        <p key={key} className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {parseInline(block.text, onSectionLink)}
        </p>
      );
    case 'code':
      return (
        <pre
          key={key}
          className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs leading-relaxed"
        >
          <code className="font-mono text-foreground">{block.text}</code>
        </pre>
      );
    case 'table': {
      const [head, ...body] = block.rows;
      return (
        <div key={key} className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {head.map((cell, ci) => (
                  <th key={ci} className="px-3 py-2 font-medium text-foreground">
                    {parseInline(cell, onSectionLink)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className="border-b border-border/60 last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-muted-foreground">
                      {parseInline(cell, onSectionLink)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag
          key={key}
          className={cn(
            'mt-3 space-y-1.5 pl-5 text-sm text-muted-foreground',
            block.ordered ? 'list-decimal' : 'list-disc',
          )}
        >
          {block.items.map((item, ii) => (
            <li key={ii} className="leading-relaxed">
              {parseInline(item, onSectionLink)}
            </li>
          ))}
        </ListTag>
      );
    }
    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="mt-4 border-l-2 border-primary/40 pl-4 text-sm italic text-muted-foreground"
        >
          {parseInline(block.text, onSectionLink)}
        </blockquote>
      );
    case 'hr':
      return <hr key={key} className="my-8 border-border" />;
    default:
      return null;
  }
}

export function StyleguideMarkdown({
  content,
  onSectionLink,
  className,
}: {
  content: string;
  onSectionLink?: (sectionId: string) => void;
  className?: string;
}) {
  const blocks = splitBlocks(content);
  return (
    <div className={cn('styleguide-markdown', className)}>
      {blocks.map((block, index) => (
        <Fragment key={index}>{renderBlock(block, onSectionLink, String(index))}</Fragment>
      ))}
    </div>
  );
}
