import { Facebook, Instagram } from "lucide-react";
import type { StoreData } from "./types";

interface StoreFooterProps {
  store: StoreData;
  secondaryColor: string;
  socialMedia: Record<string, string>;
}

const StoreFooter = ({ store, secondaryColor, socialMedia }: StoreFooterProps) => {
  const hasSocial = socialMedia?.facebook || socialMedia?.instagram || socialMedia?.tiktok;

  return (
    <footer className="mt-12 border-t" style={{ backgroundColor: secondaryColor }}>
      <div className="container px-4 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white/90">{store.store_name}</h4>
            {store.description && <p className="max-w-xs text-sm text-white/60">{store.description}</p>}
            {store.email && <p className="text-sm text-white/60">{store.email}</p>}
            {store.address && <p className="text-sm text-white/60">{store.address}</p>}
          </div>
          {hasSocial && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/90">Redes Sociales</h4>
              <div className="flex gap-3">
                {socialMedia?.facebook && (
                  <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {socialMedia?.instagram && (
                  <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {socialMedia?.tiktok && (
                  <a href={socialMedia.tiktok} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-xs font-bold">
                    TikTok
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {store.store_name}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;
