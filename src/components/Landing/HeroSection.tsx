import { Link } from "react-router-dom";
import { ArrowRight, Check, Zap, ShoppingCart, Play } from "lucide-react";
import demoDashboard from "@/assets/demo-dashboard.jpg";
import demoStorefrontMobile from "@/assets/demo-storefront-mobile.jpg";

const HeroSection = () => (
  <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:pt-32 sm:pb-24">
    {/* Background glows */}
    <div className="pointer-events-none absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#2dd4a8]/10 blur-[120px]" />
    <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[#1b4332]/30 blur-[100px]" />
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #2dd4a8 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />

    <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
      {/* Left content */}
      <div>
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#2dd4a8]/20 bg-[#1b4332]/40 px-4 py-1.5 text-xs font-semibold text-[#73ffb8] backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-[#73ffb8] animate-pulse" />
          +500 emprendedores confían en nosotros
        </div>

        <h1 className="mb-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-white lg:text-7xl">
          Tu tienda online <br />
          <span className="bg-gradient-to-r from-[#2dd4a8] to-[#73ffb8] bg-clip-text text-transparent">
            en 5 minutos
          </span>
        </h1>

        <p className="mb-10 max-w-lg text-lg leading-relaxed text-slate-400">
          Publica tu catálogo, recibe pedidos por WhatsApp y haz crecer tu negocio. Sin código, sin complicaciones. Optimizado para Bolivia y Latinoamérica.
        </p>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/register"
            className="group flex items-center justify-center gap-2 rounded-xl bg-[#2dd4a8] px-8 py-4 text-base font-bold text-[#0d1b2a] shadow-xl shadow-[#2dd4a8]/20 transition-all hover:scale-[1.02] hover:bg-[#73ffb8] active:scale-95 sm:text-lg"
          >
            Crear mi tienda GRATIS ahora
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/demo"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/30 px-8 py-4 text-base font-bold text-white transition-all hover:bg-slate-800/60 sm:text-lg"
          >
            <Play className="h-4 w-4" /> Ver demo en vivo
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-[#2dd4a8]" />
            Plan gratis permanente
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-[#2dd4a8]" />
            +10k órdenes este mes
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-[#2dd4a8]" />
            Sin tarjeta requerida
          </div>
        </div>
      </div>

      {/* Right visuals */}
      <div className="relative flex items-center justify-center">
        {/* Desktop dashboard mockup */}
        <div className="relative aspect-[16/10] w-full max-w-[540px] rounded-2xl border border-[#2dd4a8]/20 bg-[#1b4332]/20 p-2 shadow-2xl backdrop-blur-md">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#0d1b2a]">
            <div className="flex h-7 items-center gap-1.5 border-b border-slate-800 bg-slate-900 px-3">
              <div className="h-2 w-2 rounded-full bg-red-500/40" />
              <div className="h-2 w-2 rounded-full bg-yellow-500/40" />
              <div className="h-2 w-2 rounded-full bg-green-500/40" />
              <div className="ml-4 font-mono text-[10px] tracking-tighter text-slate-600">
                catalogo360.app/dashboard
              </div>
            </div>
            <img
              src={demoDashboard}
              alt="Panel de administración de Catalogo360"
              className="flex-1 object-cover opacity-90"
              loading="lazy"
            />
          </div>
        </div>

        {/* Mobile floating mockup */}
        <div className="absolute -right-2 -bottom-6 w-36 rotate-2 rounded-[2.5rem] border-[6px] border-slate-800 bg-[#0d1b2a] p-1 shadow-2xl transition-transform duration-500 hover:rotate-0 sm:w-44">
          <div className="relative aspect-[9/19] overflow-hidden rounded-[2.2rem] border border-slate-700 bg-slate-900">
            <img
              src={demoStorefrontMobile}
              alt="Tienda móvil de Catalogo360"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          {/* WhatsApp notification floating */}
          <div className="absolute -left-12 top-1/4 flex scale-90 items-center gap-2 rounded-xl bg-white p-3 text-[#0d1b2a] shadow-2xl sm:scale-100">
            <div className="rounded-lg bg-green-100 p-1.5">
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </div>
            <div className="whitespace-nowrap">
              <p className="mb-0.5 text-[10px] font-bold leading-none text-slate-500">
                Nuevo pedido
              </p>
              <p className="font-display text-xs font-bold tracking-tight">Bs 450.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
