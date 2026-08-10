import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, tokenStore } from './api';

afterEach(() => {
  vi.restoreAllMocks();
  tokenStore.clear();
});

describe('api client', () => {
  it('attaches the Bearer token and parses JSON', async () => {
    tokenStore.set('tok123');
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await api.get<{ ok: boolean }>('/api/test');
    expect(res.ok).toBe(true);

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.headers).toMatchObject({ Authorization: 'Bearer tok123' });
  });

  it('throws ApiError carrying the server message on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: 'Nope' }), { status: 400, headers: { 'content-type': 'application/json' } })),
    );
    await expect(api.get('/api/test')).rejects.toBeInstanceOf(ApiError);
    await expect(api.get('/api/test')).rejects.toMatchObject({ status: 400, message: 'Nope' });
  });

  it('sends FormData bodies (image uploads) as-is, without JSON.stringify or a manual Content-Type', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);

    const fd = new FormData();
    fd.append('name', 'Painted Planter');
    await api.post('/api/products', fd);

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.body).toBe(fd); // not JSON.stringify'd
    // No Content-Type set manually — the browser must supply the multipart boundary itself.
    expect(init.headers).not.toHaveProperty('Content-Type');
  });
});
