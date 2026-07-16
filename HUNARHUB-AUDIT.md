# HunarHub — Full Product & Engineering Audit + Milestone Roadmap

_Audit of the deployed project across five lenses (Product Design · UI/UX · Architecture · Scalability · Business Value). No code is changed here. Implementation begins only after you approve the roadmap, one milestone at a time._

---

## 0. Executive summary — the one insight that reorders everything

The backend is genuinely production-grade: JWT auth, roles, orders, reviews, admin, Zod validation, now hardened (helmet, rate limiting, sanitisation, fail-fast env, earned reviews — coded, pending a `git push` to Render).

**The frontend is a beautifully designed shell that is not connected to it.** Every page renders `src/data/mockData.ts`. There is no API client, no `AuthContext`, no login/register, no real order placement, no session. `Dashboard.tsx` shows a hard-coded Ramesh; `Browse.tsx`/`Profile.tsx` filter static arrays.

So the "premium gap" you feel is not a styling problem first — it's that **the product isn't wired**. A gorgeous landing page on top of mock data will still feel like a demo. The highest-leverage work is: connect the frontend to the live API + auth (foundation), *then* layer on the premium landing, discovery, dashboards, and growth features. This audit is ordered around that reality.

---

## 1. Screen-by-screen audit

Legend for state coverage: ✅ present · ⚠️ partial · ❌ missing.

### 1.1 Landing (`pages/Landing.tsx`)
Strong editorial art direction (animated wordmark, sand-dissolve craft showcase). But it's a *brand* page, not a *marketplace* homepage.
- **Missing functionality:** no search bar, no real categories from API, no featured entrepreneurs, no trending products, no social proof (testimonials/success stories), no impact stats, no "How it works", no real footer, no auth entry points (Sign in / Become a seller).
- **UX:** a first-time visitor can't answer "can I find a tailor near me right now?" The hero communicates *mood*, not *utility*. No obvious next action beyond "Explore Crafts".
- **UI consistency:** dinosaur-era design tokens are ad hoc (arbitrary Tailwind values like `text-[13.5vw]`) rather than a shared scale.
- **A11y:** icon-only buttons without `aria-label`; very light gray mono labels (`text-gray-400/500`) likely fail WCAG AA contrast; animated wordmark needs `prefers-reduced-motion` fallback.
- **Perf:** Picsum hero image not responsive/lazy; no code splitting.
- **States:** N/A (static) — but once data-driven, featured/trending need loading + empty states.
- **Mobile:** works, but the mega wordmark + dark section need spot-checks on small screens.

### 1.2 Browse / Marketplace (`pages/Browse.tsx`)
- **Missing:** server-side search/filter/sort (currently client-side over mock), **pagination / infinite scroll**, location/"near me", availability filter, verified filter, category landing pages, recently-viewed, recommendations, favorites toggle.
- **UX:** filters reset on reload (not URL-synced except `cat`); no result count skeleton; no "no results" recovery (suggest clearing filters).
- **UI:** cards are clean but lack a portfolio thumbnail strip, verified badge styling, and a favourite (heart) affordance.
- **A11y:** range slider + select need labels/`aria`; card is a `<Link>` wrapping interactive content (nested interactivity risk).
- **Perf:** all entrepreneurs loaded at once; images eager. Needs pagination + lazy images + `React.memo` on cards.
- **States:** loading ❌ (no skeletons), empty ⚠️ (text only), error ❌ (no failure UI once wired).
- **Mobile:** filter row wraps acceptably; a sticky filter/sort sheet would be better.

### 1.3 Entrepreneur Profile (`pages/Profile.tsx`)
- **Missing:** real portfolio **gallery/lightbox**, verified-identity proof, response time / completion rate, booking/appointment scheduling, favourite, share/QR, map of location, "message" action, review submission UI (and it must respect the new earned-review rule).
- **UX:** tabs are good; but no booking CTA that actually does anything, no availability calendar, no trust signals beyond a badge.
- **UI:** cover uses a random Picsum image (fixed the name-clipping bug earlier); needs real imagery + consistent avatar system.
- **A11y:** tabs aren't a proper ARIA tablist (no `role="tab"`, arrow-key nav); back-link is an icon+text (ok) but review stars need labels.
- **Perf:** product images eager; add lazy + responsive.
- **States:** loading ❌, empty (no products/reviews) ⚠️, error ❌.
- **Mobile:** sticky bottom CTA is good; stats row can crowd on small widths.

### 1.4 Entrepreneur Dashboard (`pages/Dashboard.tsx`)
- **Missing (vs your target):** real revenue, **monthly growth**, rating **trend**, profile **visitors**, **profile completeness**, **calendar**, portfolio management, product/service **analytics**, reviews dashboard. Availability toggle and accept/decline exist but are local state, not persisted.
- **UX:** it's a static mock of one seller; no auth means anyone sees "Ramesh".
- **UI:** KPI cards are a good base to formalise into a reusable `<StatCard>`.
- **A11y:** availability toggle is a `<span onClick>` (not keyboard-operable, no `role="switch"`).
- **Perf/States:** all ❌ until wired.

### 1.5 Auth & Onboarding — ❌ entirely missing (frontend)
No login, register, "become a seller" flow, logout, session restore, protected routes, or role-aware nav. The API supports all of it. This is the biggest single gap.

### 1.6 Customer Orders / Tracking — ❌ missing (frontend)
API has `/orders/mine` and status lifecycle, but there's no customer order history or tracking screen, and no place to actually place an order.

### 1.7 Admin Console — ❌ missing (frontend)
API has verify + stats; no UI. No verification queue, disputes, user/category/skill management, revenue, or platform health views.

### 1.8 Global shell (`Header`, `PageBar`, footer)
- Two different navs (`Header` on landing, `PageBar` on sub-pages) with no auth-aware state, no user menu, no notifications, no consistent footer. Needs one responsive app shell with role-aware navigation.

---

## 2. Cross-cutting audit (the five lenses)

### Product Design
The mission (empower local artisans, preserve skills, cut middlemen) is present in *tone* but not in *mechanics*. Nothing yet surfaces local impact, artisan stories, verification/trust, or "hire nearby". Premium marketplaces win on **trust + discovery + proof**; HunarHub currently shows none with real data.

### UI/UX
Beautiful but inconsistent and utility-light. No design tokens, no loading/empty/error system, no toasts, weak forms (none exist yet), no dark mode, accessibility gaps throughout. Two navigation systems.

### Software Architecture
Backend is clean and modular (routes/models/middleware/utils). Frontend is clean but **has no data layer** — this is the defining architectural gap. Types are **duplicated** FE/BE and will drift. No API versioning (`/api` not `/api/v1`). Business logic lives in route files (fine now; extract services later). No tests, no CI, no lint config committed.

### Scalability
No pagination anywhere; Browse search uses non-index-friendly regex while a `text` index sits unused. Render free tier cold-starts (~30s). No caching. Rating recompute is a full aggregate per review (ok for now). Denormalised `ratingAvg/ratingCount` is a good call and should stay.

### Business Value
The platform can't yet convert a visitor into a booking (no auth, no booking, no trust surface, no discovery). The backend investment is stranded until the frontend is wired. Once connected, the fastest ROI is: **premium landing (conversion) + discovery (search/nearby/trust) + booking flow**.

---

## 3. Design-system assessment
Needs to be formalised into reusable primitives:
- **Tokens:** color scale (with accessible grays), spacing scale, type scale, radii, shadows, motion durations/easings, z-index — as Tailwind theme + CSS vars.
- **Components:** `Button` (variants/sizes/loading), `Input`/`Select`/`Field`, `Card`, `Badge` (verified/status), `Avatar` (unify with `Monogram`), `Tabs` (ARIA), `Toast`, `Modal/Sheet`, `Skeleton`, `EmptyState`, `Pagination`, `StatCard`, `Rating`.
- **Dark mode:** design tokens make this cheap; add a theme toggle + `prefers-color-scheme`.
- **Motion:** respect `prefers-reduced-motion`; keep the signature dissolve as an enhancement, not a requirement.

---

## 4. Milestone roadmap (Critical → Low)

Each milestone is production-shippable on its own. Impact/difficulty are relative estimates. ⚙️ = requires a schema change (I'll spec it before writing).

| # | Milestone | Priority | Difficulty | User impact | Business impact |
|---|---|---|---|---|---|
| **M0** | **Deploy the security hardening** (already coded) | Critical | Trivial (push) | Med | High (trust) |
| **M1** | **Wire frontend ↔ API + Auth + Onboarding** — typed API client, React Query, `AuthContext`, protected + role-aware routes, Login/Register/Become-a-seller, replace mock on Browse/Profile/Dashboard | **Critical** | High | **Critical** | **Critical** |
| **M2** | **Premium landing** — hero + real search, popular categories, featured entrepreneurs, trending products, why-choose, impact stats, how-it-works, testimonials/success stories, CTA, footer (all data-driven) | High | Med–High | High | **Critical** (conversion) |
| **M3** | **Customer discovery** — server search/filter/sort, pagination/infinite scroll, verified badges, portfolio gallery/lightbox, favourites ⚙️, recently viewed, recommendations, real ratings | High | High | High | High |
| **M4** | **Booking & order tracking** — real order placement, customer "My Orders" + status timeline, entrepreneur incoming/accept/decline persisted, toasts | High | Med | High | High |
| **M5** | **Design system + a11y + skeletons + dark mode** (extracted as it's built in M1–M4, then hardened) | High | Med | High | Med |
| **M6** | **Premium entrepreneur dashboard** — revenue, growth, rating trend, visitors ⚙️, profile completeness, availability persistence, calendar, portfolio mgmt, product/service analytics, reviews dashboard | High | High | High | High |
| **M7** | **Maps & nearby** ⚙️ — geocoded profiles, "near me" discovery, location search, map on profile (Google Maps / Leaflet) | Medium | High | High | Medium |
| **M8** | **Admin console** — verification queue, disputes ⚙️, analytics/revenue, user/category/skill management, platform health | Medium | Med | Med | High |
| **M9** | **Security round 2** — refresh tokens + rotation, password reset, email verification ⚙️, file-upload validation, CSRF (if cookie auth) | High | Med | Med | High |
| **M10** | **Performance & scale** — image CDN/optimisation, lazy loading, code splitting, compound DB indexes, `.lean()`, HTTP caching, memoization | Medium | Med | Med | Med |
| **M11** | **Growth (mission-gated)** — digital payments (Razorpay) + invoices, notifications, live chat, skill badges/certificates, community stories, QR profile, business insights | Med→Low | High | High | High |

### Schema changes flagged (to spec before writing)
- **Favourites (M3):** new `Favorite { user, entrepreneur }` collection (or `favorites: [ObjectId]` on User). Recommend a collection for scale + timestamps.
- **Visitors/analytics (M6):** lightweight `ProfileView { entrepreneur, day, count }` daily rollup rather than per-hit rows.
- **Maps (M7):** `profile.location = { type: 'Point', coordinates: [lng, lat] }` + `2dsphere` index, plus address fields.
- **Disputes (M8):** new `Dispute { order, raisedBy, status, messages[] }`.
- **Email verification (M9):** `emailVerified: boolean` + `VerificationToken`.
- Everything else is additive and compatible with existing models.

### Feature triage — "how does this help a micro-entrepreneur?"
Kept because they directly raise artisan income/trust/reach: **verified badges, portfolio gallery, nearby discovery, booking, order tracking, reviews, dashboard analytics, payments+invoices, notifications, skill badges/certificates, community stories, QR profile.**
Deferred/optional (nice, not mission-critical yet): live chat (start with structured requests + notifications first), advanced fraud detection (start with admin verification queue).

---

## 5. Recommended sequence & working agreement
1. **M0 now** (your `git push` — 1 minute).
2. **M1 next** — it converts the whole thing from demo to product; nothing premium is real without it.
3. **M2**, then **M3/M4**, extracting the **design system (M5)** as we go.
4. Then M6 → M7 → M8, with security (M9), performance (M10), and growth (M11) layered in.

Per your rules, for **each** milestone I will: keep existing code intact and additive, keep strict TypeScript and reusable components, **explain schema changes before writing them**, include tests (Vitest + Supertest / component tests), and treat a milestone as done only when it's production-ready. One honest constraint: my sandbox shell is currently down (host disk space), so I can't *run* builds/tests here — I'll write them and verify by review; you run them locally / in CI, and we fix together from logs.
