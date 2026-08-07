import { Star } from 'lucide-react';

// Every caller renders the numeric rating as visible text right next to this
// (e.g. "4.5 (12)"), so the star glyphs themselves are decorative — hide them
// from screen readers instead of announcing five unlabeled icons per rating.
export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-[2px] text-[#111]">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} strokeWidth={1.2} fill={i < Math.round(value) ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}
