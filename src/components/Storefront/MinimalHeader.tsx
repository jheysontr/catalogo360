import { Store as StoreIcon } from "lucide-react";

interface MinimalHeaderProps {
  storeName: string;
  description?: string | null;
  logoUrl?: string | null;
  primaryColor: string;
}

const MinimalHeader = ({ storeName, description, logoUrl, primaryColor }: MinimalHeaderProps) => (
  <div className="flex flex-col items-center gap-4 border-b px-4 py-16 sm:py-20">
    {logoUrl ? (
      <img src={logoUrl} alt={storeName} className="h-20 w-20 rounded-full object-cover shadow-md" />
    ) : (
      <div className="flex h-20 w-20 items-center justify-center rounded-full shadow-md" style={{ backgroundColor: primaryColor }}>
        <StoreIcon className="h-8 w-8 text-white" />
      </div>
    )}
    <h1 className="text-center font-display text-4xl font-light tracking-wide text-foreground sm:text-5xl">
      {storeName}
    </h1>
    {description && (
      <p className="max-w-md text-center text-sm text-muted-foreground">{description}</p>
    )}
    <div className="mt-2 h-px w-12" style={{ backgroundColor: primaryColor }} />
  </div>
);

export default MinimalHeader;
