# HunarHub — Submission Checklist

## Application

- [x] Frontend live — [hunarhub-eight.vercel.app](https://hunarhub-eight.vercel.app)
- [x] Backend live — [hunarhub-api-s03k.onrender.com](https://hunarhub-api-s03k.onrender.com)
- [x] Health endpoint responds — `GET /health` → `{"ok":true,...}`
- [x] Login works (both demo accounts, verified live)
- [x] Marketplace works (filters verified live: category, location, price, kind, search)
- [x] Seller flow works (listings, image uploads, availability, earnings — verified live)
- [x] Admin functionality works (verified via role-gating checks live + full test coverage; no public demo
      admin account — see [DEPLOY-CHECKLIST.md](./DEPLOY-CHECKLIST.md))

## Repository

- [x] README — evaluator-readable in ~2 minutes, requirement coverage table included
- [x] PRD — [PRD.md](./PRD.md)
- [x] Technical documentation — [TECHNICAL-DESIGN.md](./TECHNICAL-DESIGN.md)
- [x] Clean git status (verified before this milestone's commit)
- [x] No `.env` committed — only `.env.example` / `server/.env.example`, placeholders only (verified by sweep)
- [x] No secrets in tracked files (verified by sweep — see final report)
- [x] Meaningful commit history (conventional-style messages, one concern per commit)

## Testing

- [x] Frontend tests — 30/30 passing
- [x] Backend tests — 85/85 passing
- [x] Typecheck — both sides clean
- [x] Production build — passes
- [x] CI — green on the submitted commit (GitHub Actions, verify link in the final report)

## Submission

- [ ] GitHub URL — `https://github.com/hiteshkumarTech/HunarHub`
- [ ] Live demo URL — `https://hunarhub-eight.vercel.app`
- [ ] PRD — attach or link [PRD.md](./PRD.md)
- [ ] Technical docs — attach or link [TECHNICAL-DESIGN.md](./TECHNICAL-DESIGN.md)
- [ ] Screenshots/video — capture per the list below if the submission format requires them
- [ ] Final project description — see below

## Screenshot plan

No browser-automation tool was used in this session, so no screenshots were captured automatically — capture
these manually before submitting if the format calls for them:

1. Landing / home page
2. Browse entrepreneurs (`/browse`, with a category filter active)
3. Marketplace (`/marketplace`, with filters applied)
4. A product's photo gallery / lightbox (open a multi-image product)
5. Customer order history with status timeline (`/orders`)
6. Entrepreneur dashboard (KPIs + incoming requests)
7. Entrepreneur listing management (add/edit a service or product)
8. Admin dashboard overview (real platform metrics)
9. Admin orders/complaints/categories tabs (pick one or two representative views)

## Project description (submission-ready, ~150 words)

HunarHub is a full-stack digital marketplace connecting local Indian micro-entrepreneurs — cobblers, potters,
tailors, artisans, and small vendors — directly with customers. Customers browse entrepreneurs or a dedicated
product/service marketplace, filter by category, location, and price, request services or buy products, track
orders through a status timeline, and leave reviews. Entrepreneurs manage their own listings with photo
uploads, accept or decline incoming requests, control their availability, and see a real earnings overview.
Admins verify entrepreneurs, manage the category list, monitor orders platform-wide, and resolve
customer/entrepreneur complaints. Built with React, TypeScript, and TanStack Query on the frontend; Express,
MongoDB, and JWT-based role authorization on the backend; images hosted on Cloudinary. Deployed live on Vercel
(frontend) and Render (API), backed by MongoDB Atlas, with 115 automated tests and CI running on every push.
The project is fully functional end-to-end, not a static prototype.

## Resume / portfolio

**One-line version**

Built a full-stack marketplace connecting local micro-entrepreneurs with customers through product/service
discovery, order management, and role-based dashboards for customers, entrepreneurs, and admins.

**Resume bullets**

- Built a full-stack TypeScript marketplace (React 19 + TanStack Query frontend, Express + MongoDB backend)
  with JWT-based role authorization across customer/entrepreneur/admin roles, enforced server-side and
  verified by an 85-test backend suite.
- Implemented real image uploads via Cloudinary (multi-image product galleries, ownership-checked mutations,
  automatic cleanup on delete) and a merged product/service marketplace with category, location, and price
  filtering across multiple MongoDB collections.
- Set up CI (GitHub Actions) running 115 automated tests (Vitest, Testing Library, Supertest,
  mongodb-memory-server) and a production build on every push; deployed and verified the app end-to-end on
  Vercel, Render, and MongoDB Atlas.
