# HunarHub — Vite + React 19 + TypeScript source bundle

Production source for the HunarHub marketplace, using your exact stack:
**React 19 · Vite 6 · Tailwind CSS 4 · Motion (Framer Motion) · lucide-react · react-router-dom · TypeScript.**

The design language (monochrome editorial, animated wordmark, three-section landing, sand-dissolve craft showcase) is re-themed from the reference NHM layout for local micro-entrepreneurs.

---

## How to create the project

```bash
# 1. scaffold an empty Vite React-TS app
npm create vite@latest hunarhub -- --template react-ts
cd hunarhub

# 2. install the runtime + dev deps
npm i react@^19 react-dom@^19 react-router-dom@^7 motion lucide-react
npm i -D tailwindcss@^4 @tailwindcss/vite@^4

# 3. create the files below (copy each block into the given path),
#    overwriting the generated defaults where they collide

# 4. run
npm run dev
```

File tree:

```
hunarhub/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
└─ src/
   ├─ main.tsx
   ├─ index.css
   ├─ App.tsx
   ├─ types.ts
   ├─ lib/utils.ts
   ├─ data/mockData.ts
   ├─ components/
   │  ├─ craftIcons.tsx
   │  ├─ Monogram.tsx
   │  ├─ Stars.tsx
   │  ├─ SandTransitionImage.tsx
   │  ├─ Header.tsx
   │  └─ PageBar.tsx
   └─ pages/
      ├─ Landing.tsx
      ├─ Browse.tsx
      ├─ Profile.tsx
      └─ Dashboard.tsx
```

> **Assets:** the bundle uses grayscale Picsum placeholders so it runs with zero setup. In production, swap `pic(...)` in `lib/utils.ts` for your Cloudinary/S3 craft photography.

---

## `package.json`

```json
{
  "name": "hunarhub",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b --noEmit"
  },
  "dependencies": {
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "react-router-dom": "^7.1.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.1",
    "@vitejs/plugin-react": "^5.0.4",
    "tailwindcss": "^4.1.14",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  }
}
```

## `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

## `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HunarHub — Digital Marketplace for Local Micro-Entrepreneurs</title>
    <meta name="description" content="HunarHub gives cobblers, potters, tailors, artisans and local vendors digital visibility and direct access to customers." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## `src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

@layer utilities {
  .text-mega {
    font-size: 21vw;
    line-height: 0.75;
    letter-spacing: -0.04em;
  }
}

html, body {
  background: #fcfcfc;
  color: #111;
  overflow-x: hidden;
}
body { font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
::selection { background: #000; color: #fff; }
```

## `src/main.tsx`

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

## `src/types.ts`

```ts
export type CategoryId = 'cobbler' | 'potter' | 'tailor' | 'artisan' | 'vendor';

export interface Category { id: CategoryId; name: string; sub: string; desc: string; }
export interface Service { name: string; price: number; dur: string; }
export interface Product { name: string; price: number; }

export interface Entrepreneur {
  id: string;
  name: string;
  category: CategoryId;
  craft: string;
  city: string;
  state: string;
  exp: number;
  rating: number;
  reviews: number;
  start: number;
  available: boolean;
  verified: boolean;
  bio: string;
  services: Service[];
  products: Product[];
}

export interface Craft { id: CategoryId; name: string; image: string; }
```

## `src/lib/utils.ts`

```ts
export const cn = (...a: Array<string | false | null | undefined>) =>
  a.filter(Boolean).join(' ');

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

/** Grayscale placeholder — replace with your CDN in production. */
export const pic = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}?grayscale`;
```

## `src/data/mockData.ts`

```ts
import type { Category, Craft, Entrepreneur } from '../types';
import { pic } from '../lib/utils';

export const CATEGORIES: Category[] = [
  { id: 'cobbler', name: 'Cobbler', sub: 'Leather & footwear', desc: 'Repairs, resoling and handmade leather goods.' },
  { id: 'potter',  name: 'Potter',  sub: 'Kumhar · clay craft', desc: 'Terracotta, diyas and hand-thrown pottery.' },
  { id: 'tailor',  name: 'Tailor',  sub: 'Stitching & alter.',  desc: 'Bespoke stitching, alterations and embroidery.' },
  { id: 'artisan', name: 'Artisan', sub: 'Handmade décor',      desc: 'Mirror-work, woodcraft and handmade décor.' },
  { id: 'vendor',  name: 'Vendor',  sub: 'Local goods',         desc: 'Home-made pickles, spices and local produce.' },
];

export const CRAFTS: Craft[] = [
  { id: 'potter',  name: 'Handcrafted Pottery', image: pic('hunar-pottery', 900, 900) },
  { id: 'tailor',  name: 'Bespoke Tailoring',   image: pic('hunar-tailor', 900, 900) },
  { id: 'cobbler', name: 'Leather & Footwear',  image: pic('hunar-leather', 900, 900) },
  { id: 'artisan', name: 'Artisan Creations',   image: pic('hunar-artisan', 900, 900) },
  { id: 'vendor',  name: 'Local Market Goods',  image: pic('hunar-market', 900, 900) },
];

export const ENTREPRENEURS: Entrepreneur[] = [
  { id: 'ramesh', name: 'Ramesh Kumar', category: 'potter', craft: 'Potter (Kumhar)', city: 'Jaipur', state: 'Rajasthan',
    exp: 24, rating: 4.9, reviews: 128, start: 120, available: true, verified: true,
    bio: 'Third-generation kumhar hand-throwing terracotta on a traditional wheel. Specialises in garden pots, diyas and clay water bottles fired in a wood kiln.',
    services: [{ name: 'Custom Terracotta Pot', price: 250, dur: '3 days' }, { name: 'Diwali Diya Set (12 pcs)', price: 120, dur: '1 day' }, { name: 'Clay Water Bottle', price: 400, dur: '2 days' }],
    products: [{ name: 'Painted Planter', price: 320 }, { name: 'Kulhad Set (6)', price: 180 }, { name: 'Terracotta Vase', price: 540 }] },
  { id: 'sunita', name: 'Sunita Devi', category: 'tailor', craft: 'Tailor', city: 'Lucknow', state: 'Uttar Pradesh',
    exp: 12, rating: 4.8, reviews: 94, start: 150, available: true, verified: true,
    bio: 'Blouse and kurti specialist trained in Lucknawi chikankari. Precise measurements, quick turnarounds and delicate hand embroidery.',
    services: [{ name: 'Blouse Stitching', price: 300, dur: '4 days' }, { name: 'Kurti Alteration', price: 150, dur: '2 days' }, { name: 'Chikankari Embroidery', price: 800, dur: '7 days' }],
    products: [{ name: 'Chikankari Dupatta', price: 950 }, { name: 'Cotton Kurti', price: 700 }] },
  { id: 'abdul', name: 'Abdul Karim', category: 'cobbler', craft: 'Cobbler', city: 'Old Delhi', state: 'Delhi',
    exp: 30, rating: 4.7, reviews: 76, start: 80, available: false, verified: true,
    bio: 'Master mochi resoling shoes and crafting custom leather sandals for three decades near Jama Masjid.',
    services: [{ name: 'Shoe Resoling', price: 200, dur: '1 day' }, { name: 'Leather Polish & Care', price: 80, dur: 'Same day' }, { name: 'Custom Leather Sandals', price: 900, dur: '5 days' }],
    products: [{ name: 'Handmade Kolhapuri', price: 1100 }, { name: 'Leather Belt', price: 450 }] },
  { id: 'meena', name: 'Meena Kumari', category: 'artisan', craft: 'Artisan · Mirror-work', city: 'Kutch', state: 'Gujarat',
    exp: 18, rating: 5.0, reviews: 210, start: 350, available: true, verified: true,
    bio: 'Kutchi embroidery and mirror-work artisan creating wall hangings, torans and cushion covers for homes across India.',
    services: [{ name: 'Custom Wall Hanging', price: 1200, dur: '10 days' }, { name: 'Toran (door hanging)', price: 650, dur: '6 days' }],
    products: [{ name: 'Mirror-work Cushion', price: 550 }, { name: 'Embroidered Toran', price: 780 }, { name: 'Wall Hanging', price: 1500 }] },
  { id: 'ravi', name: 'Ravi Prajapati', category: 'potter', craft: 'Potter (Kumhar)', city: 'Khurja', state: 'Uttar Pradesh',
    exp: 15, rating: 4.6, reviews: 58, start: 90, available: true, verified: false,
    bio: 'Khurja blue-pottery maker producing glazed ceramic crockery and decorative tiles.',
    services: [{ name: 'Glazed Dinner Set', price: 1400, dur: '8 days' }, { name: 'Decorative Tiles (set)', price: 600, dur: '5 days' }],
    products: [{ name: 'Blue Pottery Bowl', price: 240 }, { name: 'Ceramic Mug', price: 160 }] },
  { id: 'lakshmi', name: 'Lakshmi Naidu', category: 'vendor', craft: 'Local Vendor', city: 'Madurai', state: 'Tamil Nadu',
    exp: 9, rating: 4.5, reviews: 41, start: 60, available: true, verified: true,
    bio: 'Home-made pickles, filter-coffee powder and hand-ground spice blends prepared in small batches.',
    services: [{ name: 'Custom Spice Blend', price: 220, dur: '2 days' }],
    products: [{ name: 'Mango Pickle (500g)', price: 180 }, { name: 'Filter Coffee Powder', price: 240 }, { name: 'Sambar Masala', price: 130 }] },
  { id: 'iqbal', name: 'Iqbal Ansari', category: 'tailor', craft: 'Tailor · Menswear', city: 'Bhopal', state: 'Madhya Pradesh',
    exp: 20, rating: 4.8, reviews: 132, start: 200, available: true, verified: true,
    bio: 'Menswear tailor specialising in kurta-pyjama, sherwani and formal trousers with a precise finish.',
    services: [{ name: 'Kurta-Pyjama Set', price: 600, dur: '5 days' }, { name: 'Sherwani (bespoke)', price: 3500, dur: '14 days' }, { name: 'Trouser Stitching', price: 350, dur: '3 days' }],
    products: [{ name: 'Ready Cotton Kurta', price: 850 }] },
  { id: 'gopal', name: 'Gopal Sharma', category: 'artisan', craft: 'Artisan · Woodwork', city: 'Saharanpur', state: 'Uttar Pradesh',
    exp: 22, rating: 4.9, reviews: 87, start: 300, available: false, verified: true,
    bio: 'Saharanpur wood-carving artisan crafting jharokhas, trays and carved home décor from sheesham wood.',
    services: [{ name: 'Carved Wall Panel', price: 2500, dur: '12 days' }, { name: 'Wooden Serving Tray', price: 700, dur: '4 days' }],
    products: [{ name: 'Carved Trinket Box', price: 480 }, { name: 'Sheesham Coasters (6)', price: 360 }] },
];

export const byId = (id?: string) => ENTREPRENEURS.find((e) => e.id === id);
```

## `src/components/craftIcons.tsx`

```tsx
import { Footprints, Amphora, Scissors, Palette, Store, type LucideProps } from 'lucide-react';
import type { CategoryId } from '../types';

export const CAT_ICON: Record<CategoryId, React.ComponentType<LucideProps>> = {
  cobbler: Footprints,
  potter: Amphora,
  tailor: Scissors,
  artisan: Palette,
  vendor: Store,
};

export function CatIcon({ id, ...props }: { id: CategoryId } & LucideProps) {
  const Icon = CAT_ICON[id] ?? Palette;
  return <Icon {...props} />;
}
```

## `src/components/Monogram.tsx`

```tsx
import { cn } from '../lib/utils';

export function Monogram({ name, size = 48, className }: { name: string; size?: number; className?: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div
      className={cn('shrink-0 rounded-full bg-[#111] text-[#fcfcfc] flex items-center justify-center font-mono select-none', className)}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials}
    </div>
  );
}
```

## `src/components/Stars.tsx`

```tsx
import { Star } from 'lucide-react';

export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-[2px] text-[#111]">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} strokeWidth={1.2} fill={i < Math.round(value) ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}
```

## `src/components/SandTransitionImage.tsx`

Faithful sand / particle dissolve using an SVG filter chain (turbulence → displacement → offset → blur → opacity), driven by a `requestAnimationFrame` loop and `usePresence()` so it works inside `AnimatePresence`.

```tsx
import { useEffect, useRef, useState } from 'react';
import { usePresence } from 'motion/react';

let uid = 0;

export function SandTransitionImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [isPresent, safeToRemove] = usePresence();
  const filterId = useRef(`sand-${uid++}`).current;
  const [progress, setProgress] = useState(0); // 0 = fully visible, 1 = fully dissolved
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const DURATION = 900;
    const start = performance.now();
    const entering = isPresent;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      // entering: quartic ease-out · exiting: cubic
      const eased = entering ? 1 - Math.pow(1 - t, 4) : Math.pow(t, 3);
      setProgress(entering ? 1 - eased : eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else if (!entering) safeToRemove?.();
    };

    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [isPresent, safeToRemove]);

  const scale = 150 * progress;
  const dy = (isPresent ? -80 : 120) * progress;
  const dx = (isPresent ? -30 : 30) * progress;
  const blur = 6 * progress;
  const opacity = Math.max(0, 1 - progress * 1.2);

  return (
    <>
      <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves={4} seed={7} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={scale} xChannelSelector="R" yChannelSelector="G" result="disp" />
          <feOffset in="disp" dx={dx} dy={dy} result="off" />
          <feGaussianBlur in="off" stdDeviation={blur} result="blur" />
          <feColorMatrix in="blur" type="matrix" values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${opacity} 0`} />
        </filter>
      </svg>
      <img
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        className={className}
        style={{ filter: `url(#${filterId})`, opacity }}
      />
    </>
  );
}
```

## `src/components/Header.tsx`

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

const NAV = [
  { label: 'Discover', to: '/' },
  { label: 'Artisans', to: '/browse' },
  { label: 'Products', to: '/browse' },
  { label: 'Sell', to: '/dashboard' },
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
        <button onClick={() => setOpen((o) => !o)} className="md:hidden relative z-[60] flex flex-col gap-[6px] pt-1" aria-label="Menu">
          <span className={cn('block h-[1.5px] bg-black transition-all duration-300', open ? 'w-8 rotate-45 translate-y-[7.5px]' : 'w-8')} />
          <span className={cn('block h-[1.5px] bg-black transition-all duration-300', open ? 'w-8 -rotate-45 -translate-y-[1px]' : 'w-6')} />
        </button>
      </motion.div>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
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
```

## `src/components/PageBar.tsx`

```tsx
import { Link } from 'react-router-dom';

export function PageBar({ crumb }: { crumb?: string }) {
  return (
    <div className="px-6 md:px-16 pt-6 pb-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-[#fcfcfc]/90 backdrop-blur z-40">
      <Link to="/" className="text-[15px] font-semibold tracking-[-0.02em]">HunarHub</Link>
      <nav className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest text-gray-600">
        <Link to="/browse" className="hover:text-black">Browse</Link>
        <Link to="/dashboard" className="hover:text-black">Sell</Link>
        {crumb && <span className="hidden md:inline text-gray-400">{crumb}</span>}
      </nav>
    </div>
  );
}
```

## `src/pages/Landing.tsx`

Hero · Explore Local Talent · Featured Crafts (dark, sand-dissolve showcase). Uses `whileInView`, staggered reveals and the auto-cycling craft chapter from the reference design.

```tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { ArrowRight, ArrowUpRight, Plus, Sparkles } from 'lucide-react';
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
```

## `src/pages/Browse.tsx`

```tsx
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
```

## `src/pages/Profile.tsx`

```tsx
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Plus, MapPin, Check, Clock } from 'lucide-react';
import { PageBar } from '../components/PageBar';
import { Monogram } from '../components/Monogram';
import { Stars } from '../components/Stars';
import { CatIcon } from '../components/craftIcons';
import { byId, ENTREPRENEURS } from '../data/mockData';
import { cn, inr, pic } from '../lib/utils';

const TABS = [{ id: 'services', label: 'Services' }, { id: 'products', label: 'Products' }, { id: 'reviews', label: 'Reviews' }] as const;
type TabId = (typeof TABS)[number]['id'];

const REVIEWS = [
  { n: 'Priya S.', r: 5, t: 'Beautiful craftsmanship and delivered on time. Highly recommend!' },
  { n: 'Arjun M.', r: 5, t: 'Exactly what I wanted. Great communication throughout.' },
  { n: 'Neha K.', r: 4, t: 'Lovely work, took a day longer than expected but worth it.' },
];

export default function Profile() {
  const { id } = useParams();
  const e = byId(id) ?? ENTREPRENEURS[0];
  const [tab, setTab] = useState<TabId>('services');

  return (
    <div className="min-h-screen">
      <PageBar crumb={e.name} />
      <div className="relative h-44 md:h-60 bg-gray-900 overflow-hidden">
        <img src={pic(`cover-${e.id}`, 1600, 500)} alt="" className="w-full h-full object-cover opacity-60" />
        <Link to="/browse" className="absolute top-4 left-6 md:left-16 text-[10px] font-mono uppercase tracking-widest text-white/80 hover:text-white flex items-center gap-1">
          <ArrowUpRight size={13} className="rotate-[225deg]" /> Back to browse
        </Link>
      </div>

      <div className="px-6 md:px-16">
        {/* avatar overlaps the cover; sits ABOVE the image via z-10 */}
        <div className="relative z-10 -mt-12 md:-mt-16 w-fit">
          <Monogram name={e.name} size={96} className="ring-4 ring-[#fcfcfc]" />
        </div>
        {/* identity + stats sit fully BELOW the cover, so nothing is clipped */}
        <div className="mt-4 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[2rem] md:text-[2.6rem] font-medium tracking-tight leading-tight">{e.name}{e.verified && <Check size={20} className="text-blue-600" />}</div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] font-mono text-gray-600 uppercase tracking-wide">
              <span className="inline-flex items-center gap-1.5"><CatIcon id={e.category} size={13} strokeWidth={2} />{e.craft}</span>
              <span className="inline-flex items-center gap-1"><MapPin size={12} />{e.city}, {e.state}</span>
            </div>
          </div>
          <div className="flex items-center gap-8 md:pt-1 shrink-0">
            <div><div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Rating</div><div className="flex items-center gap-1.5 mt-1"><Stars value={e.rating} /><span className="text-[13px] font-medium">{e.rating}</span></div></div>
            <div><div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Experience</div><div className="text-[15px] font-medium mt-1">{e.exp} yrs</div></div>
            <div><div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Status</div><div className={cn('text-[13px] font-medium mt-1', e.available ? 'text-green-700' : 'text-gray-400')}>{e.available ? 'Available' : 'Busy'}</div></div>
          </div>
        </div>

        <p className="mt-8 max-w-[720px] text-[15px] leading-[1.7] text-gray-700">{e.bio}</p>

        <div className="mt-10 flex gap-8 border-b border-gray-200">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn('pb-3 text-[11px] font-mono uppercase tracking-widest transition-colors relative', tab === t.id ? 'text-black' : 'text-gray-400 hover:text-gray-700')}>
              {t.label}{tab === t.id && <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-black" />}
            </button>
          ))}
        </div>

        <div className="py-8 pb-24">
          {tab === 'services' && (
            <div className="grid gap-3 max-w-[760px]">
              {e.services.map((s) => (
                <div key={s.name} className="flex items-center justify-between border border-gray-200 rounded-lg px-5 py-4 bg-white hover:border-black transition-colors">
                  <div><div className="text-[15px] font-medium">{s.name}</div><div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-gray-500 uppercase tracking-wide"><Clock size={12} />{s.dur}</div></div>
                  <div className="flex items-center gap-4"><div className="text-[16px] font-semibold">{inr(s.price)}</div>
                    <button className="rounded-md bg-[#111] text-white text-[11px] font-mono uppercase tracking-widest px-4 py-2 hover:bg-black">Request</button></div>
                </div>
              ))}
            </div>
          )}
          {tab === 'products' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {e.products.map((pr, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-black transition-colors">
                  <img src={pic(`prod-${e.id}-${i}`, 500, 500)} alt="" className="w-full h-40 object-cover" />
                  <div className="p-4"><div className="text-[14px] font-medium leading-tight">{pr.name}</div>
                    <div className="mt-3 flex items-center justify-between"><span className="text-[15px] font-semibold">{inr(pr.price)}</span>
                      <button className="rounded-full border border-gray-300 hover:border-black w-8 h-8 flex items-center justify-center"><Plus size={15} /></button></div></div>
                </div>
              ))}
            </div>
          )}
          {tab === 'reviews' && (
            <div className="grid gap-4 max-w-[720px]">
              {REVIEWS.map((rv, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-5 bg-white">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Monogram name={rv.n} size={34} /><span className="text-[14px] font-medium">{rv.n}</span></div><Stars value={rv.r} /></div>
                  <p className="mt-3 text-[14px] text-gray-700 leading-relaxed">{rv.t}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-gray-200 bg-[#fcfcfc]/95 backdrop-blur px-6 md:px-16 py-4 flex items-center justify-between">
        <div className="text-[13px] text-gray-600"><span className="font-mono text-[11px] uppercase tracking-widest text-gray-400">Starting at </span><span className="font-semibold text-[#111]">{inr(e.start)}</span></div>
        <button className="rounded-md bg-[#111] text-white px-6 py-3 text-[13px] font-medium hover:bg-black flex items-center gap-2">Place Service Request <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}
```

## `src/pages/Dashboard.tsx`

```tsx
import { useState, type ReactNode } from 'react';
import { TrendingUp, Package, Clock, Star, Wallet, Plus, Check } from 'lucide-react';
import { PageBar } from '../components/PageBar';
import { Monogram } from '../components/Monogram';
import { byId } from '../data/mockData';
import { cn, inr } from '../lib/utils';

function Kpi({ icon, label, value, delta }: { icon: ReactNode; label: string; value: ReactNode; delta?: string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between text-gray-400">{icon}<span className="text-[10px] font-mono uppercase tracking-widest">{label}</span></div>
      <div className="mt-4 text-[1.8rem] font-medium tracking-tight">{value}</div>
      {delta && <div className="mt-1 text-[11px] font-mono text-green-700 flex items-center gap-1"><TrendingUp size={12} />{delta}</div>}
    </div>
  );
}

interface Req { id: number; who: string; svc: string; price: number; when: string; status: 'pending' | 'accepted' | 'declined'; }

export default function Dashboard() {
  const me = byId('ramesh')!;
  const [available, setAvailable] = useState(true);
  const [requests, setRequests] = useState<Req[]>([
    { id: 1, who: 'Priya Sharma', svc: 'Custom Terracotta Pot', price: 250, when: '2h ago', status: 'pending' },
    { id: 2, who: 'Arjun Mehta', svc: 'Diwali Diya Set (12 pcs)', price: 120, when: '5h ago', status: 'pending' },
    { id: 3, who: 'Neha Kapoor', svc: 'Clay Water Bottle', price: 400, when: '1d ago', status: 'pending' },
  ]);
  const act = (id: number, status: Req['status']) => setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  const pending = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <PageBar crumb="Dashboard" />
      <div className="px-6 md:px-16 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Monogram name={me.name} size={56} />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Entrepreneur Dashboard</div>
              <div className="text-[1.6rem] font-medium tracking-tight leading-tight">{me.name}</div>
              <div className="text-[12px] font-mono text-gray-500">{me.craft} · {me.city}</div>
            </div>
          </div>
          <label className="inline-flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-gray-600 cursor-pointer select-none">
            Availability
            <span onClick={() => setAvailable((a) => !a)} className={cn('relative w-12 h-6 rounded-full transition-colors', available ? 'bg-black' : 'bg-gray-300')}>
              <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all', available ? 'left-6' : 'left-0.5')} />
            </span>
            <span className={available ? 'text-green-700' : 'text-gray-400'}>{available ? 'Open' : 'Paused'}</span>
          </label>
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi icon={<Wallet size={16} />} label="This month" value={inr(18400)} delta="+12% vs last" />
          <Kpi icon={<Package size={16} />} label="Active orders" value="7" delta="+2 new" />
          <Kpi icon={<Clock size={16} />} label="Pending requests" value={pending} />
          <Kpi icon={<Star size={16} />} label="Rating" value={`${me.rating} ★`} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 border border-gray-200 rounded-xl bg-white">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500">Service requests</span>
              <span className="text-[11px] font-mono text-gray-400">{pending} pending</span>
            </div>
            <div className="divide-y divide-gray-100">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-5 py-4 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Monogram name={r.who} size={38} />
                    <div className="min-w-0"><div className="text-[14px] font-medium truncate">{r.who}</div><div className="text-[12px] text-gray-500 truncate">{r.svc} · <span className="text-[#111] font-medium">{inr(r.price)}</span></div><div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{r.when}</div></div>
                  </div>
                  {r.status === 'pending' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => act(r.id, 'accepted')} className="rounded-md bg-[#111] text-white text-[11px] font-mono uppercase tracking-widest px-3 py-2 hover:bg-black flex items-center gap-1"><Check size={13} />Accept</button>
                      <button onClick={() => act(r.id, 'declined')} className="rounded-md border border-gray-300 text-gray-600 text-[11px] font-mono uppercase tracking-widest px-3 py-2 hover:border-black">Decline</button>
                    </div>
                  ) : (
                    <span className={cn('shrink-0 text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded-md', r.status === 'accepted' ? 'text-green-700 bg-green-50' : 'text-gray-400 bg-gray-50')}>{r.status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl bg-white">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500">Your listings</span>
              <button className="w-7 h-7 rounded-full border border-gray-300 hover:border-black flex items-center justify-center"><Plus size={14} /></button>
            </div>
            <div className="divide-y divide-gray-100">
              {me.services.map((s) => (
                <div key={s.name} className="flex items-center justify-between px-5 py-3.5">
                  <div className="text-[13px] font-medium">{s.name}</div><div className="text-[13px] font-semibold">{inr(s.price)}</div>
                </div>
              ))}
              {me.products.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div className="text-[13px] text-gray-600 flex items-center gap-2"><Package size={13} className="text-gray-400" />{p.name}</div><div className="text-[13px] font-semibold">{inr(p.price)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## `src/App.tsx`

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Browse from './pages/Browse';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="font-sans">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
```

---

## Notes & next steps

- **Routing** uses `react-router-dom` with real URLs (`/browse?cat=potter`, `/profile/ramesh`), so deep-links and the back button work.
- **State** in Dashboard (accept/decline, availability toggle) and Browse (filters/search/sort) is fully wired against mock data — swap `data/mockData.ts` for a real API layer (React Query + your Express/Mongo backend) without touching the components.
- **`SandTransitionImage`** is the signature dissolve effect from the reference design, re-used verbatim for the craft showcase.
- **Accessibility**: interactive elements are real `<button>`/`<Link>`; add `aria-label`s to icon-only buttons before shipping.
- **To extend to the full brief** (auth, orders, admin, payments), add `/login`, `/orders`, `/admin` routes and a data layer — the design system (mono labels, black/white cards, pill filters) already scales to them.
