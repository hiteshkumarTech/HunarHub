import { useState } from 'react';
import { buttonStyles } from './button';
import { cn } from '../../lib/utils';

/**
 * Inline destructive-action confirmation — click "Delete" once to arm it,
 * click "Confirm" to actually fire, or "Cancel"/blur-away to back out.
 * Matches the rest of HunarHub's inline-disclosure pattern (e.g. MyOrders'
 * review form) rather than introducing a modal/dialog primitive.
 */
export function ConfirmAction({
  label = 'Delete',
  confirmLabel = 'Confirm',
  onConfirm,
  pending = false,
  className,
}: {
  label?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  pending?: boolean;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className={cn(buttonStyles({ variant: 'ghost', size: 'sm' }), 'text-red-600 hover:border-red-300', className)}
      >
        {label}
      </button>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="text-[12px] text-muted">Sure?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => onConfirm()}
        className="rounded-md bg-red-600 px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-widest text-white hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? '…' : confirmLabel}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setArmed(false)}
        className="rounded-md border border-line px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-widest text-muted hover:border-accent disabled:opacity-50"
      >
        Cancel
      </button>
    </span>
  );
}
