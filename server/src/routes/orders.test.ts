import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { connectTestDB, closeTestDB, clearTestDB } from '../test/db';
import { createUser, authHeader } from '../test/fixtures';

const app = createApp();

beforeAll(connectTestDB);
afterAll(closeTestDB);
beforeEach(clearTestDB);

async function seedOrder() {
  const seller = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
  const customer = await createUser({ email: 'priya@test.local', role: 'customer' });
  const service = await request(app)
    .post('/api/services')
    .set(authHeader(seller.token))
    .send({ name: 'Custom Pot', price: 250, dur: '3 days' });

  const order = await request(app)
    .post('/api/orders')
    .set(authHeader(customer.token))
    .send({ entrepreneurId: seller.user._id.toString(), kind: 'service', itemId: service.body.service.id });

  return { seller, customer, service, order };
}

describe('POST /api/orders', () => {
  it('lets a customer place a valid order', async () => {
    const { order } = await seedOrder();
    expect(order.status).toBe(201);
    expect(order.body.order.status).toBe('pending');
    expect(order.body.order.price).toBe(250);
  });

  it('rejects an entrepreneur trying to place an order (wrong role)', async () => {
    const seller = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const service = await request(app)
      .post('/api/services')
      .set(authHeader(seller.token))
      .send({ name: 'Custom Pot', price: 250 });
    const other = await createUser({ email: 'gopal@test.local', role: 'entrepreneur' });

    const res = await request(app)
      .post('/api/orders')
      .set(authHeader(other.token))
      .send({ entrepreneurId: seller.user._id.toString(), kind: 'service', itemId: service.body.service.id });

    expect(res.status).toBe(403);
  });

  it('rejects an order for an item that does not belong to the named entrepreneur', async () => {
    const seller = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const decoy = await createUser({ email: 'gopal@test.local', role: 'entrepreneur' });
    const customer = await createUser({ email: 'priya@test.local', role: 'customer' });
    const service = await request(app)
      .post('/api/services')
      .set(authHeader(seller.token))
      .send({ name: 'Custom Pot', price: 250 });

    // itemId is real, but entrepreneurId doesn't own it — must not be trusted from the client.
    const res = await request(app)
      .post('/api/orders')
      .set(authHeader(customer.token))
      .send({ entrepreneurId: decoy.user._id.toString(), kind: 'service', itemId: service.body.service.id });

    expect(res.status).toBe(404);
  });
});

describe('order visibility', () => {
  it('the seller sees the order in /orders/incoming', async () => {
    const { seller } = await seedOrder();
    const res = await request(app).get('/api/orders/incoming').set(authHeader(seller.token));
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
  });

  it('the customer sees the order in /orders/mine', async () => {
    const { customer } = await seedOrder();
    const res = await request(app).get('/api/orders/mine').set(authHeader(customer.token));
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
  });

  it('an unrelated entrepreneur sees no orders at all', async () => {
    await seedOrder();
    const other = await createUser({ email: 'gopal@test.local', role: 'entrepreneur' });
    const res = await request(app).get('/api/orders/incoming').set(authHeader(other.token));
    expect(res.body.orders).toHaveLength(0);
  });
});

describe('PATCH /api/orders/:id/status', () => {
  it('lets the owning seller accept then complete the order', async () => {
    const { seller, order } = await seedOrder();
    const accept = await request(app)
      .patch(`/api/orders/${order.body.order.id}/status`)
      .set(authHeader(seller.token))
      .send({ status: 'accepted' });
    expect(accept.status).toBe(200);
    expect(accept.body.order.status).toBe('accepted');

    const complete = await request(app)
      .patch(`/api/orders/${order.body.order.id}/status`)
      .set(authHeader(seller.token))
      .send({ status: 'completed' });
    expect(complete.status).toBe(200);
    expect(complete.body.order.status).toBe('completed');
  });

  it('blocks an unrelated seller from mutating someone else\'s order', async () => {
    const { order } = await seedOrder();
    const other = await createUser({ email: 'gopal@test.local', role: 'entrepreneur' });

    const res = await request(app)
      .patch(`/api/orders/${order.body.order.id}/status`)
      .set(authHeader(other.token))
      .send({ status: 'accepted' });

    expect(res.status).toBe(403);
  });

  it('blocks the customer from mutating their own order\'s status', async () => {
    const { customer, order } = await seedOrder();
    const res = await request(app)
      .patch(`/api/orders/${order.body.order.id}/status`)
      .set(authHeader(customer.token))
      .send({ status: 'accepted' });
    expect(res.status).toBe(403);
  });

  it('rejects a status value outside the allowed enum', async () => {
    const { seller, order } = await seedOrder();
    const res = await request(app)
      .patch(`/api/orders/${order.body.order.id}/status`)
      .set(authHeader(seller.token))
      .send({ status: 'shipped' }); // not a real status
    expect(res.status).toBe(422);
  });
});

describe('earned reviews', () => {
  it('rejects a review with no completed order', async () => {
    const seller = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
    const customer = await createUser({ email: 'priya@test.local', role: 'customer' });

    const res = await request(app)
      .post('/api/reviews')
      .set(authHeader(customer.token))
      .send({ entrepreneurId: seller.user._id.toString(), rating: 5, text: 'Great!' });

    expect(res.status).toBe(403);
  });

  it('allows a review after a completed order', async () => {
    const { seller, customer, order } = await seedOrder();
    await request(app).patch(`/api/orders/${order.body.order.id}/status`).set(authHeader(seller.token)).send({ status: 'accepted' });
    await request(app).patch(`/api/orders/${order.body.order.id}/status`).set(authHeader(seller.token)).send({ status: 'completed' });

    const res = await request(app)
      .post('/api/reviews')
      .set(authHeader(customer.token))
      .send({ entrepreneurId: seller.user._id.toString(), rating: 5, text: 'Great!' });

    expect(res.status).toBe(201);
  });
});
