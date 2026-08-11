import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { connectTestDB, closeTestDB, clearTestDB } from '../test/db';
import { createUser, authHeader } from '../test/fixtures';

const app = createApp();

beforeAll(connectTestDB);
afterAll(closeTestDB);
beforeEach(clearTestDB);

async function seedCompletedOrder() {
  const seller = await createUser({ email: 'ramesh@test.local', role: 'entrepreneur' });
  const customer = await createUser({ email: 'priya@test.local', role: 'customer' });
  const service = await request(app).post('/api/services').set(authHeader(seller.token)).send({ name: 'Custom Pot', price: 250 });
  const order = await request(app)
    .post('/api/orders')
    .set(authHeader(customer.token))
    .send({ entrepreneurId: seller.user._id.toString(), kind: 'service', itemId: service.body.service.id });
  return { seller, customer, order };
}

describe('POST /api/complaints', () => {
  it('lets a customer report an issue on their own order', async () => {
    const { customer, order } = await seedCompletedOrder();
    const res = await request(app)
      .post('/api/complaints')
      .set(authHeader(customer.token))
      .send({ subject: 'Wrong item', message: 'Received the wrong item.', orderId: order.body.order.id });
    expect(res.status).toBe(201);
    expect(res.body.complaint.status).toBe('open');
    expect(res.body.complaint.reporter.id).toBe(customer.user._id.toString());
  });

  it('lets the entrepreneur report an issue on the same order too', async () => {
    const { seller, order } = await seedCompletedOrder();
    const res = await request(app)
      .post('/api/complaints')
      .set(authHeader(seller.token))
      .send({ subject: 'Customer unreachable', message: 'Cannot reach the customer to deliver.', orderId: order.body.order.id });
    expect(res.status).toBe(201);
  });

  it("rejects a complaint referencing an order the reporter isn't a party to", async () => {
    const { order } = await seedCompletedOrder();
    const stranger = await createUser({ email: 'stranger@test.local', role: 'customer' });
    const res = await request(app)
      .post('/api/complaints')
      .set(authHeader(stranger.token))
      .send({ subject: 'Not my order', message: 'Trying to report someone else\'s order.', orderId: order.body.order.id });
    expect(res.status).toBe(403);
  });

  it('rejects an unauthenticated complaint', async () => {
    const res = await request(app).post('/api/complaints').send({ subject: 'x', message: 'y' });
    expect(res.status).toBe(401);
  });

  it('allows a complaint with no order reference (general feedback)', async () => {
    const { token } = await createUser({ email: 'customer@test.local', role: 'customer' });
    const res = await request(app).post('/api/complaints').set(authHeader(token)).send({ subject: 'General feedback', message: 'Just some feedback.' });
    expect(res.status).toBe(201);
    expect(res.body.complaint.order).toBeNull();
  });
});

describe('GET /api/complaints/mine', () => {
  it('only returns the signed-in user\'s own complaints', async () => {
    const { customer } = await seedCompletedOrder();
    await request(app).post('/api/complaints').set(authHeader(customer.token)).send({ subject: 'A', message: 'a' });
    const other = await createUser({ email: 'other@test.local', role: 'customer' });
    await request(app).post('/api/complaints').set(authHeader(other.token)).send({ subject: 'B', message: 'b' });

    const res = await request(app).get('/api/complaints/mine').set(authHeader(customer.token));
    expect(res.status).toBe(200);
    expect(res.body.complaints).toHaveLength(1);
    expect(res.body.complaints[0].subject).toBe('A');
  });
});

describe('admin complaint management', () => {
  it('rejects a non-admin', async () => {
    const { token } = await createUser({ email: 'x@test.local', role: 'customer' });
    const res = await request(app).get('/api/admin/complaints').set(authHeader(token));
    expect(res.status).toBe(403);
  });

  it('lets admin list and update a complaint', async () => {
    const { customer } = await seedCompletedOrder();
    const create = await request(app).post('/api/complaints').set(authHeader(customer.token)).send({ subject: 'Issue', message: 'Details.' });
    const admin = await createUser({ email: 'admin@test.local', role: 'admin' });

    const list = await request(app).get('/api/admin/complaints').set(authHeader(admin.token));
    expect(list.status).toBe(200);
    expect(list.body.total).toBe(1);

    const update = await request(app)
      .patch(`/api/admin/complaints/${create.body.complaint.id}`)
      .set(authHeader(admin.token))
      .send({ status: 'resolved', adminNote: 'Refund issued.' });
    expect(update.status).toBe(200);
    expect(update.body.complaint.status).toBe('resolved');
    expect(update.body.complaint.adminNote).toBe('Refund issued.');
  });

  it('filters complaints by status', async () => {
    const { customer } = await seedCompletedOrder();
    await request(app).post('/api/complaints').set(authHeader(customer.token)).send({ subject: 'A', message: 'a' });
    const admin = await createUser({ email: 'admin@test.local', role: 'admin' });
    const res = await request(app).get('/api/admin/complaints?status=resolved').set(authHeader(admin.token));
    expect(res.body.total).toBe(0); // the one complaint is still 'open'
  });
});
