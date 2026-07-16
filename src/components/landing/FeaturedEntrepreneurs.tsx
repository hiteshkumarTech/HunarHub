import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { buttonStyles } from '../ui/button';
import { EntrepreneurCardSkeleton } from '../ui/States';
import { Monogram } from '../Monogram';
import { Stars } from '../Stars';
import { CatIcon } from '../craftIcons';
import { useEntrepreneurs } from '../../hooks/entrepreneurs';
import { ENTREPRENEURS } from '../../data/mockData';
import { cn, inr, pic } from '../../lib/utils';
import type { CategoryId } from '../../types';
import type { EntrepreneurCard } from '../../types/api';

function SpotlightCard({ e }: { e: EntrepreneurCard }) {
  return (
    <Link
      to={`/profile/${e.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:border-black hover:shadow-[0_20px_50px_-30px_rgba(0,0,0,0.45)]"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={pic(`ent-${e.id}`, 640, 360)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/80 px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-white backdrop-blur">
          <CatIcon id={(e.category ?? 'artisan') as CategoryId} size={11} strokeWidth={2} />
          {e.craft.split(' ')[0] || 'Maker'}
        </span>
        {e.verified && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-accent backdrop-blur">
            <ShieldCheck size={11} /> Verified
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-3">
          <Monogram name={e.name} size={40} />
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold leading-tight">{e.name}</div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500">
              <MapPin size={11} />
              {e.city}, {e.state}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <Stars value={e.rating} size={12} />
          <span className="text-[11px] text-gray-500">
            {e.rating} ({e.reviews})
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">from </span>
            <span className="text-[15px] font-semibold">{inr(e.start)}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-accent">
            View <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedEntrepreneurs() {
  const { data, isLoading } = useEntrepreneurs({ sort: 'rating' });
  // Fall back to seed data so the homepage always looks complete.
  const source: EntrepreneurCard[] = data?.entrepreneurs && data.entrepreneurs.length > 0 ? data.entrepreneurs : ENTREPRENEURS;
  const featured = source.slice(0, 4);
  const showSkeleton = isLoading && !data;

  return (
    <section className="border-y border-gray-100 bg-white py-16 md:py-24">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Meet the makers"
            title="Featured local entrepreneurs"
            subtitle="Hand-picked artisans with proven quality and happy customers."
          />
          <Link to="/browse" className={cn(buttonStyles({ variant: 'ghost', size: 'md' }), 'hidden shrink-0 sm:inline-flex')}>
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {showSkeleton
            ? Array.from({ length: 4 }).map((_, i) => <EntrepreneurCardSkeleton key={i} />)
            : featured.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                >
                  <SpotlightCard e={e} />
                </motion.div>
              ))}
        </div>
        <div className="mt-8 sm:hidden">
          <Link to="/browse" className={buttonStyles({ variant: 'ghost', size: 'md', className: 'w-full' })}>
            View all artisans <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
