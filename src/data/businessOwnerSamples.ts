import { BusinessOwnerRequirementsUpload, UserStory } from '../types';

export const SAMPLE_REQUIREMENTS_DOC: BusinessOwnerRequirementsUpload = {
  id: 'req-sample-hrsd',
  fileName: 'HR_Service_Delivery_Requirements_v1.docx',
  uploadedAt: new Date().toISOString(),
  content: `# HR Service Delivery — Business Requirements

## 1. Background
The HR Shared Services team handles employee lifecycle requests across multiple regions. Current intake is fragmented across email, SharePoint forms, and walk-ups — causing SLA breaches and poor visibility for employees and managers.

## 2. Business Objectives
- Provide a single portal for HR case submission and tracking
- Reduce average case resolution time from 5 days to 2 days
- Give managers real-time visibility into team HR requests
- Ensure compliance with regional data retention policies

## 3. Scope — In Scope
- Employee self-service case creation (leave, payroll inquiry, benefits change)
- Manager approval workflows for leave and overtime
- HR agent workbench with assignment rules and SLA timers
- Knowledge base articles for common HR questions
- Email notifications at key workflow milestones

## 4. Scope — Out of Scope
- Payroll calculation engine replacement
- Benefits carrier integration (Phase 2)
- Mobile native app (responsive web only for MVP)

## 5. Key User Groups
| Role | Description |
|------|-------------|
| Employee | Submits HR requests, tracks status, reads KB articles |
| Manager | Approves leave/overtime, views team request dashboard |
| HR Agent | Triages, assigns, and resolves cases |
| HR Admin | Configures categories, SLAs, and assignment groups |

## 6. Functional Requirements
1. Employees must submit cases with category, description, and attachments
2. Managers receive approval tasks with one-click approve/reject
3. HR agents see a prioritized queue sorted by SLA breach risk
4. System sends email when case status changes or SLA is at risk
5. All case data retained per regional policy (EU: 7 years, US: 5 years)

## 7. Success Metrics
- 90% employee satisfaction on post-resolution survey
- 50% reduction in email-based HR inquiries within 6 months
- 95% SLA compliance on P1/P2 cases`,
};

export const SAMPLE_USER_STORIES: UserStory[] = [
  {
    id: 'us-001',
    role: 'Employee',
    action: 'submit an HR case with category, description, and attachments through a self-service portal',
    value: 'I can track my request in one place instead of chasing email threads',
    formatted:
      'As an Employee, I want to submit an HR case with category, description, and attachments through a self-service portal, so that I can track my request in one place instead of chasing email threads.',
    status: 'draft',
    priority: 'high',
    epic: 'Employee Self-Service',
  },
  {
    id: 'us-002',
    role: 'Manager',
    action: 'approve or reject leave and overtime requests from my team with one-click actions',
    value: 'I can respond quickly without leaving my daily workflow',
    formatted:
      'As a Manager, I want to approve or reject leave and overtime requests from my team with one-click actions, so that I can respond quickly without leaving my daily workflow.',
    status: 'draft',
    priority: 'high',
    epic: 'Manager Approvals',
  },
  {
    id: 'us-003',
    role: 'HR Agent',
    action: 'see a prioritized work queue sorted by SLA breach risk',
    value: 'I can focus on the most urgent cases first and meet our service commitments',
    formatted:
      'As an HR Agent, I want to see a prioritized work queue sorted by SLA breach risk, so that I can focus on the most urgent cases first and meet our service commitments.',
    status: 'draft',
    priority: 'high',
    epic: 'Agent Workbench',
  },
  {
    id: 'us-004',
    role: 'Employee',
    action: 'receive email notifications when my case status changes or SLA is at risk',
    value: 'I stay informed without having to log in and check manually',
    formatted:
      'As an Employee, I want to receive email notifications when my case status changes or SLA is at risk, so that I stay informed without having to log in and check manually.',
    status: 'draft',
    priority: 'medium',
    epic: 'Notifications',
  },
  {
    id: 'us-005',
    role: 'HR Admin',
    action: 'configure case categories, SLAs, and assignment groups without developer support',
    value: 'the platform adapts as our HR policies evolve',
    formatted:
      'As an HR Admin, I want to configure case categories, SLAs, and assignment groups without developer support, so that the platform adapts as our HR policies evolve.',
    status: 'draft',
    priority: 'medium',
    epic: 'Administration',
  },
];

export const SAMPLE_PROCESS_FLOW = {
  id: 'flow-sample-hrsd',
  name: 'HR Case Lifecycle — Process Flow',
  description:
    'Employee submits case → Auto-assignment to HR queue → Agent triage → Manager approval (if required) → Resolution → Employee notification → Survey',
  attachedAt: new Date().toISOString(),
  isSample: true,
};

export const BO_CHAT_COLD_START =
  "Hi! I can help you shape your business requirements — no technical jargon needed. Let's walk through a few quick questions.";

export const BO_CHAT_QUESTIONS = [
  {
    id: 'business_problem',
    prompt:
      '**Describe the business problem** and **who needs this solution**. What pain are you trying to solve?',
    placeholder: 'e.g., Our HR team gets 200+ email requests per week and employees have no visibility…',
  },
  {
    id: 'current_process',
    prompt:
      'What **happens today** manually? Walk me through how people handle this right now.',
    placeholder: 'e.g., Employees email HR, we log cases in a spreadsheet, managers approve via email…',
  },
  {
    id: 'success_criteria',
    prompt:
      'What does **success look like**, and **who needs to approve** this initiative?',
    placeholder: 'e.g., Cut resolution time in half, VP of HR signs off before build starts…',
  },
] as const;

export const BA_QUESTIONS = [
  {
    id: 'user_role',
    prompt: 'Who is the **primary user** performing this action? (e.g., Employee, Manager, HR Agent)',
    placeholder: 'e.g., Employee',
  },
  {
    id: 'desired_action',
    prompt: 'What **action** do they need to perform? Describe the capability in plain language.',
    placeholder: 'e.g., submit a leave request with supporting documents',
  },
  {
    id: 'business_value',
    prompt: 'What **business value** does this deliver? Why does it matter to the organization?',
    placeholder: 'e.g., reduce manual email intake and improve SLA compliance',
  },
] as const;
