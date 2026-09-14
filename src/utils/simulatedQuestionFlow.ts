import type { ChatMessage, MitraQuestion } from '../types';

/** Sent when the user skips a question card instead of answering it. */
export const SKIP_ANSWER = 'Skip — decide later';

export interface ScriptedQuestionReply {
  text: string;
  question?: MitraQuestion;
}

/**
 * Demo scenario: promoting an update set to production. Mitra stops and asks
 * whether UAT has signed off before touching the live instance.
 *
 * Trigger with e.g. "Promote the HR update set to production".
 */
const PROMOTE_TO_PROD_PATTERN = /\bpromote\b[\s\S]*\bprod(uction)?\b/i;

const PROMOTE_QUESTION: MitraQuestion = {
  header: 'Has the HR update set passed UAT sign-off?',
  options: [
    {
      label: 'Yes, UAT is signed off — promote it',
      description:
        'I preview the update set on production, resolve collisions, and commit it now. CHG0031245 moves to Implement.',
    },
    {
      label: 'Not yet — promote anyway',
      description:
        'It commits now without UAT evidence. If a defect surfaces, rollback means backing out the update set on a live instance. Your call, I’ll run it.',
    },
    {
      label: 'Not yet — hold it',
      description:
        'I leave the batch previewed and ready to commit the moment UAT signs off. Nothing touches production today.',
    },
    {
      label: 'Schedule it for the change window',
      description:
        'I attach it to CHG0031245 and queue the commit for Saturday 02:00 IST, after CAB approval lands.',
    },
  ],
};

const PROMOTE_INTRO =
  'The **HR Ticketing – Sprint 4** update set previews clean on production: 47 customer updates, 2 collisions I can resolve automatically.\n\nBefore I commit anything to a live instance, one check:';

const committedRecord = (warning?: string) =>
  [
    '## Record updated',
    '',
    '**Update set** `HR Ticketing – Sprint 4` committed to **Production**',
    '',
    '| Field | Value |',
    '|-------|-------|',
    '| **Change** | CHG0031245 → Implement |',
    '| **Preview** | 0 errors · 2 collisions resolved |',
    '| **Commit** | 47 customer updates applied |',
    ...(warning ? [`| **Flag** | ${warning} |`] : []),
    '',
    'Run the post-deploy smoke ATF suite next so the change can close.',
  ].join('\n');

const ANSWER_REPLIES: string[] = [
  committedRecord(),
  committedRecord('UAT evidence missing — raised on the change for CAB review'),
  'Holding it. The update set stays previewed on production with **no commit** — nothing on the live instance has changed.\n\nAsk me to promote it again once UAT signs off.',
  'Scheduled. The commit is queued on **CHG0031245** for **Saturday 02:00 IST**, gated on CAB approval.\n\nIf CAB rejects the change, the job cancels itself and nothing reaches production.',
];

function lastMitraMessage(history: ChatMessage[]): ChatMessage | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (m.sender === 'mitra' && (m.text.trim() || m.question)) return m;
  }
  return undefined;
}

/**
 * Scripted reply for the question-card demo, or null when the prompt isn't part
 * of it. `priorHistory` is the chat before the prompt being answered.
 */
export function getSimulatedQuestionReply(
  prompt: string,
  priorHistory: ChatMessage[],
): ScriptedQuestionReply | null {
  const pending = lastMitraMessage(priorHistory)?.question;
  if (pending) {
    const answer = prompt.trim();
    if (answer === SKIP_ANSWER) {
      return {
        text: 'No problem — I’ll hold the promotion. Nothing touches production until you decide.',
      };
    }
    const index = pending.options.findIndex((o) => o.label === answer);
    if (pending === PROMOTE_QUESTION || pending.header === PROMOTE_QUESTION.header) {
      if (index >= 0) return { text: ANSWER_REPLIES[index] };
    }
    return {
      text: `Got it — “${answer}”. I’ve left the update set previewed but uncommitted until we settle the approach.`,
    };
  }

  if (PROMOTE_TO_PROD_PATTERN.test(prompt)) {
    return { text: PROMOTE_INTRO, question: PROMOTE_QUESTION };
  }

  return null;
}
