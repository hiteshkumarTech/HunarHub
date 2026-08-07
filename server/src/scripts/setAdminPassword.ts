/**
 * Rotate the admin account's password on an ALREADY-SEEDED database — including
 * production — without touching anything else. Safe to run repeatedly.
 *
 * Unlike `npm run seed` (which wipes and recreates every collection), this only
 * updates one field on one document: it does not delete or reset users, orders,
 * reviews, services, or products.
 *
 * Usage:
 *   MONGODB_URI="<your Atlas connection string>" NEW_ADMIN_PASSWORD="<strong new password>" npm run set-admin-password
 *
 * Both env vars are required and validated below — nothing here has a
 * fallback, on purpose, to make it impossible to silently no-op or write a
 * weak default into a real database.
 */
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User';

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  const newPassword = process.env.NEW_ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hunarhub.in';

  if (!mongoUri) throw new Error('Set MONGODB_URI to the target database connection string.');
  if (!newPassword || newPassword.length < 12) {
    throw new Error('Set NEW_ADMIN_PASSWORD to a strong password (at least 12 characters).');
  }
  if (newPassword === 'password123') {
    throw new Error('Refusing to set the admin password to the public demo password.');
  }

  await mongoose.connect(mongoUri);

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const result = await User.findOneAndUpdate(
    { email: adminEmail, role: 'admin' },
    { $set: { passwordHash } },
    { new: true },
  );

  if (!result) {
    console.error(`✗ No admin user found with email "${adminEmail}" — nothing was changed.`);
    process.exitCode = 1;
  } else {
    console.log(`✓ Password rotated for ${result.email} (id ${result._id}). No other data was touched.`);
  }

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Failed to rotate admin password:', err instanceof Error ? err.message : err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
