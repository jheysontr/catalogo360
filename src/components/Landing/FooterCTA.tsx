import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Package, Mail, Check } from "lucide-react";
import { motion } from "framer-motion";

const securityPoints = [
  { icon: "✅", title: "Sin tarjeta requerida", desc: "Crea gratis. Sin datos de pago." },
  { icon: "✅", title: "Garantía 30 días", desc: "Si pagas y no te gusta, devolvemos tu dinero." },
  { icon: "✅", title: "Cancela cuando quieras", desc: "Sin contrato. Sin penalidades." },
];

const CTABanner = () => (
  <section className="py-20 sm:py-28">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border bg-gradient-to-br from-accent via-accent/50 to-primary/5 p-10 text-center shadow-lg sm:p-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-[44px] leading-tight">
            Vende hoy. Paga solo cuando ganes más.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-[1.8] text-muted-foreground">
            Tu Plan Gratis nunca expira. Crea tienda, sube 10 productos, recibe pedidos. Cero costo, cero riesgo, cero publicidad. Cuando necesites 50+ productos, upgrade a Emprendedor (Bs 49) con garantía 30 días.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {securityPoints.map((point) => (
              <div key={point.title} className="flex flex-col items-center gap-2">
                <span className="text-2xl">{point.icon}</span>
                <p className="text-sm font-semibold text-foreground">{point.title}</p>
                <p className="text-xs text-muted-foreground">{point.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 gap-2 px-10 text-base font-bold shadow-lg shadow-primary/25">
              <Link to="/register">Crear mi tienda Gratis <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 gap-2 px-8 text-base border-2 border-primary text-primary hover:bg-primary/5">
              <Link to="/demo"><Play className="h-4 w-4" /> Ver demo en vivo</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm font-semibold text-primary">
            ⏱️ Toma 5 minutos. +500 tiendas creadas este mes.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t bg-card py-12">
    <div className="container">
      <div className="grid gap-10 sm:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
            <Package className="h-5 w-5 text-primary" /> Catalogo360
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
            <li><Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Crear tienda Gratis</Link></li>
            <li><Link to="/ayuda" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Centro de Ayuda</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground">Legal</h4>
          <ul className="mt-3 space-y-2">
            <li><Link to="/terminos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Términos de Servicio</Link></li>
            <li><Link to="/privacidad" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Política de Privacidad</Link></li>
          </ul>
          <h4 className="font-display text-sm font-semibold text-foreground mt-6">Contacto</h4>
          <ul className="mt-3 space-y-2">
            <li className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" /> soporte@catalogo360.com</li>
          </ul>
        </div>
      </div>
      <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Catalogo360. Todos los derechos reservados.
      </div>
    </div>
  </footer>
);

const FooterCTA = () => (
  <CTABanner />
);

export { Footer };
export default FooterCTA;
