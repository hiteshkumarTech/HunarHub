import { Router } from 'express';
import { z } from 'zod';
import { User, ROLES } from '../models/User';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { Service } from '../models/Service';
import { Product } from '../models/Product';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { entrepreneurCard, adminUserJson, adminListingJson } from '../utils/serialize';
import { ApiError } from '../utils/ApiError';

const router = Router();

// Everything here requires an authenticated admin.
router.use(authRequired, requireRole('admin'));

router.get(
  '/entrepreneurs',
  asyncHandler(async (_req, res) => {
    const users = await User.find({ role: 'entrepreneur' }).sort({ createdAt: -1 }).lean();
    res.json({ entrepreneurs: users.map(entrepreneurCard) });
  }),
);

router.patch(
  '/entrepreneurs/:id/verify',
  validateBody(z.object({ verified: z.boolean() })),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id, role: 'entrepreneur' }).catch(() => null);
    if (!user) throw new ApiError(404, 'Entrepreneur not found');
    user.set('profile.verified', req.body.verified);
    await user.save();
    res.json({ entrepreneur: entrepreneurCard(user) });
  }),
);

// GET /admin/users?role=&q=&page=&limit= — every account, any role (mirrors the
// filter/search/pagination shape of GET /api/entrepreneurs for consistency).
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { role, q } = req.query;
    const filter: Record<string, unknown> = {};

    if (role && (ROLES as readonly string[]).includes(String(role))) {
      filter.role = role;
    }
    if (q) {
      const rx = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      users: users.map(adminUserJson),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

// GET /admin/listings?kind=&q=&page=&limit= — services + products across every
// entrepreneur, merged into one feed with the seller attached.
router.get(
  '/listings',
  asyncHandler(async (req, res) => {
    const { kind, q } = req.query;
    const nameFilter: Record<string, unknown> = {};
    if (q) {
      const rx = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      nameFilter.name = rx;
    }

    const wantServices = kind !== 'product';
    const wantProducts = kind !== 'service';

    const [services, products] = await Promise.all([
      wantServices ? Service.find(nameFilter).populate('entrepreneur', 'name').sort({ createdAt: -1 }).lean() : [],
      wantProducts ? Product.find(nameFilter).populate('entrepreneur', 'name').sort({ createdAt: -1 }).lean() : [],
    ]);

    const merged = [
      ...services.map((s) => adminListingJson(s, 'service')),
      ...products.map((p) => adminListingJson(p, 'product')),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginate the merged, sorted feed in memory — simplest correct option for
    // two independent collections at this data scale (see ROADMAP.md).
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 20));
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

// DELETE /admin/services/:id and /admin/products/:id — moderation removal.
// Unlike the entrepreneur-facing delete routes, this intentionally has no
// ownership check: an admin may remove any listing.
router.delete(
  '/services/:id',
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id).catch(() => null);
    if (!service) throw new ApiError(404, 'Service not found');
    await service.deleteOne();
    res.json({ ok: true });
  }),
);

router.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).catch(() => null);
    if (!product) throw new ApiError(404, 'Product not found');
    await product.deleteOne();
    res.json({ ok: true });
  }),
);

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [entrepreneurs, customers, admins, totalOrders, reviews, pendingOrders, completedOrders, serviceCount, productCount, availableEntrepreneurIds] =
      await Promise.all([
        User.countDocuments({ role: 'entrepreneur' }),
        User.countDocuments({ role: 'customer' }),
        User.countDocuments({ role: 'admin' }),
        Order.countDocuments({}),
        Review.countDocuments({}),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'completed' }),
        Service.countDocuments({}),
        Product.countDocuments({}),
        User.find({ role: 'entrepreneur', 'profile.available': true }, '_id').lean(),
      ]);

    // "Active" listings = owned by a seller who currently has availability on
    // (there's no per-listing status field — this is the closest real signal).
    const availableIds = availableEntrepreneurIds.map((u) => u._id);
    const [activeServices, activeProducts] = await Promise.all([
      Service.countDocuments({ entrepreneur: { $in: availableIds } }),
      Product.countDocuments({ entrepreneur: { $in: availableIds } }),
    ]);

    res.json({
      stats: {
        totalUsers: entrepreneurs + customers + admins,
        entrepreneurs,
        customers,
        admins,
        totalOrders,
        pendingOrders,
        completedOrders,
        reviews,
        totalListings: serviceCount + productCount,
        activeListings: activeServices + activeProducts,
      },
    });
  }),
);

export default router;
