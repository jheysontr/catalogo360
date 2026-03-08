import { motion } from "framer-motion";
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

/* ── Full-bleed banner (Elegante, Moda) ── */
const FullBanner = ({ store, primaryColor, theme }: AppHeroBannerProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6 }}
    className="relative overflow-hidden"
  >
    <div
      className={`relative ${theme.bannerHeight} sm:h-56 w-full`}
      style={{
        background: store.banner_url
          ? undefined
          : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)`,
      }}
    >
      {store.banner_url && (
        <img src={store.banner_url} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-white/70 mb-1">{theme.bannerGreeting}</p>
        {store.description && (
          <p className="text-sm text-white/80 line-clamp-2 max-w-md">{store.description}</p>
        )}
      </div>
    </div>
  </motion.div>
);

/* ── Split banner (Moderna) ── */
const SplitBanner = ({ store, primaryColor, theme }: AppHeroBannerProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="container px-4 pt-4"
  >
    <div className={`flex overflow-hidden ${theme.bannerRounded} ${theme.cardShadow}`} style={{ backgroundColor: primaryColor }}>
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
        <p className="text-xs uppercase tracking-widest text-white/70 mb-1">{theme.bannerGreeting}</p>
        {store.description && (
          <p className="text-xs text-white/80 line-clamp-2 mt-1">{store.description}</p>
        )}
      </div>
      {store.banner_url && (
        <div className="w-1/3 sm:w-2/5 overflow-hidden">
          <img src={store.banner_url} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}
    </div>
  </motion.div>
);

/* ── Minimal banner (Frutas) ── */
const MinimalBanner = ({ store, primaryColor }: AppHeroBannerProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
    className="container px-4 pt-4"
  >
    {store.description && (
      <p className="text-center text-sm text-muted-foreground">{store.description}</p>
    )}
  </motion.div>
);

/* ── Compact banner (App, Electrónica) ── */
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
        background: store.banner_url
          ? `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor}99)`
          : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
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
      <div className="relative z-10 space-y-1">
        <p className="text-xs font-medium text-white/80">{theme.bannerGreeting}</p>
        {store.description && (
          <p className="text-xs text-white/80 line-clamp-2 max-w-sm">{store.description}</p>
        )}
      </div>
    </div>
  </motion.div>
);

/* ── Hero banner (Classic shared, Comida) ── */
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
        background: store.banner_url
          ? `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor}99)`
          : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
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
      <div className="relative z-10 space-y-1.5">
        <p className="text-sm font-medium text-white/80">{theme.bannerGreeting}</p>
        {store.description && (
          <p className="text-sm text-white/80 line-clamp-2 max-w-sm">{store.description}</p>
        )}
      </div>
    </div>
  </motion.div>
);

const AppHeroBanner = (props: AppHeroBannerProps) => {
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
