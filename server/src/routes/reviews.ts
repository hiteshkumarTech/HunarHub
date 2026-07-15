import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { reviewJson } from '../utils/serialize';
import { ApiError } from '../utils/ApiError';

const router = Router();

async function recomputeRating(entrepreneurId: string) {
  const agg = await Review.aggregate([
    { $match: { entrepreneur: new mongoose.Types.ObjectId(entrepreneurId) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg = agg[0]?.avg ?? 0;
  const count = agg[0]?.count ?? 0;
  await User.findByIdAndUpdate(entrepreneurId, {
    $set: { 'profile.ratingAvg': Math.round(avg * 10) / 10, 'profile.ratingCount': count },
  });
}

const schema = z.object({
  entrepreneurId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).optional(),
});

// Create or update the caller's review for an entrepreneur (customer)
router.post(
  '/',
  authRequired,
  requireRole('customer'),
  validateBody(schema),
  asyncHandler(async (req, res) => {
    const { entrepreneurId, rating, text } = req.body;
    const ent = await User.findOne({ _id: entrepreneurId, role: 'entrepreneur' }).catch(() => null);
    if (!ent) throw new ApiError(404, 'Entrepreneur not found');

    const review = await Review.findOneAndUpdate(
      { entrepreneur: entrepreneurId, customer: req.user!.id },
      { $set: { rating, text: text ?? '' } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    await recomputeRating(entrepreneurId);
    res.status(201).json({ review: reviewJson(review) });
  }),
);

// Public list of an entrepreneur's reviews
router.get(
  '/entrepreneur/:id',
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ entrepreneur: req.params.id })
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .catch(() => []);
    res.json({ reviews: reviews.map(reviewJson) });
  }),
);

export default router;
