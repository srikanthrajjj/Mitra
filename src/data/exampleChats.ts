import { ChatMessage } from '../types';

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);
const minsAgo = (m: number) => new Date(Date.now() - m * 60 * 1000);

export const EXAMPLE_CHAT_HISTORIES: Record<string, ChatMessage[]> = {
  'hr-ticketing': [
    {
      id: 'hr-u1',
      sender: 'user',
      text: 'I will list the files in the src directory and help architect the HR ticketing module.',
      timestamp: minsAgo(12),
    },
    {
      id: 'hr-m1',
      sender: 'mitra',
      text: 'I found your project structure under `src/components`, `src/data`, and `src/utils`. For **HR Ticketing**, I recommend extending the standard `task` table with a confidential case flag and category-based auto-routing.\n\nShall I draft the `u_hr_case` schema next?',
      timestamp: minsAgo(11),
    },
    {
      id: 'hr-u2',
      sender: 'user',
      text: 'Yes, include SLA timers for VIP employees.',
      timestamp: minsAgo(8),
    },
    {
      id: 'hr-m2',
      sender: 'mitra',
      text: 'Added **u_priority_sla_level** with 24h VIP and 48h standard timers. Business Rule `Auto-Route Assignment Group` is ready in the Blueprint panel.',
      timestamp: minsAgo(7),
    },
  ],
  'employee-onboarding': [
    {
      id: 'onb-u1',
      sender: 'user',
      text: 'this is the core principle map for our employee onboarding lifecycle',
      timestamp: minsAgo(30),
    },
    {
      id: 'onb-m1',
      sender: 'mitra',
      text: 'The core principle is a **parent-child task model**: one `u_onboarding_process` record spawns departmental subtasks for IT, Facilities, and Legal.\n\nEach subtask inherits SLA offsets and rolls status back to the parent case.',
      timestamp: minsAgo(28),
    },
    {
      id: 'onb-u2',
      sender: 'user',
      text: 'Add procurement trigger when IT subtask completes.',
      timestamp: minsAgo(20),
    },
    {
      id: 'onb-m2',
      sender: 'mitra',
      text: 'Configured a Flow Designer hook on `u_it_setup_complete` that raises a procurement request for laptop orders automatically.',
      timestamp: minsAgo(18),
    },
  ],
  'vendor-management': [
    {
      id: 'ven-u1',
      sender: 'user',
      text: 'Running Mitra AI Architect on vendor risk register requirements.',
      timestamp: hoursAgo(4),
    },
    {
      id: 'ven-m1',
      sender: 'mitra',
      text: 'I mapped vendor scoring to **core_company** extensions with `u_security_score` and annual `u_next_audit_date` reminders.\n\nA scheduled job will flag vendors due for re-vetting within 30 days.',
      timestamp: hoursAgo(4),
    },
  ],
  'asset-tracking': [
    {
      id: 'ast-u1',
      sender: 'user',
      text: 'Running the Travel App — need asset tracking for field devices.',
      timestamp: hoursAgo(26),
    },
    {
      id: 'ast-m1',
      sender: 'mitra',
      text: 'For the travel app, extend **alm_asset** as `u_hardware_item` with serial numbers and custodian references.\n\nBarcode scans can update `u_storage_bin` on check-in/check-out events.',
      timestamp: hoursAgo(25),
    },
    {
      id: 'ast-u2',
      sender: 'user',
      text: 'Generate validation for asset recovery on user offboarding.',
      timestamp: hoursAgo(24),
    },
    {
      id: 'ast-m2',
      sender: 'mitra',
      text: 'Added a before-update Business Rule that blocks offboarding closure until all assigned hardware items are returned or marked disposed.',
      timestamp: hoursAgo(24),
    },
  ],
  'fixing-table-header': [
    {
      id: 'fix-u1',
      sender: 'user',
      text: 'Fixing Table Header Scroll — columns misalign when scrolling data grids.',
      timestamp: hoursAgo(1400),
    },
    {
      id: 'fix-m1',
      sender: 'mitra',
      text: 'Apply sticky positioning on the header row and sync column widths via CSS variables:\n\n```css\n.sn-table-header { position: sticky; top: 0; z-index: 2; }\n```\n\nResizeObserver keeps header cells aligned with body columns.',
      timestamp: hoursAgo(1399),
    },
  ],
};
