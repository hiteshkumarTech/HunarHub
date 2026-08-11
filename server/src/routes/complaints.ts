import { Router } from 'express';
import { z } from 'zod';
import { Complaint } from '../models/Complaint';
import { Order } from '../models/Order';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { complaintJson } from '../utils/serialize';
import { ApiError } from '../utils/ApiError';

const router = Router();

const createSchema = z.object({
  subject: z.string().min(1).max(120),
  message: z.string().min(1).max(2000),
  orderId: z.string().min(1).optional(),
});

// POST /api/complaints — either party to an order (customer or entrepreneur)
// can report an issue with it; a complaint not tied to an order (general
// feedback about a seller, say) is also allowed. Ownership is enforced
// server-side: you can only reference an order you're actually a party to.
router.post(
  '/',
  authRequired,
  validateBody(createSchema),
  asyncHandler(async (req, res) => {
    const { subject, message, orderId } = req.body;

    if (orderId) {
      const order = await Order.findById(orderId).catch(() => null);
      if (!order) throw new ApiError(404, 'Order not found');
      const isParty = order.customer.toString() === req.user!.id || order.entrepreneur.toString() === req.user!.id;
      if (!isParty) throw new ApiError(403, 'You can only report an issue on your own order');
    }

    const complaint = await Complaint.create({
      reporter: req.user!.id,
      order: orderId || undefined,
      subject,
      message,
    });
    res.status(201).json({ complaint: complaintJson(complaint) });
  }),
);

// GET /api/complaints/mine — the signed-in user's own reports.
router.get(
  '/mine',
  authRequired,
  asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({ reporter: req.user!.id }).sort({ createdAt: -1 }).lean();
    res.json({ complaints: complaints.map(complaintJson) });
  }),
);

export default router;
