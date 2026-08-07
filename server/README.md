# HunarHub API — Express + MongoDB

REST backend for HunarHub. **Express 4 · Mongoose 8 · JWT auth · Zod validation · TypeScript (run with `tsx`, no build step).**

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/health` | — | Liveness check |
| `POST` | `/api/auth/register` | — | Create customer or entrepreneur (+profile) |
| `POST` | `/api/auth/login` | — | Returns `{ token, user }` |
| `GET` | `/api/auth/me` | any | Current user |
| `GET` | `/api/entrepreneurs` | — | Browse (`?cat=&q=&maxPrice=&sort=rating\|priceLow\|exp`) |
| `GET` | `/api/entrepreneurs/:id` | — | Profile + services + products + reviews |
| `PATCH` | `/api/entrepreneurs/me` | entrepreneur | Update own profile / availability |
| `POST` `PATCH` `DELETE` | `/api/services` `/:id` | entrepreneur | Manage own services |
| `POST` `PATCH` `DELETE` | `/api/products` `/:id` | entrepreneur | Manage own products |
| `POST` | `/api/orders` | customer | Place service request / product order |
| `GET` | `/api/orders/mine` | customer | Customer's orders |
| `GET` | `/api/orders/incoming` | entrepreneur | Incoming requests |
| `PATCH` | `/api/orders/:id/status` | entrepreneur | accept / decline / complete |
| `POST` | `/api/reviews` | customer | Add/update a review (recomputes rating) |
| `GET` | `/api/reviews/entrepreneur/:id` | — | An entrepreneur's reviews |
| `GET` | `/api/admin/entrepreneurs` | admin | All entrepreneurs |
| `PATCH` | `/api/admin/entrepreneurs/:id/verify` | admin | Verify / unverify |
| `GET` | `/api/admin/users` | admin | Every account, any role (`?role=&q=&page=`) |
| `GET` | `/api/admin/listings` | admin | Services + products across every seller (`?kind=&q=&page=`) |
| `DELETE` | `/api/admin/services/:id` `/api/admin/products/:id` | admin | Moderation removal (no ownership check) |
| `GET` | `/api/admin/stats` | admin | Platform counts (users, listings, orders — all real queries) |

Send the token as `Authorization: Bearer <token>`.

## Tests

```bash
npm test          # vitest + supertest + mongodb-memory-server — no real database touched
npm run typecheck
```

Covers auth (register/login/session), role authorization (customer/entrepreneur rejected from admin routes),
listing ownership (an entrepreneur can't edit or delete another seller's service/product), the order lifecycle
and cross-seller isolation, and the earned-review rule. Each suite gets its own in-memory MongoDB instance.

## Run locally

```bash
cd server
cp .env.example .env        # then edit MONGODB_URI + JWT_SECRET
npm install
npm run seed                # optional: demo data (password: password123)
npm run dev                 # http://localhost:4000
```

Quick check: `curl http://localhost:4000/health`

## Deploy to Render (free)

**1. MongoDB Atlas (free M0 cluster)**
- Create a cluster at mongodb.com/atlas → **Database Access**: add a user + password.
- **Network Access**: allow `0.0.0.0/0` (so Render can connect).
- **Connect → Drivers**: copy the connection string, e.g.
  `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/hunarhub?retryWrites=true&w=majority`

**2. Push this project to GitHub** (frontend + `server/` in one repo is fine).

**3. Render**
- render.com → **New + → Blueprint** → pick the repo (it reads `server/render.yaml`).
- Or **New + → Web Service** manually with **Root Directory = `server`**, Build `npm install`, Start `npm start`.
- Set env vars:
  - `MONGODB_URI` = your Atlas string
  - `JWT_SECRET` = long random string (Blueprint auto-generates one)
  - `CLIENT_ORIGIN` = `https://hunarhub-eight.vercel.app`
- Deploy. Your API base will be `https://hunarhub-api.onrender.com`.

**4. Seed the deployed DB (once)** — from your machine with the Atlas URI in `.env`:
```bash
npm run seed
```

> Free Render services sleep after inactivity, so the first request after idle takes ~30s to wake.

## Next: connect the frontend

Once it's live, give me the Render URL and I'll add an API client + auth to the frontend (replacing mock data) and redeploy it to Vercel with `VITE_API_URL` pointing here.

## Layout

```
server/src/
  index.ts app.ts
  config/    env.ts db.ts
  middleware/ auth.ts error.ts validate.ts
  models/    User.ts Service.ts Product.ts Order.ts Review.ts
  routes/    index.ts auth.ts entrepreneurs.ts services.ts products.ts orders.ts reviews.ts admin.ts
  utils/     ApiError.ts asyncHandler.ts token.ts serialize.ts
  seed/      seed.ts
```
