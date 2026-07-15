# HunarHub — Digital Marketplace for Local Micro-Entrepreneurs

The reference NHM landing design, re-themed end-to-end for HunarHub: same monochrome editorial system, animated wordmark, three-section flow and sand-dissolve showcase — now for cobblers, potters (kumhar), tailors, artisans and local vendors.

## Two deliverables

| File | What it is | How to use |
|---|---|---|
| **`hunarhub-preview.html`** | The whole app in one self-contained file (React + Tailwind + Babel via CDN). | Just open it in a browser — landing + Browse + Profile + Dashboard all work. |
| **`hunarhub-vite-project.md`** | The production source: **React 19 · Vite 6 · Tailwind 4 · Motion · lucide-react · react-router-dom · TypeScript**, split into a clean component/page structure. | Follow the "How to create the project" steps at the top, then `npm run dev`. |

## How the design maps over

| Reference (NHM) | HunarHub |
|---|---|
| `NHM` polygon logo | Animated **HUNARHUB** wordmark (per-letter slide-up) |
| Hero specimen (T-Rex) | **Featured Artisan** card (Ramesh Kumar, Potter · Jaipur) |
| "Explore Our World" + fossil pills | **Explore Local Talent** + category pills (Cobbler, Potter, Tailor, Artisan, Vendor) |
| Dark "Ancient Collection" + chapters | **Featured Crafts** + auto-cycling craft chapters (Pottery, Tailoring, Leather, Artisan, Market) |
| `SandTransitionImage` dissolve | Re-used verbatim for the craft showcase |

## Scope in this build

Landing page (full reskin) **+ app shells**: Browse/Marketplace (category + search + price + sort filters), Entrepreneur Profile (services / products / reviews tabs, sticky request CTA), and Entrepreneur Dashboard (KPIs, accept/decline service requests, availability toggle, listings) — all wired to mock data, no backend.

## Next steps to the full brief

Add `/login`, `/orders`, `/admin` routes and a data layer (React Query → Express/Mongo) — the design system and mock-data shape already scale to auth, orders, ratings, admin verification and payments. Replace `pic(...)` placeholders with real Cloudinary/S3 craft photography.
