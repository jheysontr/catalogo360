import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Check, Palette, MousePointerClick, BarChart3, Shield,
  MessageCircle, ShoppingCart, Layers, TrendingUp, Globe, Rocket,
  Clock, MonitorSmartphone, Zap, Users,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import demoStorefront from "@/assets/demo-storefront.jpg";
import demoAnalytics from "@/assets/demo-analytics.jpg";

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
      if (start >= target) { setCount(target); clearInterval(timer); } else { setCount(start); }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const WhySection = () => (
  <section className="py-20 sm:py-28">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground mb-4">
          <Rocket className="h-3.5 w-3.5" /> Características
        </span>
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          ¿Por qué elegir <span className="text-primary">Catalogo360</span>?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">Todo lo que necesitas para vender online, en una sola plataforma.</p>
      </motion.div>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-8">
        {[
          { icon: Palette, title: "Diseño Adaptable", desc: "Personaliza colores, logos y banners para que tu tienda refleje la identidad de tu marca sin necesidad de un diseñador." },
          { icon: MousePointerClick, title: "Fácil de Usar", desc: "Interfaz intuitiva pensada para emprendedores. Agrega productos, organiza categorías y publica en pocos clics." },
          { icon: BarChart3, title: "Gestión Inteligente", desc: "Controla inventario, pedidos y métricas desde un solo dashboard. Toma decisiones basadas en datos reales." },
          { icon: Shield, title: "Control Total", desc: "Tú decides quién ve tu catálogo, los precios y la disponibilidad. Seguridad y privacidad garantizadas." },
        ].map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group relative rounded-2xl border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary/30">
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
);

const BrowserMockup = ({ url, children }: { url: string; children: React.ReactNode }) => (
  <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}
    className="rounded-2xl border bg-card shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]">
    <div className="flex items-center gap-2 border-b px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45,90%,55%)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[hsl(140,70%,40%)]" />
      </div>
      <div className="mx-auto flex-1 max-w-[60%]">
        <div className="rounded-md bg-muted/60 px-3 py-1 text-center text-[10px] text-muted-foreground truncate">{url}</div>
      </div>
    </div>
    <div className="overflow-hidden rounded-b-2xl">{children}</div>
  </motion.div>
);

const StorefrontShowcase = () => (
  <section className="border-t bg-secondary/30 py-20 sm:py-28">
    <div className="container">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
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
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 shrink-0 text-primary" /> {f}</li>
            ))}
          </ul>
          <div className="mt-8">
            <Button asChild size="lg" className="gap-2"><Link to="/demo">Ver tienda demo <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
          <BrowserMockup url="catalogo360.app/store/mi-tienda">
            <img src={demoStorefront} alt="Vista de la tienda online de Catalogo360" className="w-full" loading="lazy" />
          </BrowserMockup>
        </motion.div>
      </div>
    </div>
  </section>
);

const DashboardShowcase = () => (
  <section className="py-20 sm:py-28">
    <div className="container">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="order-2 lg:order-1">
          <BrowserMockup url="catalogo360.app/dashboard/analytics">
            <img src={demoAnalytics} alt="Panel de analíticas de Catalogo360" className="w-full" loading="lazy" />
          </BrowserMockup>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="order-1 lg:order-2">
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
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 shrink-0 text-primary" /> {f}</li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  </section>
);

const HowOrdersWork = () => (
  <section className="border-t bg-secondary/30 py-20 sm:py-28">
    <div className="container">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mx-auto w-full max-w-sm">
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
              <motion.div key={line} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.15 }}
                className="mb-2 w-fit max-w-[80%] rounded-xl rounded-tl-none bg-accent px-4 py-2 text-sm text-accent-foreground">
                {line}
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
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
              <motion.li key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                <p className="pt-1 text-sm leading-relaxed text-muted-foreground">{step}</p>
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </div>
    </div>
  </section>
);

const LiveStats = () => (
  <section className="py-20 sm:py-28">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
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
          <motion.div key={stat.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }}
            className="group flex flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent transition-colors group-hover:bg-primary/10">
              <stat.icon className="h-7 w-7 text-accent-foreground transition-colors group-hover:text-primary" />
            </div>
            <p className="mt-5 font-display text-3xl font-bold text-foreground"><AnimatedCounter target={stat.value} suffix={stat.suffix} /></p>
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FeaturesGrid = () => (
  <section className="border-t bg-secondary/30 py-20 sm:py-28">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Todo lo que incluye <span className="text-primary">Catalogo360</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">Herramientas profesionales sin complicaciones técnicas.</p>
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
          <motion.div key={feat.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group flex items-start gap-4 rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20">
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
);

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
