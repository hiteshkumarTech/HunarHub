import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { FavoritesResponse } from '../types/api';

export function useFavorites() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.get<FavoritesResponse>('/api/favorites'),
    enabled: user?.role === 'customer',
    staleTime: 30_000,
  });
}

/** Set of favourited entrepreneur ids (empty for guests / non-customers). */
export function useFavoriteIds(): Set<string> {
  const { data } = useFavorites();
  return new Set((data?.entrepreneurs ?? []).map((e) => e.id));
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entrepreneurId, isFav }: { entrepreneurId: string; isFav: boolean }) =>
      isFav ? api.del(`/api/favorites/${entrepreneurId}`) : api.post('/api/favorites', { entrepreneurId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}
