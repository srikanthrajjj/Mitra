import { cn } from '@/lib/utils';
import {
  ConversationIndicatorStatus,
  conversationStatusLabel,
} from '../utils/conversationStatus';

interface ConversationStatusDotProps {
  status: ConversationIndicatorStatus;
  className?: string;
}

export function ConversationStatusDot({ status, className }: ConversationStatusDotProps) {
  const label = conversationStatusLabel[status];

  return (
    <span
      role="status"
      aria-label={label}
      title={label}
      className={cn(
        'inline-block h-[5px] w-[5px] shrink-0 rounded-full',
        status === 'active' && 'bg-emerald-400 conversation-status-dot-active',
        status === 'failed' && 'bg-red-500',
        status === 'awaiting' && 'bg-amber-400',
        status === 'idle' && 'bg-zinc-500',
        className,
      )}
    />
  );
}
