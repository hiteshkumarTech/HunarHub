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

type StoredImage = { url: string; publicId: string };

/** Same {url, publicId} shape the API always returns — publicId is null for
 *  images that predate Cloudinary uploads (nothing to delete server-side). */
function imagesJson(images: StoredImage[] | undefined): { url: string; publicId: string | null }[] {
  return (images ?? []).map((img) => ({ url: img.url, publicId: img.publicId }));
}

export function serviceJson(s: any) {
  return { id: s._id.toString(), name: s.name, price: s.price, dur: s.dur ?? '', images: imagesJson(s.images) };
}

export function productJson(p: any) {
  // Backward compat: older documents only have the legacy `image` string
  // field (Picsum placeholder or a pre-Cloudinary URL). Synthesize a
  // one-item gallery from it so old listings keep rendering unchanged.
  const images = p.images?.length ? imagesJson(p.images) : p.image ? [{ url: p.image, publicId: null }] : [];
  return { id: p._id.toString(), name: p.name, price: p.price, images };
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

/** Admin-only: any user (customer/entrepreneur/admin) with enough detail for a management table. */
export function adminUserJson(u: any) {
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    profile: u.profile ?? null,
    createdAt: u.createdAt,
  };
}

/** Admin-only: a service or product with its owner attached, for a cross-seller listing table. */
export function adminListingJson(item: any, kind: 'service' | 'product') {
  // Just a single thumbnail for row identification — the admin table is a
  // moderation list, not a gallery, so no need for the full image set here.
  const thumbnail = item.images?.[0]?.url ?? (kind === 'product' ? item.image : '') ?? '';
  return {
    id: item._id.toString(),
    kind,
    name: item.name,
    price: item.price,
    dur: kind === 'service' ? item.dur ?? '' : undefined,
    image: thumbnail || undefined,
    entrepreneur:
      item.entrepreneur && item.entrepreneur.name
        ? { id: item.entrepreneur._id.toString(), name: item.entrepreneur.name }
        : { id: item.entrepreneur?.toString(), name: 'Unknown' },
    createdAt: item.createdAt,
  };
}
