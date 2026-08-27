import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { DataSourceStrip } from '@/components/landing/DataSourceStrip';
import { CredibilityStrip } from '@/components/landing/CredibilityStrip';
import { ModulesSection } from '@/components/landing/ModulesSection';
import { InteractiveDemoSection } from '@/components/landing/InteractiveDemoSection';
import { ConsultingComparisonSection } from '@/components/landing/ConsultingComparisonSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <CredibilityStrip />
        <InteractiveDemoSection />
        <DataSourceStrip />
        <ModulesSection />
        <ConsultingComparisonSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
