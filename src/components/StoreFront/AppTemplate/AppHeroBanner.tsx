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
  customGreeting?: string;
  customDescription?: string;
}

const useTexts = (props: AppHeroBannerProps) => ({
  greeting: props.customGreeting || props.theme.bannerGreeting,
  desc: props.customDescription || props.store.description,
});

/** Friendly emoji decor used when the store has no banner image. */
const BannerPlaceholderDecor = ({ tone = "light" }: { tone?: "light" | "dark" }) => {
  const opacity = tone === "dark" ? "opacity-30" : "opacity-50";
  const emojis = ["🛍️", "🍎", "🥖", "☕", "🌿", "✨"];
  return (
    <div className={`pointer-events-none absolute inset-0 ${opacity}`} aria-hidden="true">
      {emojis.map((e, i) => (
        <span
          key={i}
          className="absolute text-3xl sm:text-4xl"
          style={{
            top: `${10 + (i * 13) % 70}%`,
            left: `${(i * 17 + 8) % 90}%`,
            transform: `rotate(${(i * 23) % 40 - 20}deg)`,
          }}
        >{e}</span>
      ))}
    </div>
  );
};


/* ──────────────────────────────────────────────────────────────
 * BOUTIQUE — full-bleed cinematic editorial (Elegante)
 * Tall image · serif headline · vendor primary as fine accent line
 * ────────────────────────────────────────────────────────────── */
const FullBanner = (props: AppHeroBannerProps) => {
  const { greeting, desc } = useTexts(props);
  const { store, primaryColor, theme } = props;
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden"
      aria-label={`Banner ${store.store_name}`}
    >
      <div
        className={`relative ${theme.bannerHeight} w-full sm:h-72 md:h-80`}
        style={{
          backgroundColor: "hsl(24 14% 12%)",
          backgroundImage: store.banner_url ? `url(${store.banner_url})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Editorial double-overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/55" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />

        {/* Editorial frame marks */}
        <div className="absolute left-5 top-5 h-6 w-6 border-l border-t border-white/40" />
        <div className="absolute right-5 top-5 h-6 w-6 border-r border-t border-white/40" />

        <div className="absolute inset-x-0 bottom-0 container px-4 pb-8 sm:pb-10">
          <div className="flex items-center gap-3">
            <span className="h-px w-10" style={{ backgroundColor: primaryColor }} />
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/85">{greeting}</p>
          </div>
          <h2 className="editorial-serif mt-2 max-w-2xl text-3xl leading-tight text-white sm:text-5xl">
            {store.store_name}
          </h2>
          {desc && (
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75 line-clamp-2 sm:text-base">
              {desc}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
};

/* ──────────────────────────────────────────────────────────────
 * STUDIO — asymmetric split (Moderna)
 * Two-column: vendor color block + image with hairline divider
 * ────────────────────────────────────────────────────────────── */
const SplitBanner = (props: AppHeroBannerProps) => {
  const { greeting, desc } = useTexts(props);
  const { store, primaryColor, theme } = props;
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container px-4 pt-5"
    >
      <div
        className={`relative grid ${theme.bannerHeight} grid-cols-5 overflow-hidden border border-border bg-background sm:h-40`}
        style={{ borderRadius: 2 }}
      >
        {/* Text block — 3 cols */}
        <div className="col-span-3 flex flex-col justify-center gap-2 border-r border-border px-5 sm:px-7">
          <div className="flex items-center gap-2.5">
            <span className="h-px w-7" style={{ backgroundColor: primaryColor }} />
            <span className="editorial-eyebrow" style={{ color: primaryColor }}>{greeting}</span>
          </div>
          <h2 className="editorial-serif text-xl leading-tight text-foreground sm:text-2xl">
            {store.store_name}
          </h2>
          {desc && (
            <p className="line-clamp-2 max-w-md text-xs text-muted-foreground sm:text-sm">
              {desc}
            </p>
          )}
        </div>

        {/* Image / color block — 2 cols */}
        <div className="relative col-span-2 overflow-hidden">
          {store.banner_url ? (
            <img
              src={store.banner_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}88)`,
              }}
            />
          )}
        </div>
      </div>
    </motion.section>
  );
};

/* ──────────────────────────────────────────────────────────────
 * MINIMAL — quiet tape strip (rare, used by minimal style)
 * ────────────────────────────────────────────────────────────── */
const MinimalBanner = (props: AppHeroBannerProps) => {
  const { greeting, desc } = useTexts(props);
  const { primaryColor, store } = props;
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container px-4 pt-5"
    >
      <div className="flex items-center gap-4 border-y border-border py-4">
        <span className="h-px flex-1" style={{ backgroundColor: primaryColor }} />
        <div className="text-center">
          <span className="editorial-eyebrow" style={{ color: primaryColor }}>{greeting}</span>
          <p className="editorial-serif mt-0.5 text-lg text-foreground">{store.store_name}</p>
          {desc && (
            <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-muted-foreground">{desc}</p>
          )}
        </div>
        <span className="h-px flex-1" style={{ backgroundColor: primaryColor }} />
      </div>
    </motion.section>
  );
};

/* ──────────────────────────────────────────────────────────────
 * DIARIO — compact editorial tape (App)
 * Hairline frame · vendor color rule · serif store name
 * ────────────────────────────────────────────────────────────── */
const CompactBanner = (props: AppHeroBannerProps) => {
  const { greeting, desc } = useTexts(props);
  const { store, primaryColor } = props;
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container px-4 pt-5"
    >
      <div
        className="relative flex items-stretch overflow-hidden border border-border bg-card"
        style={{ borderRadius: 2 }}
      >
        {/* Vendor color accent rule */}
        <span className="w-1 shrink-0" style={{ backgroundColor: primaryColor }} />

        {/* Text */}
        <div className="flex-1 px-4 py-4 sm:px-5 sm:py-5">
          <span className="editorial-eyebrow" style={{ color: primaryColor }}>{greeting}</span>
          <h2 className="editorial-serif mt-0.5 text-xl leading-tight text-foreground sm:text-2xl">
            {store.store_name}
          </h2>
          {desc && (
            <p className="mt-1 line-clamp-2 max-w-xl text-xs text-muted-foreground sm:text-sm">
              {desc}
            </p>
          )}
        </div>

        {/* Banner thumbnail (if present) */}
        {store.banner_url && (
          <div className="relative hidden w-40 shrink-0 overflow-hidden border-l border-border sm:block">
            <img src={store.banner_url} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          </div>
        )}
      </div>
    </motion.section>
  );
};

/* ──────────────────────────────────────────────────────────────
 * HERO (default fallback) — editorial hero block
 * ────────────────────────────────────────────────────────────── */
const HeroBanner = (props: AppHeroBannerProps) => {
  const { greeting, desc } = useTexts(props);
  const { store, primaryColor, theme } = props;
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container px-4 pt-5"
    >
      <div
        className={`relative overflow-hidden border border-border ${theme.bannerRounded}`}
        style={{
          backgroundColor: "hsl(36 18% 92%)",
          backgroundImage: store.banner_url ? `url(${store.banner_url})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {store.banner_url && (
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
        )}
        <div className="relative px-5 py-7 sm:px-8 sm:py-10">
          <div className="flex items-center gap-2.5">
            <span className="h-px w-7" style={{ backgroundColor: primaryColor }} />
            <span className="editorial-eyebrow" style={{ color: primaryColor }}>{greeting}</span>
          </div>
          <h2 className="editorial-serif mt-2 max-w-xl text-3xl leading-tight text-foreground sm:text-4xl">
            {store.store_name}
          </h2>
          {desc && (
            <p className="mt-2 max-w-lg text-sm text-muted-foreground line-clamp-2 sm:text-base">
              {desc}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
};

/* ──────────────────────────────────────────────────────────────
 * FRESH — grocery-app promo card (Elegante)
 * Cream/accent tinted background · discount pill · CTA · subject image right
 * ────────────────────────────────────────────────────────────── */
const FreshBanner = (props: AppHeroBannerProps) => {
  const { greeting, desc } = useTexts(props);
  const { store, primaryColor, theme } = props;
  const highlight = theme.bannerHighlight || "Oferta";
  const cta = theme.bannerCta || "Comprar ahora";

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="container px-4 pt-4"
      aria-label={`Banner ${store.store_name}`}
    >
      {/* Headline above card */}
      <h2 className="px-1 pb-3 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
        {greeting}{" "}
        <span style={{ color: primaryColor }}>{store.store_name}.</span>{" "}
        <span className="text-foreground/70">Sin complicaciones.</span>
      </h2>

      <div
        className="relative flex items-stretch overflow-hidden rounded-2xl"
        style={{
          backgroundColor: "#FFE8B3",
          backgroundImage: store.banner_url
            ? `linear-gradient(90deg, #FFE8B3 0%, #FFE8B3 45%, rgba(255,232,179,0.3) 100%), url(${store.banner_url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "right center",
          minHeight: "150px",
        }}
      >
        <div className="relative z-10 flex flex-1 flex-col justify-center gap-2.5 p-5 sm:p-6">
          <span
            className="inline-flex w-fit items-center rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm"
            style={{ color: primaryColor }}
          >
            {highlight}
          </span>
          <p className="max-w-[16ch] text-lg font-bold leading-tight text-foreground sm:text-xl">
            {desc || "Compra fresco. Vive mejor."}
          </p>
          <button
            type="button"
            className="mt-1 inline-flex w-fit items-center rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
            style={{ backgroundColor: "#FD730D" }}
          >
            {cta}
          </button>
        </div>
      </div>
    </motion.section>
  );
};

const AppHeroBanner = (props: AppHeroBannerProps) => {
  switch (props.theme.bannerStyle) {
    case "fresh":   return <FreshBanner {...props} />;
    case "full":    return <FullBanner {...props} />;
    case "split":   return <SplitBanner {...props} />;
    case "minimal": return <MinimalBanner {...props} />;
    case "compact": return <CompactBanner {...props} />;
    default:        return <HeroBanner {...props} />;
  }
};

export default AppHeroBanner;
