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

/** publicId is null for images that predate Cloudinary uploads — nothing to delete server-side. */
export interface ListingImage {
  url: string;
  publicId: string | null;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  dur: string;
  images: ListingImage[];
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  /** images[0] is the cover image — up to 4 total. */
  images: ListingImage[];
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
  total?: number;
  page?: number;
  pages?: number;
}

export interface FavoritesResponse {
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

/** Admin-only: any account, any role. */
export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  profile: EntrepreneurProfile | null;
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUserItem[];
  total: number;
  page: number;
  pages: number;
}

/** Admin-only: a service or product with its seller attached. */
export interface AdminListingItem {
  id: string;
  kind: 'service' | 'product';
  name: string;
  price: number;
  dur?: string;
  image?: string;
  entrepreneur: PersonRef;
  createdAt: string;
}

export interface AdminListingsResponse {
  listings: AdminListingItem[];
  total: number;
  page: number;
  pages: number;
}

export interface AdminStats {
  totalUsers: number;
  entrepreneurs: number;
  customers: number;
  admins: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  reviews: number;
  totalListings: number;
  activeListings: number;
  openComplaints: number;
}

/** Admin-manageable display metadata for the 5 fixed craft categories — see
 *  ROADMAP.md for why the category set itself stays a fixed enum. */
export interface CategoryItem {
  id: CategoryId;
  label: string;
  active: boolean;
}

export interface CategoriesResponse {
  categories: CategoryItem[];
}

/** Enough about a listing's seller to filter/display a marketplace card
 *  without a second request. */
export interface MarketplaceEntrepreneurRef {
  id: string;
  name: string;
  category: CategoryId | null;
  craft: string;
  city: string;
  state: string;
  rating: number;
  verified: boolean;
  available: boolean;
}

/** A single service or product from GET /api/listings — the customer-facing
 *  product/service marketplace, distinct from Browse (which discovers sellers). */
export interface MarketplaceListing {
  id: string;
  kind: 'service' | 'product';
  name: string;
  price: number;
  dur?: string;
  images: ListingImage[];
  entrepreneur: MarketplaceEntrepreneurRef;
  createdAt: string;
}

export interface MarketplaceListingsResponse {
  listings: MarketplaceListing[];
  total: number;
  page: number;
  pages: number;
}

export type ComplaintStatus = 'open' | 'in_review' | 'resolved';

export interface ComplaintItem {
  id: string;
  reporter: PersonRef;
  order: string | null;
  subject: string;
  message: string;
  status: ComplaintStatus;
  adminNote: string;
  createdAt: string;
}

export interface ComplaintsResponse {
  complaints: ComplaintItem[];
}

/** Admin-only: any order/request with both parties attached, read-only. */
export interface AdminOrderItem {
  id: string;
  kind: 'service' | 'product';
  title: string;
  price: number;
  status: OrderStatus;
  customer: PersonRef;
  entrepreneur: PersonRef;
  createdAt: string;
}

export interface AdminOrdersResponse {
  orders: AdminOrderItem[];
  total: number;
  page: number;
  pages: number;
}

export interface AdminComplaintsResponse {
  complaints: ComplaintItem[];
  total: number;
  page: number;
  pages: number;
}
