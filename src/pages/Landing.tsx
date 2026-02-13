import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Play, Star, Monitor, Tablet, Smartphone,
  Palette, MousePointerClick, BarChart3, Shield,
  MessageCircle, Clock, MonitorSmartphone, Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
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
                <span className="font-medium">+500 emprendedores confían en CatalogHub</span>
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

      {/* Section 1 — Why CatalogHub */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl"
          >
            ¿Por qué elegir <span className="text-primary">CatalogHub</span>?
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
                    <p className="text-sm font-semibold text-card-foreground">CatalogHub Bot</p>
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
                Así recibes tus pedidos con <span className="text-primary">CatalogHub</span>
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
    </div>
  );
};

export default Landing;
