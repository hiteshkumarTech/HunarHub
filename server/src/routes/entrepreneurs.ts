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

// GET /api/entrepreneurs?cat=&q=&maxPrice=&sort=rating|priceLow|exp
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { cat, q, maxPrice, sort } = req.query;
    const filter: Record<string, unknown> = { role: 'entrepreneur' };

    if (cat && (CATEGORY_IDS as readonly string[]).includes(String(cat))) {
      filter['profile.category'] = cat;
    }
    if (maxPrice) filter['profile.startingPrice'] = { $lte: Number(maxPrice) };
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

    const users = await User.find(filter).sort(sortBy).limit(100);
    res.json({ entrepreneurs: users.map(entrepreneurCard) });
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
    const user = await User.findOne({ _id: req.params.id, role: 'entrepreneur' }).catch(() => null);
    if (!user) throw new ApiError(404, 'Entrepreneur not found');

    const [services, products, reviews] = await Promise.all([
      Service.find({ entrepreneur: user._id }),
      Product.find({ entrepreneur: user._id }),
      Review.find({ entrepreneur: user._id }).populate('customer', 'name').sort({ createdAt: -1 }),
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
