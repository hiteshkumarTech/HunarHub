import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/** Centered page-width wrapper with consistent horizontal padding. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1200px] px-6 md:px-10', className)}>{children}</div>;
}
