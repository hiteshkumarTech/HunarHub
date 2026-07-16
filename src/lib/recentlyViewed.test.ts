import { afterEach, describe, expect, it } from 'vitest';
import { getRecentlyViewed, pushRecentlyViewed } from './recentlyViewed';

afterEach(() => localStorage.clear());

describe('recentlyViewed', () => {
  it('keeps most-recent first and de-duplicates', () => {
    pushRecentlyViewed({ id: 'a', name: 'A', craft: 'Potter', city: 'X', category: 'potter' });
    pushRecentlyViewed({ id: 'b', name: 'B', craft: 'Tailor', city: 'Y', category: 'tailor' });
    pushRecentlyViewed({ id: 'a', name: 'A', craft: 'Potter', city: 'X', category: 'potter' });
    expect(getRecentlyViewed().map((m) => m.id)).toEqual(['a', 'b']);
  });

  it('caps the list at 8 entries', () => {
    for (let i = 0; i < 12; i++) {
      pushRecentlyViewed({ id: String(i), name: 'N', craft: 'C', city: 'X', category: null });
    }
    expect(getRecentlyViewed()).toHaveLength(8);
  });
});
