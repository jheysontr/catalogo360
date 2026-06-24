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
    <header className="relative">
      {/* Banner — editorial: shorter, restrained overlay */}
      <div
        className="relative h-40 w-full bg-cover bg-center sm:h-52 md:h-60"
        style={{
          backgroundColor: secondaryColor,
          backgroundImage: store.banner_url ? `url(${store.banner_url})` : undefined,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      {/* Identity block — sits on paper, not on the banner */}
      <div className="container px-4">
        <div className="relative -mt-10 flex flex-col items-center gap-4 pb-6 sm:flex-row sm:items-end sm:gap-6 sm:-mt-12">
          {/* Logo — square frame, hairline, neutral */}
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-border bg-background shadow-sm sm:h-24 sm:w-24"
            style={{ borderRadius: 6 }}
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.store_name} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: primaryColor }}>
                <StoreIcon className="h-8 w-8 text-white sm:h-9 sm:w-9" />
              </div>
            )}
          </div>

          {/* Name & Description */}
          <div className="flex flex-1 flex-col items-center gap-1.5 text-center sm:items-start sm:text-left">
            <span
              className="editorial-eyebrow inline-flex items-center gap-2"
              style={{ color: primaryColor }}
            >
              <span className="h-px w-6" style={{ backgroundColor: primaryColor }} />
              Tienda
            </span>
            <h1 className="text-3xl leading-tight text-foreground sm:text-4xl md:text-[2.65rem]">
              {store.store_name}
            </h1>
            {store.description && (
              <p className="max-w-xl text-sm text-muted-foreground line-clamp-2">
                {store.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-border bg-background text-foreground hover:bg-accent"
              onClick={onInfoClick}
            >
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Información</span>
              <span className="sm:hidden">Info</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-border bg-background text-foreground hover:bg-accent"
              onClick={onShareClick}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Compartir</span>
            </Button>
          </div>
        </div>
        <div className="h-px w-full bg-border" />
      </div>
    </header>
  );
};

export default StoreHeader;
