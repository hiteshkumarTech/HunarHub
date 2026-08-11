# HunarHub API — Express + MongoDB

REST backend for HunarHub. **Express 4 · Mongoose 8 · JWT auth · Zod validation · TypeScript (run with `tsx`, no
build step).**

The full endpoint reference, environment variables, and architecture notes live in the **[root
README](../README.md)** and **[TECHNICAL-DESIGN.md](../TECHNICAL-DESIGN.md)** — this file only covers running
the server on its own.

## Run locally

```bash
cd server
cp .env.example .env        # then edit MONGODB_URI + JWT_SECRET
npm install
npm run seed                # optional: demo data (password: password123)
npm run dev                 # http://localhost:4000
```

Quick check: `curl http://localhost:4000/health`

## Scripts

```bash
npm run dev                 # tsx watch — auto-restart on save
npm run typecheck
npm test                    # vitest + supertest + mongodb-memory-server — no real database touched
npm run seed                # wipe + reload demo data (never run against a database with real users)
npm run set-admin-password  # rotate the admin password on an already-seeded DB, no reseed
```

## Layout

```
server/src/
  index.ts app.ts
  config/    env.ts db.ts cloudinary.ts
  middleware/ auth.ts error.ts validate.ts upload.ts (multer) rateLimit.ts sanitize.ts
  models/    User.ts Service.ts Product.ts Order.ts Review.ts Favorite.ts Category.ts Complaint.ts
  routes/    index.ts auth.ts entrepreneurs.ts services.ts products.ts listings.ts categories.ts
             orders.ts reviews.ts favorites.ts complaints.ts admin.ts
  utils/     ApiError.ts asyncHandler.ts token.ts serialize.ts imageGallery.ts
  startup/   ensureCategories.ts  (idempotent default-category bootstrap, runs on every boot)
  scripts/   setAdminPassword.ts  (rotate the admin password without a full reseed)
  seed/      seed.ts
```

Deploying this service: see **[DEPLOY-CHECKLIST.md](../DEPLOY-CHECKLIST.md)**.
