# HunarHub

[![CI](https://github.com/hiteshkumarTech/HunarHub/actions/workflows/ci.yml/badge.svg)](https://github.com/hiteshkumarTech/HunarHub/actions/workflows/ci.yml)

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
| Entrepreneur | `ramesh@hunarhub.in` | `/dashboard` → accept/decline requests → mark complete → toggle availability → manage listings |
| Admin | `admin@hunarhub.in` | `/admin` → platform metrics, user directory, cross-seller listing moderation |

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
├─ App.tsx                  # routes; everything but Landing/Browse is code-split
├─ index.css                # Tailwind 4 theme — fonts, color tokens, dark-mode variables, focus-visible
├─ types.ts, types/api.ts   # shared TypeScript types (frontend shapes; mirror the API's serializers)
├─ lib/                     # api.ts (fetch client), queryClient.ts, utils.ts, recentlyViewed.ts
├─ hooks/                   # entrepreneurs, orders, favorites, reviews, listings, admin — one module each
├─ context/                 # AuthContext, ThemeContext
├─ data/mockData.ts         # seed/fallback data (landing page graceful-degrades to this if the API is cold)
├─ components/
│  ├─ ui/                   # Button, Card, Badge, Avatar, Tabs, StatusBadge, Toast, States, Field, Kpi,
│  │                         # ConfirmAction, ThemeToggle
│  ├─ landing/               # HeroSection, FeaturedEntrepreneurs, TrendingProducts, Testimonials, …
│  ├─ admin/                 # AdminOverview, AdminUsersPanel, AdminListingsPanel (used by /admin)
│  ├─ dashboard/             # ListingsManager — entrepreneur's own create/edit/delete UI
│  └─ auth/AuthShell.tsx     # shared Login/Register shell
└─ pages/                   # Landing, Browse, Profile, Dashboard, Login, Register, Favourites, MyOrders,
                             # AdminDashboard

server/
├─ src/
│  ├─ app.ts, index.ts       # Express app wiring, entry point
│  ├─ config/                # db.ts (Mongoose connect), env.ts (fail-fast env validation)
│  ├─ middleware/            # auth (JWT), rateLimit, sanitize (mongo-sanitize), validate (Zod), error
│  ├─ models/                # User (embeds entrepreneur profile), Order, Review, Service, Product, Favorite
│  ├─ routes/                # auth, entrepreneurs, services, products, orders, reviews, favorites, admin
│  ├─ utils/                 # ApiError, asyncHandler, serialize (Mongoose doc → API JSON), token
│  ├─ test/                  # db.ts (in-memory MongoDB harness), fixtures.ts (seed users + tokens)
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
| `/dashboard` | Entrepreneur | KPIs, incoming requests (accept/decline/complete), availability toggle, manage own listings |
| `/orders` | Customer | Order history, status timeline, leave a review after completion |
| `/favourites` | Customer | Saved entrepreneurs |
| `/admin` | Admin | Platform metrics, user directory (search/filter, verify entrepreneurs), cross-seller listing moderation |

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
| `GET /admin/entrepreneurs`, `PATCH /admin/entrepreneurs/:id/verify` | Admin | Entrepreneur list + verification |
| `GET /admin/users` | Admin | Every account, any role (`role`, `q`, `page` filters) |
| `GET /admin/listings` | Admin | Services + products across every seller (`kind`, `q`, `page` filters) |
| `DELETE /admin/services/:id`, `DELETE /admin/products/:id` | Admin | Moderation removal — no ownership check |
| `GET /admin/stats` | Admin | Platform counts — users, listings, orders (all real queries, no fabricated numbers) |
| `GET /health` | — | Liveness check (used by Render) |

## Testing

```bash
npm test               # frontend — Vitest + Testing Library
cd server && npm test  # backend — Vitest + Supertest + mongodb-memory-server (in-memory, never a real DB)
```

Frontend coverage: `lib/api.test.ts` (fetch client / error normalisation), `lib/recentlyViewed.test.ts`,
`pages/Landing.test.tsx` (smoke test — every marketing section renders), `components/ui/StatusBadge.test.tsx`,
`components/ui/Tabs.test.tsx` (ARIA roles + keyboard nav).

Backend coverage (40 tests, `server/src/routes/*.test.ts`) prioritises the highest-risk behavior over line
coverage: auth (register/login/session, can't self-register as admin), role authorization (customer/entrepreneur
rejected from admin routes), listing ownership (an entrepreneur can edit/delete their own service or product but
gets a 403 touching another seller's — verified against the DB state, not just the response code), the order
lifecycle and cross-seller isolation, the earned-review rule, and the new admin routes (stats reflect real counts,
not fabricated numbers; moderation delete; role/search filters). Each suite boots its own in-memory MongoDB
instance via `mongodb-memory-server` — nothing here ever touches a real database, local or production.

**CI** (`.github/workflows/ci.yml`) runs both suites — plus typecheck and the production build — on every pull
request and every push to `main`. No secrets required: the frontend build needs none, and the backend's
`env.ts` falls back to safe non-production defaults outside `NODE_ENV=production`.

## Deployment

See **[DEPLOY-CHECKLIST.md](./DEPLOY-CHECKLIST.md)** for the step-by-step. Short version: frontend → Vercel
(`vercel.json` has the SPA rewrite), backend → Render via `server/render.yaml` (Blueprint), database → MongoDB
Atlas. Required env vars are in `.env.example` (frontend) and `server/.env.example` (backend).

## Where things stand

M1–M5 shipped live API + auth, orders + dashboard, discovery, and a design-system pass. A QA/polish pass then
added accessibility (skip links, landmarks, ARIA fixes), performance (code splitting, `.lean()` + compound
indexes), and this documentation. Most recently: an **admin dashboard** (`/admin` — platform metrics, user
directory, cross-seller listing moderation, all backed by real new endpoints, not a frontend-only view), a
**seller listing manager** (entrepreneurs create/edit/delete their own services and products from `/dashboard`
without touching a database console), a **backend test suite** (40 tests covering auth, role authorization,
listing ownership, and the order lifecycle), and **CI** — every PR and push to `main` now runs both suites,
typecheck, and the production build automatically, with the repository hardened to build reproducibly on a
clean machine (no dependency on any particular local disk layout). Remaining work — payments, image uploads,
messaging, observability, i18n — is tracked in [ROADMAP.md](./ROADMAP.md).
