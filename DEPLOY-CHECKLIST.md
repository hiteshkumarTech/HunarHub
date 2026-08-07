# HunarHub — Deploy Checklist

Three pieces: **MongoDB Atlas** (database) → **Render** (API) → **Vercel** (frontend). Set them up in that
order — the API needs a live database to boot, and the frontend needs a live API URL to point at.

## 0. Before you deploy

- [ ] `npm run typecheck && npm test && npm run build` passes at the repo root (frontend).
- [ ] `cd server && npm run typecheck` passes (backend has no test suite yet — see ROADMAP.md P2).
- [ ] No secrets committed — `.env` files are gitignored; only `.env.example` / `server/.env.example` are
      tracked, and they hold placeholders, not real values.
- [ ] If you changed a Mongoose schema, decide up front whether it needs a migration for existing documents
      (this app has none yet — every field so far has a safe default).

## 1. MongoDB Atlas

- [ ] Create a free (M0) cluster, or use an existing one.
- [ ] Database user with a strong password (Atlas → Database Access).
- [ ] Network access: allow `0.0.0.0/0` (Render's IPs aren't static on the free plan) — acceptable because the
      database user's password is the actual gate, not IP allowlisting.
- [ ] Copy the connection string: `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/hunarhub?retryWrites=true&w=majority`
      — note the `/hunarhub` database name; add it if Atlas's copy button omits it.
- [ ] (First deploy only) Run `cd server && npm run seed` **against this connection string** to load demo
      data and the two demo accounts. Set `MONGODB_URI` in your local `server/.env` to the Atlas string
      temporarily, or pass it inline: `MONGODB_URI="<atlas-uri>" npm run seed`.

## 2. Render (API)

Uses the committed Blueprint at `server/render.yaml` — New → Blueprint → point at this repo.

- [ ] Root directory: `server` (the blueprint sets this, confirm it in the dashboard).
- [ ] Env vars (blueprint pre-fills most; fill in the `sync: false` ones in the dashboard):
  - [ ] `MONGODB_URI` — the Atlas connection string from step 1.
  - [ ] `JWT_SECRET` — blueprint auto-generates a strong random value. **Don't override with something
        memorable.** `env.ts` refuses to boot in production with the insecure dev default, but a *weak*
        custom value would still pass that check — let Render generate it.
  - [ ] `CLIENT_ORIGIN` — your Vercel production URL(s), comma-separated if there's more than one
        (e.g. a custom domain plus the `*.vercel.app` preview). Note `app.ts`'s CORS config already allows
        any `*.vercel.app` origin and `localhost`/`127.0.0.1` regardless of this list — `CLIENT_ORIGIN` only
        needs to cover origins *outside* those two patterns (a custom domain, for instance).
  - [ ] `NODE_ENV=production`, `JWT_EXPIRES_IN=7d` — set by the blueprint, confirm they're present.
- [ ] Health check path is `/health` (already set in the blueprint) — Render polls this to know the service
      is up.
- [ ] Deploy, then hit `https://<your-service>.onrender.com/health` directly — expect
      `{"ok":true,"service":"hunarhub-api",...}`.
- [ ] **Free-tier cold start**: the service sleeps after ~15 min idle and takes ~30s to wake on the next
      request. Fine for a demo; if you need it always-warm, upgrade the Render plan or add an external
      uptime pinger (UptimeRobot etc. hitting `/health` every 10 min) — a Redis-backed rate limiter would
      also then become worth it (ROADMAP.md P4), since the current in-memory limiter resets on every cold
      start/restart.

## 3. Vercel (frontend)

- [ ] Import the repo; Vercel auto-detects Vite. Root directory: repo root (not `server`).
- [ ] Env var: `VITE_API_URL` = your Render URL from step 2, e.g. `https://hunarhub-api-xxxx.onrender.com`.
      Optional in the sense that `src/lib/api.ts` has a hardcoded fallback — but **set it explicitly** so a
      redeploy of the *backend* to a new URL doesn't silently strand the frontend on a stale fallback.
- [ ] `vercel.json`'s SPA rewrite (`/(.*) → /index.html`) is already committed — confirm it's picked up
      (client-side routes like `/browse` or `/profile/:id` should work on a hard refresh, not just via
      in-app navigation).
- [ ] Deploy, then update Render's `CLIENT_ORIGIN` if the resulting URL is a custom domain (a plain
      `*.vercel.app` URL needs no change — see step 2).

## 4. Post-deploy smoke test

Run the full loop against the production URLs (not localhost):

- [ ] Landing page loads; "Featured local entrepreneurs" shows real data (confirms the frontend reached the
      API — if it silently shows the seed-data fallback instead, the API call failed; check `VITE_API_URL`
      and the Render logs).
- [ ] Register a new customer account → redirected correctly.
- [ ] Sign in as `priya@example.com` / `password123` (if you seeded demo data) → Browse → open a profile →
      request a service → toast confirms it.
- [ ] Sign in as `ramesh@hunarhub.in` / `password123` → `/dashboard` → the request appears → Accept → Mark
      complete.
- [ ] Back as Priya → `/orders` → status shows "Completed" → leave a review → it appears on the maker's
      profile and their rating updates.
- [ ] Toggle dark mode in the header; refresh the page — the choice persists.
- [ ] Check the browser console for CORS errors — the most common first-deploy failure is `CLIENT_ORIGIN`
      not matching the actual Vercel URL.

## 5. Rollback

- **Frontend** — Vercel keeps every deployment; use "Promote to Production" on the last-known-good deployment
  in the dashboard, no rebuild needed.
- **Backend** — Render keeps a deploy history per service; "Rollback" redeploys a previous build. No database
  migration exists yet to reverse, so backend rollback is safe as long as the schema didn't change between
  versions.
- **Database** — Atlas free-tier (M0) has no continuous backups; if you're past the demo stage, enable Atlas
  backups before relying on this for anything real.
