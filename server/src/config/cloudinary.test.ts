import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks the Cloudinary SDK itself (not our own wrapper) so uploadImageBuffer's
// real error-handling logic actually runs — this is what regressed the raw
// 500 found during M9 production verification: a file that passes our own
// MIME-type filter but that Cloudinary itself rejects (not a decodable image)
// must surface as a clean 4xx, never an unhandled error.
let uploadStreamCallback: ((err: unknown, result: unknown) => void) | null = null;
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn((_opts: unknown, cb: (err: unknown, result: unknown) => void) => {
        uploadStreamCallback = cb;
        return { end: vi.fn() };
      }),
      destroy: vi.fn(),
    },
  },
}));

async function freshUploadImageBuffer() {
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
  process.env.CLOUDINARY_API_KEY = 'test-key';
  process.env.CLOUDINARY_API_SECRET = 'test-secret';
  vi.resetModules();
  const mod = await import('./cloudinary');
  return mod.uploadImageBuffer;
}

beforeEach(() => {
  uploadStreamCallback = null;
});

describe('uploadImageBuffer error handling', () => {
  it('converts a Cloudinary-side upload rejection into a clean ApiError(422), not a raw crash', async () => {
    const uploadImageBuffer = await freshUploadImageBuffer();
    const pending = uploadImageBuffer(Buffer.from('not-a-real-image'), 'hunarhub/products');

    // Simulate Cloudinary rejecting content that passed our own MIME check
    // but isn't actually a decodable image — this is exactly what happened
    // against production with a hand-crafted test file.
    uploadStreamCallback!(new Error('Invalid image file'), null);

    // Note: not asserting `instanceof ApiError` here — vi.resetModules() gives
    // the freshly-imported module its own ApiError class identity, so a
    // same-class instanceof check would be a false negative even though the
    // rejection genuinely is one (the structural shape below is what matters).
    await expect(pending).rejects.toMatchObject({ status: 422, message: expect.stringMatching(/corrupted|unsupported/i) });
  });

  it('still resolves normally on a successful upload', async () => {
    const uploadImageBuffer = await freshUploadImageBuffer();
    const pending = uploadImageBuffer(Buffer.from('real-image-bytes'), 'hunarhub/products');
    uploadStreamCallback!(null, { secure_url: 'https://res.cloudinary.com/x/y.jpg', public_id: 'hunarhub/products/y' });
    await expect(pending).resolves.toEqual({ url: 'https://res.cloudinary.com/x/y.jpg', publicId: 'hunarhub/products/y' });
  });
});
