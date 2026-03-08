import { motion } from "framer-motion";
import { Store as StoreIcon, Sparkles, Zap, Leaf, ShoppingBag } from "lucide-react";
import type { TemplateTheme } from "./templateThemes";

interface AppHeroBannerProps {
  store: {
    banner_url: string | null;
    description: string | null;
    store_name: string;
    logo_url?: string | null;
  };
  primaryColor: string;
  theme: TemplateTheme;
}

/* ── Full-bleed cinematic banner (Elegante) ── */
const FullBanner = ({ store, primaryColor, theme }: AppHeroBannerProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
    className="relative overflow-hidden"
  >
    <div
      className={`relative ${theme.bannerHeight} sm:h-56 w-full`}
      style={{
        background: store.banner_url
          ? undefined
          : `linear-gradient(160deg, ${primaryColor}, #000 80%)`,
      }}
    >
      {store.banner_url && (
        <img src={store.banner_url} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      )}
      {/* Cinematic overlay with vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 50%, ${primaryColor}33 100%)` }} />

      {/* Decorative corner lines */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-white/30" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-white/30" />

      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 max-w-[40px]" style={{ backgroundColor: `${primaryColor}99` }} />
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/60">{theme.bannerGreeting}</p>
        </div>
        {store.description && (
          <p className="text-sm text-white/70 line-clamp-2 max-w-md font-light italic">{store.description}</p>
        )}
      </div>
    </div>
  </motion.div>
);

/* ── Moda: Editorial magazine-style full banner ── */
const ModaBanner = ({ store, primaryColor, theme }: AppHeroBannerProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 1.02 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.7 }}
    className="relative overflow-hidden"
  >
    <div
      className={`relative ${theme.bannerHeight} sm:h-60 w-full`}
      style={{
        background: store.banner_url ? undefined : `linear-gradient(180deg, ${primaryColor}22, ${primaryColor}cc)`,
      }}
    >
      {store.banner_url && (
        <img src={store.banner_url} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* Editorial top label */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pt-3">
        <span className="text-[9px] uppercase tracking-[0.5em] text-white/50 border-b border-white/20 pb-1 px-4">
          {theme.bannerGreeting}
        </span>
      </div>

      {/* Bottom content with fashion-style layout */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
        <div>
          {store.description && (
            <p className="text-xs text-white/60 line-clamp-1 max-w-[200px]">{store.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="h-3.5 w-3.5 text-white/50" />
          <span className="text-[9px] text-white/50 uppercase tracking-wider">Shop Now</span>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ── Split banner with diagonal cut (Moderna) ── */
const SplitBanner = ({ store, primaryColor, theme }: AppHeroBannerProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="container px-4 pt-4"
  >
    <div className={`relative flex overflow-hidden ${theme.bannerRounded} ${theme.cardShadow}`} style={{ backgroundColor: primaryColor }}>
      {/* Decorative geometric shapes */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
      <div className="absolute -right-2 top-8 h-16 w-16 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
      <div className="absolute left-1/2 -bottom-4 h-12 w-12 rotate-45" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />

      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center relative z-10">
        <div className="flex items-center gap-2 mb-1.5">
          <Zap className="h-3.5 w-3.5 text-white/70" />
          <p className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">{theme.bannerGreeting}</p>
        </div>
        {store.description && (
          <p className="text-xs text-white/70 line-clamp-2 mt-1">{store.description}</p>
        )}
      </div>
      {store.banner_url && (
        <div className="w-2/5 overflow-hidden relative">
          <div className="absolute inset-0 -skew-x-6 -ml-4 overflow-hidden">
            <img src={store.banner_url} alt="" className="h-full w-full object-cover skew-x-6 scale-110" loading="lazy" />
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

/* ── Frutas: Organic wave banner ── */
const MinimalBanner = ({ store, primaryColor, theme }: AppHeroBannerProps) => (
  <motion.div
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="relative"
  >
    {/* Organic wave background */}
    <div className="container px-4 pt-3">
      <div
        className="relative overflow-hidden rounded-3xl p-4"
        style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}08)` }}
      >
        {/* Decorative leaf/organic shapes */}
        <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full" style={{ backgroundColor: `${primaryColor}10` }} />
        <div className="absolute -left-2 -bottom-2 h-12 w-12 rounded-full" style={{ backgroundColor: `${primaryColor}08` }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
            <Leaf className="h-4 w-4" style={{ color: primaryColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium" style={{ color: primaryColor }}>{theme.bannerGreeting}</p>
            {store.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{store.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ── Compact tech-style banner (App, Electrónica) ── */
const CompactBanner = ({ store, primaryColor, theme }: AppHeroBannerProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="container px-4 pt-4"
  >
    <div
      className={`relative overflow-hidden ${theme.bannerRounded} p-4 sm:p-5`}
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)`,
      }}
    >
      {store.banner_url && (
        <img
          src={store.banner_url}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover mix-blend-overlay ${theme.bannerOverlayOpacity}`}
          loading="lazy"
        />
      )}

      {/* Tech grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Decorative dot accent */}
      <div className="absolute right-4 top-4 flex gap-1">
        <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
        <div className="h-1.5 w-1.5 rounded-full bg-white/50" />
        <div className="h-1.5 w-1.5 rounded-full bg-white/70" />
      </div>

      <div className="relative z-10 space-y-1">
        <p className="text-xs font-medium text-white/80">{theme.bannerGreeting}</p>
        {store.description && (
          <p className="text-xs text-white/70 line-clamp-2 max-w-sm">{store.description}</p>
        )}
      </div>
    </div>
  </motion.div>
);

/* ── Comida: Warm rounded delivery-style banner ── */
const HeroBanner = ({ store, primaryColor, theme }: AppHeroBannerProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="container px-4 pt-4"
  >
    <div
      className={`relative overflow-hidden ${theme.bannerRounded} p-5 sm:p-6`}
      style={{
        background: `linear-gradient(160deg, ${primaryColor}, ${primaryColor}dd 60%, ${primaryColor}aa)`,
      }}
    >
      {store.banner_url && (
        <img
          src={store.banner_url}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover mix-blend-overlay ${theme.bannerOverlayOpacity}`}
          loading="lazy"
        />
      )}

      {/* Warm wave decoration at bottom */}
      <svg className="absolute bottom-0 left-0 right-0 h-6 text-background/10" viewBox="0 0 400 24" preserveAspectRatio="none">
        <path d="M0,24 Q100,0 200,12 Q300,24 400,6 L400,24 Z" fill="currentColor" />
      </svg>

      {/* Floating circle decorations */}
      <div className="absolute right-4 top-3 h-14 w-14 rounded-full border-2 border-white/10" />
      <div className="absolute right-8 top-6 h-8 w-8 rounded-full bg-white/10" />

      <div className="relative z-10 space-y-1.5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1">
          <Sparkles className="h-3 w-3 text-white" />
          <p className="text-xs font-semibold text-white">{theme.bannerGreeting}</p>
        </div>
        {store.description && (
          <p className="text-sm text-white/80 line-clamp-2 max-w-sm">{store.description}</p>
        )}
      </div>
    </div>
  </motion.div>
);

const AppHeroBanner = (props: AppHeroBannerProps) => {
  // Moda gets its own unique editorial banner
  if (props.theme.id === "moda") {
    return <ModaBanner {...props} />;
  }
  switch (props.theme.bannerStyle) {
    case "full":
      return <FullBanner {...props} />;
    case "split":
      return <SplitBanner {...props} />;
    case "minimal":
      return <MinimalBanner {...props} />;
    case "compact":
      return <CompactBanner {...props} />;
    default:
      return <HeroBanner {...props} />;
  }
};

export default AppHeroBanner;
