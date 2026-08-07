# HunarHub — Roadmap

_Last refreshed after the M1–M5 milestones, a QA/polish pass (a11y, performance, docs), and an admin +
listing-management + backend-tests pass. Supersedes the original pre-M1 audit — most of P0 and P1 below are
now done; this file tracks what's actually left._

## Done

**P0 — real product + security basics**
- ✅ Frontend data + auth layer (typed API client, TanStack Query, `AuthContext`, protected routes)
- ✅ Login / Register (customer + entrepreneur onboarding)
- ✅ Browse / Profile / Dashboard wired to the live API (mock data now only a landing-page fallback)
- ✅ Backend hardening — `helmet`, rate limiting, `express-mongo-sanitize`, fail-fast env validation in prod
- ✅ Earned reviews — `POST /reviews` requires a completed order

**P1 — core product completeness**
- ✅ Order placement end-to-end (request → accept/decline/complete → customer history + status timeline)
- ✅ Server-side pagination + filtering on Browse (category/search/price/verified/available, indexed)
- ✅ UX states — loading/empty/error, skeletons, toasts, throughout
- ✅ **Listing management UI** — entrepreneurs create/edit/delete their own services & products from
  `Dashboard → Your listings` (inline forms, no modal system introduced — matches the existing disclosure
  pattern from MyOrders' review form)
- ✅ **Admin panel UI** — `/admin`, admin-role-guarded: Overview (real platform metrics — total/active
  listings, users by role, orders by status), Users (search/filter by role, verify entrepreneurs), Listings
  (search/filter, cross-seller moderation delete). Backend gained three new endpoints to support it
  (`GET /admin/users`, `GET /admin/listings`, `DELETE /admin/services|products/:id`) plus a richer `/admin/stats`
- ⬜ Image uploads (still Picsum placeholders)

**Design system / QA**
- ✅ Dark mode (CSS variable tokens + `.dark` class), shared primitives (Button/Card/Badge/Avatar/Tabs/Toast/Kpi/
  ConfirmAction)
- ✅ Accessibility — skip links + `<main>` landmarks on every screen, ARIA roles on Tabs, toast urgency
  (`role="alert"` vs `"status"`), decorative icons hidden from screen readers, labelled form controls,
  `:focus-visible` ring, AA-contrast muted text
- ✅ Performance — route-level code splitting (`React.lazy`), `.lean()` on read-only Mongoose queries,
  compound indexes on the hot paths (`Order` by customer/entrepreneur + createdAt, `User` by role + rating)
- ✅ Fixed pre-existing breakage found along the way: `typecheck` script (`tsc -b --noEmit` is fundamentally
  incompatible with project references — switched to `tsc -b`), `tsconfig.node.json` missing `composite`,
  `Landing.test.tsx` missing `ThemeProvider`, `@testing-library/user-event` declared but never installed, a
  TS overload error on a `Service | Product` model union in `orders.ts`

**P2 — backend tests**
- ✅ **Backend test suite** — Vitest + Supertest + `mongodb-memory-server` (40 tests, `server/src/routes/*.test.ts`):
  auth (register/login/session, can't self-register as admin), role authorization (customer/entrepreneur
  rejected from admin routes), listing ownership (cross-seller edit/delete correctly rejected — verified
  against DB state, not just status codes), the order lifecycle + cross-seller isolation, earned reviews, and
  the new admin routes. Every suite runs against an isolated in-memory MongoDB — never a real database.

## Remaining (highest → lowest priority)

### P2 — trust, quality, developer experience
1. **Account activation/deactivation** — the admin Users panel intentionally does *not* have a
   suspend/ban action: `User` has no `active`/`disabled` field, and adding one properly means also enforcing
   it at login (not just hiding a UI button). Real, scoped follow-up rather than a fake toggle.
2. **Order status-transition rules** — `PATCH /orders/:id/status` currently accepts any enum value from
   `accepted`/`declined`/`completed` regardless of the order's current status (e.g. a `declined` order could
   technically be moved to `completed`). No business rule exists for this today, so nothing enforces or tests
   it; worth a small state machine if this starts mattering.
3. **Shared types / typed client** — `src/types/api.ts` (frontend) and the Mongoose models (backend) are
   hand-kept in sync. Low risk at current size; worth a generator (tRPC-style or OpenAPI) if the schema churns.
4. **CI** — no GitHub Actions yet. Typecheck + test on every PR would have caught the `typecheck` script bug
   and the missing test dependency automatically.
5. **Observability** — structured logs (`morgan` only today), error tracking (Sentry), a readiness probe
   beyond `/health`.
6. **`/api/v1` versioning** before any external consumer exists.

### P3 — growth features
7. **Payments** (Razorpay for India) with hold/escrow on service completion.
8. **Image uploads** via Cloudinary/S3 (products, profile, cover) — replaces Picsum.
9. **Notifications** (email via Resend/SES; in-app) and **messaging** between customer and entrepreneur.
10. **SEO/social** — per-page meta/OG tags, sitemap; consider prerendering entrepreneur profile pages.

### P4 — scale & polish
11. **Full-text search** — swap the regex `$or` on Browse for `$text` (index already exists, unused) or
    Atlas Search; add geo-based "near me" discovery, which fits the "local" mission directly.
12. **Redis** caching + a shared rate-limit store (current limiter is in-memory, fine for one instance).
13. **Compiled backend build** — `server` runs via `tsx` in production today; a `tsc` build + `node dist/`
    is the more conventional prod path once uptime/cold-start matters more than iteration speed.
14. **i18n** — Hindi + regional languages; strongly on-brand for the target sellers.
15. **httpOnly-cookie sessions** instead of a `localStorage` JWT, if the app ever handles anything more
    sensitive than a craft marketplace (see README → Known trade-offs).

## Ground rules (unchanged)

Never rewrite working code · never remove features · keep it modular and reusable · strict TypeScript ·
production-ready · explain major decisions · flag any schema change before writing it · stay compatible with
the deployed backend.
