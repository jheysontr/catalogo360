import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const currencies = [
  { code: "BOB", symbol: "Bs", rate: 6.9 },
  { code: "USD", symbol: "$", rate: 1 },
  { code: "EUR", symbol: "€", rate: 0.92 },
  { code: "CLP", symbol: "$", rate: 980 },
  { code: "ARS", symbol: "$", rate: 1250 },
  { code: "MXN", symbol: "$", rate: 17.2 },
  { code: "PEN", symbol: "S/", rate: 3.7 },
  { code: "COP", symbol: "$", rate: 4100 },
  { code: "UYU", symbol: "$", rate: 42 },
];

const plans = [
  {
    name: "Estándar",
    basePrice: 7.5,
    popular: false,
    features: ["Hasta 60 productos", "Soporte por WhatsApp", "Estadísticas básicas", "Diseño responsive"],
  },
  {
    name: "Pro",
    basePrice: 10.5,
    popular: true,
    features: ["Todo de Estándar", "Hasta 200 productos", "Soporte 24/7", "Estadísticas avanzadas", "Linkbox gratis", "Gestión de inventario inteligente"],
  },
];

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState(currencies[0]);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const formatPrice = (baseUSD: number) => {
    const price = isAnnual ? baseUSD * 0.6 : baseUSD;
    const converted = price * currency.rate;
    const decimals = currency.rate >= 100 ? 0 : 2;
    return `${currency.symbol}${converted.toFixed(decimals)}`;
  };

  return (
    <section id="planes" className="py-20 sm:py-28">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Planes y <span className="text-primary">Precios</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">Elige el plan perfecto para tu negocio. Cancela cuando quieras.</p>
        </motion.div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <div className="relative">
            <button onClick={() => setCurrencyOpen(!currencyOpen)}
              className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent">
              {currency.code} ({currency.symbol}) <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {currencyOpen && (
              <div className="absolute left-0 z-50 mt-1 w-44 rounded-lg border bg-card py-1 shadow-lg">
                {currencies.map((c) => (
                  <button key={c.code} onClick={() => { setCurrency(c); setCurrencyOpen(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground hover:bg-accent">
                    {c.code} ({c.symbol})
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-full border bg-card p-1 shadow-sm">
            <button onClick={() => setIsAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${!isAnnual ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              Mensual
            </button>
            <button onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${isAnnual ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              Anual
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">-40%</span>
            </button>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-2">
          {plans.map((plan) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ y: -4 }}
              className={`relative rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg ${plan.popular ? "border-primary ring-2 ring-primary/20" : ""}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-md">Más Popular</span>
              )}
              <h3 className="font-display text-xl font-bold text-card-foreground">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-foreground">{formatPrice(plan.basePrice)}</span>
                <span className="text-sm text-muted-foreground">/{isAnnual ? "año" : "mes"}</span>
              </div>
              {isAnnual && <p className="mt-1 text-xs font-medium text-primary">-40% OFF aplicado</p>}
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3">
                <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                  <a href={`https://wa.me/1234567890?text=Hola, quiero el plan ${plan.name} de Catalogo360`} target="_blank" rel="noopener noreferrer">
                    Elegir Plan
                  </a>
                </Button>
                <Button asChild variant="ghost" className="w-full"><Link to="/register">Probar Gratis</Link></Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
