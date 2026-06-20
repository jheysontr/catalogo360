import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Menu, X, ArrowRight } from "lucide-react";
import HeroSection from "@/components/Landing/HeroSection";
import TrustedBySection from "@/components/Landing/TrustedBySection";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import TestimonialsSection from "@/components/Landing/TestimonialsSection";
import FAQSection from "@/components/Landing/FAQSection";
import PricingSection from "@/components/Landing/PricingSection";
import FooterCTA, { Footer } from "@/components/Landing/FooterCTA";
import FloatingCTA from "@/components/Landing/FloatingCTA";

const NAV_LINKS = [
  { href: "#funciones", label: "Funciones" },
  { href: "#planes", label: "Precios" },
  { href: "#faq", label: "FAQ" },
];

const LandingNav = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-3 z-50 w-full px-3 sm:top-5 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3">
        {/* Promo pill */}
        <a
          href="#planes"
          className="group hidden items-center gap-2.5 rounded-full border border-[#2dd4a8]/15 bg-[#2dd4a8]/5 px-4 py-1.5 backdrop-blur-md transition-all hover:border-[#2dd4a8]/40 sm:inline-flex"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#2dd4a8] shadow-[0_0_8px_#2dd4a8] animate-pulse" />
          <span className="text-xs font-medium text-slate-300 sm:text-sm">
            <span className="font-semibold text-[#2dd4a8]">Nuevo:</span> PLAN GRATIS permanente — sin tarjeta
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
        </a>

        {/* Floating glass nav */}
        <nav
          className={`flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#0d1b2a]/60 px-3 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 sm:px-5 sm:py-3.5 ${
            scrolled ? "border-white/15 bg-[#0d1b2a]/80" : ""
          }`}
        >
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2dd4a8] to-[#73ffb8] shadow-lg shadow-[#2dd4a8]/20 transition-transform group-hover:scale-105">
              <Package className="h-4.5 w-4.5 text-[#0d1b2a]" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">
              Catalogo<span className="text-[#2dd4a8]">360</span>
            </span>
          </Link>

          {/* Center links */}
          <div className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative text-sm font-medium text-slate-300 transition-colors hover:text-[#2dd4a8]"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#2dd4a8] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="hidden px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white sm:block"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-[#2dd4a8] px-4 py-2.5 font-display text-xs font-bold text-[#0d1b2a] shadow-[0_0_20px_rgba(45,212,168,0.3)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(45,212,168,0.5)] active:scale-95 sm:px-5 sm:text-sm"
            >
              <span className="relative z-10">Empezar Gratis</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
            </Link>

            {/* Mobile trigger */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu panel */}
        {open && (
          <div className="w-full rounded-2xl border border-white/10 bg-[#0d1b2a]/90 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:hidden">
            <div className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-[#2dd4a8]"
                >
                  {l.label}
                </a>
              ))}
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

const Landing = () => (
  <div
    className="min-h-screen w-full bg-[#0d1b2a] text-slate-200 selection:bg-[#2dd4a8] selection:text-[#0d1b2a]"
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
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
