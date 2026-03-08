import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  { name: "Carolina Méndez", type: "Tienda de Ropa", text: "Catalogo360 transformó mi negocio. Antes perdía horas armando catálogos en PDF, ahora mis clientes ven todo actualizado en tiempo real.", rating: 5 },
  { name: "Andrés Fuentes", type: "Tienda de Tecnología", text: "Lo que más me gusta es lo fácil que es. En 10 minutos tenía mi tienda lista y mis clientes ya estaban haciendo pedidos.", rating: 5 },
  { name: "Valentina Ríos", type: "Cosméticos", text: "El soporte es increíble y la plataforma es muy intuitiva. Mis ventas aumentaron un 40% desde que empecé a usar Catalogo360.", rating: 5 },
];

const TestimonialsSection = () => (
  <section className="border-t bg-secondary/30 py-20 sm:py-28">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Lo que dicen nuestros <span className="text-primary">clientes</span>
        </h2>
      </motion.div>
      <div className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} whileHover={{ y: -4 }}
            className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex gap-0.5 mb-3">
              {[...Array(t.rating)].map((_, j) => <Star key={j} className="h-4 w-4 fill-primary text-primary" />)}
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
);

export default TestimonialsSection;
