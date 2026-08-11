import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { MarketplaceListingsResponse } from '../types/api';

export interface MarketplaceParams {
  kind?: 'service' | 'product' | 'all';
  cat?: string;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
}

function buildQuery(params: MarketplaceParams, page: number): string {
  const search = new URLSearchParams();
  if (params.kind && params.kind !== 'all') search.set('kind', params.kind);
  if (params.cat && params.cat !== 'all') search.set('cat', params.cat);
  if (params.city) search.set('city', params.city);
  if (params.state) search.set('state', params.state);
  if (params.minPrice) search.set('minPrice', String(params.minPrice));
  if (params.maxPrice) search.set('maxPrice', String(params.maxPrice));
  if (params.q) search.set('q', params.q);
  search.set('page', String(page));
  search.set('limit', '12');
  return search.toString();
}

/**
 * Paginated marketplace feed (infinite "load more") — GET /api/listings, the
 * customer-facing discovery surface for individual products/services.
 * Distinct from Browse/useBrowseEntrepreneurs, which discovers *sellers*: a
 * customer can find a product or service directly here without first opening
 * a specific entrepreneur's profile.
 */
export function useMarketplaceListings(params: MarketplaceParams) {
  return useInfiniteQuery({
    queryKey: ['listings', params],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => api.get<MarketplaceListingsResponse>(`/api/listings?${buildQuery(params, pageParam)}`),
    getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
    placeholderData: (prev) => prev,
  });
}
