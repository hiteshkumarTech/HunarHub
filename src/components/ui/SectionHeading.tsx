import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/** Consistent eyebrow + title + subtitle used across landing sections. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div className={cn(align === 'center' && 'mx-auto max-w-[720px] text-center', className)}>
      {eyebrow && <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent">{eyebrow}</div>}
      <h2 className="mt-3 text-[1.9rem] font-semibold leading-[1.1] tracking-tight text-[#111] md:text-[2.6rem]">{title}</h2>
      {subtitle && <p className="mt-3 text-[15px] leading-[1.7] text-gray-600">{subtitle}</p>}
    </div>
  );
}
