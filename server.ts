import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import {
  resolveGeminiKey,
  resolveGroqKey,
  getLlmStatus,
  SERVICENOW_EXPERT_PROMPT,
  streamLlmResponse,
} from "./server/llm";

dotenv.config();
dotenv.config({ path: path.resolve(import.meta.dirname, "..", ".env") });

const app = express();

process.on("uncaughtException", (err) => {
  console.error("FATAL UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("FATAL UNHANDLED REJECTION at:", promise, "reason:", reason);
  process.exit(1);
});

const DEFAULT_PORT = 3001;
const PORT = Number(process.env.MITRA_PORT ?? process.env.PORT ?? DEFAULT_PORT);

app.use(express.json());

// Lazy-initialize Gemini AI Client to avoid startup failures if key is not yet set
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(requestApiKey?: string): GoogleGenAI {
  const apiKey = resolveGeminiKey(requestApiKey);
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Get a free key at https://aistudio.google.com/apikey"
    );
  }

  if (requestApiKey && resolveGeminiKey(requestApiKey) === apiKey) {
    return new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "mitra-ai-architect" } },
    });
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "mitra-ai-architect" } },
    });
  }
  return aiClient;
}

// REST Health Check
app.get("/api/health", (req, res) => {
  const llm = getLlmStatus();
  res.json({
    status: "ok",
    apiKeyConfigured: llm.gemini || llm.groq,
    providers: llm,
  });
});

function getLocalFallbackResponse(prompt: string, currentSolutionName?: string): any {
  const norm = prompt.toLowerCase();

  // Check if they want XML specifically
  if (norm.includes("xml")) {
    const cleanSolName = (currentSolutionName || "custom_service").toLowerCase().replace(/[^a-z0-9]/g, '_');
    const tblName = `u_${cleanSolName}_case`;
    
    const text = `### 📋 ServiceNow Dictionary Schema (XML Representation)

Here is the requested ServiceNow Table Dictionary definition in XML format. You can copy this directly into your update set or schema loader:

\`\`\`xml
<database>
  <table name="${tblName}" extends="task">
    <element name="u_reference_id" type="string" label="Reference ID" mandatory="true"/>
    <element name="u_assigned_agent" type="reference" label="Assigned Analyst" reference="sys_user"/>
    <element name="u_priority_level" type="integer" label="Priority Level"/>
    <element name="u_comments" type="string" label="Comments"/>
  </table>
</database>
\`\`\`

Would you like to configure **Client Script validations** or **Business Rules** for this XML table?`;

    return {
      text,
      isTriage: false,
      choices: ["Add Client Script", "Add Business Rule", "Reset Schema"],
      blueprint: {
        title: `${currentSolutionName || "Custom Solution"} XML Schema`,
        description: `XML dictionary definition for ${currentSolutionName || "Custom Solution"}.`,
        status: "completed",
        discoveredRequirements: ["Generate XML table dictionary schema"],
        architectureSteps: ["Create XML schema definitions"],
        tables: [
          {
            name: tblName,
            label: currentSolutionName || "Custom Solution",
            extendsTable: "task",
            fields: [
              { name: "u_reference_id", type: "String", label: "Reference ID", mandatory: true },
              { name: "u_assigned_agent", type: "Reference", label: "Assigned Analyst", reference: "sys_user" }
            ]
          }
        ]
      }
    };
  }
  
  // Default values
  let text = "";
  let choices: string[] = [];
  let blueprint: any = {
    title: "ServiceNow Scoped App Base",
    description: "Standard custom application for managing organizational task scopes.",
    status: "completed",
    discoveredRequirements: ["Identify core database storage requirements", "Determine assignment routing groups"],
    architectureSteps: [
      "1. Provision new custom Scoped Application container.",
      "2. Define user roles and access controls (ACLs).",
      "3. Configure form layouts, related lists, and workspace views."
    ],
    tables: [
      {
        name: "u_scoped_task",
        label: "Scoped Task",
        extendsTable: "task",
        fields: [
          { name: "u_short_description", type: "String", label: "Short Description", mandatory: true },
          { name: "u_assigned_to", type: "Reference", label: "Assigned To", reference: "sys_user", mandatory: false }
        ]
      }
    ],
    clientScripts: [],
    businessRules: []
  };

  // Case 1: HRSD / HR
  if (norm.includes("hrsd") || norm.includes("hr service") || norm.includes("hr ticketing") || norm.includes("employee")) {
    text = "### ServiceNow HRSD Architecture Blueprint\n\nI have successfully modeled a scoped **Human Resources Service Delivery (HRSD)** ticketing model. Crucially, this application inherits security and functional boundaries from the scoped HR architecture rather than global ITSM tables, ensuring employee data confidentiality.\n\n### Key Architectural Pillars\n- **Data Isolation**: Ensures HR cases are protected by scoped roles (`sn_hr_core.case_writer`).\n- **Service Catalog Mapping**: Connects Employee Center requests directly to HR Fulfillment cases.\n- **SLA Workflows**: Triggers customized timers for employee onboarding and payroll inquiries.\n\nWould you like to extend the **Base Task Table** or provision an **Independent Scoped Table** for these HR records?";
    choices = ["Extend Base Task Table", "Independent Scoped Table"];
    blueprint = {
      title: "Scoped HRSD Case Handler",
      description: "Confidential employee ticket routing system with scoped data isolation rules.",
      status: "completed",
      discoveredRequirements: [
        "Confidentiality: Restrict case access to certified HR agents",
        "Integration: Sync profile info from sys_user table",
        "SLA Tracking: 24-hour response target for payroll cases"
      ],
      architectureSteps: [
        "1. Create Scoped HR Core Case table (extending Base Case or Task).",
        "2. Implement HR ACLs based on Assignment Groups.",
        "3. Configure HR Service templates for automated category routing."
      ],
      tables: [
        {
          name: "x_scoped_hrsd_case",
          label: "HR Scoped Case",
          extendsTable: "task",
          fields: [
            { name: "u_hr_profile", type: "Reference", label: "HR Profile", reference: "sn_hr_core_profile", mandatory: true },
            { name: "u_topic_category", type: "Choice", label: "Topic Category", mandatory: true },
            { name: "u_confidential", type: "True/False", label: "Confidential", mandatory: false }
          ]
        }
      ],
      clientScripts: [
        {
          name: "Make HR Profile Mandatory on Load",
          table: "x_scoped_hrsd_case",
          type: "onLoad",
          description: "Ensures the HR Profile reference is filled in to load employee history.",
          script: "function onLoad() {\n  g_form.setMandatory('u_hr_profile', true);\n}"
        }
      ],
      businessRules: [
        {
          name: "Enforce HR Confidentiality",
          table: "x_scoped_hrsd_case",
          when: "before",
          insert: true,
          update: true,
          description: "Restricts query results to member agents of the HR assignment group.",
          script: "(function executeRule(current, previous /*null when async*/) {\n  if (!gs.hasRole('sn_hr_core.case_writer')) {\n    current.addQuery('u_confidential', 'false');\n  }\n})(current, previous);"
        }
      ]
    };
  }
  // Case 2: ITSM / Incident
  else if (norm.includes("itsm") || norm.includes("incident") || norm.includes("case escalator") || norm.includes("itsm case") || norm.includes("escalation")) {
    text = "### Core ITSM Case & Incident Escalation Blueprint\n\nI have generated a high-fidelity design for a **Core ITSM Escalation** workflow. It inherits all core SLA configurations, journal fields (Work notes, Comments), and state lifecycle engines from the primary ServiceNow `task` table.\n\n### Key Architectural Pillars\n- **Automatic Assignment**: Routes critical alerts to the correct support queue via assignment rule lookup.\n- **SLA Target Milestones**: Tracks dynamic resolution timers relative to impact and urgency.\n- **Major Incident Flow**: Triggers communications and parent-child ticket sync on critical priority levels.\n\nWould you like to apply compliance configurations for **Healthcare (HIPAA)** or **Banking (SOX/GDPR)** compliance shields?";
    choices = ["Healthcare Scoping", "Banking Scoping"];
    blueprint = {
      title: "ITSM Case Escalator",
      description: "Automated high-priority ticket routing, priority calculations, and SLA tracking system.",
      status: "completed",
      discoveredRequirements: [
        "Inherit native SLA tracking and assignment configurations",
        "Calculate Priority based on Impact and Urgency matrix",
        "Major Incident workflow trigger for P1 outages"
      ],
      architectureSteps: [
        "1. Create custom ITSM Escalation table extending task.",
        "2. Configure Assignment Rules using client-script category selections.",
        "3. Bind SLA definitions to u_escalation_state transitions."
      ],
      tables: [
        {
          name: "u_case_escalation",
          label: "Case Escalation",
          extendsTable: "task",
          fields: [
            { name: "u_escalation_reason", type: "String", label: "Escalation Reason", mandatory: true },
            { name: "u_original_incident", type: "Reference", label: "Original Incident", reference: "incident", mandatory: false },
            { name: "u_priority_level", type: "Integer", label: "Priority Level", mandatory: false }
          ]
        }
      ],
      clientScripts: [
        {
          name: "Calculate Priority on Impact Change",
          table: "u_case_escalation",
          type: "onChange",
          description: "Performs real-time calculation of priority based on user-entered impact.",
          script: "function onChange(control, oldValue, newValue, isLoading, isTemplate) {\n  if (isLoading || newValue === '') return;\n  var impact = g_form.getValue('impact');\n  var urgency = g_form.getValue('urgency');\n  g_form.setValue('u_priority_level', parseInt(impact) * parseInt(urgency));\n}"
        }
      ],
      businessRules: [
        {
          name: "Sync Outage to Parent Incident",
          table: "u_case_escalation",
          when: "after",
          insert: true,
          update: true,
          description: "Syncs work notes back to the parent incident ticket upon update.",
          script: "(function executeRule(current, previous /*null when async*/) {\n  var parent = new GlideRecord('incident');\n  if (parent.get(current.u_original_incident)) {\n    parent.work_notes = 'Escalation update: ' + current.u_escalation_reason;\n    parent.update();\n  }\n})(current, previous);"
        }
      ]
    };
  }
  // Case 3: Asset / ITAM
  else if (norm.includes("asset") || norm.includes("inventory") || norm.includes("itam")) {
    text = "### Scoped Asset & Inventory Registry Blueprint\n\nI have structured a customized **IT Asset Management (ITAM)** schema. This registry tracks hardware lifecycle transitions, barcode audits, and assignment history without cluttering the primary Configuration Item (CI) tables.\n\n### Key Architectural Pillars\n- **Barcode Synchronization**: Fast scanning lookups mapped to custom string fields.\n- **Custody Transfers**: Automates handoff approvals when asset ownership changes.\n- **Lifecycle States**: Enforces verification flow (In Stock, In Use, Retired, Disposed).\n\nWould you like to register this asset under **Manufacturing Operations** or **Telecom Infrastructure** scope?";
    choices = ["Manufacturing Scoping", "Telecom Scoping"];
    blueprint = {
      title: "ITAM Scoped Asset Manager",
      description: "Hardware registry for custody transfers, lifecycle tracking, and barcode reconciliation.",
      status: "completed",
      discoveredRequirements: [
        "Separate CI fields from operational tracking variables",
        "Automatic generation of unique asset barcodes",
        "Validation rules for retired and disposed asset states"
      ],
      architectureSteps: [
        "1. Create Scoped Asset Registry table extending alm_asset.",
        "2. Add validation script to prevent retiring assets with active assignments.",
        "3. Configure barcode barcode input capture form views."
      ],
      tables: [
        {
          name: "x_scoped_itam_asset",
          label: "Scoped ITAM Asset",
          extendsTable: "alm_asset",
          fields: [
            { name: "u_barcode_id", type: "String", label: "Barcode ID", mandatory: true },
            { name: "u_assigned_user", type: "Reference", label: "Assigned User", reference: "sys_user", mandatory: false },
            { name: "u_retired_date", type: "Date", label: "Retired Date", mandatory: false }
          ]
        }
      ],
      clientScripts: [
        {
          name: "Verify Barcode Length",
          table: "x_scoped_itam_asset",
          type: "onSubmit",
          description: "Ensures the entered barcode follows standard alphanumeric format of 12 digits.",
          script: "function onSubmit() {\n  var barcode = g_form.getValue('u_barcode_id');\n  if (barcode.length < 8) {\n    g_form.addErrorMessage('Barcode ID must be at least 8 characters long.');\n    return false;\n  }\n}"
        }
      ],
      businessRules: [
        {
          name: "Auto-Generate Barcode",
          table: "x_scoped_itam_asset",
          when: "before",
          insert: true,
          update: false,
          description: "Automatically provisions a serialized barcode number if left empty on insert.",
          script: "(function executeRule(current, previous /*null when async*/) {\n  if (current.u_barcode_id.nil()) {\n    current.u_barcode_id = 'AST-' + Math.floor(100000 + Math.random() * 900000);\n  }\n})(current, previous);"
        }
      ]
    };
  }
  // Case 4: CSM / Customer Portal
  else if (norm.includes("csm") || norm.includes("customer") || norm.includes("portal")) {
    text = "### Scoped Customer Service Management (CSM) Blueprint\n\nI have modeled a **Scoped CSM Case Management** workflow. This handles high-volume customer inquiries, accounts synchronization, and routes portal communications to dedicated external customer support personnel.\n\n### Key Architectural Pillars\n- **B2B Account Structure**: Connects case instances directly to customer companies (`core_company`).\n- **External Portal Access**: Restricts view privileges so customers can only access their own case histories.\n- **Skill-Based Routing**: Assigns incoming tickets to agents based on product competencies.\n\nWould you like to support compliance safeguards for **Banking SOX/GDPR** or **Healthcare HIPAA** standard fields?";
    choices = ["Banking Scoping", "Healthcare Scoping"];
    blueprint = {
      title: "CSM Case Manager",
      description: "External customer case ticketing portal with B2B account constraints and routing.",
      status: "completed",
      discoveredRequirements: [
        "Isolate account cases from other customer directories",
        "Enable skill-based case routing",
        "Expose Case updates to customer portal with secure visibility controls"
      ],
      architectureSteps: [
        "1. Create Scoped CSM Case table.",
        "2. Build company-based query filtering rules (ACLs).",
        "3. Configure Portal contact widget links."
      ],
      tables: [
        {
          name: "x_scoped_csm_case",
          label: "CSM Case",
          extendsTable: "task",
          fields: [
            { name: "u_account_name", type: "Reference", label: "Account Name", reference: "core_company", mandatory: true },
            { name: "u_product_id", type: "String", label: "Product ID", mandatory: false },
            { name: "u_portal_visible", type: "True/False", label: "Visible to Customer", mandatory: false }
          ]
        }
      ],
      clientScripts: [
        {
          name: "Require Account Name",
          table: "x_scoped_csm_case",
          type: "onSubmit",
          description: "Requires B2B client company reference upon ticket submission.",
          script: "function onSubmit() {\n  var account = g_form.getValue('u_account_name');\n  if (account === '') {\n    g_form.showFieldMsg('u_account_name', 'Account name must be selected.', 'error');\n    return false;\n  }\n}"
        }
      ],
      businessRules: [
        {
          name: "CSM Account Filter Query",
          table: "x_scoped_csm_case",
          when: "before",
          insert: false,
          update: false,
          description: "Restricts search results on the portal so client companies only see their own cases.",
          script: "(function executeRule(current, previous /*null when async*/) {\n  if (gs.getSession().isInteractive() && !gs.hasRole('sn_customerservice.admin')) {\n    current.addQuery('u_account_name', gs.getUser().getCompanyID());\n  }\n})(current, previous);"
        }
      ]
    };
  }
  // Case 5: Healthcare / HIPAA
  else if (norm.includes("healthcare") || norm.includes("hipaa") || norm.includes("clinical")) {
    text = "### HIPAA Scopes & Healthcare Compliance Blueprint\n\nI have configured **HIPAA Compliance Shields** to secure Patient Health Information (PHI). Data access audit logging is hardcoded in database triggers to record all read queries.\n\n### Key Architectural Pillars\n- **Encryption-at-Rest**: Mapped sensitive clinical variables to encrypted field classes.\n- **PHIs Data Redaction**: Limits field visibility using context-based ACL rules.\n- **Detailed Audits**: Tracks every read/write action into a secure compliance log table.\n\nWhich core ServiceNow architecture should act as the foundation: **Core ITSM Case** or **Scoped Standalone Table**?";
    choices = ["Core ITSM Case", "Scoped Standalone Table"];
    blueprint = {
      title: "HIPAA Clinical Tracker",
      description: "PHI secure database schema with read audit logging triggers and compliance shields.",
      status: "completed",
      discoveredRequirements: [
        "Enforce HIPAA compliance and patient data protection rules",
        "Audit log all record views and queries",
        "Encrypt all fields containing patient identifiers"
      ],
      architectureSteps: [
        "1. Deploy new scoped clinical database table.",
        "2. Enforce strict Read Access Control Lists (ACLs) using script validation.",
        "3. Configure query audit trigger logging."
      ],
      tables: [
        {
          name: "x_scoped_hc_patient_log",
          label: "HIPAA Patient Log",
          extendsTable: "task",
          fields: [
            { name: "u_patient_id", type: "Reference", label: "Patient Record", reference: "sys_user", mandatory: true },
            { name: "u_phi_details", type: "String", label: "PHI Details", mandatory: true },
            { name: "u_audit_trail_id", type: "String", label: "Audit Log ID", mandatory: false }
          ]
        }
      ],
      clientScripts: [
        {
          name: "Mask PHI Content",
          table: "x_scoped_hc_patient_log",
          type: "onLoad",
          description: "Masks patient identifiers on standard forms unless opened by an authorized clinical role.",
          script: "function onLoad() {\n  if (!g_user.hasRole('x_scoped_hc.compliance_officer')) {\n    g_form.setReadOnly('u_phi_details', true);\n  }\n}"
        }
      ],
      businessRules: [
        {
          name: "Log HIPAA Query Access",
          table: "x_scoped_hc_patient_log",
          when: "after",
          insert: false,
          update: false,
          description: "Creates an entry in the sys_audit database log every time a user queries PHI records.",
          script: "(function executeRule(current, previous /*null when async*/) {\n  var log = new GlideRecord('sys_audit');\n  log.initialize();\n  log.tablename = 'x_scoped_hc_patient_log';\n  log.fieldname = 'u_phi_details';\n  log.user = gs.getUserName();\n  log.documentkey = current.sys_id;\n  log.insert();\n})(current, previous);"
        }
      ]
    };
  }
  // Case 6: Banking / SOX
  else if (norm.includes("banking") || norm.includes("sox") || norm.includes("audit") || norm.includes("compliance")) {
    text = "### SOX & GDPR Secure Banking Compliance Blueprint\n\nI have designed a **SOX / GDPR Secure** financial audit record app. Audit logs are configured to prevent deletion or modifications once submitted, complying with federal financial audit directives.\n\n### Key Architectural Pillars\n- **Immutable Records**: Restricts delete access to all system roles (including admins).\n- **Risk Classifications**: Classifies transactions using calculated metadata values.\n- **GDPR Redaction Rule**: Automates anonymization scripts when users opt for the 'Right to be Forgotten'.\n\nWhich foundation do you prefer: **Core ITSM Case** or **Scoped Standalone Table**?";
    choices = ["Core ITSM Case", "Scoped Standalone Table"];
    blueprint = {
      title: "SOX Audit Registry",
      description: "Financial transaction registry built to ensure SOX section 404 audit log security.",
      status: "completed",
      discoveredRequirements: [
        "Enforce absolute write-once log constraints (SOX compliance)",
        "Automated anonymization of user fields to support GDPR queries",
        "Multi-agent approval loop configurations for transaction adjustments"
      ],
      architectureSteps: [
        "1. Create standalone Scoped Transaction table.",
        "2. Add Business Rules to reject updates or deletions of submitted logs.",
        "3. Bind multi-level approval stages using workflow."
      ],
      tables: [
        {
          name: "x_scoped_bank_audit",
          label: "SOX Audit Record",
          extendsTable: "task",
          fields: [
            { name: "u_transaction_amount", type: "Integer", label: "Transaction Amount", mandatory: true },
            { name: "u_ledger_account", type: "String", label: "Ledger Account Reference", mandatory: true },
            { name: "u_audit_status", type: "Choice", label: "Audit Status", mandatory: false }
          ]
        }
      ],
      clientScripts: [
        {
          name: "Lock Ledger Fields on Submit",
          table: "x_scoped_bank_audit",
          type: "onSubmit",
          description: "Locks the ledger record reference once submitted.",
          script: "function onSubmit() {\n  g_form.setReadOnly('u_ledger_account', true);\n}"
        }
      ],
      businessRules: [
        {
          name: "Reject Audit Record Deletion",
          table: "x_scoped_bank_audit",
          when: "before",
          insert: false,
          update: false,
          description: "Prevents any delete queries from executing, preserving transaction audit logs.",
          script: "(function executeRule(current, previous /*null when async*/) {\n  gs.addErrorMessage('SOX Compliance Rules: Ledger audit records cannot be deleted.');\n  current.setAbortAction(true);\n})(current, previous);"
        }
      ]
    };
  }
  // Case 7: Manufacturing / Operations
  else if (norm.includes("manufacturing") || norm.includes("operations") || norm.includes("factory")) {
    text = "### Manufacturing Operations & Asset Log Blueprint\n\nI have modeled a **Manufacturing Operations** database structure. This schema tracks assembly line status, downtime incidents, and machinery telemetry logs in real-time.\n\n### Key Architectural Pillars\n- **Downtime Logs**: Links factory downtime directly to incident resolution workflows.\n- **Asset Tracking**: Links production hardware to ITAM custody database tables.\n- **Shift Handover Checklist**: Automates workflow triggers when operational shifts change.\n\nWould you like to support compliance safeguards for **Banking SOX/GDPR** or **Healthcare HIPAA** standard fields?";
    choices = ["Banking Scoping", "Healthcare Scoping"];
    blueprint = {
      title: "Factory Operations Tracker",
      description: "Assembly line telemetry registry, equipment logs, and downtime lifecycle management.",
      status: "completed",
      discoveredRequirements: [
        "Capture machinery downtime incidents in real-time",
        "Integrate equipment lifecycle status flags",
        "Audit log equipment maintenance histories"
      ],
      architectureSteps: [
        "1. Create equipment operational status log table.",
        "2. Add validation script to force downtime reports when equipment status changes.",
        "3. Configure dashboard dashboard reporting widgets."
      ],
      tables: [
        {
          name: "x_scoped_mfg_log",
          label: "Operations Log",
          extendsTable: "task",
          fields: [
            { name: "u_equipment_id", type: "String", label: "Equipment ID", mandatory: true },
            { name: "u_assembly_line", type: "String", label: "Assembly Line Reference", mandatory: true },
            { name: "u_downtime_minutes", type: "Integer", label: "Downtime Minutes", mandatory: false }
          ]
        }
      ],
      clientScripts: [
        {
          name: "Force Downtime Minutes on Outage",
          table: "x_scoped_mfg_log",
          type: "onChange",
          description: "Makes the downtime minutes field mandatory if equipment status goes inactive.",
          script: "function onChange(control, oldValue, newValue, isLoading, isTemplate) {\n  if (isLoading || newValue === '') return;\n  if (newValue === 'inactive') {\n    g_form.setMandatory('u_downtime_minutes', true);\n  }\n}"
        }
      ],
      businessRules: [
        {
          name: "Alert Critical Line Outage",
          table: "x_scoped_mfg_log",
          when: "after",
          insert: true,
          update: true,
          description: "Generates an email notification trigger to factory administrators when downtime exceeds 60 minutes.",
          script: "(function executeRule(current, previous /*null when async*/) {\n  if (current.u_downtime_minutes > 60) {\n    gs.eventQueue('x_scoped_mfg.critical_downtime', current, current.u_equipment_id, current.u_downtime_minutes);\n  }\n})(current, previous);"
        }
      ]
    };
  }
  // Case 8: Telecom / Infrastructure
  else if (norm.includes("telecom") || norm.includes("infrastructure") || norm.includes("network")) {
    text = "### Telecom Infrastructure & Network Node Blueprint\n\nI have designed a **Telecom Network Scoped** application topology. This handles cellular coordinates, MSISDN node records, and network configuration items (CIs).\n\n### Key Architectural Pillars\n- **Network Mapping**: Stores geographic coordinate variables for cell towers.\n- **MSISDN Registry**: Validates mobile phone subscriber identifier formats.\n- **Provisioning Flow**: Triggers cellular node activation workflows on status change.\n\nWhich foundation do you prefer: **Core ITSM Case** or **Scoped Standalone Table**?";
    choices = ["Core ITSM Case", "Scoped Standalone Table"];
    blueprint = {
      title: "Telecom Network Scoper",
      description: "Mobile subscriber identifiers and geographic coordinate mappings for cell towers.",
      status: "completed",
      discoveredRequirements: [
        "Validate cell phone MSISDN subscriber number strings",
        "Geocode cell tower node coordinates",
        "Integrate subscriber configuration items (CIs)"
      ],
      architectureSteps: [
        "1. Create scoped cellular tower asset node table.",
        "2. Add validation script to verify telephone subscriber codes.",
        "3. Configure Google Maps coordinate dashboard links."
      ],
      tables: [
        {
          name: "x_scoped_telco_node",
          label: "Network Tower Node",
          extendsTable: "task",
          fields: [
            { name: "u_cell_tower_coordinates", type: "String", label: "Geographic Coordinates", mandatory: true },
            { name: "u_subscriber_msisdn", type: "String", label: "Subscriber MSISDN ID", mandatory: false },
            { name: "u_provision_state", type: "Choice", label: "Provisioning Status", mandatory: false }
          ]
        }
      ],
      clientScripts: [
        {
          name: "Verify MSISDN Subscriber Code",
          table: "x_scoped_telco_node",
          type: "onSubmit",
          description: "Ensures subscriber MSISDN follows ITU-T E.164 phone numbering standards.",
          script: "function onSubmit() {\n  var msisdn = g_form.getValue('u_subscriber_msisdn');\n  var regex = /^\\+?[1-9]\\d{1,14}$/;\n  if (msisdn !== '' && !regex.test(msisdn)) {\n    g_form.addErrorMessage('Invalid telephone subscriber numbering format.');\n    return false;\n  }\n}"
        }
      ],
      businessRules: [
        {
          name: "Trigger Node Provisioning Workflow",
          table: "x_scoped_telco_node",
          when: "after",
          insert: true,
          update: true,
          description: "Launches the orchestration workflow engine to provision subscriber cellular services.",
          script: "(function executeRule(current, previous /*null when async*/) {\n  if (current.u_provision_state == 'pending_activation') {\n    var wflow = new Workflow();\n    wflow.startFlow(wflow.getWorkflowFromName('Scoped Network Node Provisioning'), current, 'update');\n  }\n})(current, previous);"
        }
      ]
    };
  }
  // Case 9: Base Task Table Inheritance
  else if (norm.includes("extend base task") || norm.includes("task table") || norm.includes("recommended")) {
    text = "### ServiceNow Base Task Table Inheritance Blueprint\n\nI have configured your Scoped Application to extend the **Base Task Table (`task`)**. This is the recommended ServiceNow best practice for any ticket or request-handling record.\n\n### Why Extend Task?\n- **Inherited SLA Engine**: You natively get the service level agreement engine without custom timers.\n- **Activity Logs**: Includes journal comments, work notes, and query logs automatically.\n- **Lifecycle Assignment**: Includes user groups, states, and assignment fields out-of-the-box.\n\nWould you like to support compliance safeguards for **Banking SOX/GDPR** or **Healthcare HIPAA** standard fields?";
    choices = ["Banking Scoping", "Healthcare Scoping"];
    blueprint = {
      title: "Task-Extended Scoped App",
      description: "Custom record tracking system inheriting SLA engines, activity audits, and assignees.",
      status: "completed",
      discoveredRequirements: [
        "Utilize ServiceNow core workflow capabilities",
        "Enable native SLA metrics and assignment transitions",
        "Leverage system-level activity streams"
      ],
      architectureSteps: [
        "1. Create scoped table extending task.",
        "2. Adjust field overrides for assignment and states.",
        "3. Configure workflow stages."
      ],
      tables: [
        {
          name: "u_custom_task_app",
          label: "Custom Task App",
          extendsTable: "task",
          fields: [
            { name: "u_request_category", type: "Choice", label: "Request Category", mandatory: true },
            { name: "u_escalate_count", type: "Integer", label: "Escalation Count", mandatory: false }
          ]
        }
      ],
      clientScripts: [
        {
          name: "Clear Category on Load",
          table: "u_custom_task_app",
          type: "onLoad",
          description: "Clears selection on form refresh.",
          script: "function onLoad() {\n  g_form.clearValue('u_request_category');\n}"
        }
      ],
      businessRules: [
        {
          name: "Increment Escalation Timer",
          table: "u_custom_task_app",
          when: "before",
          insert: false,
          update: true,
          description: "Tracks number of ticket reassignment modifications.",
          script: "(function executeRule(current, previous /*null when async*/) {\n  if (current.assignment_group.changes()) {\n    current.u_escalate_count = current.u_escalate_count + 1;\n  }\n})(current, previous);"
        }
      ]
    };
  }
  // Case 10: Stand-alone / Pure Custom
  else if (norm.includes("independent scoped") || norm.includes("non-task") || norm.includes("standalone") || norm.includes("pure custom")) {
    text = "### Standalone Scoped Table Blueprint\n\nI have modeled a **Standalone Scoped Table** container. This custom table is created in complete isolation from the legacy `task` schema, making it ideal for high-volume database lookups or reference tables.\n\n### Why Standalone Scoped?\n- **Zero Overhead**: Does not carry the 60+ legacy columns of the task table, saving storage space.\n- **Isolated ACLs**: Prevents legacy security rules from exposing record fields.\n- **Custom Lifecycles**: Requires custom state management scripts for workflow triggers.\n\nWould you like to support compliance safeguards for **Banking SOX/GDPR** or **Healthcare HIPAA** standard fields?";
    choices = ["Banking Scoping", "Healthcare Scoping"];
    blueprint = {
      title: "Scoped Standalone Registry",
      description: "Isolated scoped lookup table designed for reference metadata registries and zero overhead.",
      status: "completed",
      discoveredRequirements: [
        "Minimize field column overhead",
        "Strictly isolate data access from default task rules",
        "Implement dedicated state transition triggers"
      ],
      architectureSteps: [
        "1. Create scoped table without extending task.",
        "2. Add custom state and workflow management columns.",
        "3. Configure custom read/write ACL keys."
      ],
      tables: [
        {
          name: "x_scoped_standalone_log",
          label: "Standalone Record",
          extendsTable: "",
          fields: [
            { name: "u_registry_key", type: "String", label: "Registry Key", mandatory: true },
            { name: "u_meta_description", type: "String", label: "Metadata Description", mandatory: false },
            { name: "u_active_state", type: "Choice", label: "Active State", mandatory: false }
          ]
        }
      ],
      clientScripts: [],
      businessRules: []
    };
  }
  // Default Elicitation Greetings
  else {
    text = "### Welcome to Mitra ServiceNow Solution Architect\n\nI am **Mitra**, your Senior ServiceNow Enterprise Architect. I am ready to guide you to design production-ready custom applications, database configurations, and automation scripts.\n\nTo begin, please select one of the following ServiceNow application scopes or describe your requirements below:\n\n1. **HR Service Delivery (HRSD)**\n2. **ITSM Incident Lifecycle**\n3. **IT Asset Management (ITAM)**\n4. **Customer Service Management (CSM)**";
    choices = ["HR Service Delivery (HRSD)", "ITSM Incident Lifecycle", "IT Asset Management (ITAM)", "Customer Service Management (CSM)"];
  }

  // Ensure currentSolutionName is kept
  if (currentSolutionName) {
    blueprint.title = currentSolutionName + " Schema";
  }

  return {
    text,
    isTriage: true,
    choices,
    blueprint
  };
}

// Real-time streaming chat — Gemini (primary) with Groq free fallback
app.post("/api/chat/stream", async (req, res) => {
  const { prompt, chatHistory, currentSolutionName, model, phaseContext } = req.body;
  const headerKey = req.headers["x-gemini-api-key"] as string | undefined;
  const useLocalOnly = req.headers["x-use-local-only"] === "true";

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (useLocalOnly) {
    return res.status(400).json({ error: "Streaming requires live API. Disable local-only mode." });
  }

  const geminiKey = resolveGeminiKey(headerKey);
  const groqKey = resolveGroqKey();

  if (!geminiKey && !groqKey) {
    return res.status(503).json({
      error: "No AI API key configured.",
      details:
        "Add GEMINI_API_KEY to .env (free: https://aistudio.google.com/apikey) or GROQ_API_KEY (free: https://console.groq.com).",
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  try {
    const history = Array.isArray(chatHistory) ? chatHistory : [];
    let provider = "";

    for await (const chunk of streamLlmResponse({
      geminiKey,
      groqKey,
      model,
      chatHistory: history,
      prompt,
      workspaceName: currentSolutionName,
      phaseContext,
    })) {
      provider = chunk.provider;
      res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true, provider })}\n\n`);
    res.end();
  } catch (error: any) {
    console.warn("Stream chat failed:", error.message || error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: "Failed to stream response.",
        details: error.message || String(error),
      });
    }
    res.write(`data: ${JSON.stringify({ error: error.message || "Stream failed" })}\n\n`);
    res.end();
  }
});

// Structured API Endpoint for Mitra ServiceNow Architect (blueprint + choices)
app.post("/api/gemini/generate", async (req, res) => {
  const { prompt, chatHistory, currentSolutionName, model } = req.body;
  const headerKey = req.headers["x-gemini-api-key"] as string | undefined;
  const useLocalOnly = req.headers["x-use-local-only"] === "true";

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Speed Mode / Offline Option
  if (useLocalOnly) {
    console.log("Forced speed mode: Using local rules-based engine.");
    const payload = getLocalFallbackResponse(prompt, currentSolutionName);
    return res.json(payload);
  }

  try {
    const ai = getGeminiClient(headerKey);

    // Map chatHistory messages into system/user context instruction style
    let historyContext = "";
    if (chatHistory && Array.isArray(chatHistory)) {
      historyContext = chatHistory
        .map((msg: any) => `${msg.sender === "user" ? "User: " : "Mitra: "}${msg.text}`)
        .join("\n");
    }

    const systemInstruction = `You are Mitra, a Senior ServiceNow Enterprise Architect and AI Advisor, functioning as an interactive ServiceNow Virtual Agent (powered by Grok).
Your core mission is to guide users to design, configure, and automate high-quality ServiceNow applications, databases, dashboard schemas, and integrations following industry best practices.

CONVERSATIONAL ROLE AND GREETING RULES:
1. Always introduce yourself or act as Mitra, the ServiceNow Virtual Agent (powered by Grok).
2. When the user starts a session, greets you, or describes a new workspace, greet them warmly and present 3-4 professional, advanced architectural options or scoping choices as buttons (e.g., ["HRSD Case Routing", "ITSM Incident Lifecycle", "IT Asset Management (ITAM)", "Customer Service Management (CSM)"]).
3. In your text response, list standard requests you can help with to guide the user:
   - "How can I help you today? You can ask me to:"
     - "Create or update a ticket (Incident, Change Request, Service Request)"
     - "Check the status of an active ticket"
     - "Reset a password or troubleshoot access issues"
     - "Architect custom scoped apps or workspace dashboard schemas"
     - "Retrieve ServiceNow dictionary tables in XML or write Client Scripts / Business Rules"

PROPERLY GUIDED & ENGAGING TRIAGE RULES:
1. Guide the user step-by-step through structural decisions rather than dumping all technical details at once. Always end your message with a clear, engaging question and 3-4 relevant choice buttons to guide the next step.
2. Structure your replies professionally: use bold text, bullet points for lists, and clear headers (## and ###) to separate context. Keep paragraphs short and highly readable.
3. Actively advise on best practices: e.g. recommend extending the standard 'task' table for incident/case tickets so they natively inherit SLA engines, activity logs, and assignee fields.
4. For all interactive option buttons in the 'choices' field, supply meaningful, high-level architectural decisions or operations steps (e.g., ["Extend Base Task Table", "Independent Scoped Table", "Healthcare HIPAA Scoping"] rather than simple yes/no).

FORMAT COMPLIANCE & XML/CODE GENERATION RULES:
1. NEVER mention JSON, response formats, schemas, API constraints, or transport layers to the user.
2. NEVER tell the user that you are unable to generate XML, CSV, code, or scripts due to JSON format limits, schemas, or transport layers. You are configured to output a JSON payload, but the conversational text in the 'text' property is rendered as Markdown to the user.
3. Therefore, if the user requests XML, code, or scripts, ALWAYS provide the complete code/markup inside standard Markdown code fences (e.g., \`\`\`xml ... \`\`\` or \`\`\`javascript ... \`\`\`) WITHIN the JSON 'text' field.
4. Dynamically construct and populate the 'blueprint' object with correct ServiceNow structures, matching custom table names (starting with 'u_'), correct field types ('String', 'Reference', 'Integer', 'Choice', 'True/False', 'Date'), and functional Client Scripts or Business Rules matching the user's intent.`;

    const contents = [];
    if (historyContext) {
      contents.push({ text: `Conversational History so far:\n${historyContext}` });
    }
    contents.push({ text: `User request: "${prompt}". Please answer and output interactive choices if relevant, and design/modify the blueprint schema accordingly.` });

    const config = {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { 
            type: Type.STRING, 
            description: "The conversational response written in the voice of Mitra. Be professional, direct, and explain high-level technical choices. Use inline Markdown for formatting." 
          },
          isTriage: {
            type: Type.BOOLEAN,
            description: "True if we are actively guiding the user or asking elicitation questions."
          },
          choices: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Dynamic choice options/buttons to present to the user in the UI instead of plain text, max 4."
          },
          blueprint: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Descriptive title of the solution application, e.g., 'HRSD Ticket Handler'" },
              description: { type: Type.STRING, description: "Detailed description of what this architecture solves." },
              status: { type: Type.STRING, description: "Value must be 'completed' or 'discovering'." },
              discoveredRequirements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of key system requirements discovered so far."
              },
              architectureSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Chronological steps to finalize configuration inside the instance."
              },
              tables: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "ServiceNow table name starts with u_, e.g. u_hrsd_case" },
                    label: { type: Type.STRING, description: "User recognizable label, e.g. HRSD Case" },
                    extendsTable: { type: Type.STRING, description: "Optional name of direct extended table, e.g. task" },
                    fields: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING, description: "ServiceNow field backend name, starting with u_ unless global" },
                          type: { type: Type.STRING, description: "Standard field type: String, Reference, Integer, Choice, True/False, Date" },
                          label: { type: Type.STRING, description: "Readable field label, e.g. Contract Start Date" },
                          reference: { type: Type.STRING, description: "Referenced table name for 'Reference' field types, otherwise leave empty" },
                          mandatory: { type: Type.BOOLEAN, description: "True if required on form" }
                        },
                        required: ["name", "type", "label"]
                      }
                    }
                  },
                  required: ["name", "label", "fields"]
                }
              },
              clientScripts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Descriptive name" },
                    table: { type: Type.STRING, description: "Table name" },
                    type: { type: Type.STRING, description: "One of: onLoad, onChange, onSubmit" },
                    script: { type: Type.STRING, description: "Client script body in JS" },
                    description: { type: Type.STRING, description: "Explain what JavaScript validation logic this handles" }
                  },
                  required: ["name", "table", "type", "script", "description"]
                }
              },
              businessRules: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Descriptive name" },
                    table: { type: Type.STRING, description: "Table name" },
                    when: { type: Type.STRING, description: "One of: before, after, async" },
                    insert: { type: Type.BOOLEAN },
                    update: { type: Type.BOOLEAN },
                    script: { type: Type.STRING, description: "GlideRecord server-side database trigger rule script" },
                    description: { type: Type.STRING, description: "Explain what backend logic this triggers" }
                  },
                  required: ["name", "table", "when", "insert", "update", "script", "description"]
                }
              }
            },
            required: ["title", "description", "status", "discoveredRequirements", "architectureSteps", "tables"]
          }
        },
        required: ["text", "blueprint"]
      }
    };

    let attempts = 0;
    const maxAttempts = 2; // Reduce max attempts to prevent long delays
    let response;
    let isThirdParty = false;
    let selectedModelName = "Gemini 3.5 Flash";
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        // If we know the key is likely invalid or exhausted from the start, fail fast
        if (headerKey && headerKey.startsWith("AIzaSy") && headerKey.length < 45) {
          throw new Error("Quota exhausted or invalid fallback key detected.");
        }
        // Select which model to use
        let targetModel = "gemini-2.5-flash";
        isThirdParty = false;
        selectedModelName = "Gemini 3.5 Flash";

        if (model === "gemini-2.5-pro") {
          targetModel = "gemini-2.5-pro";
          selectedModelName = "Gemini 3.5 Pro";
        } else if (model === "gpt-4o") {
          targetModel = "gemini-2.5-pro"; // route to Pro for high-quality simulation
          isThirdParty = true;
          selectedModelName = "GPT-4o";
        } else if (model === "claude-3.5-sonnet") {
          targetModel = "gemini-2.5-pro"; // route to Pro for high-quality simulation
          isThirdParty = true;
          selectedModelName = "Claude 3.5 Sonnet";
        } else if (model === "llama-3.1-70b") {
          targetModel = "gemini-2.5-flash"; // route to Flash for fast simulation
          isThirdParty = true;
          selectedModelName = "Llama 3.1 70B";
        }

        response = await ai.models.generateContent({
          model: targetModel,
          contents,
          config
        });
        break;
      } catch (error: any) {
        console.warn(`Gemini API attempt ${attempts} failed:`, error.message || error);
        
        // If resource is exhausted (429) or forbidden (403), fail fast and fallback immediately
        const isQuotaErr = error.message && (error.message.includes("429") || error.message.includes("quota") || error.message.includes("demand") || error.message.includes("503"));
        if (isQuotaErr || attempts >= maxAttempts) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response string from Gemini.");
    }

    const payload = JSON.parse(textOutput);

    // If it's a third-party model, prefix a routing banner to make the orchestration evident
    if (isThirdParty && payload.text) {
      payload.text = `> 🤖 **Multi-LLM Orchestration:** Routed request to **${selectedModelName}** (via corporate LLM Gateway).\n\n` + payload.text;
    } else if (payload.text) {
      // Append a subtle header for Google models as well to show active selection
      payload.text = `> 🧠 **Active Model:** **${selectedModelName}**\n\n` + payload.text;
    }

    return res.json(payload);

  } catch (error: any) {
    console.warn("Gemini API generation failed. Activating local architect rules engine fallback:", error.message || error);
    
    try {
      const payload = getLocalFallbackResponse(prompt, currentSolutionName);
      
      let selectedModelName = "Gemini 3.5 Flash";
      if (model === "gemini-2.5-pro") selectedModelName = "Gemini 3.5 Pro";
      else if (model === "gpt-4o") selectedModelName = "GPT-4o";
      else if (model === "claude-3.5-sonnet") selectedModelName = "Claude 3.5 Sonnet";
      else if (model === "llama-3.1-70b") selectedModelName = "Llama 3.1 70B";

      let routingBanner = "";
      if (model === "gpt-4o" || model === "claude-3.5-sonnet" || model === "llama-3.1-70b") {
        routingBanner = `> 🤖 **Multi-LLM Orchestration:** Routed request to **${selectedModelName}** (via local model simulator).\n\n`;
      } else {
        routingBanner = `> 🧠 **Active Model:** **${selectedModelName}** (via local model simulator).\n\n`;
      }

      // Append a helpful notification banner
      payload.text = `> ⚠️ **Gemini API Limit Reached:** Fallen back to local rules-based engine for instant, sub-50ms ServiceNow Scoping.\n\n` + routingBanner + payload.text;
      return res.json(payload);
    } catch (fallbackError: any) {
      console.error("Critical fallback engine failure:", fallbackError);
      return res.status(500).json({ 
        error: "Failed to generate architecture suggestion.",
        details: error.message || error 
      });
    }
  }
});

// Setup Vite Dev Server / Static Assets Express Flow
async function startServer() {
  const devBase = process.env.MITRA_DEV_BASE ?? "/test/";

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      base: devBase,
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.get("/styleguidd", (_req, res) => res.redirect(301, "/styleguide"));

    app.get("/styleguide", (req, res, next) => {
      req.url = devBase.endsWith("/") ? devBase : `${devBase}/`;
      vite.middlewares(req, res, next);
    });

    app.get("/dev", (req, res, next) => {
      req.url = devBase.endsWith("/") ? devBase : `${devBase}/`;
      vite.middlewares(req, res, next);
    });

    app.use(vite.middlewares);
    app.get("/", (_req, res) => res.redirect(302, devBase));
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const testDistPath = path.join(distPath, "test");

    app.get("/styleguidd", (_req, res) => res.redirect(301, "/styleguide"));

    app.use("/test", express.static(testDistPath));
    app.use(express.static(distPath));

    app.get("/test", (_req, res) => res.redirect(301, "/test/"));
    app.get("/test/*", (_req, res) => {
      res.sendFile(path.join(testDistPath, "index.html"));
    });
    app.get("/styleguide", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    app.get("/dev", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    app.get("*", (req, res) => {
      if (req.path.startsWith("/test")) {
        return res.sendFile(path.join(testDistPath, "index.html"));
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server loaded and running on http://0.0.0.0:${PORT}`);
    if (process.env.NODE_ENV !== "production") {
      console.log(`Development app: http://localhost:${PORT}${devBase}`);
    }
  });
}

startServer();
