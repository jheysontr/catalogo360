import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight, Play, Star, Monitor, Tablet, Smartphone,
  Palette, MousePointerClick, BarChart3, Shield,
  MessageCircle, Clock, MonitorSmartphone, Zap,
  Check, ChevronDown, Package, Mail, Phone,
  Quote,
} from "lucide-react";
import { motion } from "framer-motion";

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
  },
  {
    name: "Andrés Fuentes",
    type: "Tienda de Tecnología",
    text: "Lo que más me gusta es lo fácil que es. En 10 minutos tenía mi tienda lista y mis clientes ya estaban haciendo pedidos.",
  },
  {
    name: "Valentina Ríos",
    type: "Cosméticos",
    text: "El soporte es increíble y la plataforma es muy intuitiva. Mis ventas aumentaron un 40% desde que empecé a usar Catalogo360.",
  },
];

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
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/40 py-16 sm:py-24 lg:py-32">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/30 blur-3xl" />

        <div className="container relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              {/* Social proof pill */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <span className="font-medium">+500 emprendedores confían en Catalogo360</span>
              </div>

              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Crea tu tienda online y{" "}
                <span className="text-primary">vende en minutos</span>
              </h1>

              <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground lg:mx-0">
                La plataforma más completa para emprendedores en Latinoamérica. Publica tu catálogo, recibe pedidos y haz crecer tu negocio.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Button asChild size="lg" className="gap-2 shadow-lg">
                  <Link to="/register">
                    Prueba 7 días gratis <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/store/demo">
                    <Play className="h-4 w-4" /> Ver demo
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Device mockups */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto flex w-full max-w-lg items-end justify-center gap-4 lg:max-w-none"
            >
              {/* Desktop */}
              <div className="relative w-full max-w-xs rounded-xl border bg-card p-2 shadow-xl lg:max-w-sm">
                <div className="flex items-center gap-1.5 px-2 pb-2">
                  <span className="h-2 w-2 rounded-full bg-destructive/60" />
                  <span className="h-2 w-2 rounded-full bg-primary/40" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                </div>
                <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-secondary">
                  <Monitor className="h-12 w-12 text-muted-foreground/40" />
                </div>
              </div>

              {/* Tablet (hidden on small screens) */}
              <div className="hidden rounded-xl border bg-card p-1.5 shadow-lg sm:block sm:w-28 lg:w-32">
                <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-secondary">
                  <Tablet className="h-8 w-8 text-muted-foreground/40" />
                </div>
              </div>

              {/* Phone */}
              <div className="w-16 rounded-xl border bg-card p-1 shadow-lg lg:w-20">
                <div className="flex aspect-[9/16] items-center justify-center rounded-lg bg-secondary">
                  <Smartphone className="h-6 w-6 text-muted-foreground/40" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 1 — Why Catalogo360 */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl"
          >
            ¿Por qué elegir <span className="text-primary">Catalogo360</span>?
          </motion.h2>
          <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
            Todo lo que necesitas para vender online, en una sola plataforma.
          </p>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-8">
            {[
              {
                icon: Palette,
                title: "Diseño Adaptable",
                desc: "Personaliza colores, logos y banners para que tu tienda refleje la identidad de tu marca sin necesidad de un diseñador.",
              },
              {
                icon: MousePointerClick,
                title: "Fácil de Usar",
                desc: "Interfaz intuitiva pensada para emprendedores. Agrega productos, organiza categorías y publica en pocos clics.",
              },
              {
                icon: BarChart3,
                title: "Gestión Inteligente",
                desc: "Controla inventario, pedidos y métricas desde un solo dashboard. Toma decisiones basadas en datos reales.",
              },
              {
                icon: Shield,
                title: "Control Total",
                desc: "Tú decides quién ve tu catálogo, los precios y la disponibilidad. Seguridad y privacidad garantizadas.",
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                  <card.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-card-foreground">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2 — How orders work */}
      <section className="border-t bg-secondary/30 py-20 sm:py-28">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* WhatsApp mockup */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto w-full max-w-sm"
            >
              <div className="rounded-2xl border bg-card p-4 shadow-lg">
                <div className="mb-3 flex items-center gap-3 border-b pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">Catalogo360 Bot</p>
                    <p className="text-xs text-muted-foreground">Nuevo pedido recibido</p>
                  </div>
                </div>
                {["🛒 Pedido #1042", "👤 María López", "📦 3 productos — $45.00", "✅ Estado: Confirmado"].map((line) => (
                  <div key={line} className="mb-2 w-fit max-w-[80%] rounded-xl rounded-tl-none bg-accent px-4 py-2 text-sm text-accent-foreground">
                    {line}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Steps */}
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
                  <li key={i} className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <p className="pt-1 text-sm leading-relaxed text-muted-foreground">{step}</p>
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3 — Stats */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl"
          >
            Crea en minutos, <span className="text-primary">sin código</span>
          </motion.h2>

          <div className="mx-auto mt-14 grid max-w-3xl gap-8 sm:grid-cols-3">
            {[
              { icon: Clock, value: "5 minutos", label: "Tiempo para crear tu catálogo" },
              { icon: MonitorSmartphone, value: "100% Responsive", label: "Se ve perfecto en cualquier dispositivo" },
              { icon: Zap, value: "Instantáneo", label: "Tu catálogo está listo inmediatamente" },
            ].map((stat, i) => (
              <motion.div
                key={stat.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex flex-col items-center rounded-xl border bg-card p-8 text-center shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                  <stat.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <p className="mt-4 font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planes" className="border-t bg-secondary/30 py-20 sm:py-28">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl"
          >
            Planes y <span className="text-primary">Precios</span>
          </motion.h2>
          <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
            Elige el plan perfecto para tu negocio. Cancela cuando quieras.
          </p>

          {/* Controls */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            {/* Currency dropdown */}
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

            {/* Toggle */}
            <div className="flex items-center gap-3 rounded-full border bg-card p-1 shadow-sm">
              <button
                onClick={() => setIsAnnual(false)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!isAnnual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Mensual
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${isAnnual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Anual
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
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
                className={`relative rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-md ${plan.popular ? "border-primary ring-2 ring-primary/20" : ""}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
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

      {/* Testimonials */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl"
          >
            Lo que dicen nuestros <span className="text-primary">clientes</span>
          </motion.h2>
          <div className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-xl border bg-card p-6 shadow-sm"
              >
                <Quote className="h-6 w-6 text-primary/30" />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground italic">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3">
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

      {/* FAQ */}
      <section className="border-t bg-secondary/30 py-20 sm:py-28">
        <div className="container max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl"
          >
            Preguntas <span className="text-primary">Frecuentes</span>
          </motion.h2>
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

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container">
          <div className="grid gap-10 sm:grid-cols-3">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                <Package className="h-5 w-5 text-primary" />
                Catalogo360
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                La plataforma más completa para crear catálogos digitales y vender online en Latinoamérica.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-display text-sm font-semibold text-foreground">Enlaces</h4>
              <ul className="mt-3 space-y-2">
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Inicio</Link></li>
                <li><Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Iniciar sesión</Link></li>
                <li><Link to="/register" className="text-sm text-muted-foreground hover:text-foreground">Registrarse</Link></li>
              </ul>
            </div>

            {/* Contact */}
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
