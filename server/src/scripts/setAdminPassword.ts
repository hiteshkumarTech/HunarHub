/**
 * Rotate the admin account's password on an ALREADY-SEEDED database — including
 * production — without touching anything else. Safe to run repeatedly.
 *
 * Unlike `npm run seed` (which wipes and recreates every collection), this only
 * updates one field on one document: it does not delete or reset users, orders,
 * reviews, services, or products.
 *
 * Usage — interactive (preferred; the password is typed at a masked prompt,
 * so it never appears in shell history or a process listing):
 *   MONGODB_URI="<your Atlas connection string>" npm run set-admin-password
 *
 * Usage — non-interactive (CI/automation, where NEW_ADMIN_PASSWORD comes from
 * a secrets manager rather than being typed):
 *   MONGODB_URI="..." NEW_ADMIN_PASSWORD="<strong new password>" npm run set-admin-password
 *
 * MONGODB_URI is always required and always validated below — nothing here
 * has a fallback, on purpose, to make it impossible to silently no-op or
 * write a weak password into a real database.
 */
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User';

// Key codes read one character at a time in raw stdin mode.
const KEY_LF = 10; // \n
const KEY_CR = 13; // \r
const KEY_EOT = 4; // Ctrl+D
const KEY_ETX = 3; // Ctrl+C
const KEY_BACKSPACE = 8; // \b
const KEY_DEL = 127; // Delete/Backspace on most terminals

/** Reads a line from stdin without echoing it to the terminal. */
function promptHiddenPassword(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      reject(new Error('No interactive terminal available — set NEW_ADMIN_PASSWORD instead.'));
      return;
    }
    process.stdout.write(question);
    let input = '';
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    const onData = (chunk: string) => {
      for (const char of chunk) {
        const code = char.charCodeAt(0);
        if (code === KEY_LF || code === KEY_CR || code === KEY_EOT) {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(input);
          return;
        }
        if (code === KEY_ETX) {
          process.stdout.write('\n');
          process.exit(130);
        } else if (code === KEY_BACKSPACE || code === KEY_DEL) {
          input = input.slice(0, -1);
        } else {
          input += char;
        }
      }
    };
    stdin.on('data', onData);
  });
}

function isWeakPassword(password: string): boolean {
  const weak = new Set(['password123', 'admin123', 'changeme', 'password', 'admin']);
  return password.length < 12 || weak.has(password.toLowerCase());
}

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hunarhub.in';

  if (!mongoUri) throw new Error('Set MONGODB_URI to the target database connection string.');

  let newPassword = process.env.NEW_ADMIN_PASSWORD;
  if (!newPassword) {
    newPassword = await promptHiddenPassword('New admin password (12+ chars, hidden): ');
  }
  if (isWeakPassword(newPassword)) {
    throw new Error('Password is too weak — needs 12+ characters and must not be a common default.');
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
