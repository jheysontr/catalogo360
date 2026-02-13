import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, Monitor, Tablet, Smartphone } from "lucide-react";
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
    </div>
  );
};

export default Landing;
