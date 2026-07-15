import { Router } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { productJson } from '../utils/serialize';
import { ApiError } from '../utils/ApiError';

const router = Router();
const schema = z.object({ name: z.string().min(1), price: z.number().min(0), image: z.string().optional() });

router.post(
  '/',
  authRequired,
  requireRole('entrepreneur'),
  validateBody(schema),
  asyncHandler(async (req, res) => {
    const product = await Product.create({ ...req.body, entrepreneur: req.user!.id });
    res.status(201).json({ product: productJson(product) });
  }),
);

router.patch(
  '/:id',
  authRequired,
  requireRole('entrepreneur'),
  validateBody(schema.partial()),
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).catch(() => null);
    if (!product) throw new ApiError(404, 'Product not found');
    if (product.entrepreneur.toString() !== req.user!.id) throw new ApiError(403, 'Not your listing');
    Object.assign(product, req.body);
    await product.save();
    res.json({ product: productJson(product) });
  }),
);

router.delete(
  '/:id',
  authRequired,
  requireRole('entrepreneur'),
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).catch(() => null);
    if (!product) throw new ApiError(404, 'Product not found');
    if (product.entrepreneur.toString() !== req.user!.id) throw new ApiError(403, 'Not your listing');
    await product.deleteOne();
    res.json({ ok: true });
  }),
);

export default router;
