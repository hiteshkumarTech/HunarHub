import { Footprints, Amphora, Scissors, Palette, Store, type LucideProps } from 'lucide-react';
import type { CategoryId } from '../types';

export const CAT_ICON: Record<CategoryId, React.ComponentType<LucideProps>> = {
  cobbler: Footprints,
  potter: Amphora,
  tailor: Scissors,
  artisan: Palette,
  vendor: Store,
};

export function CatIcon({ id, ...props }: { id: CategoryId } & LucideProps) {
  const Icon = CAT_ICON[id] ?? Palette;
  return <Icon {...props} />;
}
