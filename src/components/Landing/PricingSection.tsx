import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Gratis",
    price: 0,
    popular: false,
    cta: "Comenzar gratis",
    features: ["Hasta 10 productos", "Plantilla personalizable", "Pedidos por WhatsApp", "Diseño responsive"],
  },
  {
    name: "Emprendedor",
    price: 49,
    popular: true,
    cta: "Elegir Emprendedor",
    features: ["Hasta 50 productos", "Todo del plan Gratis", "Cupones de descuento", "Zonas de envío", "Soporte prioritario"],
  },
  {
    name: "Negocio",
    price: 99,
    popular: false,
    cta: "Elegir Negocio",
    features: ["Productos ilimitados", "Todo del plan Emprendedor", "LinkBox", "Estadísticas avanzadas", "Soporte VIP"],
  },
];

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="planes" className="py-20 sm:py-28">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Planes y <span className="text-primary">Precios</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">Elige el plan perfecto para tu negocio. Cancela cuando quieras.</p>
        </motion.div>

        <div className="mt-10 flex items-center justify-center">
          <div className="flex items-center gap-1 rounded-full border bg-card p-1 shadow-sm">
            <button onClick={() => setIsAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${!isAnnual ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              Mensual
            </button>
            <button onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${isAnnual ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              Anual
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">2 meses gratis</span>
            </button>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const price = plan.price === 0 ? 0 : isAnnual ? Math.round(plan.price * 10 / 12) : plan.price;
            return (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ y: -4 }}
                className={`relative rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg ${plan.popular ? "border-primary ring-2 ring-primary/20" : ""}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-md">Más Popular</span>
                )}
                <h3 className="font-display text-xl font-bold text-card-foreground">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  {plan.price === 0 ? (
                    <span className="font-display text-4xl font-bold text-foreground">Gratis</span>
                  ) : (
                    <>
                      <span className="font-display text-4xl font-bold text-foreground">Bs{price}</span>
                      <span className="text-sm text-muted-foreground">/{isAnnual ? "mes" : "mes"}</span>
                    </>
                  )}
                </div>
                {isAnnual && plan.price > 0 && (
                  <p className="mt-1 text-xs font-medium text-primary">Bs{plan.price * 10}/año — 2 meses gratis</p>
                )}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                    <Link to="/register">{plan.cta}</Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
