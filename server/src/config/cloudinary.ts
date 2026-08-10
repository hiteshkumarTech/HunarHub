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
  publicId: string;
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
        if (err || !result) return reject(err ?? new Error('Cloudinary upload returned no result'));
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
