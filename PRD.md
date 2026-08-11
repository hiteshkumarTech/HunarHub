# HunarHub — Product Requirements Document

## 1. Product overview

HunarHub is a full-stack digital marketplace that gives local Indian micro-entrepreneurs — cobblers, potters
(kumhar), tailors, artisans, and small home-based vendors — a simple way to be discovered, take requests, sell
products, and build a reputation online, without needing any technical skill themselves. Customers get one
place to find, filter, hire, and buy from verified local talent.

## 2. Problem

Skilled local workers and small sellers largely rely on foot traffic, word of mouth, and informal networks.
They have no low-friction way to list what they do, show their work, take a request, or prove they're
trustworthy to someone who hasn't met them. Customers looking for a specific craft or product nearby have no
single, structured place to search, compare, and transact — they're stuck with generic classifieds or personal
referrals. HunarHub closes that gap for both sides with a purpose-built discovery + request + review loop.

## 3. Target users

### 3.1 Customer persona — "Priya, 29, works in Jaipur"

Wants a specific service (custom stitching, a repaired pair of shoes, a handmade gift) or product (pottery,
pickles, a chikankari dupatta) from someone local and trustworthy. Doesn't want to spend an evening scrolling
generic classifieds or asking around. Cares about: can I find the right craft nearby, is this person verified,
what does it cost, can I track my request, can I trust the reviews.

### 3.2 Micro-entrepreneur persona — "Ramesh, 45, third-generation potter in Jaipur"

Makes and sells real, physical goods and offers real services, but has no website, no way to be found beyond
his neighborhood, and no structured way to manage requests coming in. Wants: a free/simple online presence, a
place to show his work and price it, a way to accept or decline requests without back-and-forth calls, and
visibility into what he's earned.

### 3.3 Admin persona — "Platform operator"

Responsible for keeping the marketplace trustworthy and functional: verifying that entrepreneurs are real,
keeping the category list sensible, watching for and resolving disputes, and having a real (not fabricated)
view of platform health — without needing to touch a database directly.

## 4. Objectives

1. Let a customer discover and directly transact with a local entrepreneur — service request or product
   purchase — end to end, without a phone call.
2. Let an entrepreneur run their side of that relationship (listings, requests, availability, earnings) from
   one simple dashboard.
3. Give an admin the minimum real tooling to keep the platform trustworthy: verification, category upkeep,
   order visibility, and dispute resolution.
4. Ship something genuinely deployable and demonstrable — not a prototype that only works with mock data.

## 5. In-scope

Everything under "Key features by role" in [README.md](./README.md): registration/login, role-based
dashboards, entrepreneur discovery (Browse) and listing discovery (Marketplace) with category/location/price/
search filters, entrepreneur profiles with a photo gallery, service requests and product orders, order
tracking, earned reviews, favourites, entrepreneur listing management with image uploads, availability
management, earnings overview, admin entrepreneur verification, admin category management, admin order
monitoring, a complaints/disputes flow, and admin analytics. Full requirement-by-requirement status:
[ROADMAP.md § traceability matrix](./ROADMAP.md#requirement-traceability-matrix-m10).

## 6. Out-of-scope

Explicitly excluded by the internship brief itself, deferred to Future Enhancements: digital payments/wallet,
logistics/delivery tracking, international shipping, a native mobile app, AI-driven features (recommendations,
chat, etc.), and enterprise infrastructure (microservices, message queues, Redis, dedicated observability
stack) that this project's actual scale doesn't need.

## 7. Functional requirements

See [README.md § Requirement coverage](./README.md#requirement-coverage) for the full classified list
(customer/entrepreneur/admin/non-functional). Every requirement is DONE, INTENTIONALLY SIMPLIFIED (with the
trade-off explained), or explicitly OUT OF SCOPE per the brief — nothing is left as an unexplained gap.

## 8. Non-functional requirements

- **Responsive** — usable at 375px (mobile), tablet, and desktop widths on every screen, including all
  marketplace/admin additions.
- **Secure auth** — JWT-based, bcrypt password hashing, role checks enforced server-side (not just hidden in
  the UI), rate limiting, input sanitisation (`mongo-sanitize`), security headers (`helmet`).
- **Reliable order tracking** — a single source of truth (`Order.status`) driving both the customer's timeline
  view and the entrepreneur's action buttons.
- **Usable UI** — loading/empty/error states on every data-driven screen, keyboard-operable controls, labelled
  form fields, visible focus states.
- **Deployment-ready** — live on Vercel + Render + MongoDB Atlas, verified end-to-end, not just deployed and
  assumed to work.

## 9. User flows

### 9.1 Customer: discover → request → track → review

Register → browse Marketplace (filter by category/location/price) or Browse Talent (find a seller directly) →
open a listing/profile → request a service or buy a product → order appears `pending` → track status on
`/orders` → once `completed`, leave a review or report an issue if something went wrong.

### 9.2 Entrepreneur: list → receive → fulfil → earn

Register with craft/category/location → add services/products with photos → receive a request on `/dashboard`
→ accept or decline → do the work → mark `completed` → see it reflected in the earnings KPI and completed-order
count → toggle availability on/off as needed.

### 9.3 Admin: verify → monitor → resolve

Log in to `/admin` → verify a new entrepreneur → monitor orders platform-wide (read-only) → manage the
category list (rename/deactivate) → review any reported complaint, change its status, add a private note →
check overview analytics for real platform counts.

## 10. Core entities

`User` (with an embedded entrepreneur `profile`), `Service`, `Product`, `Order`, `Review`, `Favorite`,
`Category`, `Complaint`. Field-level detail: [TECHNICAL-DESIGN.md § Data model](./TECHNICAL-DESIGN.md#5-data-model).

## 11. Success metrics / KPIs

As an internship submission rather than a live business, "success" is measured functionally, not
commercially:

- Every functional requirement in the brief is DONE or has an explained, deliberate simplification.
- The full test suite (115 tests total) passes, and CI is green on the submitted commit.
- The live deployment responds correctly end-to-end for all three roles, verified by direct HTTP/production
  checks, not just local development.
- A new evaluator can understand the product and its scope from the README in under 2 minutes.

## 12. Assumptions

- A single geographic market (India) with city/state-level location data is sufficient — no multi-country
  address formats or currency handling needed.
- Demo/seed data stands in for a cold-start "empty marketplace" problem — not solved as a separate feature.
- Trust is established through admin verification + reviews, not third-party identity verification (KYC).

## 13. Constraints

- Internship-scope timeline and team size (single developer) — favors simple, auditable solutions
  (in-memory merge-and-paginate, a fixed category enum, exact-match location filtering) over premature
  infrastructure (Redis, microservices, aggregation pipelines) that this data scale doesn't need.
- Render's free tier cold-starts after idle — acceptable for a demo/evaluation context, documented as a known
  limitation rather than solved with paid infrastructure.
- No dedicated design/QA team — the design system and test suite exist specifically to substitute for that at
  this scale.

## 14. Future enhancements

See [README.md § Future enhancements](./README.md#future-enhancements) — payments/escrow, logistics,
notifications/messaging, a native mobile app, AI-driven recommendations, and a fully dynamic category
taxonomy, all deliberately deferred rather than attempted at internship scope.
