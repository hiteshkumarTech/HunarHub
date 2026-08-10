import { Router } from 'express';
import { z } from 'zod';
import { Product, PRODUCT_MAX_IMAGES } from '../models/Product';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { upload } from '../middleware/upload';
import { resolveImageUpdate, deleteImages } from '../utils/imageGallery';
import { productJson } from '../utils/serialize';
import { ApiError } from '../utils/ApiError';

const router = Router();
const FOLDER = 'hunarhub/products';

const createSchema = z.object({ name: z.string().min(1), price: z.coerce.number().min(0) });
const patchSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.coerce.number().min(0).optional(),
  // JSON-encoded array of image publicIds to retain — omit entirely to leave
  // the current gallery untouched (see utils/imageGallery.ts for the full
  // semantics). Only meaningful alongside a multipart request.
  keepImages: z.string().optional(),
});

function parseKeepImages(raw: string | undefined): string[] | undefined {
  if (raw === undefined) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every((x) => typeof x === 'string')) throw new Error();
    return parsed;
  } catch {
    throw new ApiError(422, 'Invalid keepImages value.');
  }
}

router.post(
  '/',
  authRequired,
  requireRole('entrepreneur'),
  upload.array('images', PRODUCT_MAX_IMAGES),
  validateBody(createSchema),
  asyncHandler(async (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const { images } = await resolveImageUpdate({
      current: [],
      keepPublicIds: undefined,
      newFiles: files,
      maxCount: PRODUCT_MAX_IMAGES,
      folder: FOLDER,
    });
    const product = await Product.create({ ...req.body, images, entrepreneur: req.user!.id });
    res.status(201).json({ product: productJson(product) });
  }),
);

router.patch(
  '/:id',
  authRequired,
  requireRole('entrepreneur'),
  upload.array('images', PRODUCT_MAX_IMAGES),
  validateBody(patchSchema),
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).catch(() => null);
    if (!product) throw new ApiError(404, 'Product not found');
    if (product.entrepreneur.toString() !== req.user!.id) throw new ApiError(403, 'Not your listing');

    const { keepImages, ...fields } = req.body as { keepImages?: string; name?: string; price?: number };
    Object.assign(product, fields);

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (keepImages !== undefined || files.length > 0) {
      const keepPublicIds = parseKeepImages(keepImages);
      const { images, toDelete } = await resolveImageUpdate({
        current: product.images,
        keepPublicIds,
        newFiles: files,
        maxCount: PRODUCT_MAX_IMAGES,
        folder: FOLDER,
      });
      product.set('images', images);
      // Once a seller actively manages the gallery, the new `images` array
      // fully owns image state — clear the legacy field so productJson's
      // backward-compat fallback (see serialize.ts) can't resurrect an old
      // placeholder after it was deliberately replaced or removed here.
      product.set('image', '');
      await product.save();
      await deleteImages(toDelete);
    } else {
      await product.save();
    }

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
    const images = product.images;
    await product.deleteOne();
    await deleteImages(images);
    res.json({ ok: true });
  }),
);

export default router;
