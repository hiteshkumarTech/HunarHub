import type { ReactNode } from 'react';
import { TrendingUp } from 'lucide-react';

/** Stat tile used on the entrepreneur Dashboard and the admin Overview panel. */
export function Kpi({
  icon,
  label,
  value,
  delta,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  /** Positive-trend indicator (rendered green, with an up arrow). */
  delta?: string;
  /** Plain explanatory caption — use for context that isn't a trend. */
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-5">
      <div className="flex items-center justify-between text-muted">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
      </div>
      <div className="mt-4 text-[1.8rem] font-medium tracking-tight text-fg">{value}</div>
      {delta && (
        <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-green-700">
          <TrendingUp size={12} />
          {delta}
        </div>
      )}
      {hint && <div className="mt-1 text-[11px] text-muted">{hint}</div>}
    </div>
  );
}
