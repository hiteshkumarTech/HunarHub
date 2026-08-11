import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { connectTestDB, closeTestDB, clearTestDB } from '../test/db';
import { createUser, authHeader } from '../test/fixtures';

const app = createApp();

beforeAll(connectTestDB);
afterAll(closeTestDB);
beforeEach(clearTestDB);

async function seedTwoSellersWithListings() {
  const jaipurPotter = await createUser({
    name: 'Jaipur Potter',
    email: 'jaipur@test.local',
    role: 'entrepreneur',
    profile: { category: 'potter', city: 'Jaipur', state: 'Rajasthan' },
  });
  const mumbaiTailor = await createUser({
    name: 'Mumbai Tailor',
    email: 'mumbai@test.local',
    role: 'entrepreneur',
    profile: { category: 'tailor', city: 'Mumbai', state: 'Maharashtra' },
  });

  await request(app).post('/api/products').set(authHeader(jaipurPotter.token)).send({ name: 'Clay Pot', price: 200 });
  await request(app).post('/api/services').set(authHeader(mumbaiTailor.token)).send({ name: 'Blouse Stitching', price: 500 });

  return { jaipurPotter, mumbaiTailor };
}

describe('GET /api/listings — marketplace discovery', () => {
  it('returns listings from every seller by default, merged and public', async () => {
    await seedTwoSellersWithListings();
    const res = await request(app).get('/api/listings');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    // No auth required — this is the public marketplace.
    const names = res.body.listings.map((l: { name: string }) => l.name);
    expect(names).toEqual(expect.arrayContaining(['Clay Pot', 'Blouse Stitching']));
  });

  it('filters by category (resolved via the owning entrepreneur)', async () => {
    await seedTwoSellersWithListings();
    const res = await request(app).get('/api/listings?cat=potter');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.listings[0].name).toBe('Clay Pot');
    expect(res.body.listings[0].entrepreneur.category).toBe('potter');
  });

  it('filters by location (city)', async () => {
    await seedTwoSellersWithListings();
    const res = await request(app).get('/api/listings?city=Mumbai');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.listings[0].name).toBe('Blouse Stitching');
  });

  it('filters by price range', async () => {
    await seedTwoSellersWithListings();
    const res = await request(app).get('/api/listings?minPrice=300&maxPrice=1000');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.listings[0].name).toBe('Blouse Stitching');
  });

  it('filters by kind (products only)', async () => {
    await seedTwoSellersWithListings();
    const res = await request(app).get('/api/listings?kind=product');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.listings[0].kind).toBe('product');
  });

  it('searches by listing name', async () => {
    await seedTwoSellersWithListings();
    const res = await request(app).get('/api/listings?q=blouse');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.listings[0].name).toBe('Blouse Stitching');
  });

  it('returns an empty page (not an error) when no seller matches the location filter', async () => {
    await seedTwoSellersWithListings();
    const res = await request(app).get('/api/listings?city=Nowhereville');
    expect(res.status).toBe(200);
    expect(res.body.listings).toEqual([]);
    expect(res.body.total).toBe(0);
  });
});

describe('GET /api/entrepreneurs — location filter', () => {
  it('filters entrepreneurs by city', async () => {
    await seedTwoSellersWithListings();
    const res = await request(app).get('/api/entrepreneurs?city=Jaipur');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.entrepreneurs[0].name).toBe('Jaipur Potter');
  });
});

describe('availability control', () => {
  it('lets an entrepreneur change their own availability', async () => {
    const { token } = await createUser({ email: 'seller@test.local', role: 'entrepreneur', profile: { available: true } });
    const res = await request(app).patch('/api/entrepreneurs/me').set(authHeader(token)).send({ available: false });
    expect(res.status).toBe(200);
    expect(res.body.user.profile.available).toBe(false);
  });

  it('blocks a customer from changing entrepreneur availability', async () => {
    const { token } = await createUser({ email: 'buyer@test.local', role: 'customer' });
    const res = await request(app).patch('/api/entrepreneurs/me').set(authHeader(token)).send({ available: false });
    expect(res.status).toBe(403);
  });
});
