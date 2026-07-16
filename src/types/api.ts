import type { CategoryId } from '../types';

export type Role = 'customer' | 'entrepreneur' | 'admin';

export interface EntrepreneurProfile {
  category: CategoryId | null;
  craft: string;
  city: string;
  state: string;
  exp: number;
  bio: string;
  startingPrice: number;
  available: boolean;
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  profile: EntrepreneurProfile | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterProfileInput {
  category: CategoryId;
  craft: string;
  city: string;
  state: string;
  exp?: number;
  bio?: string;
  startingPrice?: number;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'entrepreneur';
  profile?: RegisterProfileInput;
}

/** Compact card shape from GET /api/entrepreneurs. */
export interface EntrepreneurCard {
  id: string;
  name: string;
  category: CategoryId | null;
  craft: string;
  city: string;
  state: string;
  exp: number;
  rating: number;
  reviews: number;
  start: number;
  available: boolean;
  verified: boolean;
}

export interface EntrepreneurDetail extends EntrepreneurCard {
  bio: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  dur: string;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface PersonRef {
  id: string;
  name: string;
}

export interface ReviewItem {
  id: string;
  rating: number;
  text: string;
  customer: PersonRef | string;
  createdAt: string;
}

export interface EntrepreneursResponse {
  entrepreneurs: EntrepreneurCard[];
}

export interface EntrepreneurDetailResponse {
  entrepreneur: EntrepreneurDetail;
  services: ServiceItem[];
  products: ProductItem[];
  reviews: ReviewItem[];
}

export type OrderStatus = 'pending' | 'accepted' | 'declined' | 'completed';

export interface OrderItem {
  id: string;
  kind: 'service' | 'product';
  title: string;
  price: number;
  status: OrderStatus;
  customer?: PersonRef | string;
  entrepreneur?: PersonRef | string;
  createdAt: string;
}

export interface OrdersResponse {
  orders: OrderItem[];
}
