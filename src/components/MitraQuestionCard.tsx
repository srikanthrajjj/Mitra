import { KeyboardEvent, useRef, useState } from 'react';
import { Check, HelpCircle } from 'lucide-react';
import type { MitraQuestion } from '../types';
import { SKIP_ANSWER } from '../utils/simulatedQuestionFlow';
import { cn } from '@/lib/utils';

interface MitraQuestionCardProps {
  question: MitraQuestion;
  isDark: boolean;
  /** The submitted answer, once there is one — renders the card read-only. */
  answer?: string;
  disabled?: boolean;
  onAnswer: (answer: string) => void;
}

const OTHER = 'other' as const;

function NumberHint({ n, active }: { n: number; active: boolean }) {
  return (
    <kbd
      className={cn(
        'mt-0.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded border px-1 font-sans text-[10.5px] font-medium',
        active ? 'border-brand-green/50 text-brand-green' : 'border-border text-muted-foreground',
      )}
    >
      {n}
    </kbd>
  );
}

/**
 * Multiple-choice question Mitra pauses on: numbered options with a short
 * consequence each, a free-text "Other", and Skip / Submit.
 */
export function MitraQuestionCard({
  question,
  isDark,
  answer,
  disabled = false,
  onAnswer,
}: MitraQuestionCardProps) {
  const [selected, setSelected] = useState<number | typeof OTHER | null>(null);
  const [otherText, setOtherText] = useState('');
  const otherInputRef = useRef<HTMLInputElement>(null);

  const allowOther = question.allowOther ?? true;
  const allowSkip = question.allowSkip ?? true;
  const otherNumber = question.options.length + 1;

  const surface = isDark ? 'border-mitra-border/60 bg-mitra-surface/40' : 'border-border bg-card';

  if (answer !== undefined) {
    return (
      <div className={cn('mt-3 w-full rounded-xl border px-3.5 py-2.5', surface)}>
        <p className="text-[12px] text-muted-foreground">{question.header}</p>
        <p className="mt-1 flex items-start gap-1.5 text-[13px] font-medium text-foreground">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green" aria-hidden />
          {answer === SKIP_ANSWER ? 'Skipped' : answer}
        </p>
      </div>
    );
  }

  const submission =
    typeof selected === 'number'
      ? question.options[selected].label
      : selected === OTHER
        ? otherText.trim()
        : '';
  const canSubmit = !disabled && submission.length > 0;

  const submit = () => {
    if (canSubmit) onAnswer(submission);
  };

  const selectOther = () => {
    setSelected(OTHER);
    otherInputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
      return;
    }
    if (e.target === otherInputRef.current) return;
    const n = Number(e.key);
    if (!Number.isInteger(n) || n < 1) return;
    if (n <= question.options.length) {
      e.preventDefault();
      setSelected(n - 1);
    } else if (allowOther && n === otherNumber) {
      e.preventDefault();
      selectOther();
    }
  };

  const rowClass = (isSelected: boolean) =>
    cn(
      'flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
      isSelected
        ? 'border-brand-green/50 bg-brand-green/10'
        : isDark
          ? 'border-transparent bg-mitra-surface/60 hover:bg-mitra-highlight'
          : 'border-transparent bg-muted/70 hover:bg-accent',
    );

  return (
    <div
      role="group"
      aria-label={question.header}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={cn('mt-3 w-full rounded-xl border p-3 outline-none', surface)}
    >
      <div className="mb-2.5 flex items-center gap-2 px-0.5">
        <HelpCircle className="h-4 w-4 shrink-0 text-brand-green" aria-hidden />
        <p className="text-[13.5px] font-semibold leading-snug text-foreground">{question.header}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        {question.options.map((option, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={option.label}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => setSelected(i)}
              className={cn(rowClass(isSelected), 'cursor-pointer disabled:cursor-not-allowed')}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium leading-snug text-foreground">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                  {option.description}
                </span>
              </span>
              <NumberHint n={i + 1} active={isSelected} />
            </button>
          );
        })}

        {allowOther && (
          <div className={cn(rowClass(selected === OTHER), 'flex-col gap-2')} onClick={selectOther}>
            <div className="flex w-full items-center gap-3">
              <span className="flex-1 text-[13px] font-medium leading-snug text-foreground">Other</span>
              <NumberHint n={otherNumber} active={selected === OTHER} />
            </div>
            <input
              ref={otherInputRef}
              value={otherText}
              disabled={disabled}
              onFocus={() => setSelected(OTHER)}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Type your own answer here"
              className={cn(
                'w-full rounded-md border px-2.5 py-1.5 text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-green/60',
                isDark ? 'border-white/[0.08] bg-mitra-input' : 'border-border bg-card',
              )}
            />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        {allowSkip && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAnswer(SKIP_ANSWER)}
            className={cn(
              'cursor-pointer rounded-md border px-3 py-1 text-[12.5px] font-medium text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              isDark ? 'border-mitra-border hover:bg-mitra-highlight' : 'border-border hover:bg-accent',
            )}
          >
            Skip
          </button>
        )}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="cursor-pointer rounded-md bg-brand-green px-3 py-1 text-[12.5px] font-semibold text-black/85 transition-colors hover:bg-brand-green/90 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
