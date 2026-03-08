import { Button } from "@/components/ui/button";
import { Info, Share2, Store as StoreIcon } from "lucide-react";

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
    <div className="relative">
      <div
        className="h-44 w-full bg-cover bg-center sm:h-56 md:h-64"
        style={{
          backgroundColor: secondaryColor,
          backgroundImage: store.banner_url ? `url(${store.banner_url})` : undefined,
        }}
      />
      <div className="container relative -mt-12 flex flex-col items-center gap-3 px-4 sm:-mt-14 sm:flex-row sm:items-end sm:gap-5">
        <div
          className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-background shadow-lg sm:h-28 sm:w-28"
          style={{ backgroundColor: primaryColor }}
        >
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.store_name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <StoreIcon className="h-10 w-10 text-white" />
          )}
        </div>
        <div className="flex flex-1 flex-col items-center gap-1.5 pb-2 sm:items-start">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{store.store_name}</h1>
          {store.description && (
            <p className="max-w-lg text-center text-sm text-muted-foreground sm:text-left line-clamp-2">{store.description}</p>
          )}
        </div>
        <div className="flex gap-2 pb-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onInfoClick}>
            <Info className="h-4 w-4" /> <span className="hidden sm:inline">Información</span><span className="sm:hidden">Info</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onShareClick}>
            <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Compartir</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoreHeader;
