import { Router } from 'express';
import { User, CATEGORY_IDS } from '../models/User';
import { Service } from '../models/Service';
import { Product } from '../models/Product';
import { asyncHandler } from '../utils/asyncHandler';
import { marketplaceListingJson } from '../utils/serialize';

const router = Router();
const ENTREPRENEUR_FIELDS = 'name profile.category profile.craft profile.city profile.state profile.ratingAvg profile.verified profile.available';

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * GET /api/listings — the customer-facing product/service marketplace.
 * Unlike GET /api/entrepreneurs (browse sellers), this discovers individual
 * listings directly, matching the assignment's "product marketplace" and
 * "search by skill/location/price" requirements without first requiring a
 * customer to open a specific seller's profile.
 *
 * ?kind=service|product (default: both, merged)
 * ?cat=&city=&state=   — filters on the OWNING entrepreneur, resolved first
 * ?minPrice=&maxPrice= — filters on the listing's own price
 * ?q=                  — matches the listing's own name
 * ?page=&limit=
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { kind, cat, city, state, minPrice, maxPrice, q } = req.query;

    // Step 1: resolve which entrepreneurs match the seller-level filters, if any.
    const entFilter: Record<string, unknown> = { role: 'entrepreneur' };
    let hasEntFilter = false;
    if (cat && (CATEGORY_IDS as readonly string[]).includes(String(cat))) {
      entFilter['profile.category'] = cat;
      hasEntFilter = true;
    }
    if (city) {
      entFilter['profile.city'] = new RegExp(`^${escapeRegex(String(city).trim())}$`, 'i');
      hasEntFilter = true;
    }
    if (state) {
      entFilter['profile.state'] = new RegExp(`^${escapeRegex(String(state).trim())}$`, 'i');
      hasEntFilter = true;
    }

    let entrepreneurIds: string[] | null = null;
    if (hasEntFilter) {
      const matched = await User.find(entFilter).select('_id').lean();
      entrepreneurIds = matched.map((u) => u._id.toString());
      // No matching sellers at all — short-circuit rather than run two pointless queries.
      if (entrepreneurIds.length === 0) {
        return res.json({ listings: [], total: 0, page: 1, pages: 1 });
      }
    }

    // Step 2: filter listings by their own fields (price, name search) + the resolved seller set.
    const itemFilter: Record<string, unknown> = {};
    if (entrepreneurIds) itemFilter.entrepreneur = { $in: entrepreneurIds };
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      itemFilter.price = priceFilter;
    }
    if (q) itemFilter.name = new RegExp(escapeRegex(String(q).trim()), 'i');

    const wantServices = kind !== 'product';
    const wantProducts = kind !== 'service';

    const [services, products] = await Promise.all([
      wantServices
        ? Service.find(itemFilter).populate('entrepreneur', ENTREPRENEUR_FIELDS).sort({ createdAt: -1 }).lean()
        : [],
      wantProducts
        ? Product.find(itemFilter).populate('entrepreneur', ENTREPRENEUR_FIELDS).sort({ createdAt: -1 }).lean()
        : [],
    ]);

    // Sellers who are gone/deleted leave a populate() null — drop those rather
    // than show a broken card.
    const merged = [
      ...services.filter((s) => s.entrepreneur).map((s) => marketplaceListingJson(s, 'service')),
      ...products.filter((p) => p.entrepreneur).map((p) => marketplaceListingJson(p, 'product')),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 12));
    const start = (page - 1) * limit;
    const total = merged.length;

    res.json({
      listings: merged.slice(start, start + limit),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

export default router;
