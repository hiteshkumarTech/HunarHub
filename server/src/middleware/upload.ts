import multer from 'multer';
import { ApiError } from '../utils/ApiError';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB — plenty for a listing photo, small enough to stay fast.
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

/**
 * Shared multer instance — memory storage only (no temp files on disk; the
 * buffer goes straight to Cloudinary and is discarded). Use `.single('image')`
 * for services (one slot) or `.array('images', 4)` for products (a gallery).
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new ApiError(400, 'Only JPEG, PNG, WebP, or AVIF images are allowed.'));
      return;
    }
    cb(null, true);
  },
});

/** Multer's own errors (e.g. file too large) need translating into our error shape. */
export function isMulterSizeError(err: unknown): boolean {
  return err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE';
}
