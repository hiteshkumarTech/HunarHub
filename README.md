# HunarHub

A digital marketplace that gives local micro-entrepreneurs — cobblers, potters (kumhar), tailors, artisans and
small vendors — digital visibility and direct access to customers. Customers browse, request services, buy
products, and leave earned reviews; entrepreneurs manage requests, listings, and availability from a dashboard.

Live app: the frontend is deployed on Vercel, the API on Render (see [Deployment](#deployment)).

## Stack

**Frontend** — React 19 · Vite 6 · TypeScript (strict) · Tailwind CSS 4 · TanStack Query 5 · React Router 7 ·
Motion (Framer Motion) · lucide-react · Vitest + Testing Library.

**Backend** (`/server`) — Express 4 · MongoDB + Mongoose 8 · JWT auth · Zod validation · Helmet · rate limiting ·
mongo-sanitize · TypeScript, run via `tsx`.

## Run locally

```bash
# Frontend
npm install
npm run dev            # http://localhost:5173

# Backend (separate terminal)
cd server
npm install
cp .env.example .env   # fill in MONGODB_URI at minimum
npm run dev            # http://localhost:4000
```

The frontend's API base URL defaults to the deployed Render backend (see `src/lib/api.ts`), so `npm run dev` in
`/` alone is enough to click around against live data. To point it at your local API instead, copy `.env.example`
to `.env` and set `VITE_API_URL=http://localhost:4000`.

Other scripts: `npm run build` (typecheck + production build), `npm run preview` (serve the build),
`npm run typecheck`, `npm test` / `npm run test:watch`. Backend: `npm run seed` (populate demo data),
`npm run typecheck`.

### Demo accounts

Password for both: `password123`.

| Role | Email | Try |
|---|---|---|
| Customer | `priya@example.com` | Browse → open a profile → request a service → `/orders` to track it and leave a review once it's completed |
| Entrepreneur | `ramesh@hunarhub.in` | `/dashboard` → accept/decline requests → mark complete → toggle availability |

## Architecture

```
Browser (Vercel)                          API (Render)                    MongoDB Atlas
┌─────────────────────┐   HTTPS/JSON    ┌───────────────────────┐       ┌──────────────┐
│ React SPA            │ ───────────────▶│ Express               │──────▶│ Mongoose      │
│ TanStack Query cache  │◀─────────────── │  helmet · rate-limit  │◀──────│ models/indexes│
│ AuthContext (JWT)     │  Bearer token   │  mongo-sanitize · zod │       └──────────────┘
└─────────────────────┘                  │  JWT auth middleware  │
                                          └───────────────────────┘
```

- **Auth** — `POST /api/auth/register|login` return a JWT; the client stores it (`localStorage`, see
  "known trade-offs" below) and sends it as `Authorization: Bearer <token>`. `AuthContext` restores the session
  on load via `GET /api/auth/me` and exposes `login/register/logout` to the app. `RequireAuth` guards routes by
  role (`/dashboard` → entrepreneur, `/orders` and `/favourites` → customer).
- **Data fetching** — every list/detail screen goes through a typed hook in `src/hooks/*` built on TanStack
  Query (`src/lib/api.ts` is the single fetch wrapper: injects the bearer token, normalises errors into
  `ApiError`). Mutations invalidate the relevant query keys so the UI reflects server state without manual
  refetch plumbing.
- **Orders / earned reviews** — placing a request/order (`POST /api/orders`) creates a `pending` order; the
  entrepreneur accepts/declines/completes it (`PATCH /api/orders/:id/status`) from the Dashboard. `POST
  /api/reviews` only succeeds if the caller has a `completed` order with that entrepreneur — this is enforced
  server-side (`server/src/routes/reviews.ts`), not just hidden in the UI.
- **Design system** — semantic color tokens (`bg-surface`, `text-fg`, `text-muted`, `border-line`) map to CSS
  variables that flip under a `.dark` class on `<html>` (`ThemeProvider` in `src/context/ThemeContext.tsx`,
  persisted + OS-default). Shared primitives live in `src/components/ui/` (Button, Card, Badge, Avatar, Tabs,
  StatusBadge, Toast, States). Full catalogue and conventions: **[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)**.

### Known trade-offs (deliberate, not oversights)

- **JWT in `localStorage`** — simple and works well for this SPA + separate-origin-API shape, but is readable by
  any script if the app were ever XSS'd. An httpOnly-cookie session would close that gap; revisit if the app
  starts handling anything more sensitive than a craft marketplace.
- **Regex search, not full-text/Atlas Search** — `GET /api/entrepreneurs?q=` matches name/craft/city/state via a
  case-insensitive regex `$or`. Fine at this data scale; a `$text` or Atlas Search index would scale better and
  is a clean drop-in later (a text index already exists on `User`, just unused by the query).
- **No image uploads** — product/profile photos are grayscale Picsum placeholders (`pic()` in `src/lib/utils.ts`).
  Swap for Cloudinary/S3 without touching component code.

## Project structure

```
src/
├─ main.tsx                 # app entry — providers (Theme, Query, Auth, Toast) + BrowserRouter
├─ App.tsx                  # routes; Profile/Dashboard/Login/Register/Favourites/MyOrders are code-split
├─ index.css                # Tailwind 4 theme — fonts, color tokens, dark-mode variables, focus-visible
├─ types.ts, types/api.ts   # shared TypeScript types (frontend shapes; mirror the API's serializers)
├─ lib/                     # api.ts (fetch client), queryClient.ts, utils.ts, recentlyViewed.ts
├─ hooks/                   # entrepreneurs, orders, favorites, reviews — one TanStack Query hook module each
├─ context/                 # AuthContext, ThemeContext
├─ data/mockData.ts         # seed/fallback data (landing page graceful-degrades to this if the API is cold)
├─ components/
│  ├─ ui/                   # Button, Card, Badge, Avatar, Tabs, StatusBadge, Toast, States, Field, ThemeToggle
│  ├─ landing/               # HeroSection, FeaturedEntrepreneurs, TrendingProducts, Testimonials, …
│  └─ auth/AuthShell.tsx     # shared Login/Register shell
└─ pages/                   # Landing, Browse, Profile, Dashboard, Login, Register, Favourites, MyOrders

server/
├─ src/
│  ├─ app.ts, index.ts       # Express app wiring, entry point
│  ├─ config/                # db.ts (Mongoose connect), env.ts (fail-fast env validation)
│  ├─ middleware/            # auth (JWT), rateLimit, sanitize (mongo-sanitize), validate (Zod), error
│  ├─ models/                # User (embeds entrepreneur profile), Order, Review, Service, Product, Favorite
│  ├─ routes/                # auth, entrepreneurs, services, products, orders, reviews, favorites, admin
│  ├─ utils/                 # ApiError, asyncHandler, serialize (Mongoose doc → API JSON), token
│  └─ seed/seed.ts           # demo data incl. the accounts above
└─ render.yaml               # Render Blueprint (see Deployment)
```

## Routes

### Pages

| Path | Access | Page |
|---|---|---|
| `/` | Public | Landing — hero, popular categories, featured entrepreneurs (live, top-rated), trending products |
| `/browse` | Public | Marketplace — category/search/price/verified/available filters, sort, infinite pagination |
| `/profile/:id` | Public | Entrepreneur profile — services/products/reviews tabs, request/buy, favourite |
| `/login`, `/register` | Public | Auth — register collects craft/location for the entrepreneur role |
| `/dashboard` | Entrepreneur | KPIs, incoming requests (accept/decline/complete), availability toggle, listings |
| `/orders` | Customer | Order history, status timeline, leave a review after completion |
| `/favourites` | Customer | Saved entrepreneurs |

### API (`server`, mounted under `/api`)

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /auth/register`, `POST /auth/login` | — | Create account / sign in → `{ user, token }` |
| `GET /auth/me` | Bearer | Restore session |
| `GET /entrepreneurs` | — | List, filtered/sorted/paginated (`cat`, `q`, `maxPrice`, `sort`, `verified`, `available`, `page`, `limit`) |
| `GET /entrepreneurs/:id` | — | Profile + services + products + reviews |
| `PATCH /entrepreneurs/me` | Entrepreneur | Update own profile / availability |
| `POST/PATCH/DELETE /services`, `/products` | Entrepreneur | Manage listings |
| `POST /orders` | Customer | Place a service request / product order |
| `GET /orders/mine` | Customer | Own order history |
| `GET /orders/incoming` | Entrepreneur | Requests received |
| `PATCH /orders/:id/status` | Entrepreneur | Accept / decline / complete |
| `POST /reviews` | Customer | Earned review — requires a completed order with that entrepreneur |
| `GET /reviews/entrepreneur/:id` | — | Public review list |
| `GET/POST /favorites`, `DELETE /favorites/:id` | Customer | Wishlist |
| `GET /admin/entrepreneurs`, `PATCH /admin/entrepreneurs/:id/verify`, `GET /admin/stats` | Admin | Verification + platform stats |
| `GET /health` | — | Liveness check (used by Render) |

## Testing

```bash
npm test          # frontend — Vitest + Testing Library
cd server && npm run typecheck   # backend has no test suite yet — typecheck is the current safety net
```

Frontend coverage: `lib/api.test.ts` (fetch client / error normalisation), `lib/recentlyViewed.test.ts`,
`pages/Landing.test.tsx` (smoke test — every marketing section renders), `components/ui/StatusBadge.test.tsx`,
`components/ui/Tabs.test.tsx` (ARIA roles + keyboard nav). A Supertest suite against the API routes is the
natural next addition — see [ROADMAP.md](./ROADMAP.md).

## Deployment

See **[DEPLOY-CHECKLIST.md](./DEPLOY-CHECKLIST.md)** for the step-by-step. Short version: frontend → Vercel
(`vercel.json` has the SPA rewrite), backend → Render via `server/render.yaml` (Blueprint), database → MongoDB
Atlas. Required env vars are in `.env.example` (frontend) and `server/.env.example` (backend).

## Where things stand

M1–M5 are shipped: live API + auth, orders + dashboard, discovery (favourites/pagination/filters/recently
viewed), and a design-system pass (dark mode, accessible Tabs, shared primitives). This QA/polish pass added:
a keyboard-accessible skip link + `<main>` landmarks on every screen, ARIA fixes (toast urgency, decorative
star ratings, distinct social-link labels, hamburger `aria-expanded`), route-level code splitting, `.lean()` +
compound indexes on the hot read paths, and fixed a handful of pre-existing gaps this pass turned up (a broken
`typecheck` script, a Landing test missing `ThemeProvider`, an uninstalled test dependency, a TS overload error
in the order-creation route). Remaining work — payments, image uploads, messaging, i18n, CI, observability — is
tracked in [ROADMAP.md](./ROADMAP.md).
