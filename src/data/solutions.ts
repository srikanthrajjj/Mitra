import { Solution } from '../types';
import { EXAMPLE_CHAT_HISTORIES } from './exampleChats';

export const INITIAL_SOLUTIONS: Solution[] = [
  {
    id: 'hr-ticketing',
    name: 'HR Ticketing System',
    description: 'An AI-architected solution for HR cases, inquiries, and automatic routing based on user department.',
    createdAt: 'Just now',
    active: true,
    isFavorite: true,
    folderId: 'mitra-ai-architect',
    isLoading: false,
    blueprint: {
      id: 'bp-hr-ticketing',
      title: 'HR Ticketing System',
      description: 'HRSD scoped application — employee cases, COE routing, and stakeholder sign-off on the executive summary.',
      status: 'not_started',
      discoveredRequirements: [
        'Employee submission of HR queries via Service Portal',
        'Automatic routing of cases based on categorization (Benefits, Payroll, Relations)',
        'SLA timers set to 24 hours for VIP users, 48 hours for standard requests',
        'Confidentiality flag restricting read-access to assigned HR representatives only'
      ],
      architectureSteps: [
        'Create task-extended table "u_hr_case"',
        'Add lookup relationship to "sys_user" (Employee) and custom Category variables',
        'Create Client Script to check for confidential flag and show alert banner',
        'Configure Business Rule to execute auto-routing upon record insert'
      ],
      tables: [
        {
          name: 'u_hr_case',
          label: 'HR Case',
          extendsTable: 'task',
          fields: [
            { name: 'u_employee', type: 'Reference', label: 'Employee', reference: 'sys_user', mandatory: true },
            { name: 'u_hr_category', type: 'Choice', label: 'HR Category' },
            { name: 'u_confidential', type: 'True/False', label: 'Is Confidential' },
            { name: 'u_priority_sla_level', type: 'Choice', label: 'SLA Level' },
            { name: 'u_resolution_notes', type: 'String (Large)', label: 'Resolution Notes' }
          ]
        },
        {
          name: 'u_hr_category_lookup',
          label: 'HR Category Routing Map',
          fields: [
            { name: 'u_category', type: 'String', label: 'Category Name', mandatory: true },
            { name: 'u_assignment_group', type: 'Reference', label: 'ServiceNow Group', reference: 'sys_user_group' }
          ]
        }
      ],
      clientScripts: [
        {
          name: 'Secure Confidential Fields',
          table: 'u_hr_case',
          type: 'onLoad',
          description: 'Hides or alerts the agent when viewing a Case flagged as highly confidential.',
          script: `function onLoad() {\n  var isConfidential = g_form.getValue('u_confidential');\n  if (isConfidential == 'true') {\n    g_form.showFieldMsg('u_employee', 'WARNING: This is a restricted record.', 'error');\n    if (!g_user.hasRole('hr_admin')) {\n      g_form.setReadOnly('u_resolution_notes', true);\n    }\n  }\n}`
        }
      ],
      businessRules: [
        {
          name: 'Auto-Route Assignment Group',
          table: 'u_hr_case',
          when: 'before',
          insert: true,
          update: false,
          description: 'Queries the Category Mapping table and automatically assigns a resolving team.',
          script: `(function executeRule(current, previous /*null when async*/) {\n  var routeGr = new GlideRecord('u_hr_category_lookup');\n  routeGr.addQuery('u_category', current.u_hr_category);\n  routeGr.query();\n  if (routeGr.next()) {\n    current.assignment_group = routeGr.u_assignment_group;\n  }\n})(current, previous);`
        }
      ]
    },
    chatHistory: [],
  },
  {
    id: 'employee-onboarding',
    name: 'this is the core principle ma...',
    description: 'A structural system to coordinate enterprise provisioning actions across human resources, facilities, and IT.',
    createdAt: '2 hours ago',
    active: false,
    isFavorite: true,
    folderId: 'mitra-ai-architect',
    timeLabel: '5m',
    blueprint: {
      id: 'bp-onboarding',
      title: 'Employee Onboarding Lifecycle',
      description: 'A multi-departmental workflow tracker coordinating desk allocation, IT equipment orders, and legal paperwork.',
      status: 'completed',
      discoveredRequirements: [
        'Self-service form for managers to request new hires',
        'Automatic task generation for regional facilities (desk assignment)',
        'Automatic purchase order trigger in procurement (laptop request)',
        'Legal compliance trigger for background verification checks'
      ],
      architectureSteps: [
        'Create parent tables u_onboarding_process and u_onboarding_subtask',
        'Add status flow tracker to task lists',
        'Link procurement triggers directly via subtask hooks',
        'Configure Flow Designer steps for automatic triggers upon onboarding approval'
      ],
      tables: [
        {
          name: 'u_onboarding_process',
          label: 'Onboarding Case',
          extendsTable: 'task',
          fields: [
            { name: 'u_manager', type: 'Reference', label: 'Hiring Manager', reference: 'sys_user' },
            { name: 'u_candidate_name', type: 'String', label: 'Candidate Name', mandatory: true },
            { name: 'u_start_date', type: 'Date', label: 'Join Date' },
            { name: 'u_it_setup_complete', type: 'True/False', label: 'IT Complete' },
            { name: 'u_facilities_setup_complete', type: 'True/False', label: 'Facilities Complete' }
          ]
        },
        {
          name: 'u_onboarding_subtask',
          label: 'Onboarding Action Item',
          extendsTable: 'u_onboarding_process',
          fields: [
            { name: 'u_owner_department', type: 'Choice', label: 'Assigned Department' },
            { name: 'u_sla_offset_hours', type: 'Integer', label: 'SLA (Hours)' }
          ]
        }
      ]
    },
    chatHistory: EXAMPLE_CHAT_HISTORIES['employee-onboarding'],
  },
  {
    id: 'vendor-management',
    name: 'Running Mitra AI Archi...',
    description: 'Tracks third-party vendor security clearances, capabilities, active SLAs, and annual review cycles.',
    createdAt: '1 day ago',
    active: false,
    folderId: 'mitra-ai-architect',
    isBranch: true,
    blueprint: {
      id: 'bp-vendor',
      title: 'Vendor Risk & Security Register',
      description: 'Coordinates annual vetting checkpoints and scoring for company contractors.',
      status: 'completed',
      discoveredRequirements: [
        'Central list of Approved corporate vendors (sys_company integration)',
        'Annual evaluation triggers based on renewal anniversaries',
        'Survey questionnaire modules for security officers'
      ],
      architectureSteps: [
        'Add extra variables to core core_company table',
        'Create Vendor Security assessment table linkage',
        'Configure schedule script to query approaching renewals'
      ],
      tables: [
        {
          name: 'core_company',
          label: 'Company (Core Extension)',
          fields: [
            { name: 'u_is_vendor', type: 'True/False', label: 'Is Corporate Vendor' },
            { name: 'u_security_score', type: 'Decimal', label: 'Vetting Score (1-10)' },
            { name: 'u_next_audit_date', type: 'Date', label: 'Next Slated Audit' }
          ]
        }
      ]
    },
    chatHistory: EXAMPLE_CHAT_HISTORIES['vendor-management'],
  },
  {
    id: 'asset-tracking',
    name: 'Running the Travel App',
    description: 'Maintains hardware custody, lifecycle statuses, tracking history, and depreciation values.',
    createdAt: '3 days ago',
    active: false,
    folderId: 'remix-travel',
    isBranch: true,
    blueprint: {
      id: 'bp-assets',
      title: 'Enterprise Device Asset Registry',
      description: 'Tracks hardware locations, assigned staff, purchase cycles, and disposal steps.',
      status: 'completed',
      discoveredRequirements: [
        'Hardware tracking with barcode parameters',
        'Integration with sys_user to map active custodians',
        'Locker / storage warehouse lookup listings'
      ],
      architectureSteps: [
        'Create custom asset registry u_hardware_item extending alm_asset',
        'Add serial number and user link references',
        'Deploy validation rules regarding asset recovery'
      ],
      tables: [
        {
          name: 'u_hardware_item',
          label: 'Hardware Registry Item',
          extendsTable: 'alm_asset',
          fields: [
            { name: 'u_serial_number', type: 'String', label: 'Serial Number', mandatory: true },
            { name: 'u_assigned_user', type: 'Reference', label: 'Assigned Custodian', reference: 'sys_user' },
            { name: 'u_storage_bin', type: 'String', label: 'Storage Bin Reference' }
          ]
        }
      ]
    },
    chatHistory: EXAMPLE_CHAT_HISTORIES['asset-tracking'],
  },
  {
    id: 'fixing-table-header',
    name: 'Fixing Table Header Sc...',
    description: 'Fixing Table Header Scroll behavior and column alignment.',
    createdAt: '2 months ago',
    active: false,
    folderId: 'backup-vpro',
    isBranch: true,
    timeLabel: '2mo',
    blueprint: {
      id: 'bp-fixing-header',
      title: 'Fixing Table Header Scroll & Columns',
      description: 'Coordinates UI stylesheet overrides to align header rows in scrolled tables.',
      status: 'completed',
      discoveredRequirements: [
        'Correctly align header columns with data rows',
        'Apply sticky position parameters to table components'
      ],
      architectureSteps: [
        'Inject custom CSS variables for header offset overrides',
        'Verify scroll container bounds on resize events'
      ],
      tables: []
    },
    chatHistory: EXAMPLE_CHAT_HISTORIES['fixing-table-header'],
  }
];
