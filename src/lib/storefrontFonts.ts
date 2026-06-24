export interface StorefrontFont {
  value: string;
  label: string;
  stack: string;
  sampleClass?: string;
}

export const STOREFRONT_FONTS: StorefrontFont[] = [
  { value: "default", label: "Por defecto (Sans moderno)", stack: "'Inter', system-ui, sans-serif" },
  { value: "space-grotesk", label: "Space Grotesk (Tech)", stack: "'Space Grotesk', system-ui, sans-serif" },
  { value: "dm-sans", label: "DM Sans (Limpia)", stack: "'DM Sans', system-ui, sans-serif" },
  { value: "manrope", label: "Manrope (Profesional)", stack: "'Manrope', system-ui, sans-serif" },
  { value: "poppins", label: "Poppins (Amigable)", stack: "'Poppins', system-ui, sans-serif" },
  { value: "montserrat", label: "Montserrat (Versátil)", stack: "'Montserrat', system-ui, sans-serif" },
  { value: "work-sans", label: "Work Sans (Editorial)", stack: "'Work Sans', system-ui, sans-serif" },
  { value: "playfair", label: "Playfair Display (Elegante)", stack: "'Playfair Display', Georgia, serif" },
  { value: "lora", label: "Lora (Serif suave)", stack: "'Lora', Georgia, serif" },
  { value: "instrument-serif", label: "Instrument Serif (Editorial serif)", stack: "'Instrument Serif', Georgia, serif" },
];

export const getFontStack = (value?: string | null): string => {
  if (!value) return STOREFRONT_FONTS[0].stack;
  const found = STOREFRONT_FONTS.find((f) => f.value === value);
  return found?.stack ?? STOREFRONT_FONTS[0].stack;
};
