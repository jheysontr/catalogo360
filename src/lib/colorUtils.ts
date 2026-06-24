// Color helpers for storefront palette.

export const hexToHslTriple = (hex: string): string | null => {
  if (!hex) return null;
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  if (full.length !== 6) return null;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return `${h.toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
};

export const PALETTE_PRESETS: Array<{
  name: string;
  primary: string;
  secondary: string;
  background: string;
  accent: string;
}> = [
  { name: "Esmeralda",  primary: "#2a9d8f", secondary: "#264653", background: "#f8faf9", accent: "#e76f51" },
  { name: "Medianoche", primary: "#6366f1", secondary: "#1e1b4b", background: "#0f172a", accent: "#ec4899" },
  { name: "Crema",      primary: "#b45309", secondary: "#78350f", background: "#fefce8", accent: "#dc2626" },
  { name: "Rosa",       primary: "#db2777", secondary: "#831843", background: "#fdf2f8", accent: "#f59e0b" },
  { name: "Océano",     primary: "#0ea5e9", secondary: "#0c4a6e", background: "#f0f9ff", accent: "#f97316" },
  { name: "Bosque",     primary: "#16a34a", secondary: "#14532d", background: "#f7fee7", accent: "#ca8a04" },
];
