import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "¿Cuánto cuesta empezar?",
    a: "Cero. El Plan Gratis es permanente: crea tu tienda, sube hasta 10 productos y recibe pedidos sin pagar nada. Solo upgrade cuando crezcas.",
  },
  {
    q: "¿Qué pasa si pago Emprendedor y no me gusta?",
    a: "Garantía 30 días: dinero de vuelta, sin preguntas. El 78% de usuarios que upgrade se quedan.",
  },
  {
    q: "¿El Plan Gratis tiene trampa o publicidad?",
    a: "No. Plan Gratis real: ✓10 productos ✓Carrito ✓WhatsApp ✓Responsive ✓Sin publicidad ✓Sin expiración. La única limitación: 10 productos.",
  },
  {
    q: "¿Necesito saber diseño o programación?",
    a: "No. Cualquier persona crea su tienda en 10 minutos. Subes fotos, escribes precios y listo.",
  },
  {
    q: "¿Cómo recibo los pedidos?",
    a: "Llegan a tu WhatsApp con todos los detalles del cliente, productos y total. También los ves organizados en tu dashboard con notificaciones en tiempo real.",
  },
  {
    q: "¿Funciona en otros países además de Bolivia?",
    a: "Sí. La moneda por defecto es BOB pero soporta múltiples monedas. Tenemos clientes en México, Argentina, Chile, Perú, Colombia, Uruguay, Ecuador, Paraguay y Venezuela.",
  },
  {
    q: "¿Puedo personalizar el diseño de mi tienda?",
    a: "Sí. Logo, banner, colores principales y secundarios, slug propio (tu-tienda.catalogo360.online), información de contacto y más.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Sí. Usamos Row Level Security a nivel base de datos: cada tienda está aislada y solo tú accedes a tus datos. Hosting con respaldo automático.",
  },
];

const FAQSection = () => (
  <section className="border-t border-[#1b4332]/30 px-4 py-20 sm:py-28">
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#2dd4a8]/20 bg-[#1b4332]/40 px-3 py-1 text-xs font-semibold text-[#73ffb8]">
          <HelpCircle className="h-3.5 w-3.5" /> Preguntas frecuentes
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
          Resolvemos tus{" "}
          <span className="bg-gradient-to-r from-[#2dd4a8] to-[#73ffb8] bg-clip-text text-transparent">
            dudas
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-slate-400">
          Respuestas honestas antes de empezar. Si tienes otra pregunta, escríbenos.
        </p>
      </div>
      <div className="mt-10 rounded-2xl border border-[#2dd4a8]/10 bg-[#1b4332]/10 p-4 sm:p-8">
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-xl border border-slate-700/50 bg-slate-900/40 px-4 data-[state=open]:border-[#2dd4a8]/40 data-[state=open]:bg-[#1b4332]/30"
            >
              <AccordionTrigger className="text-left font-display text-sm font-semibold text-white hover:no-underline sm:text-base">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-slate-400">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

export default FAQSection;
