# HunarHub — Deploy Checklist

Three pieces: **MongoDB Atlas** (database) → **Render** (API) → **Vercel** (frontend). Set them up in that
order — the API needs a live database to boot, and the frontend needs a live API URL to point at.

## 🔴 Security action required — production credential rotation

**Status: code remediated, live rotation still pending.** Do this before anything else below.

### What happened

Earlier versions of `seed.ts` hardcoded the admin account (`admin@hunarhub.in`) to the same public demo
password (`password123`) documented in this repo's README. That's fine for the customer/entrepreneur demo
accounts — they can't escalate past their own data — but it means anyone who read this repo could log into
the **admin** account of any deployment that ran the old seed script. A real login against production
confirmed the credential worked.

### Why rotating the password alone is NOT enough

HunarHub's auth is **stateless JWTs** (`jsonwebtoken`, verified only by cryptographic signature + expiry —
see `server/src/middleware/auth.ts`). There is no session store, no refresh token, and nothing that checks
a token against current account state. **Changing the admin's password does not invalidate a JWT that was
already issued.** If anyone logged in with the exposed password before you rotate it, their token keeps
working — against every admin endpoint — until it naturally expires (`JWT_EXPIRES_IN`, currently `7d` from
issuance). Closing this incident requires **both**:

1. Rotate the admin password (`server/src/scripts/setAdminPassword.ts`).
2. Rotate `JWT_SECRET` on Render — this invalidates *every* previously issued token for *every* user,
   admin or not, forcing everyone to log in again. That's an intentional, acceptable trade-off here, not a
   side effect to work around.

### Runbook (do this in order)

1. Open the Render dashboard → `hunarhub-api` service → **Environment**.
2. Have the production `MONGODB_URI` ready (already in Render's env vars — copy it from there, or from
   wherever you originally stored it; never paste it into a chat, a commit, or this file).
3. Run the rotation script **locally**, in a terminal you trust:
   ```bash
   cd server
   MONGODB_URI="<paste the connection string here, not into a file>" npm run set-admin-password
   ```
   You'll be prompted for the new password with the input hidden (nothing echoes to the terminal, nothing
   is written to shell history). If you'd rather not use the interactive prompt — e.g. scripting this from
   a secrets manager — set `NEW_ADMIN_PASSWORD` as an env var instead; the script accepts either.
4. In the same Render **Environment** tab, edit `JWT_SECRET`. Generate a new value — Render can
   auto-generate one for you (the same mechanism the Blueprint used originally), or generate your own with
   `openssl rand -hex 32` (run locally; don't paste the output anywhere but the Render field). **Don't
   reuse or lightly modify the old value** — it needs to be unrelated, not derived from it.
5. Save the environment changes.
6. Render redeploys/restarts the service automatically on an env var change; if it doesn't, trigger a
   manual restart from the dashboard.
7. Once the service is back up (`GET /health` returns 200), run verification check **B** below — this is
   the one that actually proves the incident is closed, not just the password change.
8. Run check **A** — confirm the old password is rejected.
9. Run check **C** — confirm the new password works.
10. Run checks **D**, **E**, **F** — confirm the new admin token has the right access and everyone else
    still has the right restrictions.
11. Clear any local trace of what you just did: unset `MONGODB_URI`/`NEW_ADMIN_PASSWORD` in your shell
    (`unset MONGODB_URI NEW_ADMIN_PASSWORD`), and if you're on a shell that recorded the command with an
    inline `NEW_ADMIN_PASSWORD=...` (not needed if you used the interactive prompt), clear that specific
    history entry.

### Post-rotation verification (exact checks)

Replace `<api>` with the Render URL, `<old-token>` with an admin JWT captured *before* rotation (if you
have one on hand), and the request bodies' password with the actual old/new admin passwords.

| # | Check | Request | Expected |
|---|---|---|---|
| A | Old password rejected | `POST /api/auth/login` with the old admin password | **401** |
| B | Old token rejected | `GET /api/admin/stats` with `Authorization: Bearer <old-token>` | **401** — if this returns 200, the incident is **not** closed; `JWT_SECRET` wasn't actually rotated (or the service hasn't restarted yet) |
| C | New login works | `POST /api/auth/login` with the new admin password | **200** + a new token |
| D | New token has admin access | `GET /api/admin/stats`, `/api/admin/users`, `/api/admin/listings` with the new token | **200** on all three |
| E | Customer still blocked | Any customer token against `/api/admin/stats` | **403** |
| F | Unauthenticated still blocked | No token against `/api/admin/stats` | **401** |

```bash
API=https://hunarhub-api-s03k.onrender.com

# A — old password
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$API/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@hunarhub.in","password":"<OLD PASSWORD>"}'

# B — old token (the one check that actually proves closure)
curl -s -o /dev/null -w "%{http_code}\n" "$API/api/admin/stats" -H "Authorization: Bearer <OLD TOKEN>"

# C — new login
curl -s -X POST "$API/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@hunarhub.in","password":"<NEW PASSWORD>"}'
# copy the returned token for D

# D — new token, admin access
curl -s -o /dev/null -w "%{http_code}\n" "$API/api/admin/stats"    -H "Authorization: Bearer <NEW TOKEN>"
curl -s -o /dev/null -w "%{http_code}\n" "$API/api/admin/users"    -H "Authorization: Bearer <NEW TOKEN>"
curl -s -o /dev/null -w "%{http_code}\n" "$API/api/admin/listings" -H "Authorization: Bearer <NEW TOKEN>"
```

None of these commands need to be run from this repo or this machine — any terminal with `curl` works.
Don't paste real tokens or passwords into a chat, issue tracker, or commit.

## 0. Before you deploy

- [ ] `npm run typecheck && npm test && npm run build` passes at the repo root (frontend).
- [ ] `cd server && npm run typecheck && npm test` passes (40 tests, isolated in-memory MongoDB).
- [ ] CI is green on the commit you're deploying — check the Actions tab, or
      `curl https://api.github.com/repos/hiteshkumarTech/HunarHub/commits/<sha>/check-runs` (public API, no
      auth needed for a public repo).
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
      data. This wipes and recreates every collection — only run it against an empty/disposable database,
      never against one with real registered users.
  - [ ] Set a real admin password while you're at it, instead of getting a random generated one:
        `MONGODB_URI="<atlas-uri>" ADMIN_SEED_PASSWORD="<strong password>" npm run seed`. If you omit
        `ADMIN_SEED_PASSWORD`, the script generates one and prints it to the console **once** — copy it
        immediately, it isn't stored anywhere.
  - [ ] Customer/entrepreneur demo accounts (`priya@example.com`, `ramesh@hunarhub.in`, …) still use the
        public password `password123` — that's intentional, they're meant to be tried by anyone reviewing
        the app, and none of them can reach another user's data or admin functionality.

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
  - [ ] `NODE_ENV=production`, `NODE_VERSION=22`, `JWT_EXPIRES_IN=7d` — set by the blueprint, confirm
        they're present. `NODE_VERSION` pins the same major version CI tests against; without it, Render
        falls back to its own platform default, which can silently drift from what's actually tested.
- [ ] Build command is `npm ci` (not `npm install`) — deterministic, fails loudly on a lockfile mismatch
      instead of silently installing something CI never tested.
- [ ] Health check path is `/health` (already set in the blueprint) — Render polls this to know the service
      is up.
- [ ] **If you're updating an existing Render service** (not creating a new one from the Blueprint):
      changes to `render.yaml` do not auto-apply — sync them via the Render dashboard (Blueprint → Manual
      Sync) or update the Build Command / env vars directly in the service settings.
- [ ] Deploy, then hit `https://<your-service>.onrender.com/health` directly — expect
      `{"ok":true,"service":"hunarhub-api",...}`.
- [ ] **Free-tier cold start**: the service sleeps after ~15 min idle. Verified directly this pass — a
      request against a cold instance timed out past 15s, but succeeded well within 60s once actually
      awake, and every request after that was instant. Fine for a demo; if you need it always-warm, upgrade
      the Render plan or add an external uptime pinger (UptimeRobot etc. hitting `/health` every 10 min) — a
      Redis-backed rate limiter would also then become worth it (ROADMAP.md P4), since the current in-memory
      limiter resets on every cold start/restart.

## 3. Vercel (frontend)

- [ ] Import the repo; Vercel auto-detects Vite. Root directory: repo root (not `server`).
- [ ] Env var: `VITE_API_URL` = your Render URL from step 2, e.g. `https://hunarhub-api-xxxx.onrender.com`.
      Optional in the sense that `src/lib/api.ts` has a hardcoded fallback — but **set it explicitly** so a
      redeploy of the *backend* to a new URL doesn't silently strand the frontend on a stale fallback.
- [ ] `vercel.json`'s SPA rewrite (`/(.*) → /index.html`) is already committed — verified this pass: every
      app route (`/browse`, `/login`, `/register`, `/dashboard`, `/orders`, `/favourites`, `/admin`,
      `/profile/:id`) returns HTTP 200 on direct navigation, not a Vercel 404.
- [ ] Deploy, then update Render's `CLIENT_ORIGIN` if the resulting URL is a custom domain (a plain
      `*.vercel.app` URL needs no change — see step 2).

## 4. Environment variables — full reference

| Variable | Used by | Required in dev? | Required in prod? | Safe client-side? |
|---|---|---|---|---|
| `VITE_API_URL` | `src/lib/api.ts` (frontend) | No — falls back to the deployed Render URL | No (same fallback) — but set it explicitly so a backend URL change doesn't strand the frontend | **Yes** — `VITE_*` vars are always bundled into the public client build by design |
| `PORT` | `server/src/index.ts` | No — defaults to 4000 | No — Render sets this automatically | N/A, server-only |
| `NODE_ENV` | `server/src/config/env.ts`, `app.ts` (log toggle), Render's build step (skips devDependencies) | No — defaults `development` | Yes, functionally — must be exactly `production` for fail-fast validation to engage | N/A, server-only |
| `MONGODB_URI` | `server/src/config/db.ts` | No — falls back to local Mongo | **Yes** — boot fails without it | **Never** |
| `JWT_SECRET` | `server/src/utils/token.ts` | No — insecure dev fallback (rejected outright if used in prod) | **Yes** — boot fails without it, and boot fails if it's still the dev default. Rotating it invalidates every previously issued token, for every user — see the runbook at the top of this file | **Never** |
| `JWT_EXPIRES_IN` | `server/src/utils/token.ts` | No — defaults `7d` | No — same default is fine | N/A, server-only (harmless even if seen — it's a duration, not a secret) |
| `CLIENT_ORIGIN` | `server/src/config/env.ts` → CORS allowlist | No — defaults to localhost | Recommended for a custom domain (`*.vercel.app` and localhost are already allowed unconditionally) | N/A, not sensitive |
| `ADMIN_SEED_PASSWORD` | `server/src/seed/seed.ts` | No — a random one is generated and printed once if unset | Recommended so you choose the password rather than reading it off a console log. Rejected outright if it's under 12 characters or a common default (`password123`, `admin123`, …) — can't reintroduce the original vulnerability by accident | **Never** — it's a password |
| `NEW_ADMIN_PASSWORD` | `server/src/scripts/setAdminPassword.ts` | No — omit it and the script prompts interactively with the input hidden (preferred; never touches shell history) | — (one-off script, not a running service). Same weak-password rejection as `ADMIN_SEED_PASSWORD` | **Never** |
| `NODE_VERSION` | Render platform (build-time only) | N/A | Recommended — pins the runtime to match CI | N/A |

## 5. Post-deploy smoke test

Everything below was actually run against the live production URLs this pass (not just documented as a
plan) — see the M8 milestone report for the full transcript. To repeat it yourself:

- [ ] `curl https://<api>/health` → `{"ok":true,...}`.
- [ ] `curl https://<api>/api/entrepreneurs?limit=3` → real seeded data, not an empty array.
- [ ] `curl -X POST https://<api>/api/auth/register -d '{"name":"...","email":"...","password":"...","role":"customer"}'`
      → 201 with a token. Then log in with the same credentials → 200.
- [ ] With that token: `GET /api/admin/stats` → expect **403**, not 200 — a customer must never reach admin
      routes. Same for `POST /api/services` (entrepreneur-only) → 403.
- [ ] Without any token: `GET /api/orders/mine` → expect **401**.
- [ ] Frontend: open the deployed URL, Browse → open a profile → Landing page's "Featured local
      entrepreneurs" shows real data (confirms the frontend actually reached the API — if it silently shows
      the seed-data fallback instead, the API call failed; check `VITE_API_URL` and the Render logs).
- [ ] Sign in as `priya@example.com` / `password123` → request a service → toast confirms it.
- [ ] Sign in as `ramesh@hunarhub.in` / `password123` → `/dashboard` → the request appears → Accept → Mark
      complete → try the listings manager (add/edit/delete a listing).
- [ ] Back as Priya → `/orders` → status shows "Completed" → leave a review → it appears on the maker's
      profile and their rating updates.
- [ ] Sign in with your rotated admin credentials → `/admin` → Overview shows real counts, Users/Listings
      tabs load and filter.
- [ ] Toggle dark mode in the header; refresh the page — the choice persists.
- [ ] Check the browser console for CORS errors — the most common first-deploy failure is `CLIENT_ORIGIN`
      not matching the actual Vercel URL.

**Known gap**: there is no delete-user endpoint anywhere in the API (by design — no route exists for a user
to remove their own account, or for an admin to remove another user). Any account created while smoke
testing — including the disposable one used to verify this checklist — stays in the database permanently.
Prefer testing with the existing seeded accounts where the flow allows it, and keep new account creation to
the minimum needed to prove registration itself works.

## 6. Rollback

- **Frontend** — Vercel keeps every deployment; use "Promote to Production" on the last-known-good deployment
  in the dashboard, no rebuild needed.
- **Backend** — Render keeps a deploy history per service; "Rollback" redeploys a previous build. No database
  migration exists yet to reverse, so backend rollback is safe as long as the schema didn't change between
  versions.
- **Database** — Atlas free-tier (M0) has no continuous backups; if you're past the demo stage, enable Atlas
  backups before relying on this for anything real.
- **Compromised admin credential** — see the runbook at the top of this file. The password half
  (`npm run set-admin-password`) takes effect immediately, no deploy needed — the password check happens on
  every login. The `JWT_SECRET` half needs a Render env var change, which does trigger a restart; that's
  required, not optional, because it's the only thing that invalidates JWTs issued before rotation.
