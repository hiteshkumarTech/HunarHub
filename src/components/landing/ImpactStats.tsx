import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { Container } from '../ui/Container';

function useCountUp(target: number, run: boolean, duration = 1400): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration]);
  return value;
}

const stats = [
  { value: 500, suffix: '+', label: 'Artisans empowered' },
  { value: 12000, suffix: '+', label: 'Orders fulfilled' },
  { value: 40, suffix: '+', label: 'Cities reached' },
  { value: 35, suffix: '%', label: 'Avg. income increase' },
];

function StatItem({ value, suffix, label, run }: { value: number; suffix: string; label: string; run: boolean }) {
  const n = useCountUp(value, run);
  const display = value >= 1000 ? Math.round(n).toLocaleString('en-IN') : Math.round(n).toString();
  return (
    <div className="text-center">
      <div className="text-[2.4rem] font-semibold tracking-tight text-white md:text-[3rem]">
        {display}
        {suffix}
      </div>
      <div className="mt-1 text-[13px] text-white/60">{label}</div>
    </div>
  );
}

export function ImpactStats() {
  const ref = useRef<HTMLDivElement>(null);
  const run = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section className="bg-[#111] py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-[640px] text-center">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent">Local impact</div>
          <h2 className="mt-3 text-[1.9rem] font-semibold leading-[1.1] tracking-tight text-white md:text-[2.6rem]">
            Real income, real skills, real communities
          </h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-white/60">
            Every booking keeps a traditional craft alive and money in the local economy.
          </p>
        </div>
        <div ref={ref} className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <StatItem key={s.label} value={s.value} suffix={s.suffix} label={s.label} run={run} />
          ))}
        </div>
      </Container>
    </section>
  );
}
