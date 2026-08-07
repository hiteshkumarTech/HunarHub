import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ReviewItem } from '../types/api';

export interface CreateReviewInput {
  entrepreneurId: string;
  rating: number;
  text?: string;
}

/**
 * Create/update a review. The API only allows this after a completed order
 * with that entrepreneur (earned-reviews rule).
 */
export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => api.post<{ review: ReviewItem }>('/api/reviews', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entrepreneur'] });
      qc.invalidateQueries({ queryKey: ['entrepreneurs'] });
    },
  });
}
