import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "¿No debería pagar si no tengo productos aún?",
    a: "Exacto. Plan Gratis es permanente: crea, sube 10 productos, invita clientes. Cuando necesites más (porque vendes), upgrade a Emprendedor Bs 49.",
  },
  {
    q: "¿Qué pasa si pago Emprendedor y no me gusta?",
    a: "Garantía 30 días: dinero de vuelta, sin preguntas. 78% de usuarios que upgradan se quedan.",
  },
  {
    q: "¿El Plan Gratis es limitado o es trampa?",
    a: "No es trampa. Plan Gratis real: ✓10 productos ✓Carrito ✓WhatsApp ✓Responsive ✓Sin publicidad ✓SIN EXPIRACIÓN. Límite: solo 10 productos.",
  },
  {
    q: "¿Por qué no ofrecen 30 días trial como Shopify?",
    a: "Creemos en transparencia. Trial = marketing. Nosotros: Plan Gratis PERMANENTE. Pagas solo cuando expandas. Si nunca vendes, nunca pagas.",
  },
  {
    q: "¿Cómo comparo Emprendedor vs Negocio?",
    a: "Emprendedor (Bs 49): 50 productos, cupones, envíos. Negocio (Bs 99): ilimitados, integraciones, VIP support. Regla: >50 productos = Negocio.",
  },
  {
    q: "¿Necesito saber diseño o programación?",
    a: "No. Alguien crea tienda en 10 min sin código. Tu mamá podría hacerlo.",
  },
];

const FAQSection = () => (
  <section className="py-20 sm:py-28">
    <div className="container max-w-2xl">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Objeciones <span className="text-primary">Comunes</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">Respuestas honestas a tus dudas antes de empezar.</p>
      </div>
      <div className="mt-12 rounded-2xl border bg-card p-6 sm:p-10 shadow-sm">
        <Accordion type="single" collapsible>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-display text-base font-semibold text-foreground">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

export default FAQSection;
