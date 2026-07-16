import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AuthUser, EntrepreneursResponse, EntrepreneurDetailResponse } from '../types/api';

export interface BrowseParams {
  cat?: string;
  q?: string;
  maxPrice?: number;
  sort?: string;
  verified?: boolean;
  available?: boolean;
}

export function useEntrepreneurs(params: BrowseParams) {
  const search = new URLSearchParams();
  if (params.cat && params.cat !== 'all') search.set('cat', params.cat);
  if (params.q) search.set('q', params.q);
  if (params.maxPrice) search.set('maxPrice', String(params.maxPrice));
  if (params.sort) search.set('sort', params.sort);
  const qs = search.toString();

  return useQuery({
    queryKey: ['entrepreneurs', params],
    queryFn: () => api.get<EntrepreneursResponse>(`/api/entrepreneurs${qs ? `?${qs}` : ''}`),
    placeholderData: (prev) => prev, // keep previous results while refetching
  });
}

export function useEntrepreneur(id: string | undefined) {
  return useQuery({
    queryKey: ['entrepreneur', id],
    queryFn: () => api.get<EntrepreneurDetailResponse>(`/api/entrepreneurs/${id}`),
    enabled: Boolean(id),
  });
}

export interface ProfilePatch {
  available?: boolean;
  craft?: string;
  city?: string;
  state?: string;
  exp?: number;
  bio?: string;
  startingPrice?: number;
  category?: string;
}

/** Entrepreneur updates their own profile / availability. */
export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: ProfilePatch) => api.patch<{ user: AuthUser }>('/api/entrepreneurs/me', patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entrepreneur'] }),
  });
}

/** Paginated browse feed (infinite "load more"). */
export function useBrowseEntrepreneurs(params: BrowseParams) {
  return useInfiniteQuery({
    queryKey: ['entrepreneurs', 'browse', params],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const search = new URLSearchParams();
      if (params.cat && params.cat !== 'all') search.set('cat', params.cat);
      if (params.q) search.set('q', params.q);
      if (params.maxPrice) search.set('maxPrice', String(params.maxPrice));
      if (params.sort) search.set('sort', params.sort);
      if (params.verified) search.set('verified', 'true');
      if (params.available) search.set('available', 'true');
      search.set('page', String(pageParam));
      search.set('limit', '12');
      return api.get<EntrepreneursResponse>(`/api/entrepreneurs?${search.toString()}`);
    },
    getNextPageParam: (last) => {
      const page = last.page ?? 1;
      const pages = last.pages ?? 1;
      return page < pages ? page + 1 : undefined;
    },
    placeholderData: (prev) => prev,
  });
}
