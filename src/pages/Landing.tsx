import HeroSection from "@/components/Landing/HeroSection";
import TrustedBySection from "@/components/Landing/TrustedBySection";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import TestimonialsSection from "@/components/Landing/TestimonialsSection";
import FAQSection from "@/components/Landing/FAQSection";
import PricingSection from "@/components/Landing/PricingSection";
import FooterCTA, { Footer } from "@/components/Landing/FooterCTA";
import FloatingCTA from "@/components/Landing/FloatingCTA";

const Landing = () => (
  <div className="flex flex-col">
    <HeroSection />
    <TrustedBySection />
    <FeaturesSection />
    <TestimonialsSection />
    <FAQSection />
    <PricingSection />
    <FooterCTA />
    <Footer />
    <FloatingCTA />
  </div>
);

export default Landing;
