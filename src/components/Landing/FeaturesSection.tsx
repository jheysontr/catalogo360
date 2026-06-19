import { Link } from "react-router-dom";
import {
  ArrowRight, Check, Palette, BarChart3, MessageCircle, ShoppingCart,
  Layers, TrendingUp, Globe, Zap, Smartphone, Tag, Truck, QrCode,
  Users, Sparkles, Lock, Box,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import demoStorefront from "@/assets/demo-storefront.jpg";
import demoAnalytics from "@/assets/demo-analytics.jpg";

/* ---------- Animated counter ---------- */
const AnimatedCounter = ({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!ref.current || started) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStarted(true); observer.disconnect(); }
    }, { threshold: 0.4 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); } else { setCount(start); }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ---------- Browser mockup (dark) ---------- */
const BrowserMockup = ({ url, children }: { url: string; children: React.ReactNode }) => (
  <div className="relative rounded-2xl border border-[#2dd4a8]/20 bg-[#1b4332]/20 p-2 shadow-2xl backdrop-blur-md">
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d1b2a]">
      <div className="flex items-center gap-1.5 border-b border-slate-800 bg-slate-900 px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-red-500/40" />
        <div className="h-2 w-2 rounded-full bg-yellow-500/40" />
        <div className="h-2 w-2 rounded-full bg-green-500/40" />
        <div className="ml-4 font-mono text-[10px] tracking-tighter text-slate-600">{url}</div>
      </div>
      {children}
    </div>
  </div>
);

/* ---------- Why section ---------- */
const WhySection = () => {
  const benefits = [
    { emoji: "🌙", title: "VENDE INCLUSO DURMIENDO", desc: "Tu catálogo recibe pedidos 24/7 por WhatsApp, Instagram y web. Tú solo confirmas y envías." },
    { emoji: "📊", title: "DI ADIÓS AL DESORDEN", desc: "Un solo dashboard: pedidos, precios, inventario. Olvídate de Excel, Sheets y mensajes sueltos." },
    { emoji: "📈", title: "AUMENTA TU TICKET PROMEDIO", desc: "Con cupones inteligentes y variantes, nuestros usuarios suben ventas un 35%." },
    { emoji: "🔒", title: "TUS DATOS SON TUYOS", desc: "Control total de clientes, precios y margen. Nadie te puede cerrar la tienda de un día a otro." },
  ];

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2dd4a8]/20 bg-[#1b4332]/40 px-3 py-1 text-xs font-semibold text-[#73ffb8]">
            <Sparkles className="h-3.5 w-3.5" /> Beneficios
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            ¿Por qué elegir <span className="bg-gradient-to-r from-[#2dd4a8] to-[#73ffb8] bg-clip-text text-transparent">Catalogo360</span>?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">Resultados reales para emprendedores reales.</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {benefits.map((card) => (
            <div key={card.title}
              className="group relative rounded-2xl border border-[#2dd4a8]/10 bg-[#1b4332]/10 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#2dd4a8]/40 hover:bg-[#1b4332]/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1b4332] text-2xl ring-1 ring-[#2dd4a8]/20">
                {card.emoji}
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------- Storefront showcase ---------- */
const StorefrontShowcase = () => (
  <section className="border-t border-[#1b4332]/30 px-4 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2dd4a8]/20 bg-[#1b4332]/40 px-3 py-1 text-xs font-semibold text-[#73ffb8]">
            <ShoppingCart className="h-3.5 w-3.5" /> Tienda Online
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Tu catálogo profesional, <span className="bg-gradient-to-r from-[#2dd4a8] to-[#73ffb8] bg-clip-text text-transparent">listo para vender</span>
          </h2>
          <p className="mt-4 leading-relaxed text-slate-400">
            Tus clientes navegan tu catálogo como en las mejores tiendas del mundo. Filtros, búsqueda, categorías, variantes y carrito de compras incluidos.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Diseño responsive para cualquier dispositivo",
              "Búsqueda y filtros por categoría",
              "Variantes de tallas y colores",
              "Carrito + checkout con WhatsApp",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="h-4 w-4 shrink-0 text-[#2dd4a8]" /> {f}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2dd4a8] px-6 py-3 text-sm font-bold text-[#0d1b2a] shadow-lg shadow-[#2dd4a8]/20 transition-all hover:scale-[1.02] hover:bg-[#73ffb8]"
            >
              Ver tienda demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <BrowserMockup url="catalogo360.online/mi-tienda">
          <img src={demoStorefront} alt="Vista de la tienda online" className="w-full opacity-90" loading="lazy" />
        </BrowserMockup>
      </div>
    </div>
  </section>
);

/* ---------- Dashboard showcase ---------- */
const DashboardShowcase = () => (
  <section className="px-4 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <BrowserMockup url="catalogo360.app/dashboard/analytics">
            <img src={demoAnalytics} alt="Panel de analíticas" className="w-full opacity-90" loading="lazy" />
          </BrowserMockup>
        </div>
        <div className="order-1 lg:order-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2dd4a8]/20 bg-[#1b4332]/40 px-3 py-1 text-xs font-semibold text-[#73ffb8]">
            <TrendingUp className="h-3.5 w-3.5" /> Analíticas
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Métricas que impulsan <span className="bg-gradient-to-r from-[#2dd4a8] to-[#73ffb8] bg-clip-text text-transparent">tu crecimiento</span>
          </h2>
          <p className="mt-4 leading-relaxed text-slate-400">
            Monitorea ventas, pedidos y el rendimiento de tu catálogo en tiempo real. Toma decisiones basadas en datos desde un panel intuitivo.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Dashboard de ventas en tiempo real",
              "Productos más vendidos y stock bajo",
              "Reportes de pedidos y envíos",
              "Notificaciones realtime de nuevos pedidos",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="h-4 w-4 shrink-0 text-[#2dd4a8]" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

/* ---------- How orders work ---------- */
const HowOrdersWork = () => (
  <section className="border-t border-[#1b4332]/30 px-4 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="rounded-2xl border border-[#2dd4a8]/20 bg-[#1b4332]/20 p-5 backdrop-blur-md">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-700/50 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2dd4a8]/20">
                <MessageCircle className="h-5 w-5 text-[#2dd4a8]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Catalogo360 Bot</p>
                <p className="text-xs text-slate-400">Nuevo pedido recibido</p>
              </div>
            </div>
            {["🛒 Pedido #1042", "👤 María López", "📦 3 productos — Bs 450", "✅ Estado: Confirmado"].map((line) => (
              <div key={line} className="mb-2 w-fit max-w-[80%] rounded-xl rounded-tl-none bg-[#1b4332]/60 px-4 py-2 text-sm text-slate-200">
                {line}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Así recibes tus pedidos con <span className="bg-gradient-to-r from-[#2dd4a8] to-[#73ffb8] bg-clip-text text-transparent">Catalogo360</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Tus clientes ven tu catálogo, eligen productos y finalizan el pedido. Tú recibes todo organizado en WhatsApp, listo para despachar.
          </p>
          <ol className="mt-8 space-y-5">
            {[
              "Tu cliente abre el enlace de tu catálogo desde cualquier dispositivo.",
              "Explora tus productos, agrega al carrito y completa sus datos.",
              "Recibes el pedido con todos los detalles vía WhatsApp y dashboard.",
              "Confirmas, preparas y entregas. ¡Así de fácil!",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2dd4a8] text-sm font-bold text-[#0d1b2a]">
                  {i + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-slate-300">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  </section>
);

/* ---------- Live stats ---------- */
const LiveStats = () => (
  <section className="px-4 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#2dd4a8]/20 bg-[#1b4332]/40 px-3 py-1 text-xs font-semibold text-[#73ffb8]">
          <Users className="h-3.5 w-3.5" /> Comunidad
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
          Crea en minutos, <span className="bg-gradient-to-r from-[#2dd4a8] to-[#73ffb8] bg-clip-text text-transparent">sin código</span>
        </h2>
      </div>
      <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-4">
        {[
          { value: 5, suffix: " min", label: "Para crear tu tienda" },
          { value: 500, suffix: "+", label: "Tiendas activas" },
          { value: 10000, suffix: "+", label: "Pedidos procesados" },
          { value: 99, suffix: "%", label: "Uptime garantizado" },
        ].map((stat) => (
          <div key={stat.label}
            className="group flex flex-col items-center rounded-2xl border border-[#2dd4a8]/10 bg-[#1b4332]/10 p-6 text-center transition-all hover:-translate-y-1 hover:border-[#2dd4a8]/40">
            <p className="font-display text-3xl font-bold text-[#73ffb8] sm:text-4xl">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-xs text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ---------- Features grid (12 features detailed) ---------- */
const FeaturesGrid = () => {
  const features = [
    { icon: ShoppingCart, title: "Carrito + WhatsApp", desc: "Tus clientes finalizan el pedido y llega directo a tu WhatsApp con detalles." },
    { icon: Layers, title: "Variantes ilimitadas", desc: "Tallas, colores, sabores. Stock independiente y precios por variante con JSONB." },
    { icon: Tag, title: "Cupones inteligentes", desc: "Descuentos por porcentaje, monto fijo o envío gratis. Validación con RPC." },
    { icon: Truck, title: "Envío local por zonas", desc: "Configura zonas y costos. Sin tracking nacional, foco en delivery local real." },
    { icon: Globe, title: "Multi-moneda", desc: "Bolivianos por defecto, soporte para BOB, USD, ARS, PEN y más." },
    { icon: BarChart3, title: "Analytics en tiempo real", desc: "Pedidos, productos top, ingresos, conversiones. Todo desde tu dashboard." },
    { icon: Smartphone, title: "PWA optimizada", desc: "Tus clientes la instalan en su celular. Carga ultra rápida y offline ready." },
    { icon: Palette, title: "Personalización total", desc: "Logo, banner, colores, slug propio. Tu marca, tu URL: catalogo360.online/tu-tienda." },
    { icon: QrCode, title: "QR + LinkBox", desc: "Genera tu QR y agrupa tus enlaces (Instagram, TikTok, WhatsApp) en una sola página." },
    { icon: MessageCircle, title: "Notificaciones realtime", desc: "Alertas instantáneas de cada nuevo pedido sin recargar la página." },
    { icon: Box, title: "Categorías y SEO", desc: "Estructura tu catálogo con categorías. URLs limpias indexables en Google." },
    { icon: Lock, title: "Seguridad RLS", desc: "Cada tienda aislada con Row Level Security. Tus datos protegidos a nivel base de datos." },
  ];

  return (
    <section className="border-t border-[#1b4332]/30 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2dd4a8]/20 bg-[#1b4332]/40 px-3 py-1 text-xs font-semibold text-[#73ffb8]">
            <Zap className="h-3.5 w-3.5" /> Características
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Todo lo que incluye <span className="bg-gradient-to-r from-[#2dd4a8] to-[#73ffb8] bg-clip-text text-transparent">Catalogo360</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            Herramientas profesionales sin complicaciones técnicas.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat) => (
            <div key={feat.title}
              className="group rounded-2xl border border-[#2dd4a8]/10 bg-[#1b4332]/10 p-6 transition-all hover:-translate-y-0.5 hover:border-[#2dd4a8]/40 hover:bg-[#1b4332]/20">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2dd4a8]/10 text-[#2dd4a8] transition-transform group-hover:scale-110">
                <feat.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-white">{feat.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => (
  <>
    <WhySection />
    <StorefrontShowcase />
    <DashboardShowcase />
    <HowOrdersWork />
    <LiveStats />
    <FeaturesGrid />
  </>
);

export default FeaturesSection;
