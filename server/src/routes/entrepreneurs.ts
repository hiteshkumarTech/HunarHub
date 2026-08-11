import { Router } from 'express';
import { z } from 'zod';
import { User, CATEGORY_IDS } from '../models/User';
import { Service } from '../models/Service';
import { Product } from '../models/Product';
import { Review } from '../models/Review';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { entrepreneurCard, serviceJson, productJson, reviewJson, publicUser } from '../utils/serialize';
import { ApiError } from '../utils/ApiError';

const router = Router();

// GET /api/entrepreneurs?cat=&q=&city=&state=&maxPrice=&sort=rating|priceLow|exp
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { cat, q, city, state, maxPrice, sort, verified, available } = req.query;
    const filter: Record<string, unknown> = { role: 'entrepreneur' };

    if (cat && (CATEGORY_IDS as readonly string[]).includes(String(cat))) {
      filter['profile.category'] = cat;
    }
    // Exact-ish (case-insensitive) location filter — distinct from the free-text
    // `q` search below, which only fuzzy-matches location among other fields.
    if (city) filter['profile.city'] = new RegExp(`^${String(city).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    if (state) filter['profile.state'] = new RegExp(`^${String(state).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    if (maxPrice) filter['profile.startingPrice'] = { $lte: Number(maxPrice) };
    if (verified === 'true') filter['profile.verified'] = true;
    if (available === 'true') filter['profile.available'] = true;
    if (q) {
      const rx = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { 'profile.craft': rx }, { 'profile.city': rx }, { 'profile.state': rx }];
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      rating: { 'profile.ratingAvg': -1 },
      priceLow: { 'profile.startingPrice': 1 },
      exp: { 'profile.exp': -1 },
    };
    const sortBy = sortMap[String(sort)] ?? sortMap.rating;

    // Pagination (backward compatible: defaults return the first page).
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).sort(sortBy).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      entrepreneurs: users.map(entrepreneurCard),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

// PATCH /api/entrepreneurs/me — entrepreneur updates own profile / availability
const updateProfileSchema = z.object({
  category: z.enum(CATEGORY_IDS).optional(),
  craft: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  exp: z.number().int().min(0).optional(),
  bio: z.string().optional(),
  startingPrice: z.number().min(0).optional(),
  available: z.boolean().optional(),
});

router.patch(
  '/me',
  authRequired,
  requireRole('entrepreneur'),
  validateBody(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.id);
    if (!user) throw new ApiError(404, 'User not found');
    const current = user.profile ? (user.profile as unknown as { toObject: () => object }).toObject() : {};
    user.set('profile', { ...current, ...req.body });
    await user.save();
    res.json({ user: publicUser(user) });
  }),
);

// GET /api/entrepreneurs/:id — full profile + services + products + reviews
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id, role: 'entrepreneur' }).lean().catch(() => null);
    if (!user) throw new ApiError(404, 'Entrepreneur not found');

    const [services, products, reviews] = await Promise.all([
      Service.find({ entrepreneur: user._id }).lean(),
      Product.find({ entrepreneur: user._id }).lean(),
      Review.find({ entrepreneur: user._id }).populate('customer', 'name').sort({ createdAt: -1 }).lean(),
    ]);

    res.json({
      entrepreneur: { ...entrepreneurCard(user), bio: user.profile?.bio ?? '' },
      services: services.map(serviceJson),
      products: products.map(productJson),
      reviews: reviews.map(reviewJson),
    });
  }),
);

export default router;
