import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserMenu } from './UserMenu';

const NAV = [
  { label: 'Discover', to: '/' },
  { label: 'Artisans', to: '/browse' },
  { label: 'Products', to: '/browse' },
  { label: 'Sell', to: '/register' },
  { label: 'About', to: '/' },
];

const fadeUp: Variants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const letterBlock: Variants = {
  initial: { y: 120, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
};

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
      className="relative z-20 pt-6 px-6 md:px-16"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-black focus:px-4 focus:py-2 focus:text-[13px] focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      {/* utility bar: auth actions */}
      <div className="flex items-center justify-between pb-2">
        <span className="hidden text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 sm:inline">
          Local craft marketplace
        </span>
        <div className="ml-auto">
          <UserMenu />
        </div>
      </div>

      {/* wordmark */}
      <div className="overflow-hidden">
        <motion.h1
          variants={{ initial: { scale: 1.03 }, animate: { scale: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
          className="flex w-full justify-between items-end leading-[0.8]"
          aria-label="HunarHub"
        >
          {'HUNARHUB'.split('').map((c, i) => (
            <span key={i} className="overflow-hidden inline-block">
              <motion.span variants={letterBlock} className="inline-block text-[13.5vw] md:text-[12.5vw] font-semibold tracking-[-0.03em] text-[#111]">
                {c}
              </motion.span>
            </span>
          ))}
        </motion.h1>
      </div>

      {/* sub-nav */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex justify-between items-start mt-6 md:mt-8 text-[10px] md:text-[11px] font-mono tracking-[0.2em] uppercase"
      >
        <div className="w-[22%] md:w-[15%] text-gray-800 leading-relaxed">
          <div>Local</div><div>Craft</div><div>Market</div>
        </div>
        <div className="hidden md:flex w-[5%] justify-center pt-1"><ArrowRight size={14} strokeWidth={1} className="text-gray-400" /></div>
        <p className="flex-1 md:w-[30%] md:flex-none px-4 md:px-0 text-gray-800 leading-relaxed">
          Empowering local artisans and micro-entrepreneurs through digital discovery and direct trade.
        </p>
        <div className="hidden md:flex w-[5%] justify-center pt-1"><ArrowRight size={14} strokeWidth={1} className="text-gray-400" /></div>
        <nav className="hidden md:flex w-[15%] flex-col gap-1 text-gray-800">
          {NAV.map((n) => (
            <Link key={n.label} to={n.to} className="hover:text-black hover:underline underline-offset-4 transition-colors">{n.label}</Link>
          ))}
        </nav>

        {/* hamburger */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden relative z-[60] flex flex-col gap-[6px] pt-1"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          <span className={cn('block h-[1.5px] bg-black transition-all duration-300', open ? 'w-8 rotate-45 translate-y-[7.5px]' : 'w-8')} />
          <span className={cn('block h-[1.5px] bg-black transition-all duration-300', open ? 'w-8 -rotate-45 -translate-y-[1px]' : 'w-6')} />
        </button>
      </motion.div>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="md:hidden mt-6 -mx-6 px-6 py-8 bg-[#fcfcfc] border-y border-gray-200 shadow-xl"
          >
            <nav className="flex flex-col gap-6 text-sm font-mono tracking-[0.2em] uppercase text-gray-800">
              {NAV.map((n) => (
                <Link key={n.label} to={n.to} onClick={() => setOpen(false)} className="hover:text-black">{n.label}</Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
