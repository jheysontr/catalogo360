import { Package } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t bg-card">
    <div className="container flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
      <div className="flex items-center gap-2 font-display font-semibold text-foreground">
        <Package className="h-5 w-5 text-primary" />
        Catalogo360
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Link to="/terminos" className="hover:text-foreground transition-colors">Términos de Servicio</Link>
        <Link to="/privacidad" className="hover:text-foreground transition-colors">Política de Privacidad</Link>
      </div>
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Catalogo360. Todos los derechos reservados.
      </p>
    </div>
  </footer>
);

export default Footer;
