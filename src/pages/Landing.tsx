import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import HeroSection from "@/components/Landing/HeroSection";
import TrustedBySection from "@/components/Landing/TrustedBySection";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import TestimonialsSection from "@/components/Landing/TestimonialsSection";
import FAQSection from "@/components/Landing/FAQSection";
import PricingSection from "@/components/Landing/PricingSection";
import FooterCTA, { Footer } from "@/components/Landing/FooterCTA";
import FloatingCTA from "@/components/Landing/FloatingCTA";

const TopBanner = () => (
  <div className="w-full border-b border-[#2dd4a8]/20 bg-[#1b4332]/60 py-2.5 text-center backdrop-blur-md">
    <p className="text-xs font-semibold text-[#73ffb8] sm:text-sm">
      💰 PLAN GRATIS permanente · Crea tu tienda hoy sin costo. Upgrade cuando generes ventas.
    </p>
  </div>
);

const LandingNav = () => (
  <nav className="sticky top-0 z-50 w-full border-b border-[#1b4332]/40 bg-[#0d1b2a]/80 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2dd4a8] shadow-[0_0_15px_rgba(45,212,168,0.4)]">
          <Package className="h-5 w-5 text-[#0d1b2a]" strokeWidth={2.5} />
        </div>
        <span className="font-display text-lg font-bold tracking-tight text-white">Catalogo360</span>
      </Link>
      <div className="flex items-center gap-3 sm:gap-6">
        <a href="#planes" className="hidden text-sm font-medium text-slate-300 transition-colors hover:text-[#2dd4a8] sm:inline">
          Precios
        </a>
        <Link
          to="/login"
          className="hidden text-sm font-medium text-slate-300 transition-colors hover:text-[#2dd4a8] sm:inline"
        >
          Iniciar sesión
        </Link>
        <Link
          to="/register"
          className="rounded-full bg-[#2dd4a8] px-4 py-2 text-xs font-bold text-[#0d1b2a] transition-all hover:bg-[#73ffb8] sm:px-6 sm:text-sm"
        >
          Empezar Gratis
        </Link>
      </div>
    </div>
  </nav>
);

const Landing = () => (
  <div className="min-h-screen w-full bg-[#0d1b2a] text-slate-200 selection:bg-[#2dd4a8] selection:text-[#0d1b2a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
    <TopBanner />
    <LandingNav />
    <HeroSection />
    <TrustedBySection />
    <FeaturesSection />
    <TestimonialsSection />
    <PricingSection />
    <FAQSection />
    <FooterCTA />
    <Footer />
    <FloatingCTA />
  </div>
);

export default Landing;
