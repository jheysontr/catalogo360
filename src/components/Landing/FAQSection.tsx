import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  { q: "¿Qué es Catalogo360?", a: "Catalogo360 es una plataforma que te permite crear tu catálogo digital y tienda online en minutos, sin necesidad de conocimientos técnicos. Ideal para emprendedores en Latinoamérica." },
  { q: "¿Cómo se crea una tienda?", a: "Solo necesitas registrarte, agregar tus productos con fotos y precios, personalizar tu tienda y compartir el enlace con tus clientes. ¡Todo en menos de 5 minutos!" },
  { q: "¿Puedo usar Catalogo360 desde el celular?", a: "¡Claro! Tanto el panel de administración como tu tienda pública son 100% responsive y funcionan perfectamente en cualquier dispositivo." },
  { q: "¿Cuántos productos puedo subir?", a: "Depende de tu plan. El plan Estándar permite hasta 60 productos y el plan Pro hasta 200 productos." },
  { q: "¿Qué pasa cuando termina el período de prueba?", a: "Puedes elegir un plan de pago para continuar. Si no lo haces, tu tienda seguirá visible pero no podrás agregar nuevos productos hasta que actives un plan." },
  { q: "¿Es necesario saber diseño o programación?", a: "No. Catalogo360 está diseñado para que cualquier persona pueda crear su tienda sin conocimientos técnicos. Solo arrastra, escribe y publica." },
];

const FAQSection = () => (
  <section className="border-t bg-secondary/30 py-20 sm:py-28">
    <div className="container max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Preguntas <span className="text-primary">Frecuentes</span>
        </h2>
      </motion.div>
      <Accordion type="single" collapsible className="mt-12">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left font-display text-base font-semibold text-foreground">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
