import { Link } from "react-router-dom";
import { Check, Sparkles, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Gratis",
    price: "Bs 0",
    subtitle: "Para siempre",
    description: "Perfecto para empezar. Crea tu tienda y recibe pedidos sin pagar nada.",
    popular: false,
    cta: "Crear tienda Gratis",
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
    description: "El elegido por el 63% de usuarios activos. Ideal para crecer entre Bs 1,500 y Bs 15,000/mes.",
    popular: true,
    cta: "Empezar Emprendedor",
    features: [
      "Hasta 50 productos",
      "Todo del plan Gratis",
      "Cupones de descuento",
      "Múltiples zonas de envío",
      "Soporte prioritario",
      "Analíticas de ventas",
      "Variantes de productos",
    ],
  },
  {
    name: "Negocio",
    price: "Bs 99",
    subtitle: "/mes",
    description: "Para negocios consolidados. Productos ilimitados, todas las features y soporte VIP.",
    popular: false,
    cta: "Elegir Plan Negocio",
    features: [
      "Productos ilimitados",
      "Todo del plan Emprendedor",
      "LinkBox (múltiples enlaces)",
      "Estadísticas avanzadas",
      "Integraciones personalizadas",
      "Soporte VIP (respuesta <1h)",
      "Acceso anticipado a features",
    ],
  },
];

const PricingSection = () => (
  <section id="planes" className="border-t border-[#1b4332]/30 px-4 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#2dd4a8]/20 bg-[#1b4332]/40 px-3 py-1 text-xs font-semibold text-[#73ffb8]">
          <Sparkles className="h-3.5 w-3.5" /> Planes y precios
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          Precios que crecen{" "}
          <span className="bg-gradient-to-r from-[#2dd4a8] to-[#73ffb8] bg-clip-text text-transparent">
            contigo
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-slate-400">
          Empieza gratis. Paga solo cuando vendas más. Cancela cuando quieras.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-8 transition-all hover:-translate-y-1 ${
              plan.popular
                ? "border-[#2dd4a8]/50 bg-gradient-to-b from-[#1b4332]/40 to-[#1b4332]/10 shadow-2xl shadow-[#2dd4a8]/10 ring-1 ring-[#2dd4a8]/30 lg:scale-105"
                : "border-[#2dd4a8]/10 bg-[#1b4332]/10 hover:border-[#2dd4a8]/30"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 right-6 rounded-full bg-[#2dd4a8] px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0d1b2a] shadow-lg">
                ⭐ Más popular
              </span>
            )}
            <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold text-[#73ffb8]">{plan.price}</span>
              <span className="text-sm text-slate-400">{plan.subtitle}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{plan.description}</p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2dd4a8]" /> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className={`mt-8 flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all hover:scale-[1.02] ${
                plan.popular
                  ? "bg-[#2dd4a8] text-[#0d1b2a] shadow-lg shadow-[#2dd4a8]/20 hover:bg-[#73ffb8]"
                  : "border border-slate-700 bg-slate-800/30 text-white hover:bg-slate-800/60"
              }`}
            >
              {plan.cta} <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-center text-xs text-slate-500">
              {plan.popular ? "🔄 Garantía 30 días, dinero de vuelta" : "Sin contrato. Cancela cuando quieras"}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
