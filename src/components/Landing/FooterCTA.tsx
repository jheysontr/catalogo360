import { Link } from "react-router-dom";
import { ArrowRight, Play, Package, Mail, MessageCircle, Instagram } from "lucide-react";

const securityPoints = [
  { icon: "✅", title: "Sin tarjeta requerida", desc: "Crea gratis. Sin datos de pago." },
  { icon: "🔄", title: "Garantía 30 días", desc: "Si pagas y no te gusta, devolvemos tu dinero." },
  { icon: "🚪", title: "Cancela cuando quieras", desc: "Sin contrato. Sin penalidades." },
];

const CTABanner = () => (
  <section className="border-t border-[#1b4332]/30 px-4 py-20 sm:py-28">
    <div className="mx-auto max-w-5xl">
      <div className="relative overflow-hidden rounded-3xl border border-[#2dd4a8]/30 bg-gradient-to-br from-[#1b4332]/60 via-[#1b4332]/30 to-[#0d1b2a] p-10 text-center shadow-2xl shadow-[#2dd4a8]/5 sm:p-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#2dd4a8]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#73ffb8]/10 blur-3xl" />
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Vende hoy.{" "}
            <span className="bg-gradient-to-r from-[#2dd4a8] to-[#73ffb8] bg-clip-text text-transparent">
              Paga solo cuando ganes más.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400">
            Tu Plan Gratis nunca expira. Crea tienda, sube productos y recibe pedidos. Cero costo, cero riesgo, cero publicidad. Cuando crezcas, upgrade a Emprendedor con garantía 30 días.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {securityPoints.map((point) => (
              <div key={point.title} className="flex flex-col items-center gap-2">
                <span className="text-2xl">{point.icon}</span>
                <p className="text-sm font-semibold text-white">{point.title}</p>
                <p className="text-xs text-slate-400">{point.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="group flex items-center justify-center gap-2 rounded-xl bg-[#2dd4a8] px-8 py-4 text-base font-bold text-[#0d1b2a] shadow-xl shadow-[#2dd4a8]/20 transition-all hover:scale-[1.02] hover:bg-[#73ffb8]"
            >
              Crear mi tienda Gratis{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/demo"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/30 px-8 py-4 text-base font-bold text-white transition-all hover:bg-slate-800/60"
            >
              <Play className="h-4 w-4" /> Ver demo en vivo
            </Link>
          </div>
          <p className="mt-4 text-sm font-semibold text-[#2dd4a8]">
            ⏱️ Toma 5 minutos · +500 tiendas creadas este mes
          </p>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-[#1b4332]/30 bg-black/30 py-12">
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <Package className="h-5 w-5 text-[#2dd4a8]" /> Catalogo360
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            La plataforma más completa para crear catálogos digitales y vender por WhatsApp en Latinoamérica.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-white">Producto</h4>
          <ul className="mt-3 space-y-2">
            <li><Link to="/" className="text-sm text-slate-400 transition-colors hover:text-[#2dd4a8]">Inicio</Link></li>
            <li><Link to="/demo" className="text-sm text-slate-400 transition-colors hover:text-[#2dd4a8]">Demo en vivo</Link></li>
            <li><Link to="/register" className="text-sm text-slate-400 transition-colors hover:text-[#2dd4a8]">Crear tienda gratis</Link></li>
            <li><Link to="/login" className="text-sm text-slate-400 transition-colors hover:text-[#2dd4a8]">Iniciar sesión</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-white">Recursos</h4>
          <ul className="mt-3 space-y-2">
            <li><Link to="/ayuda" className="text-sm text-slate-400 transition-colors hover:text-[#2dd4a8]">Centro de ayuda</Link></li>
            <li><Link to="/terminos" className="text-sm text-slate-400 transition-colors hover:text-[#2dd4a8]">Términos de servicio</Link></li>
            <li><Link to="/privacidad" className="text-sm text-slate-400 transition-colors hover:text-[#2dd4a8]">Política de privacidad</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-white">Contacto</h4>
          <ul className="mt-3 space-y-2">
            <li className="flex items-center gap-2 text-sm text-slate-400">
              <Mail className="h-4 w-4" /> soporte@catalogo360.online
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-400">
              <MessageCircle className="h-4 w-4" /> WhatsApp soporte
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-400">
              <Instagram className="h-4 w-4" /> @catalogo360
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-10 border-t border-[#1b4332]/30 pt-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Catalogo360. Todos los derechos reservados. Hecho con 💚 en Bolivia.
      </div>
    </div>
  </footer>
);

const FooterCTA = () => <CTABanner />;

export { Footer };
export default FooterCTA;
