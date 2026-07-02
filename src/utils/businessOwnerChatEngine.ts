import { BusinessOwnerRequirementsUpload } from '../types';
import { BO_CHAT_QUESTIONS } from '../data/businessOwnerSamples';

export interface BOChatAnswers {
  businessProblem: string;
  currentProcess: string;
  successCriteria: string;
}

export function mapChatAnswerKey(
  questionId: (typeof BO_CHAT_QUESTIONS)[number]['id'],
): keyof BOChatAnswers {
  switch (questionId) {
    case 'business_problem':
      return 'businessProblem';
    case 'current_process':
      return 'currentProcess';
    case 'success_criteria':
      return 'successCriteria';
  }
}

export function briefChatAck(questionIndex: number): string {
  if (questionIndex === 0) return 'Thanks — that helps me understand the scope.';
  if (questionIndex === 1) return 'Got it — I can see how manual that is today.';
  return 'Perfect — I have what I need to draft your requirements.';
}

function extractTitle(problem: string): string {
  const firstLine = problem.split(/[.\n!]/)[0]?.trim() ?? 'Business Requirements';
  if (firstLine.length <= 55) return firstLine;
  return `${firstLine.slice(0, 52)}…`;
}

/** Build a business-friendly requirements document from chat discovery answers */
export function generateRequirementsFromChat(
  answers: BOChatAnswers,
): BusinessOwnerRequirementsUpload {
  const title = extractTitle(answers.businessProblem);
  const slug = title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').slice(0, 40);

  const content = `# ${title} — Business Requirements

## 1. Business Problem & Audience
${answers.businessProblem.trim()}

## 2. Current State — How It Works Today
${answers.currentProcess.trim()}

## 3. Success Criteria & Approval
${answers.successCriteria.trim()}

## 4. Scope Notes
- Generated from Business Owner discovery conversation with Mitra
- Pending stakeholder review and Solution Architect handoff

## 5. Recommended Next Steps
- Validate requirements with business stakeholders
- Refine user stories for Agile/Jira delivery
- Attach process flow diagrams where applicable
- Hand off to Solution Architect for technical design`;

  return {
    id: `req-chat-${Date.now()}`,
    fileName: `${slug || 'Generated'}_Requirements.md`,
    content,
    uploadedAt: new Date().toISOString(),
  };
}

export function requirementsReadyMessage(fileName: string): string {
  return `I've drafted your **Requirements Document** (${fileName}). Review it in the artifacts panel on the right.\n\nNext I'll ask a few quick questions to shape **user stories** for Agile/Jira.`;
}
