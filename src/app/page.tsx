import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsStrip } from '@/components/landing/StatsStrip';
import { DataSourceStrip } from '@/components/landing/DataSourceStrip';
import { PersonasSection } from '@/components/landing/PersonasSection';
import { CredibilityStrip } from '@/components/landing/CredibilityStrip';
import { ModulesSection } from '@/components/landing/ModulesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { BeforeAfterSection } from '@/components/landing/BeforeAfterSection';
import { ProductPreviewSection } from '@/components/landing/ProductPreviewSection';
import { ValuePropsSection } from '@/components/landing/ValuePropsSection';
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
        <StatsStrip />
        <DataSourceStrip />
        <PersonasSection />
        <CredibilityStrip />
        <ModulesSection />
        <HowItWorksSection />
        <DemoSection />
        <BeforeAfterSection />
        <ProductPreviewSection />
        <ValuePropsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
