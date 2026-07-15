import { cn } from '../lib/utils';

export function Monogram({ name, size = 48, className }: { name: string; size?: number; className?: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div
      className={cn('shrink-0 rounded-full bg-[#111] text-[#fcfcfc] flex items-center justify-center font-mono select-none', className)}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials}
    </div>
  );
}
