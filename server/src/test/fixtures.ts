/** Test-only helpers for seeding users directly (bypassing HTTP) and minting their tokens. */
import bcrypt from 'bcryptjs';
import { User, type CATEGORY_IDS } from '../models/User';
import { signToken } from '../utils/token';

type Category = (typeof CATEGORY_IDS)[number];

export async function createUser(overrides: {
  name?: string;
  email: string;
  role: 'customer' | 'entrepreneur' | 'admin';
  profile?: Partial<{
    category: Category;
    craft: string;
    city: string;
    state: string;
    available: boolean;
    verified: boolean;
  }>;
}) {
  const passwordHash = await bcrypt.hash('password123', 4); // low cost factor — tests only
  const user = await User.create({
    name: overrides.name ?? 'Test User',
    email: overrides.email,
    passwordHash,
    role: overrides.role,
    profile:
      overrides.role === 'entrepreneur'
        ? {
            category: 'potter',
            craft: 'Potter',
            city: 'Jaipur',
            state: 'Rajasthan',
            available: true,
            verified: false,
            ...overrides.profile,
          }
        : undefined,
  });
  const token = signToken({ id: user._id.toString(), role: user.role });
  return { user, token };
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
