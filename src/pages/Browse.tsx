import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Check } from 'lucide-react';
import { PageBar } from '../components/PageBar';
import { Monogram } from '../components/Monogram';
import { Stars } from '../components/Stars';
import { CatIcon } from '../components/craftIcons';
import { CATEGORIES, ENTREPRENEURS } from '../data/mockData';
import { cn, inr } from '../lib/utils';
import type { Entrepreneur } from '../types';

function EntCard({ e }: { e: Entrepreneur }) {
  return (
    <Link to={`/profile/${e.id}`} className="group text-left border border-gray-200 rounded-xl overflow-hidden bg-white transition-all hover:border-black hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(17,17,17,.08)]">
      <div className="relative h-36 overflow-hidden bg-gray-100">
        <img src={`https://picsum.photos/seed/ent-${e.id}/600/360?grayscale`} alt="" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/80 backdrop-blur px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-white">
          <CatIcon id={e.category} size={11} strokeWidth={2} />{e.craft.split(' ')[0]}
        </span>
        <span className={cn('absolute top-3 right-3 rounded-full bg-white px-2 py-1 text-[9px] font-mono uppercase tracking-widest border', e.available ? 'text-green-700 border-green-200' : 'text-gray-400 border-gray-200')}>
          {e.available ? 'Available' : 'Busy'}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Monogram name={e.name} size={38} />
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[15px] font-medium leading-tight truncate">{e.name}{e.verified && <Check size={13} className="text-blue-600 shrink-0" />}</div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500"><MapPin size={11} />{e.city}, {e.state}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5"><Stars value={e.rating} /><span className="text-[11px] font-mono text-gray-500">{e.rating} ({e.reviews})</span></div>
          <div className="text-right"><div className="text-[9px] font-mono uppercase tracking-widest text-gray-400">from</div><div className="text-[14px] font-semibold">{inr(e.start)}</div></div>
        </div>
      </div>
    </Link>
  );
}

export default function Browse() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const cat = params.get('cat') ?? 'all';
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'rating' | 'priceLow' | 'exp'>('rating');
  const [maxPrice, setMaxPrice] = useState(4000);

  const list = useMemo(() => {
    const filtered = ENTREPRENEURS.filter((e) =>
      (cat === 'all' || e.category === cat) &&
      e.start <= maxPrice &&
      (q === '' || `${e.name} ${e.craft} ${e.city} ${e.state}`.toLowerCase().includes(q.toLowerCase())),
    );
    return [...filtered].sort((a, b) =>
      sort === 'rating' ? b.rating - a.rating : sort === 'priceLow' ? a.start - b.start : b.exp - a.exp,
    );
  }, [cat, q, sort, maxPrice]);

  const setCat = (id: string) => navigate(id === 'all' ? '/browse' : `/browse?cat=${id}`);

  return (
    <div className="min-h-screen">
      <PageBar crumb="Browse" />
      <div className="px-6 md:px-16 py-10">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-gray-500 uppercase">[ Marketplace ]</div>
            <h1 className="mt-2 text-[2rem] md:text-[3rem] font-medium tracking-tight">Browse local makers</h1>
          </div>
          <div className="text-[11px] font-mono text-gray-500">{list.length} of {ENTREPRENEURS.length} makers</div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {[{ id: 'all', name: 'All' }, ...CATEGORIES].map((c) => (
              <button key={c.id} onClick={() => setCat(c.id)} className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors', cat === c.id ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700 hover:border-black')}>
                {c.id !== 'all' && <CatIcon id={c.id as never} size={13} strokeWidth={2} />}{c.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, craft or city…" className="w-full rounded-full border border-gray-300 bg-white pl-9 pr-4 py-2.5 text-[13px] outline-none focus:border-black" />
            </div>
            <label className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-gray-500">
              Max {inr(maxPrice)}
              <input type="range" min={60} max={4000} step={20} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="accent-black w-32" />
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value as never)} className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-[12px] outline-none focus:border-black">
              <option value="rating">Top rated</option>
              <option value="priceLow">Price: low to high</option>
              <option value="exp">Most experienced</option>
            </select>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map((e) => <EntCard key={e.id} e={e} />)}
        </div>
        {list.length === 0 && <div className="mt-16 text-center text-gray-400 font-mono text-sm">No makers match those filters.</div>}
      </div>
    </div>
  );
}
