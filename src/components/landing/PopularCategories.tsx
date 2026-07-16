import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { CatIcon } from '../craftIcons';
import { CATEGORIES } from '../../data/mockData';
import type { CategoryId } from '../../types';

// Illustrative supply counts until wired to live aggregates.
const COUNTS: Record<CategoryId, string> = {
  cobbler: '80+',
  potter: '120+',
  tailor: '150+',
  artisan: '90+',
  vendor: '60+',
};

export function PopularCategories() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <SectionHeading
          eyebrow="Browse by craft"
          title="Popular categories"
          subtitle="Find the right local maker for the job — from everyday repairs to one-of-a-kind handmade pieces."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link
                to={`/browse?cat=${c.id}`}
                className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-black hover:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.4)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <CatIcon id={c.id} size={20} strokeWidth={1.6} />
                </span>
                <div className="mt-5 text-[16px] font-semibold">{c.name}</div>
                <div className="text-[12px] text-gray-500">{c.sub}</div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[12px] text-gray-500">
                  <span>{COUNTS[c.id]} makers</span>
                  <ArrowUpRight size={15} className="text-gray-400 transition-colors group-hover:text-accent" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
