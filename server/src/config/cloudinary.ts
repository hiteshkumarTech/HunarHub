import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import { ApiError } from '../utils/ApiError';

export const isCloudinaryConfigured = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret,
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

export interface UploadedImage {
  url: string;
  // Nullable/optional to match the stored/DB shape (Product/Service
  // `images`), which includes legacy/placeholder entries with no real
  // Cloudinary asset. A fresh call to uploadImageBuffer() below always
  // resolves a real string — this only widens the type for compatibility
  // with values read back out of the database via Mongoose's own inferred
  // subdocument type, not a change in what a successful upload returns.
  publicId?: string | null;
}

/** Upload one in-memory image buffer to Cloudinary under an organised folder. */
export function uploadImageBuffer(buffer: Buffer, folder: string): Promise<UploadedImage> {
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, 'Image uploads are not configured on this server yet.');
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err || !result) {
          // A file that passes our own MIME-type/size filter can still fail
          // here — e.g. correctly-typed bytes that aren't actually a
          // decodable image. That's a client input problem, not a server
          // crash, so it must not fall through to a raw 500. Log the real
          // Cloudinary error for diagnosability; never expose it to the caller.
          console.error('[cloudinary] Upload rejected:', err ?? 'no result returned');
          return reject(new ApiError(422, 'Could not process this image — the file may be corrupted or in an unsupported format.'));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

/**
 * Best-effort delete — never throws. Cloudinary cleanup running after a
 * successful DB write is a nice-to-have; a failure here must never surface as
 * an API error or roll back data that's already correctly saved (see
 * ROADMAP.md: prefer data correctness over aggressive cleanup).
 */
export async function deleteImageSafe(publicId: string | null | undefined): Promise<void> {
  if (!publicId || !isCloudinaryConfigured) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`[cloudinary] Failed to delete orphaned asset "${publicId}":`, err);
  }
}
