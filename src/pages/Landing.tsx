import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { HeroSection } from '../components/landing/HeroSection';
import { PopularCategories } from '../components/landing/PopularCategories';
import { FeaturedEntrepreneurs } from '../components/landing/FeaturedEntrepreneurs';
import { TrendingProducts } from '../components/landing/TrendingProducts';
import { CraftSpotlight } from '../components/landing/CraftSpotlight';
import { WhyChoose } from '../components/landing/WhyChoose';
import { ImpactStats } from '../components/landing/ImpactStats';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Testimonials } from '../components/landing/Testimonials';
import { FinalCTA } from '../components/landing/FinalCTA';

/**
 * Premium marketing homepage. Composed from reusable sections; all data comes
 * from `data/mockData` for now and swaps to live API calls in milestone M1
 * without touching these section components.
 */
export default function Landing() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <PopularCategories />
        <FeaturedEntrepreneurs />
        <TrendingProducts />
        <CraftSpotlight />
        <WhyChoose />
        <ImpactStats />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
