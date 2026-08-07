import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { connectTestDB, closeTestDB, clearTestDB } from '../test/db';
import { createUser, authHeader } from '../test/fixtures';

const app = createApp();

beforeAll(connectTestDB);
afterAll(closeTestDB);
beforeEach(clearTestDB);

describe('admin role authorization', () => {
  it('rejects an unauthenticated request', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('rejects a customer', async () => {
    const { token } = await createUser({ email: 'priya@test.local', role: 'customer' });
    const res = await request(app).get('/api/admin/stats').set(authHeader(token));
    expect(res.status).toBe(403);
  });

  it('rejects an entrepreneur', async () => {
    const { token } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const res = await request(app).get('/api/admin/stats').set(authHeader(token));
    expect(res.status).toBe(403);
  });

  it('allows an admin', async () => {
    const { token } = await createUser({ email: 'admin@test.local', role: 'admin' });
    const res = await request(app).get('/api/admin/stats').set(authHeader(token));
    expect(res.status).toBe(200);
  });

  it('rejects a customer trying to delete a listing via the admin route', async () => {
    const seller = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const service = await request(app)
      .post('/api/services')
      .set(authHeader(seller.token))
      .send({ name: 'Custom Pot', price: 250 });
    const { token } = await createUser({ email: 'priya@test.local', role: 'customer' });

    const res = await request(app).delete(`/api/admin/services/${service.body.service.id}`).set(authHeader(token));
    expect(res.status).toBe(403);
  });
});

describe('GET /api/admin/stats', () => {
  it('reflects real counts, not fabricated numbers', async () => {
    await createUser({ email: 'admin@test.local', role: 'admin' });
    await createUser({ email: 'priya@test.local', role: 'customer' });
    const seller = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur', profile: { available: true } });
    await request(app).post('/api/services').set(authHeader(seller.token)).send({ name: 'Custom Pot', price: 250 });

    const admin = await createUser({ email: 'admin2@test.local', role: 'admin' });
    const res = await request(app).get('/api/admin/stats').set(authHeader(admin.token));

    expect(res.status).toBe(200);
    expect(res.body.stats.customers).toBe(1);
    expect(res.body.stats.entrepreneurs).toBe(1);
    expect(res.body.stats.admins).toBe(2); // the seeded admin + the one making the request
    expect(res.body.stats.totalListings).toBe(1);
    expect(res.body.stats.activeListings).toBe(1); // seller.profile.available === true
    expect(res.body.stats.totalUsers).toBe(4);
  });
});

describe('GET /api/admin/users', () => {
  it('lists every role and supports a role filter', async () => {
    const admin = await createUser({ email: 'admin@test.local', role: 'admin' });
    await createUser({ email: 'priya@test.local', role: 'customer' });
    await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });

    const all = await request(app).get('/api/admin/users').set(authHeader(admin.token));
    expect(all.body.total).toBe(3);

    const entrepreneursOnly = await request(app).get('/api/admin/users?role=entrepreneur').set(authHeader(admin.token));
    expect(entrepreneursOnly.body.total).toBe(1);
    expect(entrepreneursOnly.body.users[0].email).toBe('ramesh@test.local');
  });
});

describe('GET /api/admin/listings + DELETE moderation', () => {
  it('lists listings across every seller and lets admin remove one', async () => {
    const seller = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const service = await request(app)
      .post('/api/services')
      .set(authHeader(seller.token))
      .send({ name: 'Custom Pot', price: 250 });
    const admin = await createUser({ email: 'admin@test.local', role: 'admin' });

    const list = await request(app).get('/api/admin/listings').set(authHeader(admin.token));
    expect(list.body.total).toBe(1);
    expect(list.body.listings[0].entrepreneur.name).toBe('Test User');

    const del = await request(app)
      .delete(`/api/admin/services/${service.body.service.id}`)
      .set(authHeader(admin.token));
    expect(del.status).toBe(200);

    const after = await request(app).get('/api/admin/listings').set(authHeader(admin.token));
    expect(after.body.total).toBe(0);
  });
});

describe('PATCH /api/admin/entrepreneurs/:id/verify', () => {
  it('toggles verification', async () => {
    const seller = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const admin = await createUser({ email: 'admin@test.local', role: 'admin' });

    const res = await request(app)
      .patch(`/api/admin/entrepreneurs/${seller.user._id}/verify`)
      .set(authHeader(admin.token))
      .send({ verified: true });

    expect(res.status).toBe(200);
    expect(res.body.entrepreneur.verified).toBe(true);
  });
});
