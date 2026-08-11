import { Link } from 'react-router-dom';
import { MapPin, Check, Wrench, Package as PackageIcon } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Stars } from './Stars';
import { pic, inr } from '../lib/utils';
import type { MarketplaceListing } from '../types/api';

/** Marketplace discovery card — a single service or product, with its seller
 *  attached, so a customer can find and evaluate an item without first
 *  opening the seller's profile (see hooks/marketplace.ts). */
export function MarketplaceListingCard({ item }: { item: MarketplaceListing }) {
  const cover = item.images[0]?.url ?? pic(`listing-${item.id}`, 600, 360);

  return (
    <Link
      to={`/profile/${item.entrepreneur.id}`}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition-all hover:-translate-y-1 hover:border-black hover:shadow-[4px_4px_0_rgba(17,17,17,.08)]"
    >
      <div className="relative h-36 overflow-hidden bg-gray-100">
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
        />
        <Badge tone="dark" className="absolute left-3 top-3">
          {item.kind === 'service' ? <Wrench size={11} /> : <PackageIcon size={11} />}
          {item.kind}
        </Badge>
        {!item.entrepreneur.available && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-gray-500 backdrop-blur">
            Seller busy
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="truncate text-[15px] font-medium leading-tight">{item.name}</div>
        <div className="mt-1 flex items-center gap-1 truncate text-[11px] font-mono text-gray-500">
          {item.entrepreneur.name}
          {item.entrepreneur.verified && <Check size={12} className="shrink-0 text-blue-600" />}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-gray-500">
          <MapPin size={11} />
          {item.entrepreneur.city}, {item.entrepreneur.state}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Stars value={item.entrepreneur.rating} />
            <span className="text-[11px] font-mono text-gray-500">{item.entrepreneur.rating}</span>
          </div>
          <div className="text-right">
            {item.dur && <div className="text-[9px] font-mono uppercase tracking-widest text-gray-400">{item.dur}</div>}
            <div className="text-[14px] font-semibold">{inr(item.price)}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
