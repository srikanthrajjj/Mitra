export type ResponseBlock =
  | { type: 'title'; text: string; level: 1 | 2 }
  | { type: 'heading'; text: string; level: 3 | 4 }
  | { type: 'summary'; rows: { key: string; value: string }[] }
  | { type: 'section'; title: string; children: ResponseBlock[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'status_list'; items: { label: string; status: string }[] }
  | { type: 'tasks'; items: { text: string; raw: string; done: boolean }[]; selectable?: boolean }
  | { type: 'actions'; items: { text: string; raw: string }[] }
  | { type: 'bullet_list'; items: string[]; selectable?: boolean }
  | { type: 'next'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'facts'; items: { key: string; value: string }[] }
  | { type: 'blockquote'; text: string }
  | { type: 'code'; content: string; language?: string };

function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.startsWith('|') && t.endsWith('|') && t.includes('|');
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .slice(1, -1)
    .split('|')
    .map((c) => c.trim());
}

function isSummaryTable(headers: string[]): boolean {
  const h = headers.map((x) => x.toLowerCase());
  if (h.includes('field') || h.includes('type') || h.includes('label')) return false;
  if (h.includes('column')) return false;
  return (
    (h.includes('item') && h.includes('value')) ||
    (h.includes('key') && h.includes('value'))
  );
}

function isStatusTable(headers: string[]): boolean {
  const h = headers.map((x) => x.toLowerCase());
  return h.includes('artifact') && h.includes('status');
}

function parseTable(lines: string[]): { headers: string[]; rows: string[][] } | null {
  if (lines.length < 2) return null;
  const headers = parseTableRow(lines[0]);
  const rows = lines
    .slice(1)
    .filter((l) => !isTableSeparator(l))
    .map(parseTableRow);
  if (rows.length === 0) return null;
  return { headers, rows };
}

function isArtifactBullet(text: string): boolean {
  const t = text.trim();
  return (
    /^(table|client script|business rule|dictionary|form layout|list view|update set)\b/i.test(t) ||
    /^`/.test(t) ||
    (t.includes('`') && t.length < 72)
  );
}

function shouldRenderAsSelectablePills(items: string[]): boolean {
  if (items.length === 0) return false;
  const artifactLike = items.filter(isArtifactBullet).length;
  return artifactLike < Math.ceil(items.length / 2);
}

function parseListItem(line: string): { kind: 'task' | 'bullet' | 'action' | 'other'; text: string; raw: string; done: boolean } {
  const clean = line.trim();

  const checkboxMatch = clean.match(/^\[[ xX]\]\s+(.+)$/);
  if (checkboxMatch) {
    const text = checkboxMatch[1];
    return {
      kind: 'task',
      text,
      raw: text.replace(/\*\*|`|_/g, '').trim(),
      done: /^\[x\]/i.test(clean),
    };
  }

  const numberedMatch = clean.match(/^(\d+)\.\s+(.+)$/);
  if (numberedMatch) {
    const text = numberedMatch[2];
    return {
      kind: 'task',
      text,
      raw: text.replace(/\*\*|`|_/g, '').trim(),
      done: false,
    };
  }

  const dashBullet = clean.match(/^[-*]\s+(.+)$/);
  if (dashBullet) {
    const text = dashBullet[1];
    return {
      kind: 'bullet',
      text,
      raw: text.replace(/\*\*|`|_/g, '').trim(),
      done: false,
    };
  }

  return { kind: 'other', text: clean, raw: clean, done: false };
}

function parseTextBlocks(text: string): ResponseBlock[] {
  const lines = text.split('\n');
  const blocks: ResponseBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const clean = lines[i].trim();

    if (clean === '') {
      i += 1;
      continue;
    }

    if (clean.startsWith('#### ')) {
      blocks.push({ type: 'heading', text: clean.slice(5), level: 4 });
      i += 1;
      continue;
    }

    if (clean.startsWith('### ')) {
      const sectionTitle = clean.slice(4);
      i += 1;
      const sectionLines: string[] = [];

      while (i < lines.length) {
        const next = lines[i].trim();
        if (next.startsWith('### ') || next.startsWith('## ') || next.startsWith('# ')) break;
        if (next.match(/^\*\*Next\*\*/i) || next.match(/^Next\s*[:\-—]/i)) break;
        sectionLines.push(lines[i]);
        i += 1;
      }

      const children = parseSectionContent(sectionTitle, sectionLines);
      const flat = ['summary', 'your tasks'].includes(sectionTitle.toLowerCase());
      if (flat) {
        blocks.push(...children);
      } else {
        blocks.push({ type: 'section', title: sectionTitle, children });
      }
      continue;
    }

    if (clean.startsWith('## ')) {
      blocks.push({ type: 'title', text: clean.slice(3), level: 2 });
      i += 1;
      continue;
    }

    if (clean.startsWith('# ')) {
      blocks.push({ type: 'title', text: clean.slice(2), level: 1 });
      i += 1;
      continue;
    }

    if (clean.startsWith('> ')) {
      const quoteLines: string[] = [clean.slice(2)];
      i += 1;
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i += 1;
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join('\n') });
      continue;
    }

    if (isTableRow(clean)) {
      const tableLines: string[] = [];
      while (i < lines.length && isTableRow(lines[i].trim())) {
        tableLines.push(lines[i].trim());
        i += 1;
      }
      const parsed = parseTable(tableLines);
      if (parsed) {
        if (isSummaryTable(parsed.headers)) {
          const keyIdx = 0;
          const valIdx = 1;
          blocks.push({
            type: 'summary',
            rows: parsed.rows.map((r) => ({ key: r[keyIdx] ?? '', value: r[valIdx] ?? '' })),
          });
        } else if (isStatusTable(parsed.headers)) {
          blocks.push({
            type: 'status_list',
            items: parsed.rows.map((r) => ({ label: r[0] ?? '', status: r[1] ?? '' })),
          });
        } else {
          blocks.push({ type: 'table', headers: parsed.headers, rows: parsed.rows });
        }
      }
      continue;
    }

    const nextMatch =
      clean.match(/^\*\*Next\*\*\s*[:\-—]?\s*(.+)$/i) ||
      clean.match(/^Next\s*[:\-—]\s*(.+)$/i) ||
      clean.match(/^→\s*(.+)$/);
    if (nextMatch) {
      blocks.push({ type: 'next', text: nextMatch[1] });
      i += 1;
      continue;
    }

    const kvMatch = clean.match(/^\*\*([^*]+)\*\*\s*[:\-—]\s*(.+)$/);
    if (kvMatch) {
      const factItems: { key: string; value: string }[] = [
        { key: kvMatch[1], value: kvMatch[2] },
      ];
      i += 1;
      while (i < lines.length) {
        const nextKv = lines[i].trim().match(/^\*\*([^*]+)\*\*\s*[:\-—]\s*(.+)$/);
        if (!nextKv) break;
        factItems.push({ key: nextKv[1], value: nextKv[2] });
        i += 1;
      }
      blocks.push({ type: 'facts', items: factItems });
      continue;
    }

    const listItem = parseListItem(clean);
    if (listItem.kind === 'task') {
      const taskItems: { text: string; raw: string; done: boolean }[] = [
        { text: listItem.text, raw: listItem.raw, done: listItem.done },
      ];
      i += 1;
      while (i < lines.length) {
        const li = parseListItem(lines[i].trim());
        if (li.kind !== 'task') break;
        taskItems.push({ text: li.text, raw: li.raw, done: li.done });
        i += 1;
      }
      blocks.push({
        type: 'tasks',
        items: taskItems,
        selectable: shouldRenderAsSelectablePills(taskItems.map((t) => t.text)),
      });
      continue;
    }

    if (listItem.kind === 'bullet') {
      const bullets: string[] = [listItem.text];
      i += 1;
      while (i < lines.length) {
        const li = parseListItem(lines[i].trim());
        if (li.kind !== 'bullet') break;
        bullets.push(li.text);
        i += 1;
      }
      blocks.push({
        type: 'bullet_list',
        items: bullets,
        selectable: shouldRenderAsSelectablePills(bullets),
      });
      continue;
    }

    blocks.push({ type: 'paragraph', text: clean });
    i += 1;
  }

  return blocks;
}

function parseSectionContent(title: string, lines: string[]): ResponseBlock[] {
  const joined = lines.join('\n').trim();
  if (!joined) return [];

  const lower = title.toLowerCase();
  if (lower === 'summary') {
    return parseTextBlocks(joined);
  }
  if (lower === 'your tasks') {
    return parseTextBlocks(joined);
  }

  return parseTextBlocks(joined);
}

export function parseResponseContent(text: string): ResponseBlock[] {
  const blocks: ResponseBlock[] = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIdx = 0;
  let codeMatch;

  while ((codeMatch = codeBlockRegex.exec(text)) !== null) {
    if (codeMatch.index > lastIdx) {
      blocks.push(...parseTextBlocks(text.slice(lastIdx, codeMatch.index)));
    }
    blocks.push({
      type: 'code',
      content: codeMatch[2].trimEnd(),
      language: codeMatch[1] || undefined,
    });
    lastIdx = codeMatch.index + codeMatch[0].length;
  }

  if (lastIdx < text.length) {
    blocks.push(...parseTextBlocks(text.slice(lastIdx)));
  }

  return blocks;
}
