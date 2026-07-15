# HunarHub

Digital marketplace that gives local micro-entrepreneurs — cobblers, potters (kumhar), tailors, artisans and small vendors — digital visibility and direct access to customers.

**Stack:** React 19 · Vite 6 · Tailwind CSS 4 · Motion (Framer Motion) · lucide-react · react-router-dom · TypeScript.

## Run

```bash
npm install
npm run dev
```

Then open the printed local URL (default http://localhost:5173).

Other scripts: `npm run build` (type-check + production build), `npm run preview` (serve the build), `npm run typecheck`.

## Routes

| Path | Page |
|---|---|
| `/` | Landing — animated HUNARHUB wordmark, "Made by Hand" hero, Explore Local Talent, dark Featured Crafts showcase (sand-dissolve) |
| `/browse` | Marketplace — category + search + price + sort filters (`/browse?cat=potter`) |
| `/profile/:id` | Entrepreneur profile — services / products / reviews tabs (`/profile/ramesh`) |
| `/dashboard` | Entrepreneur dashboard — KPIs, accept/decline requests, availability toggle, listings |

## Structure

```
src/
├─ main.tsx            # app entry + BrowserRouter
├─ App.tsx             # routes
├─ index.css           # Tailwind 4 theme (Inter + JetBrains Mono, palette)
├─ types.ts            # shared TypeScript types
├─ lib/utils.ts        # cn(), inr(), pic()
├─ data/mockData.ts    # categories, crafts, entrepreneurs
├─ components/         # Header, PageBar, Monogram, Stars, craftIcons, SandTransitionImage
└─ pages/              # Landing, Browse, Profile, Dashboard
```

## Notes

- Runs entirely on mock data (`src/data/mockData.ts`) — no backend. Swap this module for a real API layer (e.g. React Query → Express/Mongo) without touching components.
- Images use grayscale Picsum placeholders (`pic()` in `src/lib/utils.ts`). Replace with your Cloudinary/S3 craft photography for production.
- `SandTransitionImage` is the signature SVG-filter dissolve used in the Featured Crafts showcase.

## Toward the full brief

Add `/login` (customer + entrepreneur + admin roles), a real service-request/order lifecycle, ratings persistence, admin verification + dispute handling, analytics, and payments/wallet. The design system and mock-data shapes already scale to these.
