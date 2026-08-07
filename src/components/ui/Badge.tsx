import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'dark';

const TONES: Record<BadgeTone, string> = {
  neutral: 'border-line bg-surface-2 text-muted',
  accent: 'border-accent/30 bg-accent/10 text-accent',
  success: 'border-green-200 bg-green-50 text-green-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  dark: 'border-transparent bg-black/80 text-white backdrop-blur',
};

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
