import { useState } from 'react';
import { CatIcon } from '../craftIcons';
import { Skeleton, ErrorState } from '../ui/States';
import { buttonStyles } from '../ui/button';
import { useToast } from '../ui/Toast';
import { useAdminCategories, useUpdateCategory } from '../../hooks/admin';
import { cn } from '../../lib/utils';
import type { CategoryId } from '../../types';
import type { CategoryItem } from '../../types/api';

/** One category row — label rename + active/inactive toggle. Deliberately no
 *  "add category": the valid category *id* set is a fixed enum shared by the
 *  Mongoose schema and Zod validation on the server (cobbler/potter/tailor/
 *  artisan/vendor); a UI control that could add an id nothing else would
 *  accept would be a fake button. See ROADMAP.md for the full trade-off. */
function CategoryRow({ category }: { category: CategoryItem }) {
  const { toast } = useToast();
  const update = useUpdateCategory();
  const [label, setLabel] = useState(category.label);
  const labelDirty = label.trim() !== category.label && label.trim().length > 0;

  function saveLabel() {
    update.mutate(
      { id: category.id, label: label.trim() },
      {
        onSuccess: () => toast('Category renamed.', 'success'),
        onError: (err) => {
          setLabel(category.label);
          toast(err instanceof Error ? err.message : 'Could not rename category.', 'error');
        },
      },
    );
  }

  function toggleActive() {
    update.mutate(
      { id: category.id, active: !category.active },
      {
        onSuccess: () => toast(category.active ? 'Category deactivated.' : 'Category activated.', 'success'),
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not update category.', 'error'),
      },
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-2 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted">
        <CatIcon id={category.id as CategoryId} size={16} strokeWidth={2} />
      </span>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        aria-label={`Label for ${category.id}`}
        className="min-w-[160px] flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-fg outline-none focus:border-accent"
      />
      <button
        type="button"
        onClick={saveLabel}
        disabled={!labelDirty || update.isPending}
        className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'disabled:opacity-40' })}
      >
        Save
      </button>
      <label className="ml-auto inline-flex shrink-0 cursor-pointer select-none items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-muted">
        {category.active ? 'Active' : 'Inactive'}
        <button
          type="button"
          role="switch"
          aria-checked={category.active}
          aria-label={`${category.active ? 'Deactivate' : 'Activate'} ${category.label}`}
          onClick={toggleActive}
          disabled={update.isPending}
          className={cn('relative h-6 w-12 rounded-full transition-colors disabled:opacity-50', category.active ? 'bg-fg' : 'bg-line')}
        >
          <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-surface-2 transition-all', category.active ? 'left-6' : 'left-0.5')} />
        </button>
      </label>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-4">
      <Skeleton className="h-9 w-9 rounded-full" />
      <Skeleton className="h-9 flex-1 rounded-lg" />
    </div>
  );
}

/** Admin "Categories" tab — rename or deactivate one of the 5 fixed craft
 *  categories. A deactivated category disappears from Register's picker and
 *  the Browse/Marketplace filter chips, but existing entrepreneurs who
 *  already chose it keep their profile unchanged. */
export function AdminCategoriesPanel() {
  const { data, isLoading, isError, refetch } = useAdminCategories();
  const categories = data?.categories ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState message="Could not load categories." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-3">
      {categories.map((c) => (
        <CategoryRow key={c.id} category={c} />
      ))}
    </div>
  );
}
