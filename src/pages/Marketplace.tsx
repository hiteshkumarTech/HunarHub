import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PageBar } from '../components/PageBar';
import { MarketplaceListingCard } from '../components/MarketplaceListingCard';
import { CardGridSkeleton, EmptyState, ErrorState } from '../components/ui/States';
import { CatIcon } from '../components/craftIcons';
import { buttonStyles } from '../components/ui/button';
import { useMarketplaceListings } from '../hooks/marketplace';
import { useCategories } from '../hooks/categories';
import { useDebounced } from '../hooks/useDebounced';
import { cn, inr } from '../lib/utils';
import type { CategoryId } from '../types';

const KIND_TABS: { id: 'all' | 'service' | 'product'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'service', label: 'Services' },
  { id: 'product', label: 'Products' },
];

/**
 * /marketplace — customer-facing product/service discovery. Distinct from
 * /browse (which discovers sellers): a customer can find and filter
 * individual listings here directly, without first opening a specific
 * entrepreneur's profile. See ROADMAP.md's traceability matrix for why this
 * exists as its own page rather than folding into Browse.
 */
export default function Marketplace() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const cat = params.get('cat') ?? 'all';
  const [kind, setKind] = useState<'all' | 'service' | 'product'>('all');
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [maxPrice, setMaxPrice] = useState(4000);
  const debouncedQ = useDebounced(q);
  const debouncedCity = useDebounced(city);
  const debouncedState = useDebounced(state);

  const categories = useCategories();
  const activeCategories = (categories.data?.categories ?? []).filter((c) => c.active);

  const query = useMarketplaceListings({
    kind,
    cat,
    city: debouncedCity,
    state: debouncedState,
    maxPrice,
    q: debouncedQ,
  });
  const list = query.data?.pages.flatMap((p) => p.listings) ?? [];
  const total = query.data?.pages[0]?.total ?? list.length;

  const setCat = (id: string) => navigate(id === 'all' ? '/marketplace' : `/marketplace?cat=${id}`);

  return (
    <div className="min-h-screen">
      <PageBar crumb="Marketplace" />
      <main id="main-content" tabIndex={-1} className="px-6 py-10 md:px-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">[ Marketplace ]</div>
            <h1 className="mt-2 text-[2rem] font-medium tracking-tight md:text-[3rem]">Products & services</h1>
            <p className="mt-2 max-w-[520px] text-[13px] text-gray-500">
              Discover individual listings directly — no need to find a seller first.
            </p>
          </div>
          <div aria-live="polite" className="text-[11px] font-mono text-gray-500">
            {query.isLoading ? 'Loading…' : `${total} listing${total === 1 ? '' : 's'}`}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {[{ id: 'all', label: 'All' }, ...activeCategories].map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors',
                  cat === c.id ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700 hover:border-black',
                )}
              >
                {c.id !== 'all' && <CatIcon id={c.id as CategoryId} size={13} strokeWidth={2} />}
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {KIND_TABS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                className={cn(
                  'rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors',
                  kind === k.id ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700 hover:border-black',
                )}
              >
                {k.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search listing name…"
                aria-label="Search listings"
                className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-[13px] outline-none focus:border-black"
              />
            </div>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              aria-label="Filter by city"
              className="w-32 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-[13px] outline-none focus:border-black"
            />
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
              aria-label="Filter by state"
              className="w-32 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-[13px] outline-none focus:border-black"
            />
            <label className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-gray-500">
              Max {inr(maxPrice)}
              <input
                type="range"
                min={60}
                max={4000}
                step={20}
                value={maxPrice}
                onChange={(e) => setMaxPrice(+e.target.value)}
                className="w-32 accent-black"
              />
            </label>
          </div>
        </div>

        {query.isLoading ? (
          <CardGridSkeleton />
        ) : query.isError ? (
          <ErrorState message={query.error instanceof Error ? query.error.message : undefined} onRetry={() => query.refetch()} />
        ) : list.length === 0 ? (
          <EmptyState title="No listings match those filters" hint="Try clearing the search or relaxing the filters." />
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((item) => (
                <MarketplaceListingCard key={`${item.kind}-${item.id}`} item={item} />
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
