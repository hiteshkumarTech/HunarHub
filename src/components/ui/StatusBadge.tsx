import { cn } from '../../lib/utils';
import type { OrderStatus } from '../../types/api';

const STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  declined: 'bg-gray-50 text-gray-500 border-gray-200',
};

const LABELS: Record<OrderStatus, string> = {
  pending: 'Awaiting confirmation',
  accepted: 'In progress',
  completed: 'Completed',
  declined: 'Declined',
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest',
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}

/** Horizontal progress track: requested → accepted → completed. */
export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'declined') {
    return <p className="text-[12px] text-gray-500">This request was declined. You can browse other makers for the same craft.</p>;
  }
  const steps = ['Requested', 'Accepted', 'Completed'];
  const activeIndex = status === 'pending' ? 0 : status === 'accepted' ? 1 : 2;

  return (
    <ol className="flex items-center gap-2" aria-label="Order progress">
      {steps.map((label, i) => {
        const done = i <= activeIndex;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                aria-current={i === activeIndex ? 'step' : undefined}
                className={cn('h-2.5 w-2.5 shrink-0 rounded-full', done ? 'bg-[#111]' : 'bg-gray-300')}
              />
              <span className={cn('text-[11px] font-mono uppercase tracking-widest', done ? 'text-[#111]' : 'text-gray-400')}>{label}</span>
            </div>
            {i < steps.length - 1 && <span className={cn('h-[1.5px] flex-1', i < activeIndex ? 'bg-[#111]' : 'bg-gray-200')} />}
          </li>
        );
      })}
    </ol>
  );
}
