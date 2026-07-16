import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Check } from 'lucide-react';
import { PageBar } from '../components/PageBar';
import { Monogram } from '../components/Monogram';
import { Stars } from '../components/Stars';
import { CatIcon } from '../components/craftIcons';
import { CardGridSkeleton, EmptyState, ErrorState } from '../components/ui/States';
import { useEntrepreneurs } from '../hooks/entrepreneurs';
import { useDebounced } from '../hooks/useDebounced';
import { CATEGORIES } from '../data/mockData';
import { cn, inr } from '../lib/utils';
import type { CategoryId } from '../types';
import type { EntrepreneurCard } from '../types/api';

function EntCard({ e }: { e: EntrepreneurCard }) {
  return (
    <Link
      to={`/profile/${e.id}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition-all hover:-translate-y-1 hover:border-black hover:shadow-[4px_4px_0_rgba(17,17,17,.08)]"
    >
      <div className="relative h-36 overflow-hidden bg-gray-100">
        <img
          src={`https://picsum.photos/seed/ent-${e.id}/600/360?grayscale`}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/80 px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-white backdrop-blur">
          <CatIcon id={(e.category ?? 'artisan') as CategoryId} size={11} strokeWidth={2} />
          {e.craft.split(' ')[0] || 'Maker'}
        </span>
        <span
          className={cn(
            'absolute right-3 top-3 rounded-full border bg-white px-2 py-1 text-[9px] font-mono uppercase tracking-widest',
            e.available ? 'border-green-200 text-green-700' : 'border-gray-200 text-gray-400',
          )}
        >
          {e.available ? 'Available' : 'Busy'}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Monogram name={e.name} size={38} />
          <div className="min-w-0">
            <div className="flex items-center gap-1 truncate text-[15px] font-medium leading-tight">
              {e.name}
              {e.verified && <Check size={13} className="shrink-0 text-blue-600" />}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500">
              <MapPin size={11} />
              {e.city}, {e.state}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Stars value={e.rating} />
            <span className="text-[11px] font-mono text-gray-500">
              {e.rating} ({e.reviews})
            </span>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-mono uppercase tracking-widest text-gray-400">from</div>
            <div className="text-[14px] font-semibold">{inr(e.start)}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Browse() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const cat = params.get('cat') ?? 'all';
  const [q, setQ] = useState(params.get('q') ?? '');
  const debouncedQ = useDebounced(q);
  const [sort, setSort] = useState<'rating' | 'priceLow' | 'exp'>('rating');
  const [maxPrice, setMaxPrice] = useState(4000);

  const { data, isLoading, isError, error, refetch } = useEntrepreneurs({ cat, q: debouncedQ, maxPrice, sort });
  const list = data?.entrepreneurs ?? [];

  const setCat = (id: string) => navigate(id === 'all' ? '/browse' : `/browse?cat=${id}`);

  return (
    <div className="min-h-screen">
      <PageBar crumb="Browse" />
      <div className="px-6 py-10 md:px-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">[ Marketplace ]</div>
            <h1 className="mt-2 text-[2rem] font-medium tracking-tight md:text-[3rem]">Browse local makers</h1>
          </div>
          <div className="text-[11px] font-mono text-gray-500">
            {isLoading ? 'Loading…' : `${list.length} maker${list.length === 1 ? '' : 's'}`}
          </div>
        </div>

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
          <div className="flex flex-wrap items-center gap-4">
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

        {isLoading ? (
          <CardGridSkeleton />
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : list.length === 0 ? (
          <EmptyState title="No makers match those filters" hint="Try clearing the search or choosing a different category." />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((e) => (
              <EntCard key={e.id} e={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
