# HunarHub — 2–3 Minute Demo Script

A walkthrough for demonstrating HunarHub live. Use the demo accounts from [README.md](./README.md#demo-accounts)
(`priya@example.com` / `ramesh@hunarhub.in`, both `password123`). If the API has been idle, open
[the health check](https://hunarhub-api-s03k.onrender.com/health) ~30s before you start so the first real
request isn't slowed by Render's free-tier cold start.

---

**0:00–0:20 — Problem + homepage**

"HunarHub connects local Indian micro-entrepreneurs — potters, tailors, cobblers, artisans, small vendors —
directly with customers who want to hire them or buy what they make. Here's the homepage: popular categories,
featured entrepreneurs, trending products — all pulled live from the API, not mock data."

*(Open the landing page, scroll past the hero into the categories/featured sections.)*

**0:20–0:45 — Browse entrepreneurs**

"If a customer wants to find a specific seller, they can browse by category, location, price, and
availability." *(Open `/browse`, click a category chip, adjust the price slider, toggle "Available now.")*
"Search is server-side and paginated, not just filtering a static list."

**0:45–1:10 — Marketplace: products/services**

"But sometimes you just want to find a product or a service directly, without hunting for a seller first —
that's what the Marketplace is for." *(Open `/marketplace`.)* "Same filters, but this discovers the actual
listings — services and products merged into one feed. Click into one." *(Open a product with multiple
photos.)* "Real Cloudinary-hosted images, a gallery with a lightbox for multi-photo products."

**1:10–1:35 — Customer: order → history → review/complaint**

"Log in as the demo customer, Priya." *(Log in.)* "Request a service or buy a product —" *(place an
order)* "— it shows up immediately on `/orders` with a status timeline: requested → accepted → completed.
Once something's completed, she can leave a review, or if something went wrong, report an issue right from
the order." *(Point at the "Report an issue" control without necessarily submitting it live.)*

**1:35–2:00 — Entrepreneur: dashboard, listings, availability, earnings**

"Now the other side — log in as Ramesh, the potter." *(Log in.)* "His dashboard: incoming requests he can
accept or decline, an availability toggle, his own listing manager where he adds services and products with
photos, and an earnings overview that only counts completed orders — never pending or declined ones." *(Point
at the Earnings and Completed-orders KPIs.)*

**2:00–2:25 — Admin: verification, categories, orders, complaints, analytics**

"And the admin side." *(Log in as admin — or narrate if not logging in live.)* "Verify entrepreneurs, monitor
every order platform-wide read-only, manage the craft category list, and review/resolve any reported
complaint. The analytics tab shows real counts pulled straight from the database — nothing here is
fabricated."

**2:25–2:40 — Tech stack**

"Under the hood: React, TypeScript, and TanStack Query on the frontend; Express, MongoDB, and JWT auth on the
backend; Cloudinary for images. Deployed on Vercel and Render, MongoDB Atlas for the database, with CI running
115 automated tests — 30 frontend, 85 backend — on every push."

**2:40–3:00 — Impact + closing**

"The goal was to give local micro-entrepreneurs real digital visibility and a direct line to customers,
without either side needing to be technical — and to build it as a real, deployed, tested product, not a
prototype. That's HunarHub."

---

## Notes for the presenter

- If time is tight, the sections that can be trimmed first: the admin walkthrough (narrate instead of
  clicking) and the tech-stack paragraph.
- Keep the customer/entrepreneur demo accounts as-is — they're meant to be reused, not to accumulate one-off
  test data. If you place a real order during a live demo, that's fine; there's no need to "clean it up"
  afterward (see README's known limitations — there's no delete endpoint anyway).
- Do **not** log into the admin account in a recorded or public demo unless you're using a private,
  non-public credential — see [DEPLOY-CHECKLIST.md](./DEPLOY-CHECKLIST.md) for why admin access isn't publicly
  documented.
