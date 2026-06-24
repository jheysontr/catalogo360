import { Button } from "@/components/ui/button";
import { Info, Share2 } from "lucide-react";

interface StoreHeaderProps {
  store: {
    store_name: string;
    description: string | null;
    logo_url: string | null;
    banner_url: string | null;
  };
  primaryColor: string;
  secondaryColor: string;
  onInfoClick: () => void;
  onShareClick: () => void;
}

const StoreHeader = ({ store, primaryColor, secondaryColor, onInfoClick, onShareClick }: StoreHeaderProps) => {
  return (
    <header className="relative">
      <div
        className="relative h-48 w-full bg-cover bg-center sm:h-60 md:h-72"
        style={{
          backgroundColor: secondaryColor,
          backgroundImage: store.banner_url ? `url(${store.banner_url})` : undefined,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 container px-4 pb-5 sm:pb-6">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:gap-5">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-[3px] border-white/90 shadow-xl sm:h-24 sm:w-24"
              style={{ backgroundColor: primaryColor }}
            >
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.store_name} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <span className="text-3xl font-bold text-white sm:text-4xl">{(store.store_name || "T").trim().charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-1 flex-col items-center gap-1 sm:items-start">
              <h1 className="text-xl font-bold text-white drop-shadow-md sm:text-2xl md:text-3xl">{store.store_name}</h1>
              {store.description && (
                <p className="max-w-md text-center text-sm text-white/80 line-clamp-2 sm:text-left">{store.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 rounded-xl border border-white/20 bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 hover:text-white"
                onClick={onInfoClick}
              >
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Información</span>
                <span className="sm:hidden">Info</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 rounded-xl border border-white/20 bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 hover:text-white"
                onClick={onShareClick}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Compartir</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;
