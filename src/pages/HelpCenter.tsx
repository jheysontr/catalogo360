import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Search, Package, HelpCircle, ShoppingBag, LayoutDashboard, CreditCard, Truck, Palette, BarChart3, QrCode, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

interface HelpCategory {
  icon: React.ReactNode;
  title: string;
  description: string;
  faqs: FAQItem[];
}

const helpCategories: HelpCategory[] = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: "Primeros pasos",
    description: "Cómo crear tu cuenta y configurar tu tienda",
    faqs: [
      {
        question: "¿Cómo creo mi tienda?",
        answer: "Al registrarte, se iniciará un asistente de configuración que te guiará paso a paso: elige el nombre de tu tienda, sube tu logo, selecciona colores y plantilla. ¡Tu tienda estará lista en menos de 5 minutos!"
      },
      {
        question: "¿Necesito conocimientos técnicos?",
        answer: "No. Catalogo360 está diseñado para que cualquier persona pueda crear su tienda online sin necesidad de saber programar ni diseñar. Todo se configura desde un panel visual muy intuitivo."
      },
      {
        question: "¿Puedo personalizar el diseño de mi tienda?",
        answer: "Sí. Puedes elegir entre varias plantillas (Moderna, Clásica, Elegante, App), cambiar colores primarios y secundarios, subir tu logo y banner, y configurar la información de tu negocio."
      },
      {
        question: "¿Cómo accedo a mi panel de administración?",
        answer: "Inicia sesión en Catalogo360 y serás redirigido automáticamente a tu Dashboard. Desde ahí puedes gestionar productos, pedidos, configuración y más."
      },
    ],
  },
  {
    icon: <ShoppingBag className="h-5 w-5" />,
    title: "Productos",
    description: "Agregar, editar y organizar tus productos",
    faqs: [
      {
        question: "¿Cómo agrego un producto?",
        answer: "Ve a Dashboard → Productos → clic en 'Agregar producto'. Completa el nombre, precio, descripción, sube imágenes y asigna una categoría. También puedes agregar variantes (tallas, colores) con precios y stock independientes."
      },
      {
        question: "¿Puedo agregar imágenes múltiples a un producto?",
        answer: "Sí. Cada producto puede tener una imagen principal y varias imágenes adicionales que se mostrarán en una galería en la página del producto."
      },
      {
        question: "¿Cómo funcionan las categorías?",
        answer: "Las categorías te permiten organizar tus productos. Crea categorías desde Dashboard → Categorías. Puedes asignar un ícono y descripción a cada una. Tus clientes podrán filtrar productos por categoría en tu tienda."
      },
      {
        question: "¿Puedo poner productos en oferta?",
        answer: "Sí. Al editar un producto, activa la opción 'En oferta' y establece el porcentaje de descuento. El precio original y el precio con descuento se mostrarán automáticamente en tu tienda."
      },
    ],
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: "Pedidos y Pagos",
    description: "Gestión de pedidos y métodos de pago",
    faqs: [
      {
        question: "¿Cómo recibo pedidos?",
        answer: "Cuando un cliente realiza un pedido en tu tienda, recibirás una notificación en tu Dashboard. Los pedidos se envían por WhatsApp con todos los detalles del pedido incluyendo productos, cantidades y datos del cliente."
      },
      {
        question: "¿Qué métodos de pago puedo ofrecer?",
        answer: "Puedes configurar múltiples métodos de pago desde Dashboard → Métodos de Pago, incluyendo transferencia bancaria, efectivo contra entrega, y otros métodos personalizados según tu país."
      },
      {
        question: "¿Cómo gestiono el estado de mis pedidos?",
        answer: "Desde Dashboard → Pedidos puedes ver todos tus pedidos, cambiar su estado (pendiente, en proceso, completado, cancelado) y ver los detalles de cada uno."
      },
    ],
  },
  {
    icon: <Truck className="h-5 w-5" />,
    title: "Envíos",
    description: "Configuración de envíos y seguimiento",
    faqs: [
      {
        question: "¿Cómo configuro los costos de envío?",
        answer: "Ve a Dashboard → Configuración de Envíos. Puedes definir zonas de envío, costos fijos o por zona, y ofrecer envío gratis a partir de cierto monto de compra."
      },
      {
        question: "¿Puedo hacer seguimiento de envíos?",
        answer: "Sí. Desde Dashboard → Envíos puedes asignar números de seguimiento a cada pedido y actualizar el estado del envío. Cada envío genera un número de rastreo único."
      },
    ],
  },
  {
    icon: <Tag className="h-5 w-5" />,
    title: "Cupones y Descuentos",
    description: "Crear promociones para tus clientes",
    faqs: [
      {
        question: "¿Cómo creo un cupón de descuento?",
        answer: "Ve a Dashboard → Cupones → 'Crear cupón'. Define el código, tipo de descuento (porcentaje o monto fijo), valor, fecha de expiración y límite de usos. Tus clientes podrán aplicar el cupón al momento de hacer su pedido."
      },
      {
        question: "¿Puedo establecer un monto mínimo de compra para el cupón?",
        answer: "Sí. Al crear un cupón puedes definir un monto mínimo de compra requerido para que el cupón sea válido."
      },
    ],
  },
  {
    icon: <Palette className="h-5 w-5" />,
    title: "Personalización",
    description: "Diseño, plantillas y marca",
    faqs: [
      {
        question: "¿Qué plantillas están disponibles?",
        answer: "Catalogo360 ofrece 4 plantillas: Moderna (diseño limpio y contemporáneo), Clásica (elegante y tradicional), Elegante (sofisticada con detalles premium) y App (estilo aplicación móvil con navegación inferior)."
      },
      {
        question: "¿Puedo cambiar los colores de mi tienda?",
        answer: "Sí. Desde Dashboard → Configuración puedes elegir un color primario y secundario que se aplicarán a toda tu tienda, incluyendo botones, encabezados y elementos destacados."
      },
      {
        question: "¿Qué es Linkbox?",
        answer: "Linkbox es tu página de enlaces personalizada (tipo Linktree). Puedes agregar enlaces a tus redes sociales, WhatsApp, sitio web y más. Comparte un solo enlace que dirige a todos tus canales."
      },
    ],
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Analíticas",
    description: "Métricas y estadísticas de tu tienda",
    faqs: [
      {
        question: "¿Qué métricas puedo ver?",
        answer: "Desde Dashboard → Analíticas puedes ver ventas totales, número de pedidos, productos más vendidos, ingresos por período y tendencias de crecimiento de tu negocio."
      },
    ],
  },
  {
    icon: <QrCode className="h-5 w-5" />,
    title: "Compartir tu tienda",
    description: "Cómo dar a conocer tu catálogo",
    faqs: [
      {
        question: "¿Cómo comparto mi tienda?",
        answer: "Tu tienda tiene un enlace único (ej: catalogo360.com/tu-tienda). Puedes compartirlo en redes sociales, WhatsApp, o donde prefieras. También puedes generar un código QR desde tu Dashboard para materiales impresos."
      },
      {
        question: "¿Mis clientes necesitan crear cuenta para comprar?",
        answer: "No. Tus clientes pueden navegar tu catálogo, agregar productos al carrito y hacer pedidos sin necesidad de registrarse. Solo necesitan proporcionar su nombre, email y teléfono al momento del pedido."
      },
    ],
  },
];

const HelpCenter = () => {
  const [search, setSearch] = useState("");
  const [openCategory, setOpenCategory] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const filtered = search.trim()
    ? helpCategories.map(cat => ({
        ...cat,
        faqs: cat.faqs.filter(
          f => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.faqs.length > 0)
    : helpCategories;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background py-16 sm:py-20">
        <div className="container max-w-3xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <HelpCircle className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Centro de Ayuda</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Encuentra respuestas a las preguntas más frecuentes sobre cómo usar Catalogo360.
          </p>
          <div className="relative mx-auto mt-8 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar pregunta..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container max-w-3xl py-12">
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No se encontraron resultados para "{search}"</p>
        )}
        <div className="space-y-4">
          {filtered.map((cat, ci) => (
            <div key={cat.title} className="rounded-xl border bg-card overflow-hidden">
              <button
                onClick={() => setOpenCategory(openCategory === ci ? null : ci)}
                className="flex w-full items-center gap-3 p-5 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{cat.title}</h3>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
                {openCategory === ci ? <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
              </button>
              <AnimatePresence>
                {openCategory === ci && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t divide-y">
                      {cat.faqs.map(faq => {
                        const key = `${ci}-${faq.question}`;
                        const isOpen = openFaq === key;
                        return (
                          <div key={faq.question}>
                            <button
                              onClick={() => setOpenFaq(isOpen ? null : key)}
                              className="flex w-full items-center gap-2 px-5 py-4 text-left text-sm hover:bg-muted/30 transition-colors"
                            >
                              <span className="flex-1 font-medium text-foreground">{faq.question}</span>
                              {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                            </button>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-xl border bg-card p-8 text-center">
          <h3 className="font-display text-lg font-semibold text-foreground">¿No encontraste lo que buscabas?</h3>
          <p className="mt-2 text-sm text-muted-foreground">Contáctanos y te ayudaremos personalmente.</p>
          <a href="mailto:soporte@catalogo360.com" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            soporte@catalogo360.com
          </a>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
