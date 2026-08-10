import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ProductItem, ServiceItem } from '../types/api';

// Entrepreneur's own listing management (POST/PATCH/DELETE /api/services, /api/products).
// The backend enforces ownership on update/delete — these hooks never need to
// pass or trust anything beyond the listing id.
//
// Every create/update now goes as multipart/form-data (even when there's no
// file to send) — the backend accepts both JSON and multipart on the same
// routes, so always building FormData here keeps this file's logic uniform
// instead of branching on "does this request have an image."

export interface ServiceInput {
  name: string;
  price: number;
  dur?: string;
  /** A new photo to upload (replaces any existing one). */
  image?: File;
  /** Clear the existing photo without replacing it. Ignored if `image` is also set. */
  removeImage?: boolean;
}

export interface ProductInput {
  name: string;
  price: number;
  /** New photos to upload (creates append here; updates append unless keepImagePublicIds is also set). */
  newImages?: File[];
  /** Update only: which existing images (by publicId) to retain. Omit to leave the gallery untouched. */
  keepImagePublicIds?: string[];
}

function serviceFormData(input: ServiceInput): FormData {
  const fd = new FormData();
  fd.append('name', input.name);
  fd.append('price', String(input.price));
  if (input.dur) fd.append('dur', input.dur);
  if (input.image) fd.append('image', input.image);
  else if (input.removeImage) fd.append('removeImage', 'true');
  return fd;
}

function productFormData(input: ProductInput): FormData {
  const fd = new FormData();
  fd.append('name', input.name);
  fd.append('price', String(input.price));
  for (const file of input.newImages ?? []) fd.append('images', file);
  if (input.keepImagePublicIds) fd.append('keepImages', JSON.stringify(input.keepImagePublicIds));
  return fd;
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
    mutationFn: (input: ServiceInput) => api.post<{ service: ServiceItem }>('/api/services', serviceFormData(input)),
    onSuccess: invalidate,
  });
}

export function useUpdateService() {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: ({ id, ...input }: ServiceInput & { id: string }) =>
      api.patch<{ service: ServiceItem }>(`/api/services/${id}`, serviceFormData(input)),
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
    mutationFn: (input: ProductInput) => api.post<{ product: ProductItem }>('/api/products', productFormData(input)),
    onSuccess: invalidate,
  });
}

export function useUpdateProduct() {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: ({ id, ...input }: ProductInput & { id: string }) =>
      api.patch<{ product: ProductItem }>(`/api/products/${id}`, productFormData(input)),
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
