import { motion } from 'motion/react';
import { Search, CalendarCheck, HandHeart } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';

const steps = [
  { icon: Search, title: 'Discover', body: 'Search by craft, skill or location and browse verified local artisans near you.' },
  { icon: CalendarCheck, title: 'Book or order', body: 'Request a service or buy a handmade product — agree the details directly with the maker.' },
  { icon: HandHeart, title: 'Support a maker', body: 'Get quality work done, leave a review, and help a local business grow.' },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <SectionHeading align="center" eyebrow="How it works" title="Hire local talent in three steps" />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-gray-200 bg-white p-7"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111] text-white">
                  <s.icon size={22} strokeWidth={1.6} />
                </span>
                <span className="font-mono text-[13px] text-gray-400">0{i + 1}</span>
              </div>
              <div className="mt-5 text-[18px] font-semibold">{s.title}</div>
              <p className="mt-2 text-[14px] leading-[1.7] text-gray-600">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
