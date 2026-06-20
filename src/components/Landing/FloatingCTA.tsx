import { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";

const FloatingCTA = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
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
    <div className="fixed bottom-6 right-4 left-4 z-[999] rounded-2xl border border-[#2dd4a8]/30 bg-[#1b4332] p-4 shadow-2xl shadow-[#2dd4a8]/20 backdrop-blur-md animate-fade-in sm:left-auto sm:right-6 sm:max-w-xs">
      <button
        onClick={() => setDismissed(true)}
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-[#0d1b2a] text-slate-400 shadow-sm transition-colors hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <p className="mb-2 text-sm font-semibold text-white">¿Listo para vender?</p>
      <button
        onClick={scrollToPricing}
        className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#2dd4a8] px-3 py-2 text-xs font-semibold text-[#0d1b2a] transition-all hover:bg-[#73ffb8]"
      >
        Crear tienda gratis <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};

export default FloatingCTA;
