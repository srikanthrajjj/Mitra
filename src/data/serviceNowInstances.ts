export interface ServiceNowInstance {
  id: string;
  name: string;
  tag: string;
  url: string;
  active: boolean;
}

export const SERVICE_NOW_INSTANCES: ServiceNowInstance[] = [
  {
    id: 'conn-1',
    name: 'POC RAVI',
    tag: 'PDI',
    url: 'https://dev202951.service-now.com',
    active: true,
  },
  {
    id: 'conn-2',
    name: 'Staging Instance',
    tag: 'STAGE',
    url: 'https://staging-sn.service-now.com',
    active: true,
  },
  {
    id: 'conn-3',
    name: 'QA Automation',
    tag: 'QA',
    url: 'https://qa-auto.service-now.com',
    active: false,
  },
  {
    id: 'conn-4',
    name: 'Production Sync',
    tag: 'PROD',
    url: 'https://prod.service-now.com',
    active: true,
  },
];

const SELECTED_INSTANCE_KEY = 'mitra_selected_instance';

export function loadSelectedInstanceId(): string {
  try {
    const stored = localStorage.getItem(SELECTED_INSTANCE_KEY);
    if (stored && SERVICE_NOW_INSTANCES.some((instance) => instance.id === stored)) {
      return stored;
    }
  } catch {
    // ignore storage errors
  }
  return (
    SERVICE_NOW_INSTANCES.find((instance) => instance.active)?.id
    ?? SERVICE_NOW_INSTANCES[0]?.id
    ?? ''
  );
}

export function persistSelectedInstanceId(instanceId: string): void {
  try {
    localStorage.setItem(SELECTED_INSTANCE_KEY, instanceId);
  } catch {
    // ignore storage errors
  }
}

export function getServiceNowInstance(instanceId: string): ServiceNowInstance | undefined {
  return SERVICE_NOW_INSTANCES.find((instance) => instance.id === instanceId);
}

export function instanceHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
