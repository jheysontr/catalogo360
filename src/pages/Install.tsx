import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Monitor, Apple, Chrome } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-12 px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
            <Download className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Instala Catalogo360
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Accede más rápido desde tu pantalla de inicio, sin necesidad de tiendas de apps.
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-primary/30 bg-primary/5 mb-8">
            <CardContent className="flex flex-col items-center py-8 gap-3">
              <span className="text-4xl">🎉</span>
              <p className="text-lg font-semibold text-foreground">¡Ya tienes la app instalada!</p>
              <p className="text-sm text-muted-foreground">Búscala en tu pantalla de inicio.</p>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Card className="border-primary/30 mb-8">
            <CardContent className="flex flex-col items-center py-8 gap-4">
              <p className="text-lg font-semibold text-foreground">Tu navegador soporta instalación directa</p>
              <Button size="lg" onClick={handleInstall} className="gap-2">
                <Download className="h-5 w-5" />
                Instalar ahora
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          {/* iOS */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Apple className="h-5 w-5" />
                iPhone / iPad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Step n={1} text='Abre Catalogo360 en Safari.' />
              <Step n={2} text='Toca el botón de Compartir (el cuadrado con flecha hacia arriba).' />
              <Step n={3} text='Desplázate y selecciona "Agregar a pantalla de inicio".' />
              <Step n={4} text='Toca "Agregar" para confirmar.' />
              <p className="text-xs text-muted-foreground pt-2">
                ⚠️ Debe ser Safari. Chrome y otros navegadores en iOS no permiten instalar PWAs.
              </p>
            </CardContent>
          </Card>

          {/* Android */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="h-5 w-5" />
                Android
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Step n={1} text="Abre Catalogo360 en Chrome." />
              <Step n={2} text='Toca el menú (⋮) en la esquina superior derecha.' />
              <Step n={3} text='Selecciona "Instalar aplicación" o "Agregar a pantalla de inicio".' />
              <Step n={4} text='Confirma tocando "Instalar".' />
              <p className="text-xs text-muted-foreground pt-2">
                También funciona en Edge, Samsung Internet y otros navegadores Chromium.
              </p>
            </CardContent>
          </Card>

          {/* Desktop */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="h-5 w-5" />
                Escritorio (Windows / Mac / Linux)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Step n={1} text="Abre Catalogo360 en Chrome o Edge." />
              <Step n={2} text='Haz clic en el ícono de instalación (⊕) en la barra de direcciones, o ve al menú → "Instalar Catalogo360".' />
              <Step n={3} text="Confirma la instalación en el diálogo emergente." />
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-10">
          <Link to="/">
            <Button variant="outline">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const Step = ({ n, text }: { n: number; text: string }) => (
  <div className="flex gap-3 items-start">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
      {n}
    </span>
    <p className="text-sm text-foreground pt-0.5">{text}</p>
  </div>
);

export default Install;
