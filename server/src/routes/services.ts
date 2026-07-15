import { Router } from 'express';
import { z } from 'zod';
import { Service } from '../models/Service';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { serviceJson } from '../utils/serialize';
import { ApiError } from '../utils/ApiError';

const router = Router();
const schema = z.object({ name: z.string().min(1), price: z.number().min(0), dur: z.string().optional() });

router.post(
  '/',
  authRequired,
  requireRole('entrepreneur'),
  validateBody(schema),
  asyncHandler(async (req, res) => {
    const service = await Service.create({ ...req.body, entrepreneur: req.user!.id });
    res.status(201).json({ service: serviceJson(service) });
  }),
);

router.patch(
  '/:id',
  authRequired,
  requireRole('entrepreneur'),
  validateBody(schema.partial()),
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id).catch(() => null);
    if (!service) throw new ApiError(404, 'Service not found');
    if (service.entrepreneur.toString() !== req.user!.id) throw new ApiError(403, 'Not your listing');
    Object.assign(service, req.body);
    await service.save();
    res.json({ service: serviceJson(service) });
  }),
);

router.delete(
  '/:id',
  authRequired,
  requireRole('entrepreneur'),
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id).catch(() => null);
    if (!service) throw new ApiError(404, 'Service not found');
    if (service.entrepreneur.toString() !== req.user!.id) throw new ApiError(403, 'Not your listing');
    await service.deleteOne();
    res.json({ ok: true });
  }),
);

export default router;
