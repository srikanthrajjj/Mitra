import { Lightbulb, LayoutTemplate, FileUp, Search, type LucideIcon } from 'lucide-react';

export type HomeActionType = 'describe' | 'template' | 'import' | 'analyze';

export interface HomeActionExample {
  label: string;
  prompt: string;
}

export interface HomeAction {
  id: HomeActionType;
  title: string;
  subtitle: string;
  prompt: string;
  icon: LucideIcon;
  examples: HomeActionExample[];
}

export const HOME_ACTIONS: HomeAction[] = [
  {
    id: 'describe',
    title: 'Build a New Application',
    subtitle: 'Describe a Solution',
    prompt: 'I want to build a ServiceNow application for...',
    icon: Lightbulb,
    examples: [
      { label: 'Employee onboarding', prompt: 'I want to build a ServiceNow application for employee onboarding.' },
      { label: 'Vendor management', prompt: 'I want to build a ServiceNow application for vendor management.' },
      { label: 'HR ticketing', prompt: 'I want to build a ServiceNow application for HR ticketing.' },
      { label: 'Asset tracking', prompt: 'I want to build a ServiceNow application for asset tracking.' },
    ],
  },
  {
    id: 'template',
    title: 'Use an Industry Template',
    subtitle: 'Industry Templates',
    prompt: 'Show me ServiceNow solution templates for my industry.',
    icon: LayoutTemplate,
    examples: [
      { label: 'Banking', prompt: 'Show me ServiceNow solution templates for the banking industry.' },
      { label: 'Healthcare', prompt: 'Show me ServiceNow solution templates for the healthcare industry.' },
      { label: 'Telecom', prompt: 'Show me ServiceNow solution templates for the telecom industry.' },
      { label: 'Manufacturing', prompt: 'Show me ServiceNow solution templates for the manufacturing industry.' },
    ],
  },
  {
    id: 'import',
    title: 'Convert Requirements to Solution',
    subtitle: 'Import Requirements',
    prompt: 'Convert my requirements into a ServiceNow solution blueprint.',
    icon: FileUp,
    examples: [
      { label: 'BRD', prompt: 'Convert my BRD into a ServiceNow solution blueprint.' },
      { label: 'User stories', prompt: 'Convert my user stories into a ServiceNow solution blueprint.' },
      { label: 'Process documents', prompt: 'Convert my process documents into a ServiceNow solution blueprint.' },
      { label: 'Meeting notes', prompt: 'Convert my meeting notes into a ServiceNow solution blueprint.' },
    ],
  },
  {
    id: 'analyze',
    title: 'Analyze an Existing Application',
    subtitle: 'Improve What You Have',
    prompt: 'Analyze an existing ServiceNow application and recommend improvements.',
    icon: Search,
    examples: [],
  },
];
