import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User, CATEGORY_IDS } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody } from '../middleware/validate';
import { authRequired } from '../middleware/auth';
import { signToken } from '../utils/token';
import { publicUser } from '../utils/serialize';
import { ApiError } from '../utils/ApiError';

const router = Router();

const profileInput = z
  .object({
    category: z.enum(CATEGORY_IDS),
    craft: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    exp: z.number().int().min(0).optional(),
    bio: z.string().optional(),
    startingPrice: z.number().min(0).optional(),
  })
  .optional();

const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['customer', 'entrepreneur']).default('customer'),
    profile: profileInput,
  })
  .refine((d) => d.role !== 'entrepreneur' || !!d.profile, {
    message: 'Entrepreneurs must include a profile (category, craft, city, state)',
    path: ['profile'],
  });

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, role, profile } = req.body;
    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, 'That email is already registered');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      profile: role === 'entrepreneur' ? { ...profile, verified: false } : undefined,
    });

    const token = signToken({ id: user._id.toString(), role: user.role });
    res.status(201).json({ token, user: publicUser(user) });
  }),
);

router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) throw new ApiError(401, 'Invalid email or password');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new ApiError(401, 'Invalid email or password');

    const token = signToken({ id: user._id.toString(), role: user.role });
    res.json({ token, user: publicUser(user) });
  }),
);

router.get(
  '/me',
  authRequired,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.id);
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ user: publicUser(user) });
  }),
);

export default router;
