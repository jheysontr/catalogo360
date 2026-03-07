import { useState, useEffect } from "react";
import { ShoppingCart, Star, Shield, Truck, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StorefrontConfig {
  template?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;
  countdown_enabled?: boolean;
  countdown_end?: string;
  countdown_text?: string;
  trust_badges?: boolean;
  social_proof_enabled?: boolean;
  social_proof_count?: number;
  social_proof_text?: string;
  guarantee_text?: string;
}

interface HeroBannerProps {
  storeName: string;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  config: StorefrontConfig;
  onCtaClick?: () => void;
}

const CountdownTimer = ({ endDate, primaryColor }: { endDate: string; primaryColor: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold text-white" style={{ backgroundColor: primaryColor }}>
      <Clock className="h-3.5 w-3.5" />
      <span className="text-xs opacity-80">Oferta termina en</span>
      <div className="flex items-center gap-0.5 font-mono">
        {timeLeft.days > 0 && <><span className="rounded bg-white/20 px-1.5 py-0.5">{pad(timeLeft.days)}</span><span>:</span></>}
        <span className="rounded bg-white/20 px-1.5 py-0.5">{pad(timeLeft.hours)}</span>
        <span>:</span>
        <span className="rounded bg-white/20 px-1.5 py-0.5">{pad(timeLeft.minutes)}</span>
        <span>:</span>
        <span className="rounded bg-white/20 px-1.5 py-0.5">{pad(timeLeft.seconds)}</span>
      </div>
    </div>
  );
};

const HeroBanner = ({ storeName, bannerUrl, logoUrl, primaryColor, secondaryColor, config, onCtaClick }: HeroBannerProps) => {
  const hasCountdown = config.countdown_enabled && config.countdown_end && new Date(config.countdown_end) > new Date();

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: secondaryColor }}>
      {/* Countdown bar */}
      {hasCountdown && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-white" style={{ backgroundColor: `${primaryColor}dd` }}>
          <span>{config.countdown_text || "Oferta por tiempo limitado"}</span>
          <CountdownTimer endDate={config.countdown_end!} primaryColor={secondaryColor} />
        </div>
      )}

      {/* Hero content */}
      <div className="relative">
        {bannerUrl && (
          <div className="absolute inset-0">
            <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
        )}
        <div className="relative flex flex-col items-center gap-4 px-4 py-12 text-center sm:py-16 md:py-20">
          {/* Social proof */}
          {config.social_proof_enabled && config.social_proof_count && config.social_proof_count > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-xs font-medium text-white">
                {config.social_proof_text || `${config.social_proof_count.toLocaleString()}+ compradores satisfechos`}
              </span>
            </div>
          )}

          <h1 className="max-w-2xl font-display text-3xl font-black text-white drop-shadow-lg sm:text-4xl md:text-5xl">
            {config.hero_title || storeName}
          </h1>
          {config.hero_subtitle && (
            <p className="max-w-md text-base text-white/80 sm:text-lg">{config.hero_subtitle}</p>
          )}

          {config.hero_cta_text && (
            <Button
              size="lg"
              className="mt-2 rounded-lg px-8 py-6 text-base font-bold text-white shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: primaryColor }}
              onClick={onCtaClick}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {config.hero_cta_text}
            </Button>
          )}

          {config.guarantee_text && (
            <p className="flex items-center gap-1.5 text-xs text-white/70">
              <Shield className="h-3.5 w-3.5" />
              {config.guarantee_text}
            </p>
          )}
        </div>
      </div>

      {/* Trust badges */}
      {config.trust_badges && (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
          <span className="flex items-center gap-1.5 text-xs font-medium text-white/80">
            <Shield className="h-3.5 w-3.5" /> Compra segura
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-white/80">
            <Truck className="h-3.5 w-3.5" /> Envío rápido
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-white/80">
            <CreditCard className="h-3.5 w-3.5" /> Pago seguro
          </span>
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
export type { StorefrontConfig };
