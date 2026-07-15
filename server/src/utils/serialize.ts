/* Serializers that shape Mongoose docs into the JSON the frontend expects. */
/* eslint-disable @typescript-eslint/no-explicit-any */

export function publicUser(u: any) {
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    profile: u.profile ?? null,
  };
}

/** Compact shape used by the Browse grid + hero card. */
export function entrepreneurCard(u: any) {
  const p = u.profile ?? {};
  return {
    id: u._id.toString(),
    name: u.name,
    category: p.category ?? null,
    craft: p.craft ?? '',
    city: p.city ?? '',
    state: p.state ?? '',
    exp: p.exp ?? 0,
    rating: p.ratingAvg ?? 0,
    reviews: p.ratingCount ?? 0,
    start: p.startingPrice ?? 0,
    available: p.available ?? true,
    verified: p.verified ?? false,
  };
}

export function serviceJson(s: any) {
  return { id: s._id.toString(), name: s.name, price: s.price, dur: s.dur ?? '' };
}

export function productJson(p: any) {
  return { id: p._id.toString(), name: p.name, price: p.price, image: p.image ?? '' };
}

export function orderJson(o: any) {
  return {
    id: o._id.toString(),
    kind: o.kind,
    title: o.title,
    price: o.price,
    status: o.status,
    customer: o.customer && o.customer.name ? { id: o.customer._id.toString(), name: o.customer.name } : o.customer?.toString(),
    entrepreneur: o.entrepreneur && o.entrepreneur.name ? { id: o.entrepreneur._id.toString(), name: o.entrepreneur.name } : o.entrepreneur?.toString(),
    createdAt: o.createdAt,
  };
}

export function reviewJson(r: any) {
  return {
    id: r._id.toString(),
    rating: r.rating,
    text: r.text ?? '',
    customer: r.customer && r.customer.name ? { id: r.customer._id.toString(), name: r.customer.name } : r.customer?.toString(),
    createdAt: r.createdAt,
  };
}
