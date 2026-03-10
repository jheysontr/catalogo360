import { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingCTA = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setVisible(scrollPercent > 0.35);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToPricing = () => {
    const el = document.getElementById("planes");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-[999] rounded-2xl border bg-primary p-4 shadow-[0_8px_24px_hsl(var(--primary)/0.3)] animate-fade-in">
      <button
        onClick={() => setDismissed(true)}
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-card border text-muted-foreground shadow-sm hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <p className="text-sm font-semibold text-primary-foreground mb-2">¿Listo para vender?</p>
      <Button
        onClick={scrollToPricing}
        variant="secondary"
        size="sm"
        className="w-full gap-1 text-xs font-semibold"
      >
        Crear tienda gratis <ArrowRight className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default FloatingCTA;
