import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { cn } from '../lib/utils';
import { buttonStyles } from './ui/button';

/** Hero/marketplace search that routes into /browse with query + category. */
export function SearchBar({ className, autoFocus = false }: { className?: string; autoFocus?: boolean }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (cat) params.set('cat', cat);
    const qs = params.toString();
    navigate(qs ? `/browse?${qs}` : '/browse');
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'flex w-full flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-full sm:border sm:border-gray-300 sm:bg-white sm:p-1.5 sm:shadow-sm',
        className,
      )}
    >
      <div className="relative flex-1">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus={autoFocus}
          placeholder="Search a craft, skill or maker — potter, tailor, Jaipur…"
          aria-label="Search artisans and crafts"
          className="w-full rounded-full border border-gray-300 bg-white py-3 pl-11 pr-4 text-[14px] outline-none focus:border-black sm:border-0 sm:py-2.5 sm:focus:border-transparent"
        />
      </div>
      <div className="flex gap-2 sm:gap-1.5">
        <label htmlFor="hero-search-cat" className="sr-only">Category</label>
        <select
          id="hero-search-cat"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-3 text-[13px] outline-none focus:border-black sm:border-0 sm:py-2.5"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="submit" className={buttonStyles({ size: 'md', className: 'shrink-0' })}>
          <Search size={16} /> <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </form>
  );
}
