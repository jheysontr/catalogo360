import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Package, Mail } from "lucide-react";
import { motion } from "framer-motion";

const InstallPWA = () => (
  <section className="py-16 sm:py-20">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Download className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-display text-xl font-bold text-foreground">Instala la app en tu celular</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Accede a Catalogo360 desde tu pantalla de inicio como una app nativa, sin necesidad de tiendas de apps.
        </p>
        <Button asChild variant="outline" className="mt-6 gap-2">
          <Link to="/install">Ver instrucciones <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </motion.div>
    </div>
  </section>
);

const CTABanner = () => (
  <section className="py-20 sm:py-28">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-accent/30 to-secondary/50 p-10 text-center shadow-lg sm:p-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">¿Listo para vender online?</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Crea tu catálogo digital en minutos y empieza a recibir pedidos hoy mismo. Prueba gratis por 7 días, sin tarjeta de crédito.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 gap-2 px-8 shadow-lg shadow-primary/25">
              <Link to="/register">Empezar gratis <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 gap-2 px-8">
              <Link to="/demo"><Play className="h-4 w-4" /> Ver demo</Link>
            </Button>
          </div>
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
            <li><Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Registrarse</Link></li>
            <li><Link to="/install" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Instalar App</Link></li>
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
  <>
    <InstallPWA />
    <CTABanner />
  </>
);

export { Footer };
export default FooterCTA;
