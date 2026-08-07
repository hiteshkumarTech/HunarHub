import { cn } from '../../lib/utils';

/**
 * Avatar primitive. Renders an image when available, otherwise initials.
 * `Monogram` remains for backwards compatibility and delegates here.
 */
export function Avatar({ name, src, size = 48, className }: { name: string; src?: string; size?: number; className?: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        className={cn('shrink-0 rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      aria-label={name}
      role="img"
      className={cn('flex shrink-0 select-none items-center justify-center rounded-full bg-[#111] font-mono text-[#fcfcfc]', className)}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials}
    </div>
  );
}
