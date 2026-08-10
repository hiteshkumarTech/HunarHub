import { uploadImageBuffer, deleteImageSafe, type UploadedImage } from '../config/cloudinary';
import { ApiError } from './ApiError';

/**
 * Shared "what should this listing's image set become" logic for both
 * services (max 1) and products (max 4).
 *
 * Semantics (see ROADMAP.md / DEPLOY-CHECKLIST.md for the product rationale):
 * - `keepPublicIds` omitted entirely  → keep every current image untouched,
 *   just append any new uploads. A plain text-only edit (no image fields at
 *   all) never touches images because this function isn't even called then.
 * - `keepPublicIds` provided          → current images are pruned to exactly
 *   that set first, then new uploads are appended. This is how a seller
 *   removes or replaces an image: omit its publicId from the list they send.
 *
 * Uploads new files first, but the count check happens BEFORE any upload —
 * a request that would exceed the cap is rejected without wasting an upload.
 * Cloudinary deletes for images that got dropped are the caller's job, run
 * only after the DB save succeeds (see each route) — never before.
 */
export async function resolveImageUpdate({
  current,
  keepPublicIds,
  newFiles,
  maxCount,
  folder,
}: {
  current: UploadedImage[];
  keepPublicIds: string[] | undefined;
  newFiles: Express.Multer.File[];
  maxCount: number;
  folder: string;
}): Promise<{ images: UploadedImage[]; toDelete: UploadedImage[] }> {
  const kept = keepPublicIds ? current.filter((img) => keepPublicIds.includes(img.publicId)) : current;

  if (kept.length + newFiles.length > maxCount) {
    throw new ApiError(422, `Too many images — ${maxCount} maximum for this listing.`);
  }

  const uploaded = await Promise.all(newFiles.map((f) => uploadImageBuffer(f.buffer, folder)));
  const images = [...kept, ...uploaded];
  const toDelete = current.filter((img) => !kept.some((k) => k.publicId === img.publicId));
  return { images, toDelete };
}

/** Best-effort cleanup after a successful save — never lets a Cloudinary hiccup surface as an API error. */
export async function deleteImages(images: UploadedImage[]): Promise<void> {
  await Promise.all(images.map((img) => deleteImageSafe(img.publicId)));
}
