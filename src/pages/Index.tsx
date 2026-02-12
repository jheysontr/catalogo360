import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, ShoppingBag, Zap } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: ShoppingBag,
    title: "Catálogos digitales",
    description: "Crea y comparte catálogos profesionales en minutos, sin diseñadores.",
  },
  {
    icon: Zap,
    title: "Rápido y simple",
    description: "Añade productos, organiza categorías y publica al instante.",
  },
  {
    icon: BarChart3,
    title: "Analíticas en tiempo real",
    description: "Conoce quién ve tus productos y optimiza tu negocio.",
  },
];

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section
        className="relative flex min-h-[85vh] items-center justify-center overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(165_60%_40%/0.15),transparent_60%)]" />
        <div className="container relative z-10 py-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl"
          >
            Tu catálogo digital,{" "}
            <span className="text-primary">listo para vender</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/70"
          >
            CatalogHub te permite crear catálogos profesionales, compartirlos con tus clientes y gestionar tu inventario desde un solo lugar.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="gap-2 shadow-lg">
              <Link to="/register">
                Comenzar gratis <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold text-foreground">
            Todo lo que necesitas
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
            Herramientas poderosas para llevar tu negocio al siguiente nivel.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-xl border bg-card p-8 transition-shadow hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                  <f.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-card-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-accent/50 py-20">
        <div className="container text-center">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            ¿Listo para empezar?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Crea tu primera tienda en menos de 5 minutos.
          </p>
          <Button asChild size="lg" className="mt-8 gap-2">
            <Link to="/register">
              Crear mi catálogo <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
