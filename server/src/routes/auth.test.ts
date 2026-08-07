import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { connectTestDB, closeTestDB, clearTestDB } from '../test/db';
import { createUser, authHeader } from '../test/fixtures';

const app = createApp();

beforeAll(connectTestDB);
afterAll(closeTestDB);
beforeEach(clearTestDB);

describe('POST /api/auth/register', () => {
  it('registers a customer and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Priya', email: 'priya@test.local', password: 'password123', role: 'customer' });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe('priya@test.local');
    expect(res.body.user.role).toBe('customer');
    // A hashed password (or the plaintext one) must never leave the API.
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.user.password).toBeUndefined();
  });

  it('registers an entrepreneur when a profile is included', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ramesh',
      email: 'ramesh@test.local',
      password: 'password123',
      role: 'entrepreneur',
      profile: { category: 'potter', craft: 'Potter', city: 'Jaipur', state: 'Rajasthan' },
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('entrepreneur');
    expect(res.body.user.profile.verified).toBe(false); // never self-verified on registration
  });

  it('rejects an entrepreneur registration with no profile', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'No Profile', email: 'noprofile@test.local', password: 'password123', role: 'entrepreneur' });

    expect(res.status).toBe(422);
  });

  it('rejects a duplicate email', async () => {
    await createUser({ email: 'dup@test.local', role: 'customer' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dup', email: 'dup@test.local', password: 'password123', role: 'customer' });

    expect(res.status).toBe(409);
  });

  it('cannot self-register as admin — role is restricted to customer/entrepreneur', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Wannabe Admin', email: 'admin2@test.local', password: 'password123', role: 'admin' });

    expect(res.status).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Priya', email: 'priya@test.local', password: 'password123', role: 'customer' });

    const res = await request(app).post('/api/auth/login').send({ email: 'priya@test.local', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('rejects an unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@test.local', password: 'password123' });
    expect(res.status).toBe(401);
  });

  it('rejects the wrong password', async () => {
    await createUser({ email: 'priya@test.local', role: 'customer' });
    const res = await request(app).post('/api/auth/login').send({ email: 'priya@test.local', password: 'wrong-password' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('rejects a request with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects a garbage token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('returns the signed-in user for a valid token', async () => {
    const { user, token } = await createUser({ name: 'Priya', email: 'priya@test.local', role: 'customer' });
    const res = await request(app).get('/api/auth/me').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(user._id.toString());
  });
});
