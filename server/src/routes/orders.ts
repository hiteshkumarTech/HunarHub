import { Router } from 'express';
import { z } from 'zod';
import { Order } from '../models/Order';
import { Service } from '../models/Service';
import { Product } from '../models/Product';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { orderJson } from '../utils/serialize';
import { ApiError } from '../utils/ApiError';

const router = Router();

const createSchema = z.object({
  entrepreneurId: z.string().min(1),
  kind: z.enum(['service', 'product']),
  itemId: z.string().min(1),
  note: z.string().max(500).optional(),
});

// Place a service request or product order (customer)
router.post(
  '/',
  authRequired,
  requireRole('customer'),
  validateBody(createSchema),
  asyncHandler(async (req, res) => {
    const { entrepreneurId, kind, itemId, note } = req.body;
    const model = kind === 'service' ? Service : Product;
    const item = await model.findById(itemId).catch(() => null);
    if (!item || item.entrepreneur.toString() !== entrepreneurId) {
      throw new ApiError(404, 'That item was not found for this entrepreneur');
    }
    const order = await Order.create({
      customer: req.user!.id,
      entrepreneur: entrepreneurId,
      kind,
      item: item._id,
      title: item.name,
      price: item.price,
      note: note ?? '',
    });
    res.status(201).json({ order: orderJson(order) });
  }),
);

// Customer's own orders/requests
router.get(
  '/mine',
  authRequired,
  requireRole('customer'),
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ customer: req.user!.id }).populate('entrepreneur', 'name').sort({ createdAt: -1 });
    res.json({ orders: orders.map(orderJson) });
  }),
);

// Requests coming in to the entrepreneur
router.get(
  '/incoming',
  authRequired,
  requireRole('entrepreneur'),
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ entrepreneur: req.user!.id }).populate('customer', 'name').sort({ createdAt: -1 });
    res.json({ orders: orders.map(orderJson) });
  }),
);

// Entrepreneur accepts / declines / completes a request
router.patch(
  '/:id/status',
  authRequired,
  requireRole('entrepreneur'),
  validateBody(z.object({ status: z.enum(['accepted', 'declined', 'completed']) })),
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).catch(() => null);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.entrepreneur.toString() !== req.user!.id) throw new ApiError(403, 'Not your order');
    order.status = req.body.status;
    await order.save();
    res.json({ order: orderJson(order) });
  }),
);

export default router;
