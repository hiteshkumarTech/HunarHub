# HunarHub — Roadmap

_Last refreshed after the M1–M5 milestones, a QA/polish pass (a11y, performance, docs), an admin +
listing-management + backend-tests pass, a CI + repository-portability pass, a production deployment
verification pass, a real image-uploads + product-gallery pass (M9), and an internship-requirement gap sweep
(M10 — marketplace discovery, location filtering, admin order/category/complaint management). Supersedes the
original pre-M1 audit — most of P0 and P1 below are now done; this file tracks what's actually left._

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
- ✅ **Real image uploads + product gallery** (M9) — see the dedicated section below.

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

**M9 — real image uploads + product gallery**
- ✅ **Cloudinary, through the backend** — `POST/PATCH /api/services`, `/api/products` now accept
  `multipart/form-data` (as well as the original JSON, on the same routes — Multer only engages for
  multipart requests, so every existing text-only call keeps working unchanged). 5MB/image, JPEG/PNG/WebP/
  AVIF only, uploaded to `hunarhub/products` or `hunarhub/services`. `CLOUDINARY_API_SECRET` never reaches
  the frontend — no signed-upload flow was needed since the browser never talks to Cloudinary directly.
- ✅ **Schema**: both `Service` and `Product` gained `images: [{url, publicId}]` (products capped at 4, first
  = cover; services capped at 1). The old `Product.image` string field was kept, not removed — `productJson`
  synthesizes a one-item gallery from it when `images` is empty, so every pre-existing seeded/placeholder
  listing keeps rendering with zero migration. The moment a seller actually edits that listing's photos, the
  legacy field is cleared so it can't resurface a since-removed image.
- ✅ **Gallery editing model** — chose the smallest mechanism that's still genuinely a gallery: PATCH accepts
  new files (appended) and an optional `keepImages` (JSON array of publicIds to retain — omitted means
  "don't touch images at all," so a plain price edit never risks the gallery). Replace = remove + add in one
  request; the cap is checked before any upload runs, so a rejected request never wastes an upload.
- ✅ **Ownership + authorization** — image mutations sit behind the exact same `authRequired` +
  `requireRole('entrepreneur')` + owner-id check every other listing mutation already used; nothing new to
  bypass. Verified by test, not just code inspection (see below).
- ✅ **Cleanup** — deleting a listing, replacing an image, or pruning one via `keepImages` deletes the
  matching Cloudinary asset after the DB write succeeds, never before, and never as a reason to fail the
  request if Cloudinary cleanup itself hiccups (best-effort, logged, swallowed).
- ✅ **Seller UI** — `ImageUploadField` (new, shared component): file picker behind an accessible `<label>`,
  live preview via object URLs (cleaned up on unmount), per-image remove, a "Cover"/"New" badge, max-count
  enforcement, and a client-side type/size check ahead of the server one (real defense-in-depth — verified in
  a test that a mismatched file reaches the component's own validation branch even when the browser's
  `accept` filter would normally have blocked the picker from offering it at all). Reused by both the
  service (max 1) and product (max 4) forms in the existing `ListingsManager` — no new form/modal system.
- ✅ **Customer-facing** — Profile's Products tab shows the real cover image (Picsum fallback only if a
  listing truly has none) with a photo-count badge; the lightbox is now a real multi-image gallery
  (thumbnail strip, click to switch, correct `aria-current`); Services tab shows a small thumbnail per row.
  Alt text throughout is `"{name} by {maker}"` / `"{name} photo N"` — never `alt="image"`.
- ✅ **Admin** — a single thumbnail per listing row in the moderation table (not a gallery — a moderator
  doesn't need one to identify a row).
- ✅ **Tests** — 15 new backend tests (customer/cross-seller authorization on uploads, gallery append/prune/
  cap, MIME + size rejection, Cloudinary cleanup on delete, legacy-field fallback serialization — Cloudinary
  itself fully mocked, never a real network call) + 7 new frontend tests (`ImageUploadField` render/preview/
  validation/max-count, `api.ts` FormData handling). 55 backend / 19 frontend total, zero regressions.
- 📝 **Known gap, not fixed this pass**: a seller can't remove a *legacy* placeholder image without also
  uploading a replacement (removing it via `keepImages` is a no-op against a real `images` array that's
  already empty for a legacy-only listing — the fallback is display-only, not a real array entry to prune).
  Low-impact: only affects listings that predate this milestone and haven't had their photos touched since.

**M10 — internship requirement gap sweep**

_Context: after M9, a full requirement-by-requirement audit against the original internship brief found the
implementation solid on almost every functional point, with a handful of real, meaningful gaps — most notably
that "Profile → Products tab" was a weak substitute for a real product/service marketplace, since a customer
had to find a seller before discovering anything they sell. M10 closes exactly those gaps and nothing else —
explicitly not a platform rebuild. See the traceability matrix below for the complete requirement-by-requirement
classification._

- ✅ **Real marketplace discovery surface** — new `GET /api/listings` (`server/src/routes/listings.ts`) merges
  services + products across every seller into one filterable, paginated feed (`kind`, `cat`, `city`, `state`,
  `minPrice`/`maxPrice`, `q`), resolving seller-level filters (category/location, which live on `User.profile`,
  not on the listing itself) to an entrepreneur-id set first. New `/marketplace` page (`src/pages/Marketplace.tsx`)
  + `MarketplaceListingCard` — a customer can now find and evaluate a specific product or service directly,
  without opening a seller's profile first. `/browse` (seller discovery, "Browse Talent") is unchanged and kept
  as a distinct, separate surface — Header's "Products" nav item and a new PageBar link now point at
  `/marketplace` instead.
- ✅ **Genuine location filtering** — `city`/`state` were already collected at entrepreneur registration
  (`Register.tsx`) and stored on `User.profile`, but `GET /api/entrepreneurs` only offered fuzzy multi-field
  `q` search. Added real `city`/`state` query params (case-insensitive exact match, `entrepreneurs.ts`), kept
  separate from `q`. `GET /api/listings` supports the same two params. No GPS/Maps/geocoding — exact string
  match against the city/state the entrepreneur typed at registration, per the internship brief's explicit
  "no geocoding" scope.
- ✅ **Entrepreneur availability** — inspected first, found already fully wired end-to-end (Dashboard's
  availability toggle → `PATCH /api/entrepreneurs/me` → `profile.available`, already authorization-tested).
  M10 added one authorization regression test (`marketplace.test.ts`: a customer gets 403 on the same route)
  and confirmed the marketplace/browse filters correctly reflect it — no new UI needed, matching the brief's
  explicit "if already implemented, wire it in" guidance.
- ✅ **Earnings overview** — inspected first, found the Dashboard already sums `completed` orders only (never
  `declined`/`pending`/`accepted`) into an "Earnings" KPI. Added one more KPI next to it — "Completed orders"
  (a count, not a new computation) — plus a `Dashboard.test.tsx` test asserting the sum and count are both
  correct against a mixed-status order set (verifies declined/accepted/pending amounts are excluded, not just
  that *some* number renders).
- ✅ **Admin order/request monitoring** — new `GET /admin/orders` (`status`/`kind`/`q`/`page` filters, both
  parties' names attached) + `AdminOrdersPanel` — a new read-only "Orders" tab in `/admin`. Deliberately no
  status-mutation endpoint here: an order's status transitions are the owning entrepreneur's business-rule-governed
  action (`PATCH /api/orders/:id/status`), not something today's business rules give an admin authority to
  override — adding that would be a new capability the brief didn't ask for, not a gap-fill.
- ✅ **Admin category/skill management** *(intentionally simplified — see below)* — new `Category` model +
  `GET /api/categories` (public) + `GET/PATCH /admin/categories/:id` (admin-only: rename label, toggle
  active/inactive) + a new "Categories" admin tab. `Register.tsx` and `Browse.tsx` now read the category list
  from this endpoint instead of a compiled-in constant, so a rename/deactivate takes effect without a redeploy.
- ✅ **Complaints/disputes** — new `Complaint` model (reporter, optional order ref, subject, message, status
  `open`/`in_review`/`resolved`, admin note) + `POST /api/complaints` (any authenticated user, ownership-checked
  against the referenced order if one is given) + `GET /api/complaints/mine` + admin
  `GET/PATCH /admin/complaints/:id` (status + private note) + a new "Complaints" admin tab. Customer-facing
  "Report an issue" inline form (`ComplaintForm.tsx`, same disclosure pattern as `MyOrders`' review form) is
  wired into both `MyOrders` (customer) and `Dashboard` (entrepreneur), so either party to an order can report
  it. No live chat, ticket threading, SLAs, or attachments — exactly the simple model the brief specified.
- ✅ **Admin analytics** — one new, real, cheap metric: `openComplaints` (`Complaint.countDocuments({status:
  {$ne: 'resolved'}})`) added to `GET /admin/stats` and shown on `AdminOverview`. No fabricated numbers, no
  metric added that isn't backed by a real query.
- ✅ **Backend authorization, verified by test, not just code inspection** — every new mutation sits behind
  the same `authRequired`/`requireRole('admin')` pattern already used elsewhere. New tests confirm: a customer
  can't touch admin category/order/complaint routes (403), a complaint's `orderId` is rejected if the reporter
  isn't actually a party to that order (403), an unauthenticated complaint post is rejected (401), and
  `GET /complaints/mine` only ever returns the caller's own complaints.
- ✅ **Real production bug found and fixed along the way** — while verifying `seed.ts` runs cleanly against a
  fresh database (a defensive check taken because M10 explicitly depends on seed data being demonstrable),
  found that `Product`/`Service`'s embedded image schema had `publicId: { required: true }`, but the app's own
  documented convention is that legacy/placeholder images legitimately have `publicId: null`. This predates
  M10 (an M9 schema bug never caught because the route-test suite never constructs a null-`publicId` image, and
  M9's own verification never ran the standalone seed script against a fresh DB). Fixed the schema
  (`default: null`, not `required: true`) and widened `UploadedImage.publicId` to `string | null | undefined`
  to match, with one behavior-preserving null-guard fix in `imageGallery.ts`. Verified via a throwaway
  `mongodb-memory-server` smoketest (not committed) that `npm run seed` now completes cleanly with correct
  earnings math on the seeded orders.
- ✅ **Seed data** — 5 categories, 5 orders (2 completed + 1 accepted + 1 pending + 1 declined, giving the
  earnings/admin-monitoring demo real mixed-status data to show), 1 demo complaint referencing a real
  completed order. Reset-and-reseed only (`deleteMany` on its own collections) — never touches unrelated
  collections, safe to re-run.
- ✅ **Tests** — 12 new backend tests (`marketplace.test.ts`: listings filter by category/location/price/kind/
  name search, empty-result-not-error, entrepreneurs city filter, availability-toggle authorization;
  `complaints.test.ts`: create/ownership/authorization/scoping/admin management; `admin.test.ts`: orders
  monitoring + category management authorization) — **82 backend tests total** (up from 57), zero regressions.
  11 new frontend tests (`marketplace.test.tsx`: query-param building + pagination; `ComplaintForm.test.tsx`:
  validation/submission/error handling; `AdminComplaintsPanel.test.tsx`: render/status-change/filter/empty-state;
  `Dashboard.test.tsx`: earnings correctness against a mixed-status order set) — **30 frontend tests total**
  (up from 19), zero regressions.

**Intentionally simplified in M10** (explicit, not a silent gap):
- **Category management stays a fixed 5-category enum**, admin-editable only for `label`/`active` — no
  "add a new category" control. The valid category *id* set is shared, compile-time-known state across the
  Mongoose schema (`User.ts`, `Category.ts`), two separate Zod validation schemas (`auth.ts`,
  `entrepreneurs.ts`), the frontend's `CategoryId` union type, and the icon map (`craftIcons.tsx`) — real,
  coupled changes across both apps. A UI "Add category" button that produced an id nothing else would accept
  would be a fake button, not a feature. Renaming/deactivating one of the 5 (Cobbler, Potter/Kumhar, Tailor,
  Artisan, Small Vendor — all preserved) is real and fully wired end-to-end.
- **No order-status override from the admin panel** — monitoring is read-only by design; see the "Admin
  order/request monitoring" entry above.
- **Location filtering is exact-match on entrepreneur-entered text**, not geocoded/radius-based — matches the
  brief's own "no GPS/Maps/geocoding" scope note.

## Requirement traceability matrix (M10)

_Every functional requirement from the internship brief, explicitly classified. "DONE" = fully implemented and
tested; "INTENTIONALLY SIMPLIFIED" = implemented with a documented, deliberate scope reduction (see above);
"OUT OF SCOPE" = explicitly excluded by the brief itself._

| Requirement | Status | Implementation |
|---|---|---|
| Customer registration/login | DONE | `POST /api/auth/register`, `/login` (pre-existing, M1) |
| Browse by category | DONE | `Browse.tsx` (sellers) + `Marketplace.tsx` (listings, M10) — category chips from `GET /api/categories` |
| Search/filter by skill, location, price | DONE | `GET /api/entrepreneurs` (`q`, `city`, `state`, `maxPrice`) + `GET /api/listings` (M10: `cat`, `city`, `state`, `minPrice`/`maxPrice`, `q`) |
| Entrepreneur profiles | DONE | `GET /api/entrepreneurs/:id`, `Profile.tsx` (pre-existing) |
| Product gallery | DONE | Cloudinary uploads, up to 4 images (M9) |
| Pricing | DONE | `price`/`startingPrice` throughout (pre-existing) |
| Service requests | DONE | `POST /api/orders` with `kind: 'service'` (pre-existing) |
| Product purchases | DONE | `POST /api/orders` with `kind: 'product'` (pre-existing) |
| Order history | DONE | `GET /api/orders/mine`, `MyOrders.tsx` (pre-existing) |
| Ratings | DONE | `POST /api/reviews`, earned-review rule (pre-existing) |
| Entrepreneur dashboard | DONE | `Dashboard.tsx` (pre-existing) |
| Entrepreneur registration/profile | DONE | `Register.tsx` incl. craft/city/state (pre-existing) |
| Listings management | DONE | `ListingsManager.tsx`, `POST/PATCH/DELETE /api/services`, `/products` (pre-existing) |
| Accept/reject requests | DONE | `PATCH /api/orders/:id/status`, Dashboard's incoming-requests panel (pre-existing) |
| Manage availability | DONE | `PATCH /api/entrepreneurs/me`, Dashboard toggle (pre-existing; M10 added an authorization test) |
| View orders (entrepreneur) | DONE | `GET /api/orders/incoming`, Dashboard (pre-existing) |
| Earnings overview | DONE | Dashboard "Earnings (completed)" + "Completed orders" KPIs (pre-existing sum; M10 added the count KPI + a correctness test) |
| Admin: verify entrepreneurs | DONE | `PATCH /api/admin/entrepreneurs/:id/verify` (pre-existing) |
| Admin: manage categories/skills | INTENTIONALLY SIMPLIFIED | `Category` model, `GET/PATCH /api/admin/categories/:id` — label + active/inactive on the fixed 5, no dynamic add (M10; trade-off explained above) |
| Admin: monitor orders | DONE | `GET /api/admin/orders`, `AdminOrdersPanel` — read-only (M10) |
| Admin: handle disputes/complaints | DONE | `Complaint` model, `POST /api/complaints`, `GET/PATCH /api/admin/complaints/:id`, `AdminComplaintsPanel` (M10) |
| Admin: analytics/reports | DONE | `AdminOverview.tsx`, `GET /api/admin/stats` (pre-existing; M10 added `openComplaints`) |
| Responsive UI | DONE | Tailwind mobile-first throughout, incl. all new M10 screens (375px/tablet/desktop) |
| Secure auth | DONE | JWT + bcrypt (pre-existing), credential-rotation hardening (M8) |
| Reliable order tracking | DONE | `OrderTimeline`/`StatusBadge` (pre-existing) |
| Usable UI (loading/empty/error states) | DONE | `States.tsx` primitives used throughout, incl. every new M10 screen |
| Deployment-ready | DONE | Render + Vercel + Atlas, verified live (M8) |
| Native mobile app | OUT OF SCOPE | Explicitly excluded by the brief — web-responsive only |
| International shipping | OUT OF SCOPE | Explicitly excluded by the brief |
| AI features | OUT OF SCOPE | Explicitly excluded by the brief |
| Logistics/delivery tracking | OUT OF SCOPE | Explicitly excluded by the brief |
| Payment gateway / wallet | OUT OF SCOPE | Explicitly deferred to "Future Enhancements" by the brief itself — see Remaining §9 below |
| Microservices / Redis / queues / Kafka / enterprise monitoring | OUT OF SCOPE | Explicitly excluded by the brief — this is an internship-scope monolith, deliberately |

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
7. **Legacy image removal** — found during M9: a listing that predates Cloudinary uploads and still shows
   its old placeholder can't have that image removed without uploading a replacement first (see M9's Done
   section above for why). Low-impact, but worth a small explicit "clear legacy image" endpoint if it ever
   comes up in practice.
8. **npm audit deferrals** — root has exactly 7 advisories (1 critical + 3 high + 3 moderate — verified via
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
9. **Payments** (Razorpay for India) with hold/escrow on service completion.
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
