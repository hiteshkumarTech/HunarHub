import { Router } from 'express';
import { z } from 'zod';
import { User, ROLES } from '../models/User';
import { Order, ORDER_STATUSES } from '../models/Order';
import { Review } from '../models/Review';
import { Service } from '../models/Service';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Complaint, COMPLAINT_STATUSES } from '../models/Complaint';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { entrepreneurCard, adminUserJson, adminListingJson, adminOrderJson, categoryJson, complaintJson } from '../utils/serialize';
import { deleteImages } from '../utils/imageGallery';
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
    const images = service.images;
    await service.deleteOne();
    await deleteImages(images);
    res.json({ ok: true });
  }),
);

router.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).catch(() => null);
    if (!product) throw new ApiError(404, 'Product not found');
    const images = product.images;
    await product.deleteOne();
    await deleteImages(images);
    res.json({ ok: true });
  }),
);

// GET /admin/orders?status=&kind=&q=&page=&limit= — read-only monitoring of
// every order/request across the platform. Deliberately no PATCH here: admin
// can inspect, not rewrite business-rule-governed status transitions that
// belong to the entrepreneur who owns the order (see ROADMAP.md).
router.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const { status, kind, q } = req.query;
    const filter: Record<string, unknown> = {};
    if (status && (ORDER_STATUSES as readonly string[]).includes(String(status))) filter.status = status;
    if (kind && (['service', 'product'] as readonly string[]).includes(String(kind))) filter.kind = kind;
    if (q) {
      const rx = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.title = rx;
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name')
        .populate('entrepreneur', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders: orders.map(adminOrderJson),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

// GET /admin/categories — same data as the public GET /api/categories, kept
// here too so the admin panel doesn't need a special-cased unauthenticated
// call. PATCH is the only admin-only mutation: label + active/inactive.
router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await Category.find().sort({ id: 1 }).lean();
    res.json({ categories: categories.map(categoryJson) });
  }),
);

router.patch(
  '/categories/:id',
  validateBody(z.object({ label: z.string().min(1).max(60).optional(), active: z.boolean().optional() })),
  asyncHandler(async (req, res) => {
    const category = await Category.findOne({ id: req.params.id }).catch(() => null);
    if (!category) throw new ApiError(404, 'Category not found');
    Object.assign(category, req.body);
    await category.save();
    res.json({ category: categoryJson(category) });
  }),
);

// GET /admin/complaints?status=&page=&limit= — every complaint, any reporter.
router.get(
  '/complaints',
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status && (COMPLAINT_STATUSES as readonly string[]).includes(String(status))) filter.status = status;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter).populate('reporter', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Complaint.countDocuments(filter),
    ]);

    res.json({
      complaints: complaints.map(complaintJson),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

router.patch(
  '/complaints/:id',
  validateBody(z.object({ status: z.enum(COMPLAINT_STATUSES).optional(), adminNote: z.string().max(2000).optional() })),
  asyncHandler(async (req, res) => {
    const complaint = await Complaint.findById(req.params.id).catch(() => null);
    if (!complaint) throw new ApiError(404, 'Complaint not found');
    Object.assign(complaint, req.body);
    await complaint.save();
    res.json({ complaint: complaintJson(complaint) });
  }),
);

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [entrepreneurs, customers, admins, totalOrders, reviews, pendingOrders, completedOrders, serviceCount, productCount, availableEntrepreneurIds, openComplaints] =
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
        Complaint.countDocuments({ status: { $ne: 'resolved' } }),
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
        openComplaints,
      },
    });
  }),
);

export default router;
