import { Link } from 'react-router-dom';
import { MapPin, Check } from 'lucide-react';
import { Monogram } from './Monogram';
import { Stars } from './Stars';
import { CatIcon } from './craftIcons';
import { FavoriteButton } from './FavoriteButton';
import { cn, inr } from '../lib/utils';
import type { CategoryId } from '../types';
import type { EntrepreneurCard } from '../types/api';

/** Shared marketplace card (Browse, Favourites). */
export function EntrepreneurCardTile({ e }: { e: EntrepreneurCard }) {
  return (
    <Link
      to={`/profile/${e.id}`}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition-all hover:-translate-y-1 hover:border-black hover:shadow-[4px_4px_0_rgba(17,17,17,.08)]"
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
        <FavoriteButton entrepreneurId={e.id} size={15} className="absolute right-3 top-3 h-8 w-8" />
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
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest">
          <span className={cn('h-1.5 w-1.5 rounded-full', e.available ? 'bg-green-500' : 'bg-gray-300')} />
          <span className={e.available ? 'text-green-700' : 'text-gray-400'}>{e.available ? 'Available' : 'Busy'}</span>
        </div>
      </div>
    </Link>
  );
}
