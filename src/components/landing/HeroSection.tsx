import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Star, MapPin, ArrowRight } from 'lucide-react';
import { Container } from '../ui/Container';
import { buttonStyles } from '../ui/button';
import { SearchBar } from '../SearchBar';
import { Monogram } from '../Monogram';
import { Stars } from '../Stars';
import { CatIcon } from '../craftIcons';
import { CATEGORIES, ENTREPRENEURS } from '../../data/mockData';
import { inr, pic } from '../../lib/utils';

const featured = ENTREPRENEURS[0];
const quickCats = CATEGORIES.slice(0, 5);
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[1.7rem] font-semibold tracking-tight text-[#111]">{value}</div>
      <div className="text-[12px] text-gray-500">{label}</div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-14 md:pb-24">
      <div aria-hidden className="pointer-events-none absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-gray-600">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Empowering local micro-entrepreneurs
            </div>

            <h1 className="mt-5 text-[2.6rem] font-semibold leading-[1.02] tracking-tight text-[#111] md:text-[3.6rem] lg:text-[4rem]">
              Discover &amp; hire skilled <span className="text-accent">local artisans</span>.
            </h1>

            <p className="mt-5 max-w-[520px] text-[15px] leading-[1.7] text-gray-600 md:text-[16px]">
              Potters, tailors, cobblers, artisans and vendors near you — handmade quality, fair prices, and every
              rupee going straight to the maker. No middlemen.
            </p>

            <div className="mt-7 max-w-[620px]">
              <SearchBar />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[12px] text-gray-500">Popular:</span>
              {quickCats.map((c) => (
                <Link
                  key={c.id}
                  to={`/browse?cat=${c.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[12px] text-gray-700 transition-colors hover:border-black"
                >
                  <CatIcon id={c.id} size={13} strokeWidth={2} />
                  {c.name}
                </Link>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4">
              <Stat value="500+" label="Verified artisans" />
              <Stat value="40+" label="Cities across India" />
              <Stat value="4.8/5" label="Average rating" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease }} className="relative">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
              <div className="relative h-52 md:h-60">
                <img src={pic(`cover-${featured.id}`, 900, 520)} alt="" loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-accent backdrop-blur">
                  <ShieldCheck size={12} /> Verified
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <Monogram name={featured.name} size={52} className="relative z-10 -mt-12 ring-4 ring-white" />
                  <div className="min-w-0">
                    <div className="text-[16px] font-semibold leading-tight">{featured.name}</div>
                    <div className="flex items-center gap-1 text-[12px] font-mono text-gray-500">
                      <MapPin size={12} />
                      {featured.craft} · {featured.city}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Stars value={featured.rating} />
                    <span className="text-[12px] text-gray-500">{featured.rating} ({featured.reviews})</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">from</div>
                    <div className="text-[15px] font-semibold">{inr(featured.start)}</div>
                  </div>
                </div>
                <Link to={`/profile/${featured.id}`} className={buttonStyles({ variant: 'secondary', size: 'md', className: 'mt-5 w-full' })}>
                  View profile <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-lg md:flex">
              <div className="flex items-center gap-1.5">
                <Star size={16} className="fill-accent text-accent" />
                <span className="text-[15px] font-semibold">4.9</span>
              </div>
              <div className="text-[11px] leading-tight text-gray-500">
                rated by
                <br />
                128 customers
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
