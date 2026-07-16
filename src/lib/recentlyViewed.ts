export interface RecentMaker {
  id: string;
  name: string;
  craft: string;
  city: string;
  category: string | null;
}

const KEY = 'hunarhub_recent';
const MAX = 8;

export function getRecentlyViewed(): RecentMaker[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentMaker[]) : [];
  } catch {
    return [];
  }
}

export function pushRecentlyViewed(maker: RecentMaker): void {
  try {
    const list = getRecentlyViewed().filter((m) => m.id !== maker.id);
    list.unshift(maker);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* storage unavailable — ignore */
  }
}
