import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AdminListingsResponse, AdminStats, AdminUsersResponse, EntrepreneurCard, Role } from '../types/api';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<{ stats: AdminStats }>('/api/admin/stats'),
  });
}

export interface AdminUsersParams {
  role?: Role | 'all';
  q?: string;
  page?: number;
}

export function useAdminUsers(params: AdminUsersParams) {
  const search = new URLSearchParams();
  if (params.role && params.role !== 'all') search.set('role', params.role);
  if (params.q) search.set('q', params.q);
  search.set('page', String(params.page ?? 1));

  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => api.get<AdminUsersResponse>(`/api/admin/users?${search.toString()}`),
    placeholderData: (prev) => prev,
  });
}

export function useVerifyEntrepreneur() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      api.patch<{ entrepreneur: EntrepreneurCard }>(`/api/admin/entrepreneurs/${id}/verify`, { verified }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['entrepreneurs'] });
      qc.invalidateQueries({ queryKey: ['entrepreneur'] });
    },
  });
}

export interface AdminListingsParams {
  kind?: 'service' | 'product' | 'all';
  q?: string;
  page?: number;
}

export function useAdminListings(params: AdminListingsParams) {
  const search = new URLSearchParams();
  if (params.kind && params.kind !== 'all') search.set('kind', params.kind);
  if (params.q) search.set('q', params.q);
  search.set('page', String(params.page ?? 1));

  return useQuery({
    queryKey: ['admin', 'listings', params],
    queryFn: () => api.get<AdminListingsResponse>(`/api/admin/listings?${search.toString()}`),
    placeholderData: (prev) => prev,
  });
}

export function useDeleteAdminListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, kind }: { id: string; kind: 'service' | 'product' }) =>
      api.del<{ ok: true }>(`/api/admin/${kind}s/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'listings'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
      qc.invalidateQueries({ queryKey: ['entrepreneur'] });
    },
  });
}
