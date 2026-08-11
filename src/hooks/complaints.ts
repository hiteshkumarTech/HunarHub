import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ComplaintItem, ComplaintsResponse } from '../types/api';

export interface CreateComplaintInput {
  subject: string;
  message: string;
  /** Ties the complaint to one of the reporter's own orders — the backend
   *  rejects this if the signed-in user isn't a party to that order. */
  orderId?: string;
}

export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateComplaintInput) => api.post<{ complaint: ComplaintItem }>('/api/complaints', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['complaints', 'mine'] }),
  });
}

/** The signed-in user's own complaints (customer or entrepreneur) — the
 *  backend scopes this to `reporter === req.user.id`. */
export function useMyComplaints(enabled = true) {
  return useQuery({
    queryKey: ['complaints', 'mine'],
    queryFn: () => api.get<ComplaintsResponse>('/api/complaints/mine'),
    enabled,
  });
}
