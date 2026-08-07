import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { connectTestDB, closeTestDB, clearTestDB } from '../test/db';
import { createUser, authHeader } from '../test/fixtures';

const app = createApp();

beforeAll(connectTestDB);
afterAll(closeTestDB);
beforeEach(clearTestDB);

describe('service listing ownership', () => {
  it('lets an entrepreneur create a service', async () => {
    const { token } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const res = await request(app)
      .post('/api/services')
      .set(authHeader(token))
      .send({ name: 'Custom Pot', price: 250, dur: '3 days' });

    expect(res.status).toBe(201);
    expect(res.body.service.name).toBe('Custom Pot');
  });

  it('rejects a customer trying to create a service', async () => {
    const { token } = await createUser({ email: 'priya@test.local', role: 'customer' });
    const res = await request(app).post('/api/services').set(authHeader(token)).send({ name: 'Custom Pot', price: 250 });
    expect(res.status).toBe(403);
  });

  it('rejects an unauthenticated create', async () => {
    const res = await request(app).post('/api/services').send({ name: 'Custom Pot', price: 250 });
    expect(res.status).toBe(401);
  });

  it('lets the owning entrepreneur edit their own service', async () => {
    const { token } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const create = await request(app).post('/api/services').set(authHeader(token)).send({ name: 'Custom Pot', price: 250 });

    const res = await request(app)
      .patch(`/api/services/${create.body.service.id}`)
      .set(authHeader(token))
      .send({ price: 300 });

    expect(res.status).toBe(200);
    expect(res.body.service.price).toBe(300);
  });

  it('blocks a different entrepreneur from editing someone else\'s service', async () => {
    const owner = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const intruder = await createUser({ email: 'sunita@test.local', role: 'entrepreneur' });
    const create = await request(app)
      .post('/api/services')
      .set(authHeader(owner.token))
      .send({ name: 'Custom Pot', price: 250 });

    const res = await request(app)
      .patch(`/api/services/${create.body.service.id}`)
      .set(authHeader(intruder.token))
      .send({ price: 1 });

    expect(res.status).toBe(403);
  });

  it('blocks a different entrepreneur from deleting someone else\'s service', async () => {
    const owner = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const intruder = await createUser({ email: 'sunita@test.local', role: 'entrepreneur' });
    const create = await request(app)
      .post('/api/services')
      .set(authHeader(owner.token))
      .send({ name: 'Custom Pot', price: 250 });

    const del = await request(app).delete(`/api/services/${create.body.service.id}`).set(authHeader(intruder.token));
    expect(del.status).toBe(403);

    // Confirm it's actually still there — the rejection wasn't just a status-code fluke.
    const stillThere = await request(app).get(`/api/entrepreneurs/${owner.user._id}`);
    expect(stillThere.body.services).toHaveLength(1);
  });

  it('lets the owner delete their own service', async () => {
    const { token, user } = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const create = await request(app).post('/api/services').set(authHeader(token)).send({ name: 'Custom Pot', price: 250 });

    const del = await request(app).delete(`/api/services/${create.body.service.id}`).set(authHeader(token));
    expect(del.status).toBe(200);

    const profile = await request(app).get(`/api/entrepreneurs/${user._id}`);
    expect(profile.body.services).toHaveLength(0);
  });
});

describe('product listing ownership', () => {
  it('blocks a different entrepreneur from deleting someone else\'s product', async () => {
    const owner = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const intruder = await createUser({ email: 'sunita@test.local', role: 'entrepreneur' });
    const create = await request(app)
      .post('/api/products')
      .set(authHeader(owner.token))
      .send({ name: 'Painted Planter', price: 320 });

    const del = await request(app).delete(`/api/products/${create.body.product.id}`).set(authHeader(intruder.token));
    expect(del.status).toBe(403);
  });
});
