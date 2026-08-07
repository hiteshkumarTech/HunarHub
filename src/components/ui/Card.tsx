import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/** Surface container used across dashboards, lists and panels. */
export function Card({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return <div className={cn('rounded-xl border border-line bg-surface-2', padded && 'p-5', className)}>{children}</div>;
}

export function CardHeader({ title, action, className }: { title: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between border-b border-line px-5 py-4', className)}>
      <span className="text-[11px] font-mono uppercase tracking-widest text-muted">{title}</span>
      {action}
    </div>
  );
}
