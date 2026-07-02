import React from 'react';
import {
  ActionCard,
  ActionPillList,
  BulletList,
  DataTable,
  GroupPanel,
  QuoteBlock,
  SimpleTaskList,
  StatusList,
  stripMarkdownLabel,
} from './ChatResponseCards';
import { parseResponseContent, type ResponseBlock } from '../utils/responseParser';
import { simplifyResponseText } from '../utils/simplifyResponseText';

function parseInlineMarkdown(text: string, isDark: boolean): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[0].startsWith('**')) {
      parts.push(
        <strong key={match.index} className={`font-medium ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
          {match[2]}
        </strong>,
      );
    } else {
      parts.push(
        <code
          key={match.index}
          className={`px-1 rounded font-mono text-[11px] ${
            isDark ? 'text-brand-green/90' : 'text-emerald-700'
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

interface StructuredMarkdownProps {
  text: string;
  isDark: boolean;
  onSendMessage: (text: string) => void;
  isGenerating: boolean;
  renderCodeBlock: (code: string, key: React.Key, language?: string) => React.ReactNode;
  messageId?: string;
  selectedChoice?: string;
  onChoiceSelect?: (messageId: string, choice: string) => void;
}

function handlePillSelect(
  raw: string,
  messageId: string | undefined,
  onChoiceSelect: ((messageId: string, choice: string) => void) | undefined,
  onSendMessage: (text: string) => void,
) {
  if (onChoiceSelect && messageId) {
    onChoiceSelect(messageId, raw);
  } else {
    onSendMessage(raw);
  }
}

function renderBlock(
  block: ResponseBlock,
  isDark: boolean,
  onSendMessage: (text: string) => void,
  isGenerating: boolean,
  renderCodeBlock: (code: string, key: React.Key, language?: string) => React.ReactNode,
  blockKey: React.Key,
  messageId?: string,
  selectedChoice?: string,
  onChoiceSelect?: (messageId: string, choice: string) => void,
): React.ReactNode {
  switch (block.type) {
    case 'title':
      return (
        <p className={`text-[14px] font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          {parseInlineMarkdown(block.text, isDark)}
        </p>
      );

    case 'heading':
    case 'facts':
    case 'summary':
    case 'next':
      return (
        <p className={`text-[13px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {parseInlineMarkdown(
            block.type === 'facts'
              ? block.items.map((i) => i.value).join(' ')
              : block.type === 'summary'
                ? block.rows.map((r) => r.value).join(' ')
                : block.text,
            isDark,
          )}
        </p>
      );

    case 'section':
      return (
        <GroupPanel title={block.title} isDark={isDark}>
          <div className="space-y-1.5">
            {block.children.map((child, i) => (
              <React.Fragment key={`${blockKey}-${i}`}>
                {renderBlock(child, isDark, onSendMessage, isGenerating, renderCodeBlock, `${blockKey}-${i}`, messageId, selectedChoice, onChoiceSelect)}
              </React.Fragment>
            ))}
          </div>
        </GroupPanel>
      );

    case 'table':
      return <DataTable headers={block.headers} rows={block.rows} isDark={isDark} />;

    case 'status_list':
      return <StatusList items={block.items} isDark={isDark} />;

    case 'tasks':
      if (block.selectable !== false) {
        return (
          <ActionPillList
            isDark={isDark}
            numbered
            disabled={isGenerating}
            selectedItem={selectedChoice}
            items={block.items.map((t) => ({
              text: t.text,
              raw: t.raw || stripMarkdownLabel(t.text),
            }))}
            onSelect={(raw) => handlePillSelect(raw, messageId, onChoiceSelect, onSendMessage)}
            renderLabel={(text) => parseInlineMarkdown(text, isDark)}
          />
        );
      }
      return (
        <SimpleTaskList
          isDark={isDark}
          items={block.items.map((t) => ({ text: t.text, done: t.done }))}
        />
      );

    case 'bullet_list':
      if (block.selectable !== false) {
        return (
          <ActionPillList
            isDark={isDark}
            disabled={isGenerating}
            selectedItem={selectedChoice}
            items={block.items.map((text) => ({
              text,
              raw: stripMarkdownLabel(text),
            }))}
            onSelect={(raw) => handlePillSelect(raw, messageId, onChoiceSelect, onSendMessage)}
            renderLabel={(text) => parseInlineMarkdown(text, isDark)}
          />
        );
      }
      return (
        <BulletList
          isDark={isDark}
          items={block.items}
          renderItem={(text) => parseInlineMarkdown(text, isDark)}
        />
      );

    case 'actions':
      return (
        <div className="space-y-0.5">
          {block.items.map((item, i) => (
            <React.Fragment key={i}>
              <ActionCard
                isDark={isDark}
                disabled={isGenerating}
                onClick={() => onSendMessage(item.raw)}
              >
                {parseInlineMarkdown(item.text, isDark)}
              </ActionCard>
            </React.Fragment>
          ))}
        </div>
      );

    case 'paragraph':
      return (
        <p className={`text-[13px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {parseInlineMarkdown(block.text, isDark)}
        </p>
      );

    case 'blockquote':
      return (
        <QuoteBlock isDark={isDark}>
          {block.text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {parseInlineMarkdown(line, isDark)}
            </React.Fragment>
          ))}
        </QuoteBlock>
      );

    case 'code':
      return renderCodeBlock(block.content, blockKey, block.language);

    default:
      return null;
  }
}

export default function StructuredMarkdown({
  text,
  isDark,
  onSendMessage,
  isGenerating,
  renderCodeBlock,
  messageId,
  selectedChoice,
  onChoiceSelect,
}: StructuredMarkdownProps) {
  if (!text) return null;

  const blocks = parseResponseContent(simplifyResponseText(text));

  return (
    <div className="space-y-1.5">
      {blocks.map((block, i) => (
        <React.Fragment key={i}>
          {renderBlock(block, isDark, onSendMessage, isGenerating, renderCodeBlock, i, messageId, selectedChoice, onChoiceSelect)}
        </React.Fragment>
      ))}
    </div>
  );
}
