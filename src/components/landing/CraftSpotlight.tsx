import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { SandTransitionImage } from '../SandTransitionImage';
import { CatIcon } from '../craftIcons';
import { CRAFTS } from '../../data/mockData';
import { cn, pic } from '../../lib/utils';
import type { CategoryId } from '../../types';

/**
 * The signature dark craft showcase (relocated from Landing.tsx, unchanged in
 * behaviour) — auto-cycling categories with the SVG sand-dissolve transition.
 */
export function CraftSpotlight() {
  const nav = useNavigate();
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      if (!paused.current) setActive((p) => (p + 1) % CRAFTS.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const cur = CRAFTS[active];
  const goCat = (id: CategoryId) => nav(`/browse?cat=${id}`);

  return (
    <section className="relative z-30 flex w-full flex-col overflow-hidden bg-[#0a0a0a] text-white">
      <motion.img
        src={pic('hunar-overlap-craft', 1300, 800)}
        alt=""
        initial={{ y: '-65%', opacity: 0 }}
        whileInView={{ y: '-34%', opacity: 0.4 }}
        viewport={{ margin: '100px' }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        className="pointer-events-none absolute left-1/2 top-0 z-0 w-[150vw] -translate-x-1/2 md:w-[1000px]"
        style={{
          maskImage: 'radial-gradient(60% 55% at 50% 45%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(60% 55% at 50% 45%, black, transparent)',
        }}
      />

      <div className="relative z-10 mb-14 flex flex-col gap-10 px-8 pt-28 md:px-16 md:pt-44 xl:flex-row xl:justify-between">
        <h2 className="max-w-[820px] text-[1.7rem] font-medium leading-[1.15] tracking-tight text-white md:text-[3rem] lg:text-[3.6rem] xl:text-[3.8rem]">
          Curated from generations of skill
          <span className="mx-2 inline-flex -translate-y-1 gap-2 align-middle md:mx-3 md:gap-3">
            {(['tailor', 'potter', 'artisan'] as CategoryId[]).map((id) => (
              <span
                key={id}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 bg-black text-gray-400 transition-colors hover:border-white hover:bg-white hover:text-black md:h-14 md:w-14"
              >
                <CatIcon id={id} size={22} strokeWidth={1.4} />
              </span>
            ))}
          </span>
          &amp; tradition.
        </h2>
        <div className="shrink-0">
          <p className="mb-5 text-[9px] font-mono uppercase leading-relaxed tracking-widest text-gray-400 md:text-[10px]">
            We don&apos;t just sell products
            <br />
            we share a maker&apos;s story
          </p>
          <div className="flex flex-wrap gap-2">
            {['Authentic', 'Handmade', 'Local'].map((t) => (
              <span
                key={t}
                className="cursor-default rounded-full border border-gray-600 px-5 py-2 text-[9px] font-mono uppercase tracking-widest text-gray-300 transition-colors hover:border-white hover:bg-white hover:text-black"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-gray-800" />

      <div
        className="relative z-10 flex flex-col md:flex-row"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
      >
        <div className="flex min-h-[360px] w-full flex-col justify-between border-b border-gray-800 p-8 md:min-h-[500px] md:w-[35%] md:border-b-0 md:border-r">
          <div className="text-xl tracking-[0.3em] text-gray-500">✳ ✳ ✳</div>
          <div className="relative my-6 flex-1">
            <AnimatePresence mode="wait">
              <SandTransitionImage
                key={cur.id}
                src={cur.image}
                alt={cur.name}
                className="absolute inset-0 m-auto h-[82%] w-[82%] rounded object-cover mix-blend-lighten"
              />
            </AnimatePresence>
          </div>
          <div className="flex items-end gap-2 text-[10px] font-mono uppercase tracking-widest text-[#888]">
            <motion.span key={active} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl leading-none text-white">
              {String(active + 1).padStart(2, '0')}
            </motion.span>
            <span className="text-[#333]">/</span>
            <span>{String(CRAFTS.length).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="w-full md:w-[65%]">
          <div className="flex justify-between border-b border-gray-800 p-8 text-[10px] font-mono uppercase tracking-widest text-gray-400">
            <span>Explore the craft. Support the maker.</span>
            <span className="text-white">Craft 0{active + 1}</span>
          </div>
          {CRAFTS.map((ch, i) => (
            <button
              key={ch.id}
              onClick={() => {
                setActive(i);
                goCat(ch.id);
              }}
              className={cn(
                'flex w-full items-center justify-between border-b border-gray-800/80 px-8 py-7 text-left transition-colors',
                i === active ? 'text-white' : 'text-[#444] hover:text-[#999]',
              )}
            >
              <span className="text-2xl font-medium tracking-tight md:text-[2rem]">{ch.name}</span>
              <ArrowUpRight
                size={22}
                strokeWidth={1}
                className={cn('text-gray-400 transition-all duration-500', i === active ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0')}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="h-[1px] bg-gray-800" />
      <div className="bg-[#0a0a0a] px-8 py-8 text-[10px] font-mono uppercase tracking-widest text-gray-500">Crafted with pride across India</div>
    </section>
  );
}
