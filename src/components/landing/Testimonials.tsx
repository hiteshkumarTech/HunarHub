import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { Monogram } from '../Monogram';
import { Stars } from '../Stars';

const items = [
  { quote: 'HunarHub doubled my monthly orders. I finally sell my pottery beyond my own street.', name: 'Ramesh Kumar', role: 'Potter · Jaipur', rating: 5 },
  { quote: 'Found a brilliant tailor two lanes away. Perfect fit, fair price, delivered on time.', name: 'Priya Sharma', role: 'Customer · Lucknow', rating: 5 },
  { quote: 'I earn directly now — no middleman taking a cut. My family workshop is thriving again.', name: 'Meena Kumari', role: 'Artisan · Kutch', rating: 5 },
];

export function Testimonials() {
  return (
    <section className="border-y border-gray-100 bg-white py-16 md:py-24">
      <Container>
        <SectionHeading align="center" eyebrow="Success stories" title="Loved by makers and customers alike" />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="flex flex-col rounded-2xl border border-gray-200 p-7"
            >
              <Quote size={26} className="text-accent/30" />
              <blockquote className="mt-3 flex-1 text-[15px] leading-[1.7] text-[#111]">“{t.quote}”</blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-5">
                <Monogram name={t.name} size={40} />
                <div className="min-w-0 flex-1">
                  <figcaption className="text-[14px] font-semibold leading-tight">{t.name}</figcaption>
                  <div className="text-[12px] text-gray-500">{t.role}</div>
                </div>
                <Stars value={t.rating} size={12} />
              </div>
            </motion.figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
