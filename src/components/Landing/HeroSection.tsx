import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, ShoppingCart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import demoDashboard from "@/assets/demo-dashboard.jpg";
import demoStorefrontMobile from "@/assets/demo-storefront-mobile.jpg";

const FloatingOrb = ({ className }: { className?: string }) => (
  <motion.div
    className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
    animate={{ y: [0, -30, 0], scale: [1, 1.08, 1] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
  />
);

const HeroSection = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-secondary/40 py-20 sm:py-28 lg:py-36">
    <FloatingOrb className="-top-40 right-10 h-[500px] w-[500px] bg-primary/6" />
    <FloatingOrb className="bottom-0 -left-20 h-[400px] w-[400px] bg-accent/25" />
    <FloatingOrb className="top-1/2 left-1/2 h-[300px] w-[300px] bg-primary/4" />

    <div
      className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
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
              <Link to="/demo">
                <Play className="h-4 w-4" /> Ver demo
              </Link>
            </Button>
          </div>

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

        <motion.div
          initial={{ opacity: 0, x: 50, rotateY: -5 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mx-auto flex w-full max-w-lg items-end justify-center gap-4 lg:max-w-none perspective-[1200px]"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 m-auto h-3/4 w-3/4 rounded-full bg-primary/10 blur-[80px]" />

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
);

export default HeroSection;
