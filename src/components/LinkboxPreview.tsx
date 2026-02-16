import { Store as StoreIcon, ExternalLink } from "lucide-react";

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
  is_active: boolean;
}

interface LinkboxPreviewProps {
  storeName: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  config: LinkboxConfig;
  links: LinkItem[];
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
    case "outline": return "rounded-2xl bg-transparent border-2 border-white/40";
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

const LinkboxPreview = ({ storeName, logoUrl, primaryColor = "#2a9d8f", secondaryColor = "#264653", config, links }: LinkboxPreviewProps) => {
  const background = getBackground(config, primaryColor, secondaryColor);
  const colors = getTextColor(config.theme);
  const buttonClass = getButtonClass(config.buttonStyle);
  const fontClass = getFontClass(config.fontFamily);
  const showLogo = config.showLogo !== false;
  const showStoreLink = config.showStoreLink !== false;
  const isOutline = config.buttonStyle === "outline";
  const activeLinks = links.filter((l) => l.is_active);

  return (
    <div className="relative mx-auto w-[280px]">
      {/* Phone frame */}
      <div className="rounded-[2.5rem] border-[6px] border-foreground/20 bg-foreground/10 p-1.5 shadow-2xl">
        <div
          className={`flex flex-col items-center overflow-hidden rounded-[2rem] px-3 py-6 ${fontClass}`}
          style={{ background, minHeight: 520 }}
        >
          {/* Profile */}
          <div className="flex flex-col items-center gap-2">
            {showLogo && (
              <div
                className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 shadow-lg"
                style={{ borderColor: primaryColor, backgroundColor: primaryColor }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt={storeName} className="h-full w-full object-cover" />
                ) : (
                  <StoreIcon className="h-6 w-6" style={{ color: colors.primary }} />
                )}
              </div>
            )}
            <h2 className="text-sm font-bold drop-shadow-md" style={{ color: colors.primary }}>
              {storeName}
            </h2>
            {config.bio && (
              <p className="max-w-[220px] text-center text-[10px] leading-tight" style={{ color: colors.secondary }}>
                {config.bio}
              </p>
            )}
          </div>

          {/* Links */}
          <div className="mt-4 w-full space-y-2">
            {activeLinks.length === 0 ? (
              <p className="text-center text-[10px]" style={{ color: colors.muted }}>
                No hay enlaces
              </p>
            ) : (
              activeLinks.slice(0, 6).map((link) => (
                <div
                  key={link.id}
                  className={`flex items-center gap-2 px-3 py-2 transition-colors ${buttonClass} ${
                    isOutline ? "" : "border border-white/20 bg-white/10 backdrop-blur-md"
                  }`}
                  style={{
                    boxShadow: config.buttonStyle === "shadow" ? `0 4px 15px ${primaryColor}44` : undefined,
                  }}
                >
                  <span className="text-sm">{link.icon || "🔗"}</span>
                  <span className="flex-1 truncate text-[11px] font-semibold" style={{ color: colors.primary }}>
                    {link.title}
                  </span>
                  <ExternalLink className="h-2.5 w-2.5" style={{ color: colors.muted }} />
                </div>
              ))
            )}
            {activeLinks.length > 6 && (
              <p className="text-center text-[9px]" style={{ color: colors.muted }}>
                +{activeLinks.length - 6} más
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto flex flex-col items-center gap-1.5 pt-4">
            {showStoreLink && (
              <div
                className="rounded-full px-4 py-1.5 text-[10px] font-medium"
                style={{ border: `1px solid ${primaryColor}`, color: colors.primary }}
              >
                🛒 Visitar tienda
              </div>
            )}
            <p className="text-[8px]" style={{ color: colors.muted }}>
              Powered by <span className="font-semibold">Catalogo360</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkboxPreview;
