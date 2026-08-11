import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CategoriesResponse } from '../types/api';

/** Public category list — Register's category picker and the Marketplace/
 *  Browse category filters all read from here instead of a compiled-in list,
 *  so an admin renaming/deactivating a category takes effect without a
 *  redeploy. See models/Category.ts on the server for why the underlying
 *  category *ids* still stay a fixed set. */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<CategoriesResponse>('/api/categories'),
    staleTime: 5 * 60 * 1000,
  });
}
