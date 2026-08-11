import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMarketplaceListings } from './marketplace';

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

afterEach(() => vi.unstubAllGlobals());

describe('useMarketplaceListings', () => {
  it('sends kind/category/location/price/search as real GET /api/listings query params', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ listings: [], total: 0, page: 1, pages: 1 }));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(
      () => useMarketplaceListings({ kind: 'product', cat: 'potter', city: 'Jaipur', state: 'Rajasthan', maxPrice: 500, q: 'pot' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/api/listings?');
    expect(url).toContain('kind=product');
    expect(url).toContain('cat=potter');
    expect(url).toContain('city=Jaipur');
    expect(url).toContain('state=Rajasthan');
    expect(url).toContain('maxPrice=500');
    expect(url).toContain('q=pot');
  });

  it('omits kind/cat when "all" — that is "no filter", not a literal value the API understands', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ listings: [], total: 0, page: 1, pages: 1 }));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useMarketplaceListings({ kind: 'all', cat: 'all' }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).not.toContain('kind=');
    expect(url).not.toContain('cat=');
  });

  it('requests the next page from fetchNextPage using the server-reported page count', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const page = new URL(url).searchParams.get('page');
      return jsonResponse({ listings: [], total: 20, page: Number(page), pages: 2 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useMarketplaceListings({}), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    await result.current.fetchNextPage();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][0] as string).toContain('page=2');
  });
});
