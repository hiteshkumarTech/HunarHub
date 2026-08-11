import { Router } from 'express';
import { Category } from '../models/Category';
import { asyncHandler } from '../utils/asyncHandler';
import { categoryJson } from '../utils/serialize';

const router = Router();

// GET /api/categories — public. Registration's category picker and the
// Browse/Marketplace category filter both read from here instead of a
// compiled-in list, so an admin renaming/deactivating a category actually
// takes effect without a redeploy.
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await Category.find().sort({ id: 1 }).lean();
    res.json({ categories: categories.map(categoryJson) });
  }),
);

export default router;
