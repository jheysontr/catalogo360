import { Star } from "lucide-react";

const testimonials = [
  {
    name: "María López",
    type: "Tienda de Ropa",
    text: "Pasé de $0 a $2,500/mes en 60 días. Catalogo360 me permitió vender profesionalmente sin comprender código.",
    metric: "Ganancia promedio: $2,500/mes",
    highlighted: false,
  },
  {
    name: "Andrés Fuentes",
    type: "Tienda de Tecnología",
    text: "Lo mejor: mis clientes ahora compran desde el celular. Ahorré 10 horas/semana armando catálogos en PDF.",
    metric: "Tiempo ahorrado: 10 horas/semana",
    highlighted: true,
  },
  {
    name: "Valentina Ríos",
    type: "Cosméticos",
    text: "El soporte es increíble. Mis ventas aumentaron un 40% en 3 meses sin hacer nada extra.",
    metric: "Aumento de ventas: +40%",
    highlighted: false,
  },
];

const TestimonialsSection = () => (
  <section className="border-t bg-secondary/30 py-20 sm:py-28">
    <div className="container">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Lo que dicen nuestros <span className="text-primary">clientes</span>
        </h2>
      </div>
      <div className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t.name}
            className={`relative rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 ${
              t.highlighted
                ? "border-primary bg-accent/50 ring-2 ring-primary/20"
                : "bg-card"
            }`}>
            {t.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-md">
                Más Popular
              </span>
            )}
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-primary text-primary" />)}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground italic">"{t.text}"</p>
            <p className="mt-3 text-xs font-semibold text-primary">{t.metric}</p>
            <div className="mt-5 flex items-center gap-3 border-t pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {t.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-semibold text-card-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.type}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-10 text-center text-sm text-muted-foreground">
        ⭐ 4.9/5 | 127 reseñas verificadas | 500+ tiendas activas
      </p>
    </div>
  </section>
);

export default TestimonialsSection;
