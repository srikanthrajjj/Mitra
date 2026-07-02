import React from 'react';

export type FuturisticIconType =
  | 'architecture'
  | 'script'
  | 'rule'
  | 'shield'
  | 'layers'
  | 'database'
  | 'users'
  | 'code'
  | 'health'
  | 'finance'
  | 'factory'
  | 'network'
  | 'settings'
  | 'sla'
  | 'alert';

interface FuturisticIconProps {
  type: FuturisticIconType;
  className?: string;
  active?: boolean;
}

const gradId = (type: string) => `fi-grad-${type}`;
const glowId = (type: string) => `fi-glow-${type}`;

function IconDefs({ type }: { type: FuturisticIconType }) {
  return (
    <defs>
      <linearGradient id={gradId(type)} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CCFF00" />
        <stop offset="45%" stopColor="#25c905" />
        <stop offset="100%" stopColor="#148f00" />
      </linearGradient>
      <filter id={glowId(type)} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

const icons: Record<FuturisticIconType, React.ReactNode> = {
  architecture: (
    <>
      <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" fill="none" stroke="url(#fi-grad-architecture)" strokeWidth="1.4" filter="url(#fi-glow-architecture)" />
      <circle cx="12" cy="12" r="2.5" fill="url(#fi-grad-architecture)" opacity="0.9" />
      <line x1="12" y1="9.5" x2="12" y2="5" stroke="url(#fi-grad-architecture)" strokeWidth="1" opacity="0.7" />
      <line x1="14.2" y1="13.2" x2="17.5" y2="15" stroke="url(#fi-grad-architecture)" strokeWidth="1" opacity="0.7" />
      <line x1="9.8" y1="13.2" x2="6.5" y2="15" stroke="url(#fi-grad-architecture)" strokeWidth="1" opacity="0.7" />
    </>
  ),
  script: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="url(#fi-grad-script)" strokeWidth="1.3" filter="url(#fi-glow-script)" />
      <path d="M8 9h8M8 12h6M8 15h4" stroke="url(#fi-grad-script)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M16 15l2 2-2 2" fill="none" stroke="#CCFF00" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  rule: (
    <>
      <circle cx="6" cy="12" r="2.2" fill="url(#fi-grad-rule)" filter="url(#fi-glow-rule)" />
      <circle cx="18" cy="6" r="2.2" fill="url(#fi-grad-rule)" />
      <circle cx="18" cy="18" r="2.2" fill="url(#fi-grad-rule)" />
      <path d="M8 11.5h4.5M13.5 8.5l3 2.5M13.5 15.5l3-2.5" stroke="url(#fi-grad-rule)" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5.5c0 4.2-2.8 7.5-7 9.5-4.2-2-7-5.3-7-9.5V6l7-3z" fill="none" stroke="url(#fi-grad-shield)" strokeWidth="1.4" filter="url(#fi-glow-shield)" />
      <path d="M9 12l2 2 4-4.5" fill="none" stroke="#CCFF00" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  layers: (
    <>
      <path d="M4 8l8-4 8 4-8 4-8-4z" fill="none" stroke="url(#fi-grad-layers)" strokeWidth="1.3" filter="url(#fi-glow-layers)" />
      <path d="M4 12l8 4 8-4" fill="none" stroke="url(#fi-grad-layers)" strokeWidth="1.2" opacity="0.75" />
      <path d="M4 16l8 4 8-4" fill="none" stroke="url(#fi-grad-layers)" strokeWidth="1.1" opacity="0.5" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6.5" rx="7" ry="2.8" fill="none" stroke="url(#fi-grad-database)" strokeWidth="1.3" filter="url(#fi-glow-database)" />
      <path d="M5 6.5v11c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-11" fill="none" stroke="url(#fi-grad-database)" strokeWidth="1.3" />
      <ellipse cx="12" cy="12" rx="7" ry="2.8" fill="none" stroke="url(#fi-grad-database)" strokeWidth="1" opacity="0.55" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9" r="2.5" fill="none" stroke="url(#fi-grad-users)" strokeWidth="1.2" filter="url(#fi-glow-users)" />
      <circle cx="16" cy="10" r="2" fill="none" stroke="url(#fi-grad-users)" strokeWidth="1.1" opacity="0.8" />
      <path d="M5.5 18c0-2.5 1.8-4 3.5-4s3.5 1.5 3.5 4M13.5 18c0-2 1.2-3.2 2.5-3.5" fill="none" stroke="url(#fi-grad-users)" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  code: (
    <>
      <path d="M8 8L4 12l4 4M16 8l4 4-4 4" fill="none" stroke="url(#fi-grad-code)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" filter="url(#fi-glow-code)" />
      <line x1="13" y1="6" x2="11" y2="18" stroke="#CCFF00" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
    </>
  ),
  health: (
    <>
      <path d="M12 20s-6.5-4.2-6.5-9a3.5 3.5 0 0 1 6.5-1.8A3.5 3.5 0 0 1 18.5 11c0 4.8-6.5 9-6.5 9z" fill="none" stroke="url(#fi-grad-health)" strokeWidth="1.3" filter="url(#fi-glow-health)" />
      <path d="M10 11.5h4M12 9.5v4" stroke="#CCFF00" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  finance: (
    <>
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="url(#fi-grad-finance)" strokeWidth="1.2" filter="url(#fi-glow-finance)" />
      <path d="M12 7v10M9.5 9.5c0-1 1-1.8 2.5-1.8s2.5.7 2.5 1.8-1 1.8-2.5 1.8-2.5.8-2.5 1.8 1 1.8 2.5 1.8 2.5-.7 2.5-1.8" fill="none" stroke="url(#fi-grad-finance)" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  factory: (
    <>
      <path d="M4 18V10l4-2v10M8 18V7l4-2v13M12 18V9l4-2v11M16 18V12l4-1.5v7.5" fill="none" stroke="url(#fi-grad-factory)" strokeWidth="1.2" strokeLinejoin="round" filter="url(#fi-glow-factory)" />
      <line x1="3" y1="18" x2="21" y2="18" stroke="url(#fi-grad-factory)" strokeWidth="1.3" />
    </>
  ),
  network: (
    <>
      <rect x="9" y="9" width="6" height="6" rx="1" fill="none" stroke="url(#fi-grad-network)" strokeWidth="1.3" filter="url(#fi-glow-network)" />
      <circle cx="12" cy="5" r="1.5" fill="#CCFF00" />
      <circle cx="19" cy="12" r="1.5" fill="#25c905" />
      <circle cx="12" cy="19" r="1.5" fill="#25c905" />
      <circle cx="5" cy="12" r="1.5" fill="#CCFF00" />
      <line x1="12" y1="6.5" x2="12" y2="9" stroke="url(#fi-grad-network)" strokeWidth="1" />
      <line x1="17.5" y1="12" x2="15" y2="12" stroke="url(#fi-grad-network)" strokeWidth="1" />
      <line x1="12" y1="15" x2="12" y2="17.5" stroke="url(#fi-grad-network)" strokeWidth="1" />
      <line x1="6.5" y1="12" x2="9" y2="12" stroke="url(#fi-grad-network)" strokeWidth="1" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="2.8" fill="none" stroke="url(#fi-grad-settings)" strokeWidth="1.3" filter="url(#fi-glow-settings)" />
      <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" stroke="url(#fi-grad-settings)" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  sla: (
    <>
      <circle cx="12" cy="13" r="7" fill="none" stroke="url(#fi-grad-sla)" strokeWidth="1.3" filter="url(#fi-glow-sla)" />
      <path d="M12 9v4.5l3 2" fill="none" stroke="#CCFF00" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="4" r="1.2" fill="#CCFF00" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4a5.5 5.5 0 0 1 5.5 5.5c0 3.8-2.5 6.5-5.5 9-3-2.5-5.5-5.2-5.5-9A5.5 5.5 0 0 1 12 4z" fill="none" stroke="url(#fi-grad-alert)" strokeWidth="1.3" filter="url(#fi-glow-alert)" />
      <path d="M12 8.5v3.5M12 14.5h.01" stroke="#CCFF00" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
};

export function resolveIconType(choice: string): FuturisticIconType {
  const norm = choice.toLowerCase();

  if (norm.includes('client script') || norm.includes('validation script') || norm.includes('script')) return 'script';
  if (norm.includes('business rule') || norm.includes('assignment rule') || norm.includes('boundary rule')) return 'rule';
  if (norm.includes('email alert') || norm.includes('notification') || norm.includes('alert')) return 'alert';
  if (norm.includes('xml') || norm.includes('table') || norm.includes('schema') || norm.includes('database')) return 'database';
  if (norm.includes('sla') || norm.includes('priority')) return 'sla';
  if (norm.includes('hrsd') || norm.includes('hr service') || norm.includes('hipaa') || norm.includes('healthcare')) return 'health';
  if (norm.includes('itsm') || norm.includes('incident') || norm.includes('case escalator')) return 'layers';
  if (norm.includes('asset') || norm.includes('inventory')) return 'settings';
  if (norm.includes('csm') || norm.includes('customer') || norm.includes('account portal')) return 'users';
  if (norm.includes('task table') || norm.includes('task-extended') || norm.includes('extend')) return 'code';
  if (norm.includes('sox') || norm.includes('banking') || norm.includes('audit') || norm.includes('gdpr')) return 'finance';
  if (norm.includes('manufacturing') || norm.includes('operations') || norm.includes('factory')) return 'factory';
  if (norm.includes('telecom') || norm.includes('network') || norm.includes('infrastructure')) return 'network';
  if (norm.includes('compliance') || norm.includes('shield') || norm.includes('secure')) return 'shield';

  return 'architecture';
}

export default function FuturisticIcon({ type, className = 'w-5 h-5', active = false }: FuturisticIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} ${active ? 'futuristic-icon-active' : 'futuristic-icon'}`}
      fill="none"
      aria-hidden
    >
      <IconDefs type={type} />
      {icons[type]}
    </svg>
  );
}

export function FuturisticIconWrap({
  type,
  active = false,
  children,
}: {
  type: FuturisticIconType;
  active?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={`icon-futuristic-wrap ${active ? 'icon-futuristic-wrap--active' : ''}`}>
      <FuturisticIcon type={type} active={active} />
      {children}
    </div>
  );
}
