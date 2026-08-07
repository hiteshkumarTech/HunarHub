import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ProductItem, ServiceItem } from '../types/api';

// Entrepreneur's own listing management (POST/PATCH/DELETE /api/services, /api/products).
// The backend enforces ownership on update/delete — these hooks never need to
// pass or trust anything beyond the listing id.

export interface ServiceInput {
  name: string;
  price: number;
  dur?: string;
}

export interface ProductInput {
  name: string;
  price: number;
  image?: string;
}

/** Every mutation here changes what GET /api/entrepreneurs/:id returns for the
 *  signed-in seller, so invalidating the ['entrepreneur'] group refreshes both
 *  the Dashboard's listings panel and the seller's own public profile. */
function useInvalidateListings() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['entrepreneur'] });
    qc.invalidateQueries({ queryKey: ['admin', 'listings'] });
    qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
  };
}

export function useCreateService() {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: (input: ServiceInput) => api.post<{ service: ServiceItem }>('/api/services', input),
    onSuccess: invalidate,
  });
}

export function useUpdateService() {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: ({ id, ...input }: ServiceInput & { id: string }) =>
      api.patch<{ service: ServiceItem }>(`/api/services/${id}`, input),
    onSuccess: invalidate,
  });
}

export function useDeleteService() {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: (id: string) => api.del<{ ok: true }>(`/api/services/${id}`),
    onSuccess: invalidate,
  });
}

export function useCreateProduct() {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: (input: ProductInput) => api.post<{ product: ProductItem }>('/api/products', input),
    onSuccess: invalidate,
  });
}

export function useUpdateProduct() {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: ({ id, ...input }: ProductInput & { id: string }) =>
      api.patch<{ product: ProductItem }>(`/api/products/${id}`, input),
    onSuccess: invalidate,
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: (id: string) => api.del<{ ok: true }>(`/api/products/${id}`),
    onSuccess: invalidate,
  });
}
