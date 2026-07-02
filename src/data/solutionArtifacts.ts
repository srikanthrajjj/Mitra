import { ArtifactStatus, Solution, SolutionArtifact } from '../types';

export interface SolutionWithArtifacts {
  solutionId: string;
  title: string;
  artifacts: SolutionArtifact[];
}

export const DEMO_SOLUTION_ARTIFACTS: SolutionWithArtifacts[] = [
  {
    solutionId: 'hr-ticketing',
    title: 'HR Ticketing System',
    artifacts: [
      {
        id: 'hr-req',
        solutionId: 'hr-ticketing',
        type: 'requirements_doc',
        name: 'Requirements Document',
        filingName: 'requirements_hrsd_v1.doc',
        status: 'approved',
        artifactFormat: 'DOC',
        buildStage: 'scope',
        phase: 1,
        version: '1.0',
        updatedBy: 'Mitra AI',
        updatedAt: '2026-06-10T14:22:00Z',
        revealAfterTurn: 1,
      },
      {
        id: 'hr-data',
        solutionId: 'hr-ticketing',
        type: 'data_model',
        name: 'Table Dictionary — u_hrsd_case',
        filingName: 'data_model_u_hrsd_case.xml',
        status: 'approved',
        artifactFormat: 'XML',
        buildStage: 'tables',
        phase: 2,
        version: '1.2',
        updatedBy: 'Mitra Architect',
        updatedAt: '2026-06-11T09:15:00Z',
        revealAfterTurn: 2,
      },
      {
        id: 'hr-flow',
        solutionId: 'hr-ticketing',
        type: 'workflow',
        name: 'HRSD Intake Flow',
        filingName: 'flow_hrsd_intake.json',
        status: 'in_review',
        artifactFormat: 'JSON',
        buildStage: 'forms',
        phase: 2,
        version: '0.9',
        updatedBy: 'Mitra Architect',
        updatedAt: '2026-06-12T11:40:00Z',
        revealAfterTurn: 3,
      },
      {
        id: 'hr-roles',
        solutionId: 'hr-ticketing',
        type: 'role_matrix',
        name: 'HR ACL Role Matrix',
        filingName: 'acl_hrsd_case_read.xml',
        status: 'pending',
        artifactFormat: 'XML',
        buildStage: 'forms',
        phase: 2,
        version: '1.0',
        updatedBy: 'Mitra Architect',
        updatedAt: '2026-06-12T11:42:00Z',
        revealAfterTurn: 3,
      },
      {
        id: 'hr-scripts',
        solutionId: 'hr-ticketing',
        type: 'script_library',
        name: 'Client Script Library',
        filingName: 'script_include_hrsd_confidential.js',
        status: 'draft',
        artifactFormat: 'JSON',
        buildStage: 'scripts',
        phase: 2,
        version: '0.8',
        updatedBy: 'Mitra Architect',
        updatedAt: '2026-06-12T16:05:00Z',
        revealAfterTurn: 4,
      },
      {
        id: 'hr-rfp',
        solutionId: 'hr-ticketing',
        type: 'rfp_package',
        name: 'RFP Package',
        filingName: 'rfp_package_hrsd_v1.doc',
        status: 'not_started',
        artifactFormat: 'DOC',
        buildStage: 'update_set',
        phase: 4,
        version: '1.0',
        updatedBy: 'Mitra AI',
        revealAfterTurn: 5,
      },
      {
        id: 'hr-summary',
        solutionId: 'hr-ticketing',
        type: 'executive_summary',
        name: 'Executive Summary',
        filingName: 'u_hrsd_executive_summary.doc',
        status: 'draft',
        artifactFormat: 'WORD',
        buildStage: 'rules',
        phase: 3,
        version: '1.0',
        updatedBy: 'Mitra AI',
        updatedAt: '2026-06-13T08:30:00Z',
        revealAfterTurn: 6,
      },
      {
        id: 'hr-test',
        solutionId: 'hr-ticketing',
        type: 'test_script',
        name: 'Test Script',
        filingName: 'test_script_hrsd_v1.doc',
        status: 'not_started',
        artifactFormat: 'DOC',
        buildStage: 'update_set',
        phase: 5,
        version: '1.0',
        updatedBy: 'Mitra AI',
        revealAfterTurn: 7,
      },
      {
        id: 'hr-ticketing-deploy',
        solutionId: 'hr-ticketing',
        type: 'deployment_checklist',
        name: 'Deployment Checklist',
        filingName: 'deployment_checklist_hrsd.doc',
        status: 'pending',
        artifactFormat: 'DOC',
        buildStage: 'published',
        phase: 7,
        version: '1.0',
        updatedBy: 'Mitra AI',
        revealAfterTurn: 8,
      },
    ],
  },
  {
    solutionId: 'employee-onboarding',
    title: 'Employee Onboarding',
    artifacts: [
      {
        id: 'eo-req',
        solutionId: 'employee-onboarding',
        type: 'requirements_doc',
        name: 'Scope Brief',
        filingName: 'scope_brief_v1.doc',
        status: 'approved',
        artifactFormat: 'DOC',
        buildStage: 'scope',
        version: '1.0',
        updatedBy: 'Mitra AI',
        revealAfterTurn: 1,
      },
      {
        id: 'eo-data',
        solutionId: 'employee-onboarding',
        type: 'data_model',
        name: 'Table Dictionary',
        filingName: 'data_model_u_onboard_case.json',
        status: 'draft',
        artifactFormat: 'JSON',
        buildStage: 'tables',
        version: '0.5',
        updatedBy: 'Mitra Architect',
        revealAfterTurn: 2,
      },
    ],
  },
  {
    solutionId: 'vendor-management',
    title: 'Vendor Management',
    artifacts: [
      {
        id: 'vm-req',
        solutionId: 'vendor-management',
        type: 'requirements_doc',
        name: 'Scope Brief',
        filingName: 'scope_brief_v1.doc',
        status: 'draft',
        artifactFormat: 'DOC',
        buildStage: 'scope',
        version: '0.1',
        updatedBy: 'Mitra AI',
        revealAfterTurn: 1,
      },
      {
        id: 'vm-data',
        solutionId: 'vendor-management',
        type: 'data_model',
        name: 'Table Dictionary',
        filingName: 'data_model_u_vendor_case.json',
        status: 'not_started',
        artifactFormat: 'JSON',
        buildStage: 'tables',
        revealAfterTurn: 2,
      },
    ],
  },
  {
    solutionId: 'asset-tracking',
    title: 'Asset Tracking System',
    artifacts: [
      {
        id: 'at-req',
        solutionId: 'asset-tracking',
        type: 'requirements_doc',
        name: 'Scope Brief',
        filingName: 'scope_brief_v1.doc',
        status: 'not_started',
        artifactFormat: 'DOC',
        buildStage: 'scope',
        revealAfterTurn: 1,
      },
    ],
  },
];

export function findArtifact(artifactId: string): SolutionArtifact | undefined {
  for (const sol of DEMO_SOLUTION_ARTIFACTS) {
    const found = sol.artifacts.find((a) => a.id === artifactId);
    if (found) return found;
  }
  return undefined;
}

export function getSolutionTitle(solutionId: string, solutions: Solution[] = []): string {
  const fromDemo = DEMO_SOLUTION_ARTIFACTS.find((s) => s.solutionId === solutionId)?.title;
  if (fromDemo) return fromDemo;
  const live = solutions.find((s) => s.id === solutionId);
  return live?.name ?? live?.blueprint.title ?? 'Solution';
}

function applyStatusOverrides(
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus>,
): SolutionArtifact[] {
  return artifacts.map((a) => ({
    ...a,
    status: statusOverrides[a.id] ?? a.status,
  }));
}

export function getArtifactsWithStatuses(
  statusOverrides: Record<string, ArtifactStatus> = {},
  dynamicBySolution: Record<string, SolutionArtifact[]> = {},
  solutions: Solution[] = [],
): SolutionWithArtifacts[] {
  const staticRows = DEMO_SOLUTION_ARTIFACTS.map((sol) => ({
    ...sol,
    artifacts: applyStatusOverrides(sol.artifacts, statusOverrides),
  }));

  const dynamicRows: SolutionWithArtifacts[] = Object.entries(dynamicBySolution).map(
    ([solutionId, artifacts]) => ({
      solutionId,
      title: getSolutionTitle(solutionId, solutions),
      artifacts: applyStatusOverrides(artifacts, statusOverrides),
    }),
  );

  const staticIds = new Set(DEMO_SOLUTION_ARTIFACTS.map((s) => s.solutionId));
  return [...staticRows, ...dynamicRows.filter((row) => !staticIds.has(row.solutionId))];
}

export function findArtifactWithStatuses(
  artifactId: string,
  statusOverrides: Record<string, ArtifactStatus> = {},
  dynamicBySolution: Record<string, SolutionArtifact[]> = {},
  solutions: Solution[] = [],
): SolutionArtifact | undefined {
  for (const sol of getArtifactsWithStatuses(statusOverrides, dynamicBySolution, solutions)) {
    const found = sol.artifacts.find((a) => a.id === artifactId);
    if (found) return found;
  }
  return undefined;
}
