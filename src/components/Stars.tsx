import { Star } from 'lucide-react';

export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-[2px] text-[#111]">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} strokeWidth={1.2} fill={i < Math.round(value) ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}
