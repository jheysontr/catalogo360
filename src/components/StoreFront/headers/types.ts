import type { TemplateTheme } from "@/components/StoreFront/AppTemplate/templateThemes";

export interface TemplateHeaderProps {
  store: {
    store_name: string;
    logo_url: string | null;
  };
  primaryColor: string;
  theme: TemplateTheme;
  search: string;
  onSearchChange: (v: string) => void;
  itemCount: number;
  wishlistCount: number;
  whatsapp?: string;
  onCartOpen: () => void;
  onWishlistOpen: () => void;
  onInfoClick: () => void;
}
