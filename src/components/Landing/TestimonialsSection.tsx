import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "María López",
    type: "Tienda de Ropa · La Paz",
    text: "Pasé de Bs 0 a Bs 17,000/mes en 60 días. Catalogo360 me permitió vender profesionalmente sin entender de código.",
    metric: "+Bs 17,000 / mes",
    highlighted: false,
  },
  {
    name: "Andrés Fuentes",
    type: "Tienda de Tecnología · Santa Cruz",
    text: "Mis clientes ahora compran desde el celular. Ahorré 10 horas a la semana armando catálogos en PDF y respondiendo WhatsApps.",
    metric: "10 hrs ahorradas/semana",
    highlighted: true,
  },
  {
    name: "Valentina Ríos",
    type: "Cosméticos · Cochabamba",
    text: "El soporte es increíble. Mis ventas aumentaron un 40% en 3 meses sin hacer publicidad extra.",
    metric: "+40% en ventas",
    highlighted: false,
  },
];

const TestimonialsSection = () => (
  <section className="border-t border-[#1b4332]/30 px-4 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#2dd4a8]/20 bg-[#1b4332]/40 px-3 py-1 text-xs font-semibold text-[#73ffb8]">
          <Quote className="h-3.5 w-3.5" /> Testimonios
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
          Lo que dicen nuestros{" "}
          <span className="bg-gradient-to-r from-[#2dd4a8] to-[#73ffb8] bg-clip-text text-transparent">
            clientes
          </span>
        </h2>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className={`relative rounded-2xl border p-6 transition-all hover:-translate-y-1 ${
              t.highlighted
                ? "border-[#2dd4a8]/50 bg-[#1b4332]/30 shadow-2xl shadow-[#2dd4a8]/10 ring-1 ring-[#2dd4a8]/30"
                : "border-[#2dd4a8]/10 bg-[#1b4332]/10 hover:border-[#2dd4a8]/30"
            }`}
          >
            {t.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2dd4a8] px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0d1b2a] shadow-lg">
                ⭐ Más Popular
              </span>
            )}
            <div className="mb-3 flex gap-0.5">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-[#73ffb8] text-[#73ffb8]" />
              ))}
            </div>
            <p className="text-sm italic leading-relaxed text-slate-300">"{t.text}"</p>
            <p className="mt-3 text-xs font-semibold text-[#2dd4a8]">{t.metric}</p>
            <div className="mt-5 flex items-center gap-3 border-t border-slate-700/50 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2dd4a8] text-sm font-bold text-[#0d1b2a]">
                {t.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-slate-400">{t.type}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-10 text-center text-sm text-slate-400">
        ⭐ <span className="font-semibold text-white">4.9/5</span> · 127 reseñas verificadas · 500+ tiendas activas
      </p>
    </div>
  </section>
);

export default TestimonialsSection;
