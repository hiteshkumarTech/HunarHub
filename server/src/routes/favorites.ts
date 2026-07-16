import { Router } from 'express';
import { z } from 'zod';
import { Favorite } from '../models/Favorite';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { entrepreneurCard } from '../utils/serialize';
import { ApiError } from '../utils/ApiError';

const router = Router();

// Wishlist is a customer feature.
router.use(authRequired, requireRole('customer'));

// GET /api/favorites — the caller's saved entrepreneurs as full cards.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const favs = await Favorite.find({ user: req.user!.id }).sort({ createdAt: -1 }).populate('entrepreneur');
    const entrepreneurs = favs
      .map((f) => f.entrepreneur as unknown as { role?: string })
      .filter((e) => e && e.role === 'entrepreneur')
      .map((e) => entrepreneurCard(e));
    res.json({ entrepreneurs });
  }),
);

// POST /api/favorites { entrepreneurId } — idempotent add.
router.post(
  '/',
  validateBody(z.object({ entrepreneurId: z.string().min(1) })),
  asyncHandler(async (req, res) => {
    const { entrepreneurId } = req.body;
    const ent = await User.findOne({ _id: entrepreneurId, role: 'entrepreneur' }).catch(() => null);
    if (!ent) throw new ApiError(404, 'Entrepreneur not found');
    await Favorite.updateOne(
      { user: req.user!.id, entrepreneur: entrepreneurId },
      { $setOnInsert: { user: req.user!.id, entrepreneur: entrepreneurId } },
      { upsert: true },
    );
    res.status(201).json({ ok: true });
  }),
);

// DELETE /api/favorites/:entrepreneurId — idempotent remove.
router.delete(
  '/:entrepreneurId',
  asyncHandler(async (req, res) => {
    await Favorite.deleteOne({ user: req.user!.id, entrepreneur: req.params.entrepreneurId });
    res.json({ ok: true });
  }),
);

export default router;
