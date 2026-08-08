# HunarHub — Roadmap

_Last refreshed after the M1–M5 milestones, a QA/polish pass (a11y, performance, docs), an admin +
listing-management + backend-tests pass, a CI + repository-portability pass, and a production deployment
verification pass. Supersedes the original pre-M1 audit — most of P0 and P1 below are now done; this file
tracks what's actually left._

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

**CI + repository portability**
- ✅ **`.github/workflows/ci.yml`** — separate `frontend` (typecheck → test → build) and `backend`
  (typecheck → test) jobs, on every PR and every push to `main`. No secrets: the backend's MongoDB is
  `mongodb-memory-server`, cached across runs, pinned to an explicit version.
- ✅ **Removed `"preserveSymlinks": true`** from `server/tsconfig.json` — it was added to fix a local
  Windows directory-junction workaround (this machine's C: drive had ~0 bytes free, so `server/node_modules`
  was relocated to a D: junction). Verified empirically with a fresh `npm ci` into a normal, non-symlinked
  directory: typecheck and all 40 tests pass with no `preserveSymlinks` at all — it was never something
  HunarHub itself needed. (Re-tested the local junction too, now also passing without it — the original
  failure was most likely leftover corruption from that session's disk-full `npm install` retries, not the
  junction/symlink mechanism itself.)
- ✅ `.github/dependabot.yml` — weekly, PR-only updates for both npm ecosystems (`/`, `/server`) and the
  workflow's own `actions/*` versions.

**Production deployment verification**
- ✅ **Confirmed CI actually passed remotely** — queried GitHub's public check-runs API directly (no `gh`
  install needed) rather than assuming green from a local run; both `frontend` and `backend` jobs showed
  `conclusion: success` on the deployed commit.
- ✅ **Full HTTP-level smoke test against the real production URLs** — Vercel frontend, Render API, Atlas
  database, all live. Verified: health check, real (non-empty) listing data, registration, login, session
  restore, invalid-credential rejection, every role-authorization boundary (customer → 403 on admin and
  entrepreneur-only routes, unauthenticated → 401 on protected routes), listing detail view, favourite/
  unfavourite, a full order lifecycle (create → visible to seller → status transition → resolved), a
  temporary listing create/edit/verify/delete cycle, and the admin stats/users/listings endpoints. CORS
  preflight tested from the actual deployed frontend origin. Security headers, error-response shape (no
  stack traces/connection strings/file paths leaked), and Render's documented cold-start behavior all
  confirmed directly, not assumed from the code.
- ✅ **Fixed an active production security issue** — the seeded admin account (`admin@hunarhub.in`) shared
  the same public demo password documented in the README. Confirmed this credential currently grants live
  admin access (a non-destructive login check), then fixed the root cause: `seed.ts` no longer hardcodes an
  admin password (generates one, or reads `ADMIN_SEED_PASSWORD`), and a new `set-admin-password` script lets
  the password be rotated on an already-seeded database — including production — without wiping anything
  else. The actual production rotation is a manual step for whoever holds the Atlas credentials (documented
  in `DEPLOY-CHECKLIST.md`) — this session never had access to the production `MONGODB_URI` and couldn't
  have performed it directly even if that were the right call.
- ✅ Pinned `NODE_VERSION: "22"` and switched `buildCommand` to `npm ci` in `server/render.yaml`, matching
  CI exactly. (Requires a manual Blueprint sync in the Render dashboard for the *already-existing* service —
  `render.yaml` changes don't auto-apply to a service created before the change.)
- ✅ Resolved a documentation-drift bug in this file: a prior `npm audit` summary stated "7 vulnerabilities"
  but its prose breakdown only listed 6 (misclassifying `vite`'s own advisories as part of the "moderate"
  group instead of `vite`'s actual `high` severity, and omitting `vite-node` entirely). Re-ran the audit and
  reconciled it — see the updated breakdown below.

**Credential-exposure incident closure (code side)**
- ✅ Confirmed by direct code inspection, not assumption: HunarHub's JWTs are fully stateless (signature +
  expiry only, no session store, no refresh token) — so rotating the admin password alone does **not**
  invalidate a JWT issued while the old password was exposed. `JWT_SECRET` rotation is required too, since
  it's the only thing that invalidates already-issued tokens. Both steps, plus the exact pre/post
  verification checks, are now a single runbook in `DEPLOY-CHECKLIST.md`.
- ✅ Audited `setAdminPassword.ts` against a full safety checklist (safe targeting, correct hashing, never
  logs the password or the Mongo URI, fails clearly on bad input, can't upsert a stray second admin, can't
  touch other users, disconnects cleanly) — it already passed every point, so it was left alone.
- ✅ Hardened its *invocation*: it now prompts for the password with terminal echo off by default (falls
  back to `NEW_ADMIN_PASSWORD` for non-interactive use), so the password no longer has to appear as literal
  text in a shell command or history file.
- ✅ Closed a gap `setAdminPassword.ts` already had but `seed.ts` didn't: `ADMIN_SEED_PASSWORD` is now
  rejected if it's under 12 characters or a common default (`password123`, `admin123`, …) — checked before
  any database write, so a weak value fails safe with nothing touched. Previously, setting it to a weak
  value would have silently reintroduced the exact vulnerability being fixed.
- ✅ Swept current tree and full git history for other exposed credentials — found none. No real Mongo
  connection string or `JWT_SECRET` value was ever committed at any point; `seed.ts` has exactly two
  revisions (the original, and this fix). Concluded history rewriting is unnecessary: the exposed value was
  a guessable demo string, not a unique leaked secret, and both rotations below fully neutralize it —
  scrubbing history would be security theater, not a real mitigation.
- 📝 **Future hardening note** (not needed to close this incident, since `JWT_SECRET` rotation already
  invalidates every outstanding token globally): ordinary password changes still won't revoke individual
  sessions going forward, because JWTs stay stateless. If that ever matters again, the fix is a per-user
  `tokenVersion`/`securityVersion` field checked on every request, or materially shorter token lifetimes —
  not a Redis blacklist, which is unnecessary complexity for this app's scale.

## 🔴 One manual action still required

**Rotating the password alone does not close this incident.** Production needs BOTH the admin password AND
`JWT_SECRET` rotated — the code fix shipped this pass, but both actual rotations need live Render/Atlas
access, which no automated session has ever had. Full runbook + exact verification commands at the top of
`DEPLOY-CHECKLIST.md`. Until both are done and check B in that runbook passes, treat this as **open**, not
resolved.

## Remaining (highest → lowest priority)

### P2 — trust, quality, developer experience
1. **Account activation/deactivation** — the admin Users panel intentionally does *not* have a
   suspend/ban action: `User` has no `active`/`disabled` field, and adding one properly means also enforcing
   it at login (not just hiding a UI button). Real, scoped follow-up rather than a fake toggle.
2. **No account deletion, anywhere** — found while smoke-testing M8: there is no endpoint for a user to
   delete their own account, nor for an admin to remove another user. Every account created while testing —
   including the disposable smoke-test customer from this pass — is permanent. Worth adding both a
   self-service delete and an admin-driven one; until then, keep test-account creation against production to
   the minimum needed.
3. **Order status-transition rules** — `PATCH /orders/:id/status` currently accepts any enum value from
   `accepted`/`declined`/`completed` regardless of the order's current status (e.g. a `declined` order could
   technically be moved to `completed`). No business rule exists for this today, so nothing enforces or tests
   it; worth a small state machine if this starts mattering.
4. **Shared types / typed client** — `src/types/api.ts` (frontend) and the Mongoose models (backend) are
   hand-kept in sync. Low risk at current size; worth a generator (tRPC-style or OpenAPI) if the schema churns.
5. **Observability** — structured logs (`morgan` only today), error tracking (Sentry), a readiness probe
   beyond `/health`.
6. **`/api/v1` versioning** before any external consumer exists.
7. **npm audit deferrals** — root has exactly 7 advisories (1 critical + 3 high + 3 moderate — verified via
   `npm audit --json`, not eyeballed):
   - **Critical**: `vitest` — arbitrary file read/execute when `vitest --ui` is listening. This project has
     no `--ui` script and no `@vitest/ui` dependency — not reachable in this project's actual usage.
   - **High**: `react-router` + `react-router-dom` (direct prod dependency) — RSC-mode CSRF bypass; this is
     a plain client-rendered SPA, not using React Server Components. Also **high**: `vite` (transitive,
     dev-only) — three rolled-up advisories (optimized-deps path traversal, a Windows-only `launch-editor`
     NTLMv2 hash disclosure, a `server.fs.deny` bypass).
   - **Moderate**: `esbuild`, `@vitest/mocker`, `vite-node` — all transitive, all dev-tooling-only, all part
     of the same old-`vitest`-pulls-old-`vite` chain.
   - All 7 require a `vitest`/`vite` major bump (v2→v4) or `react-router` v8 to clear — server audit is
     clean (0 advisories) and none of these are exploitable in how this project actually runs, so none were
     forced. Fixing them is a deliberate, separate dependency-upgrade task, not a deployment blocker.

### P3 — growth features
8. **Payments** (Razorpay for India) with hold/escrow on service completion.
9. **Image uploads** via Cloudinary/S3 (products, profile, cover) — replaces Picsum.
10. **Notifications** (email via Resend/SES; in-app) and **messaging** between customer and entrepreneur.
11. **SEO/social** — per-page meta/OG tags, sitemap; consider prerendering entrepreneur profile pages.

### P4 — scale & polish
12. **Full-text search** — swap the regex `$or` on Browse for `$text` (index already exists, unused) or
    Atlas Search; add geo-based "near me" discovery, which fits the "local" mission directly.
13. **Redis** caching + a shared rate-limit store (current limiter is in-memory, fine for one instance).
14. **Compiled backend build** — `server` runs via `tsx` in production today; a `tsc` build + `node dist/`
    is the more conventional prod path once uptime/cold-start matters more than iteration speed.
15. **i18n** — Hindi + regional languages; strongly on-brand for the target sellers.
16. **httpOnly-cookie sessions** instead of a `localStorage` JWT, if the app ever handles anything more
    sensitive than a craft marketplace (see README → Known trade-offs).

## Ground rules (unchanged)

Never rewrite working code · never remove features · keep it modular and reusable · strict TypeScript ·
production-ready · explain major decisions · flag any schema change before writing it · stay compatible with
the deployed backend.
