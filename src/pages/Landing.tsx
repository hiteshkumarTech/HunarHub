import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { ArrowUpRight, Plus, Sparkles } from 'lucide-react';
import { Header } from '../components/Header';
import { Monogram } from '../components/Monogram';
import { SandTransitionImage } from '../components/SandTransitionImage';
import { CatIcon } from '../components/craftIcons';
import { CATEGORIES, CRAFTS } from '../data/mockData';
import { cn, pic } from '../lib/utils';
import type { CategoryId } from '../types';

/* ---------- Hero ---------- */
function Hero() {
  const nav = useNavigate();
  const [showBg, setShowBg] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShowBg(true), 900); return () => clearTimeout(t); }, []);

  return (
    <section className="relative w-full min-h-[92vh] flex flex-col overflow-hidden">
      <div className={cn('pointer-events-none absolute inset-0 z-0 transition-opacity duration-[1400ms]', showBg ? 'opacity-100' : 'opacity-0')}>
        <img
          src={pic('hunar-hero-hands', 1600, 1000)}
          alt=""
          className="w-full h-full object-cover opacity-50"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent), linear-gradient(to right, transparent, black 55%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent), linear-gradient(to right, transparent, black 55%)',
            WebkitMaskComposite: 'source-in', maskComposite: 'intersect',
          }}
        />
      </div>

      <motion.div
        initial="initial" animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.15, delayChildren: 0.6 } } }}
        className="relative z-10 flex-1 flex flex-col md:flex-row md:justify-between px-6 md:px-16 mt-16 sm:mt-20 md:mt-24"
      >
        <div className="w-full md:w-[320px]">
          <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} className="flex items-center gap-3 text-xs font-mono text-gray-500">
            <span>01</span><span className="w-16 h-[1.5px] bg-black/20" />
          </motion.div>
          <motion.h2 variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} className="mt-6 text-[3.2rem] md:text-[5rem] font-normal tracking-tight leading-[1]">
            MADE<br />BY HAND
          </motion.h2>
          <motion.p variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} className="mt-6 text-[13px] md:text-[14px] text-gray-700 w-[240px] leading-[1.6]">
            Discover skilled local makers near you and support the craft behind every handmade piece.
          </motion.p>
          <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
            <button
              onClick={() => nav('/browse')}
              className="group relative mt-8 inline-flex items-center gap-3 overflow-hidden rounded-md border border-[#1a1a1a] bg-[#1a1a1a] px-6 py-3.5 shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_rgba(17,17,17,.5)] active:translate-y-0 active:shadow-none"
            >
              <span className="absolute inset-0 z-0 -translate-x-[101%] bg-[#fcfcfc] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
              <Sparkles size={18} strokeWidth={1.6} className="relative z-10 text-white transition-all duration-300 group-hover:text-[#111] group-hover:scale-110 group-hover:-rotate-12 group-hover:-translate-y-1" />
              <span className="relative z-10 text-[15px] font-medium text-white transition-colors duration-300 group-hover:text-[#111]">Explore Crafts</span>
            </button>
          </motion.div>
        </div>

        <motion.div
          initial="initial" animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.15, delayChildren: 0.9 } } }}
          className="hidden md:flex flex-col w-[220px] mt-12 md:mt-24 gap-8"
        >
          <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
            <div className="text-[10px] font-bold font-mono tracking-widest uppercase text-[#111]">Featured Artisan</div>
            <div className="mt-3 flex items-center gap-3">
              <Monogram name="Ramesh Kumar" size={40} />
              <div>
                <div className="text-[13px] font-medium leading-tight">Ramesh Kumar</div>
                <div className="text-[11px] text-gray-600 font-mono">Potter · Jaipur</div>
              </div>
            </div>
          </motion.div>
          <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} className="grid grid-cols-2 gap-4">
            <div><div className="text-[10px] font-mono tracking-widest uppercase text-gray-500">Experience</div><div className="text-[13px] font-medium">24 yrs</div></div>
            <div><div className="text-[10px] font-mono tracking-widest uppercase text-gray-500">Rating</div><div className="text-[13px] font-medium">4.9 ★</div></div>
          </motion.div>
          <motion.button variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} onClick={() => nav('/profile/ramesh')} className="group flex items-center gap-3">
            <span className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center transition-colors group-hover:border-black group-hover:bg-[#111]">
              <Plus size={16} strokeWidth={1.5} className="text-[#111] transition-colors group-hover:text-white" />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">View Profile</span>
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="hidden md:flex items-center gap-3 absolute bottom-10 left-[4rem]">
        <span className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center gap-[4px]">
          <span className="w-[1px] h-[12px] bg-gray-600" /><span className="w-[1px] h-[12px] bg-gray-600" />
        </span>
        <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 font-semibold">Scroll to explore</span>
      </motion.div>
    </section>
  );
}

/* ---------- Explore Local Talent ---------- */
function Explore() {
  const nav = useNavigate();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative w-full min-h-[70vh] md:min-h-[88vh] bg-[#fcfcfc] flex flex-col items-center pt-20 md:pt-28 px-6 z-20">
      <div className="text-[10px] md:text-[11px] font-mono tracking-[0.2em] mb-10">
        <span className="text-gray-500">[ 02 ]</span> <span className="text-gray-900 font-bold uppercase">Explore Local Talent</span>
      </div>

      <motion.h2 ref={ref} initial={{ y: 40, opacity: 0 }} animate={inView ? { y: 0, opacity: 1 } : {}} className="max-w-[1000px] text-center text-[2.1rem] md:text-[3.5rem] lg:text-[4rem] leading-[1.1] font-medium tracking-tight text-[#111]">
        Discover skilled hands and handmade treasures from makers in your neighbourhood.
      </motion.h2>

      <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }} className="flex flex-wrap justify-center gap-3 md:gap-4 mt-10 md:mt-14">
        {CATEGORIES.map((c) => (
          <motion.button
            key={c.id}
            variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}
            onClick={() => nav(`/browse?cat=${c.id}`)}
            className="group inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/50 backdrop-blur-sm px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-800 transition-colors hover:border-black hover:bg-black hover:text-white"
          >
            <CatIcon id={c.id} size={14} strokeWidth={2} />{c.name}
          </motion.button>
        ))}
      </motion.div>

      <div className="w-full max-w-[1100px] grid grid-cols-2 md:grid-cols-5 gap-3 mt-12 md:mt-16">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => nav(`/browse?cat=${c.id}`)} className="group text-left border border-gray-200 rounded-lg p-4 bg-white transition-all hover:border-black hover:-translate-y-1">
            <CatIcon id={c.id} size={22} strokeWidth={1.4} className="text-[#111]" />
            <div className="mt-6 text-[15px] font-medium">{c.name}</div>
            <div className="text-[11px] font-mono text-gray-500 uppercase tracking-wide">{c.sub}</div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-mono text-gray-400 group-hover:text-black transition-colors">Browse <ArrowUpRight size={13} /></div>
          </button>
        ))}
      </div>

      <div className="hidden md:flex justify-between w-full px-2 md:px-10 mt-auto pt-16 pb-8 text-[10px] font-mono tracking-widest uppercase text-gray-500 font-medium">
        <span>Handmade. Local. Yours.</span><span>HunarHub © 2026</span>
      </div>
    </section>
  );
}

/* ---------- Featured Crafts (dark) ---------- */
function FeaturedCrafts() {
  const nav = useNavigate();
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const t = setInterval(() => { if (!paused.current) setActive((p) => (p + 1) % CRAFTS.length); }, 3500);
    return () => clearInterval(t);
  }, []);

  const cur = CRAFTS[active];
  const goCat = (id: CategoryId) => nav(`/browse?cat=${id}`);

  return (
    <section className="relative w-full bg-[#0a0a0a] text-white flex flex-col z-30 overflow-hidden">
      <motion.img
        src={pic('hunar-overlap-craft', 1300, 800)}
        alt=""
        initial={{ y: '-65%', opacity: 0 }}
        whileInView={{ y: '-34%', opacity: 0.4 }}
        viewport={{ margin: '100px' }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 w-[150vw] md:w-[1000px] z-0"
        style={{ maskImage: 'radial-gradient(60% 55% at 50% 45%, black, transparent)', WebkitMaskImage: 'radial-gradient(60% 55% at 50% 45%, black, transparent)' }}
      />

      <div className="relative z-10 px-8 md:px-16 pt-28 md:pt-44 mb-14 flex flex-col xl:flex-row xl:justify-between gap-10">
        <h2 className="max-w-[820px] text-[1.7rem] md:text-[3rem] lg:text-[3.6rem] xl:text-[3.8rem] leading-[1.15] font-medium tracking-tight text-white">
          Curated from generations of skill
          <span className="inline-flex gap-2 md:gap-3 align-middle mx-2 md:mx-3 -translate-y-1">
            {(['tailor', 'potter', 'artisan'] as CategoryId[]).map((id) => (
              <span key={id} className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-gray-600 bg-black text-gray-400 flex items-center justify-center transition-colors hover:bg-white hover:text-black hover:border-white">
                <CatIcon id={id} size={22} strokeWidth={1.4} />
              </span>
            ))}
          </span>
          &amp; tradition.
        </h2>
        <div className="shrink-0">
          <p className="text-[9px] md:text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-5 leading-relaxed">
            We don't just sell products<br />we share a maker's story
          </p>
          <div className="flex flex-wrap gap-2">
            {['Authentic', 'Handmade', 'Local'].map((t) => (
              <span key={t} className="px-5 py-2 rounded-full border border-gray-600 text-[9px] font-mono tracking-widest uppercase text-gray-300 transition-colors hover:bg-white hover:text-black hover:border-white cursor-default">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-gray-800" />

      <div className="relative z-10 flex flex-col md:flex-row" onMouseEnter={() => (paused.current = true)} onMouseLeave={() => (paused.current = false)}>
        <div className="w-full md:w-[35%] border-b md:border-b-0 md:border-r border-gray-800 min-h-[360px] md:min-h-[500px] flex flex-col justify-between p-8">
          <div className="text-gray-500 text-xl tracking-[0.3em]">✳ ✳ ✳</div>
          <div className="relative flex-1 my-6">
            <AnimatePresence mode="wait">
              <SandTransitionImage key={cur.id} src={cur.image} alt={cur.name} className="absolute inset-0 w-[82%] h-[82%] m-auto object-cover rounded mix-blend-lighten" />
            </AnimatePresence>
          </div>
          <div className="flex items-end gap-2 text-[10px] font-mono tracking-widest text-[#888] uppercase">
            <motion.span key={active} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-white text-2xl leading-none">
              {String(active + 1).padStart(2, '0')}
            </motion.span>
            <span className="text-[#333]">/</span><span>{String(CRAFTS.length).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="w-full md:w-[65%]">
          <div className="border-b border-gray-800 p-8 flex justify-between text-[10px] font-mono text-gray-400 tracking-widest uppercase">
            <span>Explore the craft. Support the maker.</span>
            <span className="text-white">Craft 0{active + 1}</span>
          </div>
          {CRAFTS.map((ch, i) => (
            <button key={ch.id} onClick={() => { setActive(i); goCat(ch.id); }} className={cn('w-full flex items-center justify-between border-b border-gray-800/80 px-8 py-7 text-left transition-colors', i === active ? 'text-white' : 'text-[#444] hover:text-[#999]')}>
              <span className="text-2xl md:text-[2rem] font-medium tracking-tight">{ch.name}</span>
              <ArrowUpRight size={22} strokeWidth={1} className={cn('text-gray-400 transition-all duration-500', i === active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2')} />
            </button>
          ))}
        </div>
      </div>

      <div className="h-[1px] bg-gray-800" />
      <div className="px-8 py-8 text-[10px] font-mono tracking-widest text-gray-500 uppercase bg-[#0a0a0a]">Crafted with pride across India</div>
    </section>
  );
}

export default function Landing() {
  return (
    <>
      <Header />
      <Hero />
      <Explore />
      <FeaturedCrafts />
    </>
  );
}
