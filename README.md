# HunarHub

[![CI](https://github.com/hiteshkumarTech/HunarHub/actions/workflows/ci.yml/badge.svg)](https://github.com/hiteshkumarTech/HunarHub/actions/workflows/ci.yml)

A digital marketplace that gives local micro-entrepreneurs — cobblers, potters (kumhar), tailors, artisans and
small vendors — digital visibility and direct access to customers. Customers browse, request services, buy
products, and leave earned reviews; entrepreneurs manage requests, listings, and availability from a dashboard.

**Live**: [hunarhub-eight.vercel.app](https://hunarhub-eight.vercel.app) (frontend) ·
[hunarhub-api-s03k.onrender.com](https://hunarhub-api-s03k.onrender.com/health) (API — free-tier cold start,
~30s on the first request after idle). Both verified live and end-to-end functional as of the M8 deployment
pass (see [Deployment](#deployment)) — registration, login, role authorization, orders, and the admin
dashboard were all tested against these exact URLs, not just deployed and assumed to work.

## Stack

**Frontend** — React 19 · Vite 6 · TypeScript (strict) · Tailwind CSS 4 · TanStack Query 5 · React Router 7 ·
Motion (Framer Motion) · lucide-react · Vitest + Testing Library.

**Backend** (`/server`) — Express 4 · MongoDB + Mongoose 8 · JWT auth · Zod validation · Helmet · rate limiting ·
mongo-sanitize · Cloudinary (image uploads, via Multer) · TypeScript, run via `tsx`.

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

Password for both: `password123`. (Deliberately public — try them on the live site, they can't reach
another user's data or any admin functionality. There's no demo *admin* login here on purpose — see
`DEPLOY-CHECKLIST.md` for why and how admin access is provisioned instead.)

| Role | Email | Try |
|---|---|---|
| Customer | `priya@example.com` | Browse → open a profile → request a service → `/orders` to track it and leave a review once it's completed |
| Entrepreneur | `ramesh@hunarhub.in` | `/dashboard` → accept/decline requests → mark complete → toggle availability → manage listings |

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
- **Cloudinary uploads flow through the backend, not signed client-side** — simpler (no signing endpoint, no
  Cloudinary widget on the frontend) and keeps `CLOUDINARY_API_SECRET` server-only. Fine at this traffic scale;
  a signed direct-to-Cloudinary upload would offload bandwidth from Render if that ever became the bottleneck.

## Project structure

```
src/
├─ main.tsx                 # app entry — providers (Theme, Query, Auth, Toast) + BrowserRouter
├─ App.tsx                  # routes; everything but Landing/Browse is code-split
├─ index.css                # Tailwind 4 theme — fonts, color tokens, dark-mode variables, focus-visible
├─ types.ts, types/api.ts   # shared TypeScript types (frontend shapes; mirror the API's serializers)
├─ lib/                     # api.ts (fetch client), queryClient.ts, utils.ts, recentlyViewed.ts
├─ hooks/                   # entrepreneurs, orders, favorites, reviews, listings, admin, marketplace,
│                            # categories, complaints (M10) — one module each
├─ context/                 # AuthContext, ThemeContext
├─ data/mockData.ts         # landing-page fallback data only — CATEGORIES here is a marketing-page constant;
│                            # Register/Browse/Marketplace read the live list from GET /api/categories (M10)
├─ components/
│  ├─ ui/                   # Button, Card, Badge, Avatar, Tabs, StatusBadge, Toast, States, Field, Kpi,
│  │                         # ConfirmAction, ImageUploadField, ThemeToggle
│  ├─ landing/               # HeroSection, FeaturedEntrepreneurs, TrendingProducts, Testimonials, …
│  ├─ admin/                 # AdminOverview, AdminUsersPanel, AdminListingsPanel, AdminOrdersPanel,
│  │                         # AdminComplaintsPanel, AdminCategoriesPanel (last three are M10)
│  ├─ dashboard/             # ListingsManager — entrepreneur's own create/edit/delete UI
│  ├─ auth/AuthShell.tsx     # shared Login/Register shell
│  ├─ MarketplaceListingCard.tsx  # M10 — a single service/product card with its seller attached
│  └─ ComplaintForm.tsx      # M10 — inline "report an issue" form, shared by MyOrders + Dashboard
└─ pages/                   # Landing, Browse, Marketplace (M10), Profile, Dashboard, Login, Register,
                             # Favourites, MyOrders, AdminDashboard

server/
├─ src/
│  ├─ app.ts, index.ts       # Express app wiring, entry point
│  ├─ config/                # db.ts (Mongoose connect), env.ts (fail-fast env validation), cloudinary.ts
│  ├─ middleware/            # auth (JWT), rateLimit, sanitize (mongo-sanitize), validate (Zod), upload (Multer), error
│  ├─ models/                # User (embeds entrepreneur profile), Order, Review, Service, Product, Favorite,
│  │                         # Category, Complaint (last two are M10)
│  ├─ routes/                # auth, entrepreneurs, services, products, orders, reviews, favorites, admin,
│  │                         # listings, categories, complaints (last three are M10)
│  ├─ utils/                 # ApiError, asyncHandler, serialize (Mongoose doc → API JSON), token, imageGallery
│  ├─ test/                  # db.ts (in-memory MongoDB harness), fixtures.ts (seed users + tokens)
│  ├─ seed/seed.ts           # demo data incl. the customer/entrepreneur accounts above (admin gets its
│  │                         # own generated password — never the public demo one, see DEPLOY-CHECKLIST.md);
│  │                         # M10 added categories, mixed-status orders, and a demo complaint
│  └─ scripts/setAdminPassword.ts  # rotate the admin password on an already-seeded DB without wiping it
└─ render.yaml               # Render Blueprint (see Deployment)
```

## Routes

### Pages

| Path | Access | Page |
|---|---|---|
| `/` | Public | Landing — hero, popular categories, featured entrepreneurs (live, top-rated), trending products |
| `/browse` | Public | Browse Talent — discover *sellers*: category/search/price/verified/available filters, sort, infinite pagination |
| `/marketplace` | Public | Marketplace (M10) — discover *listings* directly: services + products merged, filter by category/location/price/search, no need to open a seller's profile first |
| `/profile/:id` | Public | Entrepreneur profile — services/products/reviews tabs, request/buy, favourite |
| `/login`, `/register` | Public | Auth — register collects craft/location for the entrepreneur role; category picker reads live from `GET /api/categories` |
| `/dashboard` | Entrepreneur | KPIs (incl. completed-orders count), incoming requests (accept/decline/complete), availability toggle, report an issue, manage own listings |
| `/orders` | Customer | Order history, status timeline, leave a review after completion, report an issue |
| `/favourites` | Customer | Saved entrepreneurs |
| `/admin` | Admin | Platform metrics, user directory, cross-seller listing moderation, order monitoring, complaint management, category management (M10 added the last three tabs) |

### API (`server`, mounted under `/api`)

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /auth/register`, `POST /auth/login` | — | Create account / sign in → `{ user, token }` |
| `GET /auth/me` | Bearer | Restore session |
| `GET /entrepreneurs` | — | List, filtered/sorted/paginated (`cat`, `q`, `city`, `state`, `maxPrice`, `sort`, `verified`, `available`, `page`, `limit`) |
| `GET /entrepreneurs/:id` | — | Profile + services + products + reviews |
| `PATCH /entrepreneurs/me` | Entrepreneur | Update own profile / availability |
| `POST/PATCH/DELETE /services`, `/products` | Entrepreneur | Manage listings — JSON or `multipart/form-data` with image file(s); products get a 4-image gallery (first = cover), services get 1 photo |
| `GET /listings` *(M10)* | — | Marketplace discovery — services + products merged across every seller (`kind`, `cat`, `city`, `state`, `minPrice`/`maxPrice`, `q`, `page`, `limit`) |
| `GET /categories` *(M10)* | — | The 5 craft categories' current label/active state |
| `POST /orders` | Customer | Place a service request / product order |
| `GET /orders/mine` | Customer | Own order history |
| `GET /orders/incoming` | Entrepreneur | Requests received |
| `PATCH /orders/:id/status` | Entrepreneur | Accept / decline / complete |
| `POST /reviews` | Customer | Earned review — requires a completed order with that entrepreneur |
| `GET /reviews/entrepreneur/:id` | — | Public review list |
| `GET/POST /favorites`, `DELETE /favorites/:id` | Customer | Wishlist |
| `POST /complaints` *(M10)* | Bearer | Report an issue, optionally tied to one of the caller's own orders (403 if not a party to it) |
| `GET /complaints/mine` *(M10)* | Bearer | The caller's own reported complaints |
| `GET /admin/entrepreneurs`, `PATCH /admin/entrepreneurs/:id/verify` | Admin | Entrepreneur list + verification |
| `GET /admin/users` | Admin | Every account, any role (`role`, `q`, `page` filters) |
| `GET /admin/listings` | Admin | Services + products across every seller (`kind`, `q`, `page` filters) |
| `DELETE /admin/services/:id`, `DELETE /admin/products/:id` | Admin | Moderation removal — no ownership check |
| `GET /admin/orders` *(M10)* | Admin | Read-only order/request monitoring (`status`, `kind`, `q`, `page` filters); no status-override endpoint by design |
| `GET/PATCH /admin/categories/:id` *(M10)* | Admin | Rename a category's label / toggle it active-inactive (fixed 5, no add) |
| `GET /admin/complaints`, `PATCH /admin/complaints/:id` *(M10)* | Admin | List/filter by status, resolve/annotate any complaint |
| `GET /admin/stats` | Admin | Platform counts — users, listings, orders, open complaints (all real queries, no fabricated numbers) |
| `GET /health` | — | Liveness check (used by Render) |

## Testing

```bash
npm test               # frontend — Vitest + Testing Library
cd server && npm test  # backend — Vitest + Supertest + mongodb-memory-server (in-memory, never a real DB)
```

Frontend coverage (30 tests): `lib/api.test.ts` (fetch client / error normalisation, FormData vs JSON bodies),
`lib/recentlyViewed.test.ts`, `pages/Landing.test.tsx` (smoke test — every marketing section renders),
`components/ui/StatusBadge.test.tsx`, `components/ui/Tabs.test.tsx` (ARIA roles + keyboard nav),
`components/ui/ImageUploadField.test.tsx` (renders, preview on select, existing-image alt text, validation error,
max-count enforcement). **M10 additions (11 tests)**: `hooks/marketplace.test.tsx` (correct `GET /api/listings`
query params per filter, `all` omitted rather than sent literally, pagination via `fetchNextPage`),
`components/ComplaintForm.test.tsx` (submit disabled until both fields are filled, correct payload incl.
`orderId`, error surfaces without closing the form), `components/admin/AdminComplaintsPanel.test.tsx` (renders
from the admin endpoint, status-select triggers the update mutation, status-tab click refetches filtered,
empty state), `pages/Dashboard.test.tsx` (earnings sum + completed-order count both correct against a
mixed-status order set — declined/accepted/pending amounts verified excluded, not just "a number renders").

Backend coverage (82 tests, `server/src/routes/*.test.ts`) prioritises the highest-risk behavior over line
coverage: auth (register/login/session, can't self-register as admin), role authorization (customer/entrepreneur
rejected from admin routes), listing ownership (an entrepreneur can edit/delete their own service or product but
gets a 403 touching another seller's — verified against the DB state, not just the response code), the order
lifecycle and cross-seller isolation, the earned-review rule, the admin routes (stats reflect real counts, not
fabricated numbers; moderation delete; role/search filters), and image uploads (ownership on upload/replace/
remove, MIME/size validation, the 4-image gallery cap, Cloudinary cleanup on delete — Cloudinary is fully mocked,
never called for real). **M10 additions (12 tests)**: `marketplace.test.ts` (listings filter correctly by
category/location/price/kind/name search, a zero-match seller filter returns an empty result not an error,
entrepreneurs city filter, availability-toggle authorization), `complaints.test.ts` (create/ownership-check
against the referenced order/authentication/scoping to `/mine`/admin list+filter+update/non-admin blocked),
`admin.test.ts` additions (order monitoring incl. status filter, category rename+toggle reflected on the public
endpoint, non-admin blocked from both). Each suite boots its own in-memory MongoDB instance via
`mongodb-memory-server` — nothing here ever touches a real database, local or production.

**CI** (`.github/workflows/ci.yml`) runs both suites — plus typecheck and the production build — on every pull
request and every push to `main`. No secrets required: the frontend build needs none, and the backend's
`env.ts` falls back to safe non-production defaults outside `NODE_ENV=production`.

## Deployment

See **[DEPLOY-CHECKLIST.md](./DEPLOY-CHECKLIST.md)** for the step-by-step. Short version: frontend → Vercel
(`vercel.json` has the SPA rewrite), backend → Render via `server/render.yaml` (Blueprint), database → MongoDB
Atlas. Required env vars are in `.env.example` (frontend) and `server/.env.example` (backend).

## Where things stand

M1–M5 shipped live API + auth, orders + dashboard, discovery, and a design-system pass. A QA/polish pass then
added accessibility, performance, and documentation. After that: an **admin dashboard**, a **seller listing
manager**, a **backend test suite** (40 tests), and **CI** (every PR/push runs both suites, typecheck, and
the build; the repo builds reproducibly on a clean machine).

Most recently, a full **production deployment verification pass**: confirmed CI actually passed remotely (not
assumed), then smoke-tested the live Vercel + Render + Atlas stack directly over HTTP — registration, login,
session restore, every role-authorization boundary (customer blocked from admin/entrepreneur routes,
unauthenticated blocked from protected ones), the full order lifecycle, favourites, a temporary listing
create/edit/delete cycle, and the admin stats/users/listings endpoints — all against the real deployed URLs,
all cleaned up afterward where the API allows it. That pass also found and fixed a real issue: the seeded
admin account had been sharing the same public demo password documented in this README, which would have
handed anyone reading the repo live admin access to any deployment run from the old seed script. Admin
provisioning is now separate from the public demo accounts. That fix is in the code — closing it in the
*live* deployment also requires rotating the production `JWT_SECRET` (HunarHub's JWTs are stateless, so a
password change alone doesn't invalidate a token issued before rotation); full runbook in
`DEPLOY-CHECKLIST.md`.

After that, **real image uploads + a product gallery** (M9): sellers upload actual photos (Cloudinary, via
the backend — never a raw URL paste) for their services (1 photo) and products (up to 4, first = cover),
with a preview/remove/replace UI in the existing listing manager, ownership enforced server-side the same way
every other listing mutation already was, and old seeded/placeholder listings still rendering unchanged
(nothing required a destructive migration). Customers see the real photos on Browse → profile → Products/
Services, with a lightbox gallery for multi-image products; admin sees a thumbnail per listing row.

Most recently, an **internship-requirement gap sweep** (M10): a full requirement-by-requirement audit against
the original brief, followed by targeted fixes for the real gaps it found — a genuine **product/service
marketplace** (`/marketplace`, distinct from `/browse`'s seller discovery), **real location filtering**
(exact city/state match, not just fuzzy search), an **admin order-monitoring** view, **admin category
management** (rename/deactivate the 5 fixed categories), and a **complaints/disputes** flow (customer/
entrepreneur report → admin resolve). Entrepreneur availability and the earnings overview were both found
already fully implemented and just needed a small completeness pass (a KPI + tests) rather than new work. Every
original functional requirement is now explicitly classified DONE / INTENTIONALLY SIMPLIFIED / OUT OF SCOPE in
[ROADMAP.md](./ROADMAP.md#requirement-traceability-matrix-m10)'s traceability matrix — nothing was left as an
unexplained gap. 82 backend / 30 frontend tests, zero regressions.

Remaining work — payments, messaging, observability, i18n — is tracked in [ROADMAP.md](./ROADMAP.md).
