import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';

// Cloudinary is fully mocked — these tests never make a real network call and
// never need real credentials. uploadImageBuffer returns a deterministic fake
// {url, publicId} pair so assertions can check the exact shape without
// depending on anything Cloudinary actually returns.
let uploadCounter = 0;
vi.mock('../config/cloudinary', () => ({
  isCloudinaryConfigured: true,
  uploadImageBuffer: vi.fn(async (_buffer: Buffer, folder: string) => {
    uploadCounter += 1;
    return { url: `https://mock.cloudinary.test/${folder}/img-${uploadCounter}.jpg`, publicId: `${folder}/img-${uploadCounter}` };
  }),
  deleteImageSafe: vi.fn(async () => {}),
}));

import { createApp } from '../app';
import { connectTestDB, closeTestDB, clearTestDB } from '../test/db';
import { createUser, authHeader } from '../test/fixtures';

const app = createApp();
const jpeg = { filename: 'photo.jpg', contentType: 'image/jpeg' };

beforeAll(connectTestDB);
afterAll(closeTestDB);
beforeEach(() => {
  uploadCounter = 0;
});
beforeEach(clearTestDB);

describe('product image upload — authorization', () => {
  it('rejects a customer trying to create a product with an image', async () => {
    const { token } = await createUser({ email: 'priya@test.local', role: 'customer' });
    const res = await request(app)
      .post('/api/products')
      .set(authHeader(token))
      .field('name', 'Painted Planter')
      .field('price', '320')
      .attach('images', Buffer.from('fake-jpeg-bytes'), jpeg);

    expect(res.status).toBe(403);
  });

  it('rejects a customer trying to attach an image to someone else\'s product', async () => {
    const owner = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const customer = await createUser({ email: 'priya@test.local', role: 'customer' });
    const create = await request(app).post('/api/products').set(authHeader(owner.token)).send({ name: 'Vase', price: 500 });

    const res = await request(app)
      .patch(`/api/products/${create.body.product.id}`)
      .set(authHeader(customer.token))
      .attach('images', Buffer.from('fake-jpeg-bytes'), jpeg);

    expect(res.status).toBe(403);
  });

  it('rejects a different entrepreneur modifying another seller\'s product image', async () => {
    const owner = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const intruder = await createUser({ email: 'sunita@test.local', role: 'entrepreneur' });
    const create = await request(app)
      .post('/api/products')
      .set(authHeader(owner.token))
      .field('name', 'Vase')
      .field('price', '500')
      .attach('images', Buffer.from('fake-jpeg-bytes'), jpeg);
    const originalImages = create.body.product.images;

    const res = await request(app)
      .patch(`/api/products/${create.body.product.id}`)
      .set(authHeader(intruder.token))
      .attach('images', Buffer.from('another-fake-jpeg'), jpeg);
    expect(res.status).toBe(403);

    // Confirm the rejection wasn't just a status-code fluke — image untouched.
    const check = await request(app).get(`/api/entrepreneurs/${owner.user._id}`);
    expect(check.body.products[0].images).toEqual(originalImages);
  });
});

describe('product image upload — happy path + gallery', () => {
  it('lets an entrepreneur add an image to their own product, serialized as {url, publicId}', async () => {
    const { token } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const res = await request(app)
      .post('/api/products')
      .set(authHeader(token))
      .field('name', 'Painted Planter')
      .field('price', '320')
      .attach('images', Buffer.from('fake-jpeg-bytes'), jpeg);

    expect(res.status).toBe(201);
    expect(res.body.product.images).toEqual([{ url: expect.stringContaining('hunarhub/products'), publicId: expect.any(String) }]);
  });

  it('appends a second image on PATCH without touching the first (gallery, cover = first)', async () => {
    const { token } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const create = await request(app)
      .post('/api/products')
      .set(authHeader(token))
      .field('name', 'Vase')
      .field('price', '500')
      .attach('images', Buffer.from('img-1'), jpeg);
    const firstImage = create.body.product.images[0];

    const res = await request(app)
      .patch(`/api/products/${create.body.product.id}`)
      .set(authHeader(token))
      .attach('images', Buffer.from('img-2'), jpeg);

    expect(res.status).toBe(200);
    expect(res.body.product.images).toHaveLength(2);
    expect(res.body.product.images[0]).toEqual(firstImage); // cover unchanged, new one appended
  });

  it('rejects a 5th image beyond the 4-image cap without uploading it', async () => {
    const { token, user } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const create = await request(app)
      .post('/api/products')
      .set(authHeader(token))
      .field('name', 'Vase')
      .field('price', '500')
      .attach('images', Buffer.from('1'), jpeg)
      .attach('images', Buffer.from('2'), jpeg)
      .attach('images', Buffer.from('3'), jpeg)
      .attach('images', Buffer.from('4'), jpeg);
    expect(create.body.product.images).toHaveLength(4);

    const res = await request(app)
      .patch(`/api/products/${create.body.product.id}`)
      .set(authHeader(token))
      .attach('images', Buffer.from('5'), jpeg);

    expect(res.status).toBe(422);
    // Untouched — still exactly 4, the 5th was never persisted.
    const check = await request(app).get(`/api/entrepreneurs/${user._id}`);
    expect(check.body.products[0].images).toHaveLength(4);
  });

  it('removes a specific image via keepImages without touching the others', async () => {
    const { token } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const create = await request(app)
      .post('/api/products')
      .set(authHeader(token))
      .field('name', 'Vase')
      .field('price', '500')
      .attach('images', Buffer.from('1'), jpeg)
      .attach('images', Buffer.from('2'), jpeg);
    const [first, second] = create.body.product.images;

    const res = await request(app)
      .patch(`/api/products/${create.body.product.id}`)
      .set(authHeader(token))
      .field('keepImages', JSON.stringify([second.publicId]));

    expect(res.status).toBe(200);
    expect(res.body.product.images).toEqual([second]);
    expect(res.body.product.images).not.toContainEqual(first);
  });

  it('leaves images completely untouched on a text-only edit (no image fields sent)', async () => {
    const { token } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const create = await request(app)
      .post('/api/products')
      .set(authHeader(token))
      .field('name', 'Vase')
      .field('price', '500')
      .attach('images', Buffer.from('1'), jpeg);

    const res = await request(app).patch(`/api/products/${create.body.product.id}`).set(authHeader(token)).send({ price: 600 });

    expect(res.status).toBe(200);
    expect(res.body.product.price).toBe(600);
    expect(res.body.product.images).toEqual(create.body.product.images);
  });

  it('cleans up Cloudinary images when the listing itself is deleted', async () => {
    const cloudinary = await import('../config/cloudinary');
    const { token } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const create = await request(app)
      .post('/api/products')
      .set(authHeader(token))
      .field('name', 'Vase')
      .field('price', '500')
      .attach('images', Buffer.from('1'), jpeg);

    const del = await request(app).delete(`/api/products/${create.body.product.id}`).set(authHeader(token));
    expect(del.status).toBe(200);
    expect(cloudinary.deleteImageSafe).toHaveBeenCalledWith(create.body.product.images[0].publicId);
  });
});

describe('image validation', () => {
  it('rejects an unsupported file type with a human-readable error', async () => {
    const { token } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const res = await request(app)
      .post('/api/products')
      .set(authHeader(token))
      .field('name', 'Vase')
      .field('price', '500')
      .attach('images', Buffer.from('not an image'), { filename: 'notes.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/JPEG|PNG|WebP|AVIF/i);
  });

  it('rejects an oversized image', async () => {
    const { token } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const oversized = Buffer.alloc(6 * 1024 * 1024); // 6MB > the 5MB limit
    const res = await request(app)
      .post('/api/products')
      .set(authHeader(token))
      .field('name', 'Vase')
      .field('price', '500')
      .attach('images', oversized, jpeg);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/large/i);
  });
});

describe('service image (single slot)', () => {
  it('creates a service with one image', async () => {
    const { token } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const res = await request(app)
      .post('/api/services')
      .set(authHeader(token))
      .field('name', 'Custom Pot')
      .field('price', '250')
      .attach('image', Buffer.from('img'), jpeg);

    expect(res.status).toBe(201);
    expect(res.body.service.images).toHaveLength(1);
  });

  it('replaces the image on PATCH and cleans up the old one', async () => {
    const cloudinary = await import('../config/cloudinary');
    const { token } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const create = await request(app)
      .post('/api/services')
      .set(authHeader(token))
      .field('name', 'Custom Pot')
      .field('price', '250')
      .attach('image', Buffer.from('img-1'), jpeg);
    const oldPublicId = create.body.service.images[0].publicId;

    const res = await request(app)
      .patch(`/api/services/${create.body.service.id}`)
      .set(authHeader(token))
      .attach('image', Buffer.from('img-2'), jpeg);

    expect(res.status).toBe(200);
    expect(res.body.service.images).toHaveLength(1);
    expect(res.body.service.images[0].publicId).not.toBe(oldPublicId);
    expect(cloudinary.deleteImageSafe).toHaveBeenCalledWith(oldPublicId);
  });

  it('clears the image via removeImage without a new file', async () => {
    const { token } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const create = await request(app)
      .post('/api/services')
      .set(authHeader(token))
      .field('name', 'Custom Pot')
      .field('price', '250')
      .attach('image', Buffer.from('img'), jpeg);

    const res = await request(app)
      .patch(`/api/services/${create.body.service.id}`)
      .set(authHeader(token))
      .field('removeImage', 'true');

    expect(res.status).toBe(200);
    expect(res.body.service.images).toEqual([]);
  });
});

describe('backward compatibility', () => {
  it('serializes a legacy single `image` string field as a one-item gallery', async () => {
    const { Product } = await import('../models/Product');
    const { user } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    // Simulate a pre-Cloudinary document that only has the old `image` string field.
    const legacy = await Product.create({ name: 'Old Vase', price: 400, entrepreneur: user._id, image: 'https://picsum.photos/seed/old/500/500' });

    const res = await request(app).get(`/api/entrepreneurs/${user._id}`);
    const found = res.body.products.find((p: { id: string }) => p.id === legacy._id.toString());
    expect(found.images).toEqual([{ url: 'https://picsum.photos/seed/old/500/500', publicId: null }]);
  });
});
