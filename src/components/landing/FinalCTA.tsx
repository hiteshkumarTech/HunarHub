import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container } from '../ui/Container';
import { buttonStyles } from '../ui/button';

export function FinalCTA() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-[#111] px-8 py-14 text-center md:px-16 md:py-20">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative mx-auto max-w-[640px]">
            <h2 className="text-[2rem] font-semibold leading-[1.1] tracking-tight text-white md:text-[3rem]">
              Discover the skilled hands near you
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-white/70 md:text-[16px]">
              Hire a local artisan today — or put your own craft in front of thousands of customers.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/browse" className={buttonStyles({ variant: 'primary', size: 'lg' })}>
                Explore artisans <ArrowRight size={18} />
              </Link>
              <Link to="/dashboard" className={buttonStyles({ variant: 'onDark', size: 'lg' })}>
                Become a seller
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
