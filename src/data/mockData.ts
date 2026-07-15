import type { Category, Craft, Entrepreneur } from '../types';
import { pic } from '../lib/utils';

export const CATEGORIES: Category[] = [
  { id: 'cobbler', name: 'Cobbler', sub: 'Leather & footwear', desc: 'Repairs, resoling and handmade leather goods.' },
  { id: 'potter',  name: 'Potter',  sub: 'Kumhar · clay craft', desc: 'Terracotta, diyas and hand-thrown pottery.' },
  { id: 'tailor',  name: 'Tailor',  sub: 'Stitching & alter.',  desc: 'Bespoke stitching, alterations and embroidery.' },
  { id: 'artisan', name: 'Artisan', sub: 'Handmade décor',      desc: 'Mirror-work, woodcraft and handmade décor.' },
  { id: 'vendor',  name: 'Vendor',  sub: 'Local goods',         desc: 'Home-made pickles, spices and local produce.' },
];

export const CRAFTS: Craft[] = [
  { id: 'potter',  name: 'Handcrafted Pottery', image: pic('hunar-pottery', 900, 900) },
  { id: 'tailor',  name: 'Bespoke Tailoring',   image: pic('hunar-tailor', 900, 900) },
  { id: 'cobbler', name: 'Leather & Footwear',  image: pic('hunar-leather', 900, 900) },
  { id: 'artisan', name: 'Artisan Creations',   image: pic('hunar-artisan', 900, 900) },
  { id: 'vendor',  name: 'Local Market Goods',  image: pic('hunar-market', 900, 900) },
];

export const ENTREPRENEURS: Entrepreneur[] = [
  { id: 'ramesh', name: 'Ramesh Kumar', category: 'potter', craft: 'Potter (Kumhar)', city: 'Jaipur', state: 'Rajasthan',
    exp: 24, rating: 4.9, reviews: 128, start: 120, available: true, verified: true,
    bio: 'Third-generation kumhar hand-throwing terracotta on a traditional wheel. Specialises in garden pots, diyas and clay water bottles fired in a wood kiln.',
    services: [{ name: 'Custom Terracotta Pot', price: 250, dur: '3 days' }, { name: 'Diwali Diya Set (12 pcs)', price: 120, dur: '1 day' }, { name: 'Clay Water Bottle', price: 400, dur: '2 days' }],
    products: [{ name: 'Painted Planter', price: 320 }, { name: 'Kulhad Set (6)', price: 180 }, { name: 'Terracotta Vase', price: 540 }] },
  { id: 'sunita', name: 'Sunita Devi', category: 'tailor', craft: 'Tailor', city: 'Lucknow', state: 'Uttar Pradesh',
    exp: 12, rating: 4.8, reviews: 94, start: 150, available: true, verified: true,
    bio: 'Blouse and kurti specialist trained in Lucknawi chikankari. Precise measurements, quick turnarounds and delicate hand embroidery.',
    services: [{ name: 'Blouse Stitching', price: 300, dur: '4 days' }, { name: 'Kurti Alteration', price: 150, dur: '2 days' }, { name: 'Chikankari Embroidery', price: 800, dur: '7 days' }],
    products: [{ name: 'Chikankari Dupatta', price: 950 }, { name: 'Cotton Kurti', price: 700 }] },
  { id: 'abdul', name: 'Abdul Karim', category: 'cobbler', craft: 'Cobbler', city: 'Old Delhi', state: 'Delhi',
    exp: 30, rating: 4.7, reviews: 76, start: 80, available: false, verified: true,
    bio: 'Master mochi resoling shoes and crafting custom leather sandals for three decades near Jama Masjid.',
    services: [{ name: 'Shoe Resoling', price: 200, dur: '1 day' }, { name: 'Leather Polish & Care', price: 80, dur: 'Same day' }, { name: 'Custom Leather Sandals', price: 900, dur: '5 days' }],
    products: [{ name: 'Handmade Kolhapuri', price: 1100 }, { name: 'Leather Belt', price: 450 }] },
  { id: 'meena', name: 'Meena Kumari', category: 'artisan', craft: 'Artisan · Mirror-work', city: 'Kutch', state: 'Gujarat',
    exp: 18, rating: 5.0, reviews: 210, start: 350, available: true, verified: true,
    bio: 'Kutchi embroidery and mirror-work artisan creating wall hangings, torans and cushion covers for homes across India.',
    services: [{ name: 'Custom Wall Hanging', price: 1200, dur: '10 days' }, { name: 'Toran (door hanging)', price: 650, dur: '6 days' }],
    products: [{ name: 'Mirror-work Cushion', price: 550 }, { name: 'Embroidered Toran', price: 780 }, { name: 'Wall Hanging', price: 1500 }] },
  { id: 'ravi', name: 'Ravi Prajapati', category: 'potter', craft: 'Potter (Kumhar)', city: 'Khurja', state: 'Uttar Pradesh',
    exp: 15, rating: 4.6, reviews: 58, start: 90, available: true, verified: false,
    bio: 'Khurja blue-pottery maker producing glazed ceramic crockery and decorative tiles.',
    services: [{ name: 'Glazed Dinner Set', price: 1400, dur: '8 days' }, { name: 'Decorative Tiles (set)', price: 600, dur: '5 days' }],
    products: [{ name: 'Blue Pottery Bowl', price: 240 }, { name: 'Ceramic Mug', price: 160 }] },
  { id: 'lakshmi', name: 'Lakshmi Naidu', category: 'vendor', craft: 'Local Vendor', city: 'Madurai', state: 'Tamil Nadu',
    exp: 9, rating: 4.5, reviews: 41, start: 60, available: true, verified: true,
    bio: 'Home-made pickles, filter-coffee powder and hand-ground spice blends prepared in small batches.',
    services: [{ name: 'Custom Spice Blend', price: 220, dur: '2 days' }],
    products: [{ name: 'Mango Pickle (500g)', price: 180 }, { name: 'Filter Coffee Powder', price: 240 }, { name: 'Sambar Masala', price: 130 }] },
  { id: 'iqbal', name: 'Iqbal Ansari', category: 'tailor', craft: 'Tailor · Menswear', city: 'Bhopal', state: 'Madhya Pradesh',
    exp: 20, rating: 4.8, reviews: 132, start: 200, available: true, verified: true,
    bio: 'Menswear tailor specialising in kurta-pyjama, sherwani and formal trousers with a precise finish.',
    services: [{ name: 'Kurta-Pyjama Set', price: 600, dur: '5 days' }, { name: 'Sherwani (bespoke)', price: 3500, dur: '14 days' }, { name: 'Trouser Stitching', price: 350, dur: '3 days' }],
    products: [{ name: 'Ready Cotton Kurta', price: 850 }] },
  { id: 'gopal', name: 'Gopal Sharma', category: 'artisan', craft: 'Artisan · Woodwork', city: 'Saharanpur', state: 'Uttar Pradesh',
    exp: 22, rating: 4.9, reviews: 87, start: 300, available: false, verified: true,
    bio: 'Saharanpur wood-carving artisan crafting jharokhas, trays and carved home décor from sheesham wood.',
    services: [{ name: 'Carved Wall Panel', price: 2500, dur: '12 days' }, { name: 'Wooden Serving Tray', price: 700, dur: '4 days' }],
    products: [{ name: 'Carved Trinket Box', price: 480 }, { name: 'Sheesham Coasters (6)', price: 360 }] },
];

export const byId = (id?: string) => ENTREPRENEURS.find((e) => e.id === id);
