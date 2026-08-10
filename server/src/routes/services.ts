import { Router } from 'express';
import { z } from 'zod';
import { Service } from '../models/Service';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { upload } from '../middleware/upload';
import { uploadImageBuffer } from '../config/cloudinary';
import { deleteImages } from '../utils/imageGallery';
import { serviceJson } from '../utils/serialize';
import { ApiError } from '../utils/ApiError';

const router = Router();
const FOLDER = 'hunarhub/services';

// A service has one photo slot, not a gallery — a boolean "clear it" flag is
// simpler here than the keepImages mechanism products use for a real gallery.
// Coerced manually because multipart fields always arrive as strings
// ("true"/"false"), where z.coerce.boolean() would treat "false" as truthy.
const removeImageField = z.preprocess((v) => {
  if (v === undefined) return undefined;
  if (typeof v === 'string') return v === 'true';
  return v;
}, z.boolean().optional());

const createSchema = z.object({ name: z.string().min(1), price: z.coerce.number().min(0), dur: z.string().optional() });
const patchSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.coerce.number().min(0).optional(),
  dur: z.string().optional(),
  removeImage: removeImageField,
});

router.post(
  '/',
  authRequired,
  requireRole('entrepreneur'),
  upload.single('image'),
  validateBody(createSchema),
  asyncHandler(async (req, res) => {
    const images = req.file ? [await uploadImageBuffer(req.file.buffer, FOLDER)] : [];
    const service = await Service.create({ ...req.body, images, entrepreneur: req.user!.id });
    res.status(201).json({ service: serviceJson(service) });
  }),
);

router.patch(
  '/:id',
  authRequired,
  requireRole('entrepreneur'),
  upload.single('image'),
  validateBody(patchSchema),
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id).catch(() => null);
    if (!service) throw new ApiError(404, 'Service not found');
    if (service.entrepreneur.toString() !== req.user!.id) throw new ApiError(403, 'Not your listing');

    const { removeImage, ...fields } = req.body as { removeImage?: boolean; name?: string; price?: number; dur?: string };
    Object.assign(service, fields);

    const oldImages = service.images;
    let imagesChanged = false;
    if (req.file) {
      service.set('images', [await uploadImageBuffer(req.file.buffer, FOLDER)]);
      imagesChanged = true;
    } else if (removeImage) {
      service.set('images', []);
      imagesChanged = true;
    }

    await service.save();
    if (imagesChanged) await deleteImages(oldImages);
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
    const images = service.images;
    await service.deleteOne();
    await deleteImages(images);
    res.json({ ok: true });
  }),
);

export default router;
