import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Heart } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { ENTREPRENEURS } from '../../data/mockData';
import { inr, pic } from '../../lib/utils';

type TrendingProduct = { key: string; name: string; price: number; maker: string; makerId: string; image: string };

const trending: TrendingProduct[] = ENTREPRENEURS.flatMap((e) =>
  e.products.map((p, i) => ({
    key: `${e.id}-${i}`,
    name: p.name,
    price: p.price,
    maker: e.name,
    makerId: e.id,
    image: pic(`prod-${e.id}-${i}`, 500, 500),
  })),
).slice(0, 8);

export function TrendingProducts() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <SectionHeading
          eyebrow="Handmade & one-of-a-kind"
          title="Trending handmade products"
          subtitle="Real pieces made by real hands — buy directly and support the maker behind each one."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {trending.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: (i % 4) * 0.05 }}
            >
              <Link
                to={`/profile/${p.makerId}`}
                className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:border-black hover:shadow-[0_18px_44px_-28px_rgba(0,0,0,0.45)]"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    aria-hidden
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                  >
                    <Heart size={15} />
                  </span>
                </div>
                <div className="p-4">
                  <div className="truncate text-[14px] font-medium">{p.name}</div>
                  <div className="mt-0.5 text-[12px] text-gray-500">by {p.maker}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[15px] font-semibold">{inr(p.price)}</span>
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                      View <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
