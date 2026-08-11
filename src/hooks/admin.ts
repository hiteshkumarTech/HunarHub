import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  AdminComplaintsResponse,
  AdminListingsResponse,
  AdminOrdersResponse,
  AdminStats,
  AdminUsersResponse,
  CategoriesResponse,
  CategoryItem,
  ComplaintItem,
  ComplaintStatus,
  EntrepreneurCard,
  OrderStatus,
  Role,
} from '../types/api';

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

export interface AdminOrdersParams {
  status?: OrderStatus | 'all';
  kind?: 'service' | 'product' | 'all';
  q?: string;
  page?: number;
}

/** Read-only order/request monitoring — no status-mutation hook exists here
 *  on purpose: rewriting an order's status is the owning entrepreneur's
 *  business-rule-governed action, not an admin override (see ROADMAP.md). */
export function useAdminOrders(params: AdminOrdersParams) {
  const search = new URLSearchParams();
  if (params.status && params.status !== 'all') search.set('status', params.status);
  if (params.kind && params.kind !== 'all') search.set('kind', params.kind);
  if (params.q) search.set('q', params.q);
  search.set('page', String(params.page ?? 1));

  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => api.get<AdminOrdersResponse>(`/api/admin/orders?${search.toString()}`),
    placeholderData: (prev) => prev,
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<CategoriesResponse>('/api/admin/categories'),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string; label?: string; active?: boolean }) =>
      api.patch<{ category: CategoryItem }>(`/api/admin/categories/${id}`, patch),
    // Shared key with the public useCategories() — one invalidation refreshes
    // both this panel and Register/Marketplace's category pickers.
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export interface AdminComplaintsParams {
  status?: ComplaintStatus | 'all';
  page?: number;
}

export function useAdminComplaints(params: AdminComplaintsParams) {
  const search = new URLSearchParams();
  if (params.status && params.status !== 'all') search.set('status', params.status);
  search.set('page', String(params.page ?? 1));

  return useQuery({
    queryKey: ['admin', 'complaints', params],
    queryFn: () => api.get<AdminComplaintsResponse>(`/api/admin/complaints?${search.toString()}`),
    placeholderData: (prev) => prev,
  });
}

export function useUpdateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string; status?: ComplaintStatus; adminNote?: string }) =>
      api.patch<{ complaint: ComplaintItem }>(`/api/admin/complaints/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'complaints'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
