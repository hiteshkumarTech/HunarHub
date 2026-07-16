import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { OrderItem, OrdersResponse, OrderStatus } from '../types/api';

export interface CreateOrderInput {
  entrepreneurId: string;
  kind: 'service' | 'product';
  itemId: string;
  note?: string;
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => api.post<{ order: OrderItem }>('/api/orders', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/** Orders coming in to the signed-in entrepreneur. */
export function useIncomingOrders(enabled = true) {
  return useQuery({
    queryKey: ['orders', 'incoming'],
    queryFn: () => api.get<OrdersResponse>('/api/orders/incoming'),
    enabled,
  });
}

/** The signed-in customer's own orders. */
export function useMyOrders(enabled = true) {
  return useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => api.get<OrdersResponse>('/api/orders/mine'),
    enabled,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Exclude<OrderStatus, 'pending'> }) =>
      api.patch<{ order: OrderItem }>(`/api/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
