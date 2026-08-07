import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PageBar } from '../components/PageBar';
import { EntrepreneurCardTile } from '../components/EntrepreneurCardTile';
import { CardGridSkeleton, EmptyState, ErrorState } from '../components/ui/States';
import { CatIcon } from '../components/craftIcons';
import { buttonStyles } from '../components/ui/button';
import { useBrowseEntrepreneurs } from '../hooks/entrepreneurs';
import { useDebounced } from '../hooks/useDebounced';
import { getRecentlyViewed } from '../lib/recentlyViewed';
import { CATEGORIES } from '../data/mockData';
import { cn, inr } from '../lib/utils';
import type { CategoryId } from '../types';

export default function Browse() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const cat = params.get('cat') ?? 'all';
  const [q, setQ] = useState(params.get('q') ?? '');
  const debouncedQ = useDebounced(q);
  const [sort, setSort] = useState<'rating' | 'priceLow' | 'exp'>('rating');
  const [maxPrice, setMaxPrice] = useState(4000);
  const [verified, setVerified] = useState(false);
  const [available, setAvailable] = useState(false);
  const recent = getRecentlyViewed();

  const query = useBrowseEntrepreneurs({ cat, q: debouncedQ, maxPrice, sort, verified, available });
  const list = query.data?.pages.flatMap((p) => p.entrepreneurs) ?? [];
  const total = query.data?.pages[0]?.total ?? list.length;

  const setCat = (id: string) => navigate(id === 'all' ? '/browse' : `/browse?cat=${id}`);

  const toggleChip = (active: boolean) =>
    cn(
      'rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors',
      active ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700 hover:border-black',
    );

  return (
    <div className="min-h-screen">
      <PageBar crumb="Browse" />
      <main id="main-content" tabIndex={-1} className="px-6 py-10 md:px-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">[ Marketplace ]</div>
            <h1 className="mt-2 text-[2rem] font-medium tracking-tight md:text-[3rem]">Browse local makers</h1>
          </div>
          <div aria-live="polite" className="text-[11px] font-mono text-gray-500">
            {query.isLoading ? 'Loading…' : `${total} maker${total === 1 ? '' : 's'}`}
          </div>
        </div>

        {recent.length > 0 && (
          <div className="mt-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Recently viewed</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {recent.map((m) => (
                <Link
                  key={m.id}
                  to={`/profile/${m.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[12px] text-gray-700 transition-colors hover:border-black"
                >
                  {m.name}
                  <span className="text-gray-400">· {m.craft.split(' ')[0]}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {[{ id: 'all', name: 'All' }, ...CATEGORIES].map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors',
                  cat === c.id ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700 hover:border-black',
                )}
              >
                {c.id !== 'all' && <CatIcon id={c.id as CategoryId} size={13} strokeWidth={2} />}
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, craft or city…"
                aria-label="Search makers"
                className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-[13px] outline-none focus:border-black"
              />
            </div>
            <button type="button" aria-pressed={verified} onClick={() => setVerified((v) => !v)} className={toggleChip(verified)}>
              Verified
            </button>
            <button type="button" aria-pressed={available} onClick={() => setAvailable((v) => !v)} className={toggleChip(available)}>
              Available now
            </button>
            <label className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-gray-500">
              Max {inr(maxPrice)}
              <input type="range" min={60} max={4000} step={20} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-32 accent-black" />
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'rating' | 'priceLow' | 'exp')}
              aria-label="Sort makers"
              className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-[12px] outline-none focus:border-black"
            >
              <option value="rating">Top rated</option>
              <option value="priceLow">Price: low to high</option>
              <option value="exp">Most experienced</option>
            </select>
          </div>
        </div>

        {query.isLoading ? (
          <CardGridSkeleton />
        ) : query.isError ? (
          <ErrorState message={query.error instanceof Error ? query.error.message : undefined} onRetry={() => query.refetch()} />
        ) : list.length === 0 ? (
          <EmptyState title="No makers match those filters" hint="Try clearing the search or relaxing the filters." />
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((e) => (
                <EntrepreneurCardTile key={e.id} e={e} />
              ))}
            </div>
            {query.hasNextPage && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                  className={buttonStyles({ variant: 'ghost', size: 'md' })}
                >
                  {query.isFetchingNextPage ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
