import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Store as StoreIcon, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  linkbox_config: LinkboxConfig | null;
}

interface LinkboxConfig {
  bio?: string;
  theme?: string;
  buttonStyle?: string;
  fontFamily?: string;
  showStoreLink?: boolean;
  showLogo?: boolean;
  customBgColor1?: string;
  customBgColor2?: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  sort_order: number;
}

const getBackground = (config: LinkboxConfig, primaryColor: string, secondaryColor: string) => {
  switch (config.theme) {
    case "dark":
      return "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";
    case "light":
      return "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)";
    case "neon":
      return "linear-gradient(135deg, #1a0033 0%, #2d0066 50%, #4a0080 100%)";
    case "nature":
      return "linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)";
    case "sunset":
      return "linear-gradient(135deg, #ff6b35 0%, #f7418c 50%, #fc5c7d 100%)";
    case "ocean":
      return "linear-gradient(135deg, #0077b6 0%, #023e8a 50%, #03045e 100%)";
    case "custom":
      return `linear-gradient(135deg, ${config.customBgColor1 || "#6366f1"} 0%, ${config.customBgColor2 || "#8b5cf6"} 100%)`;
    default:
      return `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor}22 50%, ${secondaryColor} 100%)`;
  }
};

const getTextColor = (theme?: string) => {
  if (theme === "light") return { primary: "#1a1a1a", secondary: "#4a4a4a", muted: "#6a6a6a" };
  return { primary: "#ffffff", secondary: "rgba(255,255,255,0.8)", muted: "rgba(255,255,255,0.5)" };
};

const getButtonClass = (style?: string) => {
  switch (style) {
    case "pill": return "rounded-full";
    case "square": return "rounded-none";
    case "outline": return "rounded-2xl bg-transparent border-2 border-white/40 hover:border-white/60";
    case "shadow": return "rounded-2xl shadow-lg shadow-black/20";
    case "glass": return "rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl";
    default: return "rounded-2xl";
  }
};

const getFontClass = (font?: string) => {
  switch (font) {
    case "serif": return "font-serif";
    case "mono": return "font-mono";
    case "cursive": return "italic";
    default: return "";
  }
};

const LinkboxPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreData | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: storeData } = await supabase
        .from("stores_public" as any)
        .select("id, store_name, store_slug, description, logo_url, primary_color, secondary_color, linkbox_config")
        .eq("store_slug", slug)
        .limit(1);

      if (!storeData?.length) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const s = storeData[0] as unknown as StoreData;
      setStore(s);

      const { data: linksData } = await supabase
        .from("links")
        .select("id, title, url, icon, sort_order")
        .eq("store_id", s.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      setLinks((linksData as LinkItem[]) ?? []);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <StoreIcon className="h-16 w-16 text-muted-foreground/30" />
        <h1 className="text-2xl font-bold text-foreground">Linkbox no encontrado</h1>
        <p className="text-muted-foreground">La página que buscas no existe.</p>
      </div>
    );
  }

  const config: LinkboxConfig = (store.linkbox_config && typeof store.linkbox_config === "object") ? store.linkbox_config : {};
  const primaryColor = store.primary_color || "#2a9d8f";
  const secondaryColor = store.secondary_color || "#264653";
  const background = getBackground(config, primaryColor, secondaryColor);
  const colors = getTextColor(config.theme);
  const buttonClass = getButtonClass(config.buttonStyle);
  const fontClass = getFontClass(config.fontFamily);
  const showLogo = config.showLogo !== false;
  const showStoreLink = config.showStoreLink !== false;
  const bio = config.bio || store.description;
  const isOutline = config.buttonStyle === "outline";

  return (
    <div
      className={`flex min-h-screen flex-col items-center px-4 py-12 ${fontClass}`}
      style={{ background }}
    >
      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        {showLogo && (
          <div
            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 shadow-xl"
            style={{ borderColor: primaryColor, backgroundColor: primaryColor }}
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.store_name} className="h-full w-full object-cover" />
            ) : (
              <StoreIcon className="h-10 w-10" style={{ color: colors.primary }} />
            )}
          </div>
        )}
        <div className="text-center">
          <h1 className="text-2xl font-bold drop-shadow-md" style={{ color: colors.primary }}>
            {store.store_name}
          </h1>
          {bio && (
            <p className="mt-2 max-w-sm text-sm" style={{ color: colors.secondary }}>
              {bio}
            </p>
          )}
        </div>
      </motion.div>

      {/* Links */}
      <div className="mt-8 w-full max-w-md space-y-3">
        {links.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
            style={{ color: colors.muted }}
          >
            No hay enlaces disponibles
          </motion.p>
        ) : (
          links.map((link, i) => (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-4 px-5 py-4 transition-colors ${buttonClass} ${
                isOutline ? "" : "border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20"
              }`}
              style={{ boxShadow: config.buttonStyle === "shadow" ? `0 8px 30px ${primaryColor}44` : `0 4px 20px ${primaryColor}33` }}
            >
              <span className="text-2xl">{link.icon || "🔗"}</span>
              <span className="flex-1 text-base font-semibold" style={{ color: colors.primary }}>{link.title}</span>
              <ExternalLink className="h-4 w-4" style={{ color: colors.muted }} />
            </motion.a>
          ))
        )}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 flex flex-col items-center gap-2"
      >
        {showStoreLink && (
          <a
            href={`/store/${store.store_slug}`}
            className="rounded-full px-6 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
            style={{ border: `1px solid ${primaryColor}`, color: colors.primary }}
          >
            🛒 Visitar tienda
          </a>
        )}
        <p className="mt-4 text-xs" style={{ color: colors.muted }}>
          Powered by <span className="font-semibold">Catalogo360</span>
        </p>
      </motion.div>
    </div>
  );
};

export default LinkboxPage;
