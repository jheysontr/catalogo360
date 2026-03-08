import HeroSection from "@/components/Landing/HeroSection";
import TrustedBySection from "@/components/Landing/TrustedBySection";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import PricingSection from "@/components/Landing/PricingSection";
import TestimonialsSection from "@/components/Landing/TestimonialsSection";
import FAQSection from "@/components/Landing/FAQSection";
import FooterCTA, { Footer } from "@/components/Landing/FooterCTA";

const Landing = () => (
  <div className="flex flex-col">
    <HeroSection />
    <TrustedBySection />
    <FeaturesSection />
    <PricingSection />
    <TestimonialsSection />
    <FooterCTA />
    <FAQSection />
    <Footer />
  </div>
);

export default Landing;
