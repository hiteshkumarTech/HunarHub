/**
 * Seed the database with an admin, a demo customer, and the sample
 * entrepreneurs (with services + products) that match the frontend.
 *
 * Run:  npm run seed
 *
 * Customer + entrepreneur demo accounts use the password:  password123
 * (intentionally public — they're meant to be tried by anyone reviewing the app,
 * and none of them can escalate past their own data).
 *
 * The admin account is DIFFERENT: it must never have a predictable password,
 * because it grants full platform access (every user, every listing, moderation
 * delete). Set ADMIN_SEED_PASSWORD before running this against anything other
 * than a disposable local database — see the console output below if you don't.
 */
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Service } from '../models/Service';
import { Product } from '../models/Product';
import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { Category } from '../models/Category';
import { Complaint } from '../models/Complaint';
import { CATEGORY_LABELS } from '../models/categoryLabels';

const pic = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}?grayscale`;

type SeedEntrepreneur = {
  id: string;
  name: string;
  category: 'cobbler' | 'potter' | 'tailor' | 'artisan' | 'vendor';
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
  services: { name: string; price: number; dur: string }[];
  products: { name: string; price: number }[];
};

const ENTREPRENEURS: SeedEntrepreneur[] = [
  { id: 'ramesh', name: 'Ramesh Kumar', category: 'potter', craft: 'Potter (Kumhar)', city: 'Jaipur', state: 'Rajasthan', exp: 24, rating: 4.9, reviews: 128, start: 120, available: true, verified: true, bio: 'Third-generation kumhar hand-throwing terracotta on a traditional wheel. Specialises in garden pots, diyas and clay water bottles fired in a wood kiln.', services: [{ name: 'Custom Terracotta Pot', price: 250, dur: '3 days' }, { name: 'Diwali Diya Set (12 pcs)', price: 120, dur: '1 day' }, { name: 'Clay Water Bottle', price: 400, dur: '2 days' }], products: [{ name: 'Painted Planter', price: 320 }, { name: 'Kulhad Set (6)', price: 180 }, { name: 'Terracotta Vase', price: 540 }] },
  { id: 'sunita', name: 'Sunita Devi', category: 'tailor', craft: 'Tailor', city: 'Lucknow', state: 'Uttar Pradesh', exp: 12, rating: 4.8, reviews: 94, start: 150, available: true, verified: true, bio: 'Blouse and kurti specialist trained in Lucknawi chikankari. Precise measurements, quick turnarounds and delicate hand embroidery.', services: [{ name: 'Blouse Stitching', price: 300, dur: '4 days' }, { name: 'Kurti Alteration', price: 150, dur: '2 days' }, { name: 'Chikankari Embroidery', price: 800, dur: '7 days' }], products: [{ name: 'Chikankari Dupatta', price: 950 }, { name: 'Cotton Kurti', price: 700 }] },
  { id: 'abdul', name: 'Abdul Karim', category: 'cobbler', craft: 'Cobbler', city: 'Old Delhi', state: 'Delhi', exp: 30, rating: 4.7, reviews: 76, start: 80, available: false, verified: true, bio: 'Master mochi resoling shoes and crafting custom leather sandals for three decades near Jama Masjid.', services: [{ name: 'Shoe Resoling', price: 200, dur: '1 day' }, { name: 'Leather Polish & Care', price: 80, dur: 'Same day' }, { name: 'Custom Leather Sandals', price: 900, dur: '5 days' }], products: [{ name: 'Handmade Kolhapuri', price: 1100 }, { name: 'Leather Belt', price: 450 }] },
  { id: 'meena', name: 'Meena Kumari', category: 'artisan', craft: 'Artisan · Mirror-work', city: 'Kutch', state: 'Gujarat', exp: 18, rating: 5.0, reviews: 210, start: 350, available: true, verified: true, bio: 'Kutchi embroidery and mirror-work artisan creating wall hangings, torans and cushion covers for homes across India.', services: [{ name: 'Custom Wall Hanging', price: 1200, dur: '10 days' }, { name: 'Toran (door hanging)', price: 650, dur: '6 days' }], products: [{ name: 'Mirror-work Cushion', price: 550 }, { name: 'Embroidered Toran', price: 780 }, { name: 'Wall Hanging', price: 1500 }] },
  { id: 'ravi', name: 'Ravi Prajapati', category: 'potter', craft: 'Potter (Kumhar)', city: 'Khurja', state: 'Uttar Pradesh', exp: 15, rating: 4.6, reviews: 58, start: 90, available: true, verified: false, bio: 'Khurja blue-pottery maker producing glazed ceramic crockery and decorative tiles.', services: [{ name: 'Glazed Dinner Set', price: 1400, dur: '8 days' }, { name: 'Decorative Tiles (set)', price: 600, dur: '5 days' }], products: [{ name: 'Blue Pottery Bowl', price: 240 }, { name: 'Ceramic Mug', price: 160 }] },
  { id: 'lakshmi', name: 'Lakshmi Naidu', category: 'vendor', craft: 'Local Vendor', city: 'Madurai', state: 'Tamil Nadu', exp: 9, rating: 4.5, reviews: 41, start: 60, available: true, verified: true, bio: 'Home-made pickles, filter-coffee powder and hand-ground spice blends prepared in small batches.', services: [{ name: 'Custom Spice Blend', price: 220, dur: '2 days' }], products: [{ name: 'Mango Pickle (500g)', price: 180 }, { name: 'Filter Coffee Powder', price: 240 }, { name: 'Sambar Masala', price: 130 }] },
  { id: 'iqbal', name: 'Iqbal Ansari', category: 'tailor', craft: 'Tailor · Menswear', city: 'Bhopal', state: 'Madhya Pradesh', exp: 20, rating: 4.8, reviews: 132, start: 200, available: true, verified: true, bio: 'Menswear tailor specialising in kurta-pyjama, sherwani and formal trousers with a precise finish.', services: [{ name: 'Kurta-Pyjama Set', price: 600, dur: '5 days' }, { name: 'Sherwani (bespoke)', price: 3500, dur: '14 days' }, { name: 'Trouser Stitching', price: 350, dur: '3 days' }], products: [{ name: 'Ready Cotton Kurta', price: 850 }] },
  { id: 'gopal', name: 'Gopal Sharma', category: 'artisan', craft: 'Artisan · Woodwork', city: 'Saharanpur', state: 'Uttar Pradesh', exp: 22, rating: 4.9, reviews: 87, start: 300, available: false, verified: true, bio: 'Saharanpur wood-carving artisan crafting jharokhas, trays and carved home décor from sheesham wood.', services: [{ name: 'Carved Wall Panel', price: 2500, dur: '12 days' }, { name: 'Wooden Serving Tray', price: 700, dur: '4 days' }], products: [{ name: 'Carved Trinket Box', price: 480 }, { name: 'Sheesham Coasters (6)', price: 360 }] },
];

// An explicitly-set-but-weak ADMIN_SEED_PASSWORD is rejected rather than silently
// accepted — otherwise ADMIN_SEED_PASSWORD=password123 could quietly reintroduce
// the exact vulnerability this file was fixed to close. Checked BEFORE any
// database write below, so a weak value fails safe with nothing touched yet.
const WEAK_ADMIN_PASSWORDS = new Set(['password123', 'admin123', 'changeme', 'password', 'admin']);
if (process.env.ADMIN_SEED_PASSWORD) {
  const candidate = process.env.ADMIN_SEED_PASSWORD;
  if (candidate.length < 12 || WEAK_ADMIN_PASSWORDS.has(candidate.toLowerCase())) {
    throw new Error(
      '[seed] ADMIN_SEED_PASSWORD is too weak (needs 12+ chars, not a common default). ' +
        'Unset it to get a random generated password instead, or provide a stronger one.',
    );
  }
}

async function run() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Service.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Order.deleteMany({}),
    Category.deleteMany({}),
    Complaint.deleteMany({}),
  ]);

  await Category.insertMany(Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label, active: true })));

  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin gets its own password — generated fresh, or read from ADMIN_SEED_PASSWORD
  // (already validated above) — instead of sharing the public demo password above.
  const generatedAdminPassword = crypto.randomBytes(12).toString('base64url');
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || generatedAdminPassword;
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  await User.create({ name: 'Platform Admin', email: 'admin@hunarhub.in', passwordHash: adminPasswordHash, role: 'admin' });
  const priya = await User.create({ name: 'Priya Sharma', email: 'priya@example.com', passwordHash, role: 'customer' });

  // Keep track of a couple of real created listings so the order/earnings/
  // admin-monitoring demo data below references genuine ids, not fabricated ones.
  const entrepreneursById: Record<string, { userId: (typeof priya)['_id']; firstServiceId?: unknown; firstProductId?: unknown }> = {};

  for (const e of ENTREPRENEURS) {
    const user = await User.create({
      name: e.name,
      email: `${e.id}@hunarhub.in`,
      passwordHash,
      role: 'entrepreneur',
      profile: {
        category: e.category,
        craft: e.craft,
        city: e.city,
        state: e.state,
        exp: e.exp,
        bio: e.bio,
        startingPrice: e.start,
        available: e.available,
        verified: e.verified,
        ratingAvg: e.rating,
        ratingCount: e.reviews,
      },
    });
    // publicId: null on these — they're Picsum placeholder URLs, not real
    // Cloudinary assets, so there's nothing to delete if they're ever
    // replaced. Same convention the API uses for any pre-Cloudinary image.
    const createdServices = await Service.insertMany(
      e.services.map((s, i) => ({
        ...s,
        entrepreneur: user._id,
        images: i === 0 ? [{ url: pic(`svc-${e.id}-${i}`, 500, 400), publicId: null }] : [],
      })),
    );
    const createdProducts = await Product.insertMany(
      e.products.map((p, i) => ({
        ...p,
        entrepreneur: user._id,
        images: [
          { url: pic(`prod-${e.id}-${i}-0`, 500, 500), publicId: null },
          { url: pic(`prod-${e.id}-${i}-1`, 500, 500), publicId: null },
        ],
      })),
    );
    entrepreneursById[e.id] = { userId: user._id, firstServiceId: createdServices[0]?._id, firstProductId: createdProducts[0]?._id };
  }

  // A handful of orders across a few statuses — gives the entrepreneur
  // earnings KPI, the admin order-monitoring tab, and the complaint below
  // something real to show immediately, without needing anyone to place a
  // fresh order by hand first.
  const ramesh = entrepreneursById.ramesh;
  const sunita = entrepreneursById.sunita;
  const seededOrders = await Order.insertMany([
    { customer: priya._id, entrepreneur: ramesh.userId, kind: 'service', item: ramesh.firstServiceId, title: 'Custom Terracotta Pot', price: 250, status: 'completed' },
    { customer: priya._id, entrepreneur: ramesh.userId, kind: 'product', item: ramesh.firstProductId, title: 'Painted Planter', price: 320, status: 'completed' },
    { customer: priya._id, entrepreneur: ramesh.userId, kind: 'service', item: ramesh.firstServiceId, title: 'Custom Terracotta Pot', price: 250, status: 'accepted' },
    { customer: priya._id, entrepreneur: ramesh.userId, kind: 'service', item: ramesh.firstServiceId, title: 'Custom Terracotta Pot', price: 250, status: 'pending' },
    { customer: priya._id, entrepreneur: sunita.userId, kind: 'service', item: sunita.firstServiceId, title: 'Blouse Stitching', price: 300, status: 'declined' },
  ]);

  // One demo complaint tied to a real order, so the admin Complaints tab and
  // a customer's own "my reports" view both have something to show.
  await Complaint.create({
    reporter: priya._id,
    order: seededOrders[1]._id,
    subject: 'Planter arrived with a small crack',
    message: 'The painted planter I ordered arrived with a hairline crack near the base. Could you advise on a replacement or refund?',
    status: 'open',
  });

  console.log(`✓ Seeded 1 admin, 1 customer, ${ENTREPRENEURS.length} entrepreneurs (with services + products), 5 orders, 1 complaint, 5 categories`);
  console.log('  Customer/entrepreneur demo logins (password: password123):');
  console.log('    priya@example.com  ·  ramesh@hunarhub.in …');
  console.log('');
  if (process.env.ADMIN_SEED_PASSWORD) {
    console.log('  Admin login: admin@hunarhub.in — password set from ADMIN_SEED_PASSWORD.');
  } else {
    console.log('  Admin login: admin@hunarhub.in');
    console.log(`  Admin password (generated, shown once — save it now): ${generatedAdminPassword}`);
    console.log('  Set ADMIN_SEED_PASSWORD next time to choose your own instead of a random one.');
  }

  await disconnectDB();
}

run().catch(async (err) => {
  console.error('Seed failed:', err);
  await disconnectDB();
  process.exit(1);
});
