export type CategoryId = 'cobbler' | 'potter' | 'tailor' | 'artisan' | 'vendor';

export interface Category { id: CategoryId; name: string; sub: string; desc: string; }
export interface Service { name: string; price: number; dur: string; }
export interface Product { name: string; price: number; }

export interface Entrepreneur {
  id: string;
  name: string;
  category: CategoryId;
  craft: string;
  city: string;
  state: string;
  exp: number;
  rating: number;
  reviews: number;
  start: number;
  available: boolean;
  verified: boolean;
  bio: string;
  services: Service[];
  products: Product[];
}

export interface Craft { id: CategoryId; name: string; image: string; }
