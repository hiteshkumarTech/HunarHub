import { motion } from 'motion/react';
import { ShieldCheck, HandCoins, HeartHandshake, Leaf } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';

const reasons = [
  { icon: ShieldCheck, title: 'Verified local artisans', body: 'Every seller is reviewed and verified, so you can hire with confidence.' },
  { icon: HandCoins, title: 'Fair prices, no middlemen', body: 'You pay the maker directly — they keep more, you pay less.' },
  { icon: HeartHandshake, title: 'Direct support to makers', body: 'Your order sustains a real family business and a traditional skill.' },
  { icon: Leaf, title: 'Handmade & sustainable', body: 'Small-batch, made to order, and kinder to the planet than mass production.' },
];

export function WhyChoose() {
  return (
    <section className="border-y border-gray-100 bg-white py-16 md:py-24">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Why HunarHub"
          title="A better deal for you — and for the maker"
          subtitle="We're built around one idea: local skill deserves a fair, direct marketplace."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="rounded-2xl border border-gray-200 p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <r.icon size={22} strokeWidth={1.6} />
              </span>
              <div className="mt-5 text-[16px] font-semibold">{r.title}</div>
              <p className="mt-2 text-[14px] leading-[1.7] text-gray-600">{r.body}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
