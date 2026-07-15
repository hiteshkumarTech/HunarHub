import { Router } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { entrepreneurCard } from '../utils/serialize';
import { ApiError } from '../utils/ApiError';

const router = Router();

// Everything here requires an authenticated admin.
router.use(authRequired, requireRole('admin'));

router.get(
  '/entrepreneurs',
  asyncHandler(async (_req, res) => {
    const users = await User.find({ role: 'entrepreneur' }).sort({ createdAt: -1 });
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

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [entrepreneurs, customers, orders, reviews, pendingOrders] = await Promise.all([
      User.countDocuments({ role: 'entrepreneur' }),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments({}),
      Review.countDocuments({}),
      Order.countDocuments({ status: 'pending' }),
    ]);
    res.json({ stats: { entrepreneurs, customers, orders, reviews, pendingOrders } });
  }),
);

export default router;
