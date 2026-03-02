import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight, Play, Star,
  Palette, MousePointerClick, BarChart3, Shield,
  MessageCircle, Clock, MonitorSmartphone, Zap,
  Check, ChevronDown, Package, Mail, Phone,
  Quote, ShoppingCart, Layers, TrendingUp, Globe,
  Sparkles, Rocket, Users, Download,
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import demoDashboard from "@/assets/demo-dashboard.jpg";
import demoStorefront from "@/assets/demo-storefront.jpg";
import demoStorefrontMobile from "@/assets/demo-storefront-mobile.jpg";
import demoAnalytics from "@/assets/demo-analytics.jpg";

/* ── Animated counter ── */
const AnimatedCounter = ({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const currencies = [
  { code: "BOB", symbol: "Bs", rate: 6.9 },
  { code: "USD", symbol: "$", rate: 1 },
  { code: "EUR", symbol: "€", rate: 0.92 },
  { code: "CLP", symbol: "$", rate: 980 },
  { code: "ARS", symbol: "$", rate: 1250 },
  { code: "MXN", symbol: "$", rate: 17.2 },
  { code: "PEN", symbol: "S/", rate: 3.7 },
  { code: "COP", symbol: "$", rate: 4100 },
  { code: "UYU", symbol: "$", rate: 42 },
];

const plans = [
  {
    name: "Estándar",
    basePrice: 7.5,
    popular: false,
    features: [
      "Hasta 60 productos",
      "Soporte por WhatsApp",
      "Estadísticas básicas",
      "Diseño responsive",
    ],
  },
  {
    name: "Pro",
    basePrice: 10.5,
    popular: true,
    features: [
      "Todo de Estándar",
      "Hasta 200 productos",
      "Soporte 24/7",
      "Estadísticas avanzadas",
      "Linkbox gratis",
      "Gestión de inventario inteligente",
    ],
  },
];

const faqs = [
  {
    q: "¿Qué es Catalogo360?",
    a: "Catalogo360 es una plataforma que te permite crear tu catálogo digital y tienda online en minutos, sin necesidad de conocimientos técnicos. Ideal para emprendedores en Latinoamérica.",
  },
  {
    q: "¿Cómo se crea una tienda?",
    a: "Solo necesitas registrarte, agregar tus productos con fotos y precios, personalizar tu tienda y compartir el enlace con tus clientes. ¡Todo en menos de 5 minutos!",
  },
  {
    q: "¿Puedo usar Catalogo360 desde el celular?",
    a: "¡Claro! Tanto el panel de administración como tu tienda pública son 100% responsive y funcionan perfectamente en cualquier dispositivo.",
  },
  {
    q: "¿Cuántos productos puedo subir?",
    a: "Depende de tu plan. El plan Estándar permite hasta 60 productos y el plan Pro hasta 200 productos.",
  },
  {
    q: "¿Qué pasa cuando termina el período de prueba?",
    a: "Puedes elegir un plan de pago para continuar. Si no lo haces, tu tienda seguirá visible pero no podrás agregar nuevos productos hasta que actives un plan.",
  },
  {
    q: "¿Es necesario saber diseño o programación?",
    a: "No. Catalogo360 está diseñado para que cualquier persona pueda crear su tienda sin conocimientos técnicos. Solo arrastra, escribe y publica.",
  },
];

const testimonials = [
  {
    name: "Carolina Méndez",
    type: "Tienda de Ropa",
    text: "Catalogo360 transformó mi negocio. Antes perdía horas armando catálogos en PDF, ahora mis clientes ven todo actualizado en tiempo real.",
    rating: 5,
  },
  {
    name: "Andrés Fuentes",
    type: "Tienda de Tecnología",
    text: "Lo que más me gusta es lo fácil que es. En 10 minutos tenía mi tienda lista y mis clientes ya estaban haciendo pedidos.",
    rating: 5,
  },
  {
    name: "Valentina Ríos",
    type: "Cosméticos",
    text: "El soporte es increíble y la plataforma es muy intuitiva. Mis ventas aumentaron un 40% desde que empecé a usar Catalogo360.",
    rating: 5,
  },
];

/* ── Floating orbs for hero background ── */
const FloatingOrb = ({ className }: { className?: string }) => (
  <motion.div
    className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
    animate={{
      y: [0, -30, 0],
      scale: [1, 1.08, 1],
    }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
  />
);

const Landing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState(currencies[0]);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const formatPrice = (baseUSD: number) => {
    const price = isAnnual ? baseUSD * 0.6 : baseUSD;
    const converted = price * currency.rate;
    const decimals = currency.rate >= 100 ? 0 : 2;
    return `${currency.symbol}${converted.toFixed(decimals)}`;
  };

  return (
    <div className="flex flex-col">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-secondary/40 py-20 sm:py-28 lg:py-36">
        <FloatingOrb className="-top-40 right-10 h-[500px] w-[500px] bg-primary/6" />
        <FloatingOrb className="bottom-0 -left-20 h-[400px] w-[400px] bg-accent/25" />
        <FloatingOrb className="top-1/2 left-1/2 h-[300px] w-[300px] bg-primary/4" />

        {/* Grid pattern overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="container relative z-10">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border bg-card/80 backdrop-blur-sm px-4 py-2 text-sm text-muted-foreground shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium">+500 emprendedores confían en nosotros</span>
              </motion.div>

              <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
                Crea tu tienda
                <br />
                <span className="bg-gradient-to-r from-primary to-[hsl(180,55%,45%)] bg-clip-text text-transparent">
                  vende en minutos
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground lg:mx-0 lg:text-xl">
                La plataforma más completa para emprendedores en Latinoamérica. Publica tu catálogo, recibe pedidos y haz crecer tu negocio.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Button asChild size="lg" className="h-12 gap-2 px-8 text-base shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30">
                  <Link to="/register">
                    Prueba 7 días gratis <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 gap-2 px-8 text-base">
                  <Link to="/store/demo">
                    <Play className="h-4 w-4" /> Ver demo
                  </Link>
                </Button>
              </div>

              {/* Mini stats under CTA */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-8 lg:justify-start">
                {[
                  { value: "500+", label: "Tiendas activas" },
                  { value: "10K+", label: "Pedidos procesados" },
                  { value: "4.9★", label: "Calificación" },
                ].map((s) => (
                  <div key={s.label} className="text-center lg:text-left">
                    <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative mx-auto flex w-full max-w-lg items-end justify-center gap-4 lg:max-w-none perspective-[1200px]"
            >
              {/* Glow behind mockup */}
              <div className="pointer-events-none absolute inset-0 -z-10 m-auto h-3/4 w-3/4 rounded-full bg-primary/10 blur-[80px]" />

              {/* Desktop mockup */}
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative w-full max-w-xs rounded-2xl border bg-card shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] lg:max-w-sm dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center gap-2 border-b px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45,90%,55%)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[hsl(140,70%,40%)]" />
                  </div>
                  <div className="mx-auto flex-1 max-w-[60%]">
                    <div className="rounded-md bg-muted/60 px-3 py-1 text-center text-[10px] text-muted-foreground truncate">catalogo360.app/dashboard</div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-b-2xl">
                  <img src={demoDashboard} alt="Panel de administración de Catalogo360" className="h-full w-full object-cover" loading="lazy" />
                </div>
              </motion.div>

              {/* Mobile mockup */}
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-20 overflow-hidden rounded-[16px] border-2 border-border bg-card shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)] lg:w-24 dark:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.45)]"
              >
                <div className="flex items-center justify-center bg-muted/40 py-1">
                  <div className="h-1 w-6 rounded-full bg-muted-foreground/20" />
                </div>
                <img src={demoStorefrontMobile} alt="Tienda móvil de Catalogo360" className="h-full w-full object-cover" loading="lazy" />
              </motion.div>

              {/* Floating notification card */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -right-2 top-6 z-20 rounded-xl border bg-card/95 backdrop-blur-sm p-3 shadow-lg lg:-right-8"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-card-foreground">Nuevo pedido 🎉</p>
                    <p className="text-[10px] text-muted-foreground">Hace 2 min</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TRUSTED BY ═══════════════ */}
      <section className="border-y bg-card py-8">
        <div className="container">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
            Usado por emprendedores en toda Latinoamérica
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {["🇧🇴 Bolivia", "🇲🇽 México", "🇦🇷 Argentina", "🇨🇱 Chile", "🇵🇪 Perú", "🇨🇴 Colombia", "🇺🇾 Uruguay"].map((country) => (
              <span key={country} className="text-sm font-medium text-muted-foreground/60">{country}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ WHY CATALOGO360 ═══════════════ */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground mb-4">
              <Rocket className="h-3.5 w-3.5" /> Características
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              ¿Por qué elegir <span className="text-primary">Catalogo360</span>?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Todo lo que necesitas para vender online, en una sola plataforma.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-8">
            {[
              { icon: Palette, title: "Diseño Adaptable", desc: "Personaliza colores, logos y banners para que tu tienda refleje la identidad de tu marca sin necesidad de un diseñador." },
              { icon: MousePointerClick, title: "Fácil de Usar", desc: "Interfaz intuitiva pensada para emprendedores. Agrega productos, organiza categorías y publica en pocos clics." },
              { icon: BarChart3, title: "Gestión Inteligente", desc: "Controla inventario, pedidos y métricas desde un solo dashboard. Toma decisiones basadas en datos reales." },
              { icon: Shield, title: "Control Total", desc: "Tú decides quién ve tu catálogo, los precios y la disponibilidad. Seguridad y privacidad garantizadas." },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-2xl border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent transition-colors group-hover:bg-primary/10">
                  <card.icon className="h-6 w-6 text-accent-foreground transition-colors group-hover:text-primary" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-card-foreground">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ STOREFRONT SHOWCASE ═══════════════ */}
      <section className="border-t bg-secondary/30 py-20 sm:py-28">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                <ShoppingCart className="h-3.5 w-3.5" /> Tienda Online
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Tu catálogo profesional, <span className="text-primary">listo para vender</span>
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Tus clientes navegan tu catálogo como en las mejores tiendas del mundo. Filtros, búsqueda, categorías y carrito de compras incluidos.
              </p>
              <ul className="mt-6 space-y-3">
                {["Diseño responsive para cualquier dispositivo", "Búsqueda y filtros por categoría", "Carrito de compras integrado", "Vista en grilla o lista"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/store/demo">
                    Ver tienda demo <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="rounded-2xl border bg-card shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center gap-2 border-b px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45,90%,55%)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[hsl(140,70%,40%)]" />
                  </div>
                  <div className="mx-auto flex-1 max-w-[60%]">
                    <div className="rounded-md bg-muted/60 px-3 py-1 text-center text-[10px] text-muted-foreground truncate">catalogo360.app/store/mi-tienda</div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-b-2xl">
                  <img src={demoStorefront} alt="Vista de la tienda online de Catalogo360" className="w-full" loading="lazy" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ DASHBOARD SHOWCASE ═══════════════ */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="rounded-2xl border bg-card shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center gap-2 border-b px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45,90%,55%)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[hsl(140,70%,40%)]" />
                  </div>
                  <div className="mx-auto flex-1 max-w-[60%]">
                    <div className="rounded-md bg-muted/60 px-3 py-1 text-center text-[10px] text-muted-foreground truncate">catalogo360.app/dashboard/analytics</div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-b-2xl">
                  <img src={demoAnalytics} alt="Panel de analíticas de Catalogo360" className="w-full" loading="lazy" />
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> Analíticas
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Métricas que impulsan <span className="text-primary">tu crecimiento</span>
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Monitorea ventas, pedidos y el rendimiento de tu catálogo en tiempo real. Toma decisiones basadas en datos desde un panel intuitivo.
              </p>
              <ul className="mt-6 space-y-3">
                {["Dashboard de ventas en tiempo real", "Estadísticas de productos más vendidos", "Control de inventario automatizado", "Reportes de pedidos y envíos"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW ORDERS WORK ═══════════════ */}
      <section className="border-t bg-secondary/30 py-20 sm:py-28">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto w-full max-w-sm"
            >
              <div className="rounded-2xl border bg-card p-5 shadow-lg">
                <div className="mb-4 flex items-center gap-3 border-b pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">Catalogo360 Bot</p>
                    <p className="text-xs text-muted-foreground">Nuevo pedido recibido</p>
                  </div>
                </div>
                {["🛒 Pedido #1042", "👤 María López", "📦 3 productos — $45.00", "✅ Estado: Confirmado"].map((line, i) => (
                  <motion.div
                    key={line}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                    className="mb-2 w-fit max-w-[80%] rounded-xl rounded-tl-none bg-accent px-4 py-2 text-sm text-accent-foreground"
                  >
                    {line}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                Así recibes tus pedidos con <span className="text-primary">Catalogo360</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Tus clientes ven tu catálogo, eligen productos y finalizan el pedido. Tú recibes todo organizado, listo para despachar.
              </p>

              <ol className="mt-8 space-y-5">
                {[
                  "Tu cliente abre el enlace de tu catálogo desde cualquier dispositivo.",
                  "Explora tus productos, agrega al carrito y completa sus datos.",
                  "Recibes el pedido con todos los detalles en tu dashboard.",
                  "Confirmas, preparas y entregas. ¡Así de fácil!",
                ].map((step, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 }}
                    className="flex items-start gap-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <p className="pt-1 text-sm leading-relaxed text-muted-foreground">{step}</p>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ LIVE STATS ═══════════════ */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground mb-4">
              <Users className="h-3.5 w-3.5" /> Comunidad
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Crea en minutos, <span className="text-primary">sin código</span>
            </h2>
          </motion.div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
            {[
              { icon: Clock, value: 5, suffix: " min", label: "Tiempo para crear tu catálogo" },
              { icon: MonitorSmartphone, value: 100, suffix: "%", label: "Responsive en cualquier dispositivo" },
              { icon: Zap, value: 10000, suffix: "+", label: "Pedidos procesados" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group flex flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent transition-colors group-hover:bg-primary/10">
                  <stat.icon className="h-7 w-7 text-accent-foreground transition-colors group-hover:text-primary" />
                </div>
                <p className="mt-5 font-display text-3xl font-bold text-foreground">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES GRID ═══════════════ */}
      <section className="border-t bg-secondary/30 py-20 sm:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Todo lo que incluye <span className="text-primary">Catalogo360</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Herramientas profesionales sin complicaciones técnicas.
            </p>
          </motion.div>
          <div className="mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ShoppingCart, title: "Carrito de compras", desc: "Tus clientes agregan productos y finalizan su pedido fácilmente." },
              { icon: Layers, title: "Categorías", desc: "Organiza tu catálogo con categorías personalizadas." },
              { icon: Globe, title: "Multi-moneda", desc: "Soporte para múltiples monedas de Latinoamérica." },
              { icon: TrendingUp, title: "Analíticas", desc: "Métricas de ventas, productos populares y más." },
              { icon: MessageCircle, title: "Pedidos por WhatsApp", desc: "Recibe pedidos directamente en tu WhatsApp." },
              { icon: Palette, title: "Personalización", desc: "Colores, logo y banner a tu medida." },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group flex items-start gap-4 rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent transition-colors group-hover:bg-primary/10">
                  <feat.icon className="h-5 w-5 text-accent-foreground transition-colors group-hover:text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-card-foreground">{feat.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <section id="planes" className="py-20 sm:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Planes y <span className="text-primary">Precios</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Elige el plan perfecto para tu negocio. Cancela cuando quieras.
            </p>
          </motion.div>

          {/* Controls */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <div className="relative">
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
              >
                {currency.code} ({currency.symbol})
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {currencyOpen && (
                <div className="absolute left-0 z-50 mt-1 w-44 rounded-lg border bg-card py-1 shadow-lg">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c); setCurrencyOpen(false); }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground hover:bg-accent"
                    >
                      {c.code} ({c.symbol})
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 rounded-full border bg-card p-1 shadow-sm">
              <button
                onClick={() => setIsAnnual(false)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${!isAnnual ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Mensual
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${isAnnual ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Anual
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                  -40%
                </span>
              </button>
            </div>
          </div>

          {/* Plan cards */}
          <div className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-2">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg ${plan.popular ? "border-primary ring-2 ring-primary/20" : ""}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-md">
                    Más Popular
                  </span>
                )}
                <h3 className="font-display text-xl font-bold text-card-foreground">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-foreground">{formatPrice(plan.basePrice)}</span>
                  <span className="text-sm text-muted-foreground">/{isAnnual ? "año" : "mes"}</span>
                </div>
                {isAnnual && (
                  <p className="mt-1 text-xs font-medium text-primary">-40% OFF aplicado</p>
                )}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-col gap-3">
                  <Button
                    asChild
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    <a
                      href={`https://wa.me/1234567890?text=Hola, quiero el plan ${plan.name} de Catalogo360`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Elegir Plan
                    </a>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link to="/register">Probar Gratis</Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="border-t bg-secondary/30 py-20 sm:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Lo que dicen nuestros <span className="text-primary">clientes</span>
            </h2>
          </motion.div>
          <div className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground italic">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3 border-t pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.type}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ INSTALL PWA ═══════════════ */}
      <section className="py-16 sm:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center shadow-sm sm:p-10"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Instala la app en tu celular</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Accede a Catalogo360 desde tu pantalla de inicio como una app nativa, sin necesidad de tiendas de apps.
            </p>
            <Button asChild variant="outline" className="mt-6 gap-2">
              <Link to="/install">
                Ver instrucciones <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-accent/30 to-secondary/50 p-10 text-center shadow-lg sm:p-16"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                ¿Listo para vender online?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-muted-foreground">
                Crea tu catálogo digital en minutos y empieza a recibir pedidos hoy mismo. Prueba gratis por 7 días, sin tarjeta de crédito.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg" className="h-12 gap-2 px-8 shadow-lg shadow-primary/25">
                  <Link to="/register">
                    Empezar gratis <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 gap-2 px-8">
                  <Link to="/store/demo">
                    <Play className="h-4 w-4" /> Ver demo
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section className="border-t bg-secondary/30 py-20 sm:py-28">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Preguntas <span className="text-primary">Frecuentes</span>
            </h2>
          </motion.div>
          <Accordion type="single" collapsible className="mt-12">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-display text-base font-semibold text-foreground">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t bg-card py-12">
        <div className="container">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                <Package className="h-5 w-5 text-primary" />
                Catalogo360
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                La plataforma más completa para crear catálogos digitales y vender online en Latinoamérica.
              </p>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-foreground">Enlaces</h4>
              <ul className="mt-3 space-y-2">
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Inicio</Link></li>
                <li><Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Iniciar sesión</Link></li>
                <li><Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Registrarse</Link></li>
                <li><Link to="/install" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Instalar App</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-foreground">Contacto</h4>
              <ul className="mt-3 space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" /> soporte@catalogo360.com
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" /> WhatsApp: +1 234 567 890
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
            © 2026 Catalogo360. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
