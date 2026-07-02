import { ArtifactFormat, RequirementsDocument, RequirementsSection, SolutionArtifact } from '../types';
import { buildRequirementsSections, sectionsToMarkdown } from './requirementsDocument';

export type DocumentPreviewVariant = 'doc' | 'pdf';

export function isPrintLikeFormat(format: ArtifactFormat): DocumentPreviewVariant {
  return format === 'PDF' ? 'pdf' : 'doc';
}

export function isDocumentArtifact(artifact: SolutionArtifact): boolean {
  return (
    artifact.type === 'requirements_doc' ||
    artifact.type === 'executive_summary' ||
    artifact.type === 'rfp_package' ||
    artifact.type === 'test_script' ||
    artifact.type === 'deployment_checklist' ||
    artifact.artifactFormat === 'DOC' ||
    artifact.artifactFormat === 'WORD' ||
    artifact.artifactFormat === 'PDF'
  );
}

function parseTextToSections(content: string, defaultTitle = 'Overview'): RequirementsSection[] {
  const blocks = content.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length <= 1) {
    return [{ id: 'overview', title: defaultTitle, body: content.trim() }];
  }
  return blocks.map((block, i) => {
    const lines = block.split('\n');
    const first = lines[0] ?? '';
    const isHeading = lines.length > 1 && first.length < 80 && !first.startsWith('•') && !/^\d+\./.test(first);
    if (isHeading) {
      return {
        id: `section-${i}`,
        title: first.replace(/^#+\s*/, ''),
        body: lines.slice(1).join('\n').trim(),
      };
    }
    return { id: `section-${i}`, title: i === 0 ? defaultTitle : `Section ${i + 1}`, body: block };
  });
}

const SCOPE_BRIEF_SECTIONS: Record<string, RequirementsSection[]> = {
  'hr-req': [
    {
      id: 'overview',
      title: 'Scope Overview',
      body: 'Employee Relations intake on HR Service Delivery — scoped application with Employee Center catalog integration.',
    },
    {
      id: 'process',
      title: 'Process Scope',
      body: '1. Employee submits confidential or general HR case via catalog\n2. Case routes to Center of Excellence based on topic\n3. HR agent resolves with audit trail and closure codes',
    },
    {
      id: 'platform',
      title: 'Platform & Integration',
      body: '• Platform: HR Service Delivery (scoped app)\n• Integration: Employee Center catalog\n• Data: HR profile reference on every case',
    },
    {
      id: 'security',
      title: 'Confidentiality',
      body: '• HR-scoped ACLs on case records\n• Confidential flag restricts visibility to authorized HR roles\n• Audit logging on all field changes',
    },
  ],
  'eo-req': [
    {
      id: 'overview',
      title: 'Project Objective',
      body: 'Digitize employee onboarding handoffs — from offer acceptance through day-one provisioning — in a single trackable workflow.',
    },
    {
      id: 'functional',
      title: 'Functional Requirements',
      body: '1. New hire record created from HRIS feed\n2. Task checklist assigned to HR, IT, and hiring manager\n3. Status dashboard for onboarding coordinator',
    },
    {
      id: 'metrics',
      title: 'Success Metrics',
      body: '• Reduce time-to-productivity by 30%\n• Zero missed provisioning steps in pilot cohort',
    },
  ],
  'vm-req': [
    {
      id: 'overview',
      title: 'Project Objective',
      body: 'Centralize vendor onboarding, contract tracking, and performance reviews in a scoped ServiceNow application.',
    },
    {
      id: 'functional',
      title: 'Functional Requirements',
      body: '1. Vendor registration portal with document upload\n2. Contract renewal alerts 90 days before expiry\n3. Scorecard reviews linked to purchase orders',
    },
  ],
  'at-req': [
    {
      id: 'overview',
      title: 'Project Objective',
      body: 'Track IT assets from procurement through assignment, maintenance, and retirement with barcode scanning support.',
    },
    {
      id: 'functional',
      title: 'Functional Requirements',
      body: '1. Asset lifecycle states: ordered, in stock, assigned, retired\n2. Check-in/check-out with employee self-service\n3. Integration with procurement and CMDB',
    },
  ],
};

export function getArtifactDocumentSections(
  artifact: SolutionArtifact,
  requirementsDoc?: RequirementsDocument,
  solutionTitle?: string,
): RequirementsSection[] | null {
  if (artifact.type === 'requirements_doc') {
    if (requirementsDoc?.sections?.length) {
      return requirementsDoc.sections;
    }
    const preset = SCOPE_BRIEF_SECTIONS[artifact.id];
    if (preset) return preset;
    if (solutionTitle) {
      return buildRequirementsSections(solutionTitle, []);
    }
    return parseTextToSections(`${artifact.name} — draft content pending discovery completion.`, 'Scope Brief');
  }

  if (artifact.type === 'executive_summary') {
    return parseTextToSections(
      artifact.id === 'hr-summary'
        ? 'Executive Summary — HR Ticketing System\n\nScope\nEmployee Relations on HR Service Delivery with confidential case handling.\n\nTimeline\nQ3 go-live · 6–8 weeks after stakeholder approval.\n\nInvestment\nScoped application build with standard HRSD integration — no custom platform extensions.'
        : `${artifact.name} for ${solutionTitle ?? 'this solution'}.\n\nKey outcomes, timeline, and investment summary will appear here after Phase 3 synthesis.`,
      'Executive Summary',
    );
  }

  if (artifact.type === 'rfp_package') {
    return [
      {
        id: 'package',
        title: 'RFP Package Contents',
        body: '1. Requirements Document (approved)\n2. Data model and table dictionary\n3. Workflow and form specifications\n4. Update set export manifest',
      },
      {
        id: 'export',
        title: 'Export Status',
        body: artifact.status === 'not_started'
          ? 'Package assembly begins after Phase 4 gate approval.'
          : 'Update set compiled — ready for partner handoff.',
      },
    ];
  }

  if (artifact.type === 'test_script' || artifact.type === 'deployment_checklist') {
    return [
      {
        id: 'purpose',
        title: artifact.type === 'test_script' ? 'Test Coverage' : 'Deployment Steps',
        body:
          artifact.type === 'test_script'
            ? '1. Intake form validation\n2. Routing rules by topic\n3. Confidential case ACL verification\n4. Employee Center catalog entry'
            : '1. Validate update set in sub-production\n2. Run regression test script\n3. Stakeholder sign-off\n4. Production deployment window',
      },
    ];
  }

  if (artifact.type === 'role_matrix') {
    return parseTextToSections(
      'HR ACL Role Matrix\n\nRoles\n• sn_hr_core.case_writer — create and update HR cases\n• hr_admin — full HRSD administration\n• employee_center_user — submit catalog requests',
      'Access Control',
    );
  }

  const preview = getArtifactPreviewContent(artifact, requirementsDoc);
  if (preview.kind === 'text' || preview.kind === 'download') {
    return parseTextToSections(preview.content, artifact.name);
  }

  return null;
}

export function getArtifactPreviewContent(
  artifact: SolutionArtifact,
  requirementsDoc?: RequirementsDocument,
): {
  kind: 'html' | 'code' | 'download' | 'text';
  language?: string;
  content: string;
  downloadLabel?: string;
} {
  switch (artifact.id) {
    case 'hr-req':
      return {
        kind: 'text',
        content:
          'HRSD Scope Brief\n\nProcess: Employee Relations\nPlatform: HR Service Delivery (scoped app)\nIntegration: Employee Center catalog\nConfidentiality: HR-scoped ACLs required',
      };
    case 'hr-data':
      return {
        kind: 'code',
        language: 'xml',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<table name="u_hrsd_employee_onboarding_case" extends="sn_hr_core_case">
  <element name="u_hr_profile" type="reference" reference="sn_hr_core_profile" mandatory="true"/>
  <element name="u_topic_category" type="choice"/>
  <element name="u_confidential" type="boolean" default="false"/>
</table>`,
      };
    case 'hr-flow':
      return {
        kind: 'html',
        content: `<section style="font-family:system-ui;padding:12px">
  <h3 style="margin:0 0 8px;font-size:13px">Form layout — HRSD Case</h3>
  <ol style="margin:0;padding-left:18px;font-size:12px;line-height:1.6">
    <li>Requester — employee, HR profile</li>
    <li>Case details — topic, confidential flag</li>
    <li>Resolution — COE group, closure code</li>
  </ol>
  <p style="margin:10px 0 0;font-size:11px;color:#64748b">sys_ui_form · x_mitra_hr_case</p>
</section>`,
      };
    case 'hr-roles':
      return {
        kind: 'download',
        content: 'HR ACL Role Matrix — sn_hr_core.case_writer, hr_admin, employee_center_user',
        downloadLabel: 'Download PDF',
      };
    case 'hr-scripts':
      return {
        kind: 'code',
        language: 'xml',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<client_script name="HRSD Confidential Warning" table="x_mitra_hr_case" type="onLoad">
  <script><![CDATA[
function onLoad() {
  if (g_form.getValue('u_confidential') === 'true') {
    g_form.showFieldMsg('short_description', 'Confidential HR case', 'warning');
  }
}
  ]]></script>
</client_script>`,
      };
    case 'hr-rfp':
      return {
        kind: 'code',
        language: 'xml',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<update_set name="HR Ticketing — Mitra Blueprint" state="in progress">
  <item type="sys_db_object" name="x_mitra_hr_case"/>
  <item type="sys_script_client" name="HRSD Confidential Warning"/>
  <item type="sys_script" name="HRSD COE Auto-Route"/>
  <item type="sys_ui_form" name="x_mitra_hr_case.default"/>
</update_set>`,
      };
    case 'hr-summary':
      return {
        kind: 'download',
        content:
          'Executive Summary — HR Ticketing System\nScope: Employee Relations on HRSD\nTimeline: Q3 go-live · 6–8 weeks after approval',
        downloadLabel: 'Download Word doc',
      };
    default:
      if (artifact.type === 'requirements_doc' && requirementsDoc) {
        return {
          kind: 'text',
          content: sectionsToMarkdown(
            requirementsDoc.sections,
            requirementsDoc.sections.find((s) => s.id === 'project_objective')?.body?.replace(/^\*\*[^*]+\*\*\s*—\s*/, ''),
          ),
        };
      }
      if (artifact.artifactFormat === 'HTML') {
        return { kind: 'html', content: `<p style="padding:12px;font-size:12px">${artifact.name} preview</p>` };
      }
      if (artifact.artifactFormat === 'JSON' || artifact.artifactFormat === 'XML') {
        return {
          kind: 'code',
          language: artifact.artifactFormat.toLowerCase(),
          content: `<!-- ${artifact.name} — generated by Mitra -->`,
        };
      }
      if (artifact.artifactFormat === 'PDF' || artifact.artifactFormat === 'WORD' || artifact.artifactFormat === 'DOC') {
        return {
          kind: 'download',
          content: `${artifact.name} — ready for download`,
          downloadLabel: `Download ${artifact.artifactFormat}`,
        };
      }
      return { kind: 'text', content: `${artifact.name} preview content` };
  }
}

export function formatBadgeColor(format: ArtifactFormat, isDark = true): string {
  const dark: Record<ArtifactFormat, string> = {
    DOC: 'border-sky-500/25 bg-sky-500/10 text-sky-400',
    HTML: 'border-orange-500/25 bg-orange-500/10 text-orange-400',
    PDF: 'border-rose-500/25 bg-rose-500/10 text-rose-400',
    WORD: 'border-indigo-500/25 bg-indigo-500/10 text-indigo-400',
    XML: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
    JSON: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
  };
  const light: Record<ArtifactFormat, string> = {
    DOC: 'border-sky-600/30 bg-sky-50 text-sky-700',
    HTML: 'border-orange-600/30 bg-orange-50 text-orange-700',
    PDF: 'border-rose-600/30 bg-rose-50 text-rose-700',
    WORD: 'border-indigo-600/30 bg-indigo-50 text-indigo-700',
    XML: 'border-amber-600/30 bg-amber-50 text-amber-800',
    JSON: 'border-emerald-600/30 bg-emerald-50 text-emerald-700',
  };
  return (isDark ? dark : light)[format];
}
