import {
  SolutionBlueprint,
  StudioBuildStage,
  UpdateSet,
  UpdateSetItem,
  ScopedApp,
  ApplicationModule,
} from '../types';

export const STUDIO_STEPS = [
  { id: 'scope', label: 'Create App', sn: 'sys_app' },
  { id: 'tables', label: 'Create Table', sn: 'sys_db_object' },
  { id: 'forms', label: 'Form & List', sn: 'sys_ui_form' },
  { id: 'scripts', label: 'Client Scripts', sn: 'sys_script_client' },
  { id: 'rules', label: 'Business Rules', sn: 'sys_script' },
  { id: 'update_set', label: 'Update Set', sn: 'sys_update_set' },
  { id: 'published', label: 'Publish', sn: 'sys_store_app' },
] as const;

export function slugifyScope(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 24) || 'custom_app';
  return `x_${base}`;
}

export function deriveScopedApp(title: string, description = ''): ScopedApp {
  const scope = slugifyScope(title);
  return {
    name: title || 'Custom Application',
    scope,
    version: '1.0.0',
    vendor: 'Mitra AI',
    sysId: `app_${scope.replace(/x_/, '')}`,
    shortDescription: description || `Scoped application ${scope}`,
  };
}

export function deriveBuildStage(blueprint: SolutionBlueprint): StudioBuildStage {
  if (blueprint.buildStage === 'published') return 'published';
  const hasTables = blueprint.tables.length > 0;
  const hasFields = blueprint.tables.some((t) => t.fields.length > 0);
  const hasScripts = (blueprint.clientScripts?.length ?? 0) > 0;
  const hasRules = (blueprint.businessRules?.length ?? 0) > 0;
  const updateComplete = blueprint.updateSet?.state === 'complete';

  if (updateComplete || blueprint.status === 'completed') return 'published';
  if (hasRules && hasScripts) return 'update_set';
  if (hasRules) return 'rules';
  if (hasScripts) return 'scripts';
  if (hasFields) return 'forms';
  if (hasTables) return 'tables';
  return 'scope';
}

export function buildUpdateSetItems(blueprint: SolutionBlueprint): UpdateSetItem[] {
  const items: UpdateSetItem[] = [];
  const committed = blueprint.buildStage === 'published' || blueprint.updateSet?.state === 'complete';

  if (blueprint.scopedApp) {
    items.push({
      type: 'Module',
      name: `Application: ${blueprint.scopedApp.name}`,
      state: committed ? 'Committed' : 'In Progress',
    });
  }

  blueprint.tables.forEach((table) => {
    items.push({
      type: 'Table',
      name: table.name,
      table: table.label,
      state: committed ? 'Committed' : 'In Progress',
    });
    table.fields.forEach((field) => {
      items.push({
        type: 'Field',
        name: field.name,
        table: table.name,
        state: committed ? 'Committed' : 'In Progress',
      });
    });
  });

  blueprint.clientScripts?.forEach((script) => {
    items.push({
      type: 'Client Script',
      name: script.name,
      table: script.table,
      state: committed ? 'Committed' : 'In Progress',
    });
  });

  blueprint.businessRules?.forEach((rule) => {
    items.push({
      type: 'Business Rule',
      name: rule.name,
      table: rule.table,
      state: committed ? 'Committed' : 'In Progress',
    });
  });

  blueprint.applicationMenu?.forEach((mod) => {
    items.push({
      type: 'Module',
      name: mod.title,
      table: mod.table,
      state: committed ? 'Committed' : 'In Progress',
    });
  });

  return items;
}

export function deriveApplicationMenu(blueprint: SolutionBlueprint): ApplicationModule[] {
  return blueprint.tables.map((table, i) => ({
    title: table.label,
    table: table.name,
    order: (i + 1) * 100,
    roles: ['admin', 'itil'],
  }));
}

export function deriveUpdateSet(blueprint: SolutionBlueprint): UpdateSet {
  const scope = blueprint.scopedApp?.scope ?? slugifyScope(blueprint.title);
  const stage = deriveBuildStage(blueprint);
  return {
    name: `MITRA_${scope.toUpperCase()}`,
    state: stage === 'published' ? 'complete' : 'in progress',
    items: buildUpdateSetItems(blueprint),
  };
}

/** Enrich blueprint with ServiceNow Studio metadata derived from artifacts. */
export function enrichBlueprintStudio(blueprint: SolutionBlueprint): SolutionBlueprint {
  const scopedApp = blueprint.scopedApp ?? deriveScopedApp(blueprint.title, blueprint.description);
  const buildStage = deriveBuildStage({ ...blueprint, scopedApp });
  const applicationMenu = blueprint.applicationMenu?.length
    ? blueprint.applicationMenu
    : deriveApplicationMenu(blueprint);
  const updateSet = deriveUpdateSet({ ...blueprint, scopedApp, applicationMenu, buildStage });

  return {
    ...blueprint,
    scopedApp,
    buildStage,
    applicationMenu,
    updateSet,
  };
}

export function studioStepIndex(stage: StudioBuildStage): number {
  return STUDIO_STEPS.findIndex((s) => s.id === stage);
}
