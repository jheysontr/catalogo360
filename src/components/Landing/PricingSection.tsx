import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Gratis",
    price: "$0",
    subtitle: "Sin tarjeta requerida",
    description: "Perfecto para emprendedores nuevos. Crea tienda, invita clientes, recibe pedidos. Gratis, siempre.",
    popular: false,
    cta: "Crear tienda Gratis",
    ctaVariant: "outline" as const,
    note: "Sin contrato. Cancela o upgrade cuando quieras.",
    noteColor: "text-muted-foreground",
    features: [
      "Hasta 10 productos",
      "Carrito de compras",
      "Pedidos por WhatsApp",
      "Diseño 100% responsive",
      "Sin límite de tiempo",
      "Personalización básica",
    ],
  },
  {
    name: "Emprendedor",
    price: "Bs 49",
    subtitle: "/mes",
    description: "El elegido por 63% de usuarios activos. Genera $500-5,000/mes con 50 productos.",
    popular: true,
    cta: "Empezar Emprendedor Ahora",
    ctaVariant: "default" as const,
    note: "🔄 Garantía 30 días. Dinero de vuelta si no te gusta.",
    noteColor: "text-primary",
    features: [
      "Hasta 50 productos",
      "Todo del plan Gratis",
      "Cupones de descuento",
      "Múltiples zonas de envío",
      "Soporte prioritario",
      "Analíticas de ventas",
      "Integración con redes sociales",
    ],
  },
  {
    name: "Negocio",
    price: "Bs 99",
    subtitle: "/mes",
    description: "Para negocios consolidados. Productos ilimitados, todas las features, soporte prioritario.",
    popular: false,
    cta: "Elegir Plan Negocio",
    ctaVariant: "outline" as const,
    note: "Ideal para tiendas con 50+ productos.",
    noteColor: "text-muted-foreground",
    features: [
      "Productos ilimitados",
      "Todo del plan Emprendedor",
      "LinkBox (múltiples enlaces)",
      "Estadísticas avanzadas",
      "Integraciones personalizadas",
      "Soporte VIP (respuesta <1h)",
      "API disponible",
    ],
  },
];

const PricingSection = () => (
  <section id="planes" className="py-20 sm:py-28">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Planes y <span className="text-primary">Precios</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">Elige el plan perfecto para tu negocio. Cancela cuando quieras.</p>
      </motion.div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className={`relative rounded-2xl border p-8 shadow-sm transition-shadow hover:shadow-lg ${
              plan.popular
                ? "border-primary bg-accent/30 ring-2 ring-primary/20 scale-105 shadow-[0_12px_32px_-8px_hsl(var(--primary)/0.2)]"
                : "bg-card"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 right-6 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-md">
                ⭐ MÁS POPULAR
              </span>
            )}
            <h3 className="font-display text-xl font-bold text-card-foreground">{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold text-primary">{plan.price}</span>
              {plan.subtitle !== "Sin tarjeta requerida" && (
                <span className="text-sm text-muted-foreground">{plan.subtitle}</span>
              )}
            </div>
            {plan.subtitle === "Sin tarjeta requerida" && (
              <p className="mt-1 text-sm text-muted-foreground">{plan.subtitle}</p>
            )}
            <p className={`mt-4 text-sm leading-relaxed ${plan.popular ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
              {plan.description}
            </p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button
                asChild
                className={`w-full ${plan.popular ? "h-12 text-base font-bold" : ""}`}
                variant={plan.ctaVariant}
              >
                <Link to="/register">{plan.cta}</Link>
              </Button>
            </div>
            <p className={`mt-3 text-center text-xs italic ${plan.noteColor} font-semibold`}>
              {plan.note}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
