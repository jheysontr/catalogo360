import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Mail, MapPin, Phone, Facebook, Instagram, ExternalLink } from "lucide-react";
import type { StoreData } from "./types";

interface StoreInfoDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  store: StoreData;
  socialMedia: Record<string, string>;
}

const StoreInfoDialog = ({ open, onOpenChange, store, socialMedia }: StoreInfoDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{store.store_name}</DialogTitle>
        <DialogDescription>Información de contacto</DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-2">
        {store.email && (
          <a href={`mailto:${store.email}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
            <Mail className="h-4 w-4 text-muted-foreground" /> {store.email}
          </a>
        )}
        {store.address && (
          <div className="flex items-center gap-3 text-sm text-foreground">
            <MapPin className="h-4 w-4 text-muted-foreground" /> {store.address}
          </div>
        )}
        {socialMedia?.whatsapp && (
          <a
            href={`https://api.whatsapp.com/send?phone=${socialMedia.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4 text-muted-foreground" /> {socialMedia.whatsapp}
          </a>
        )}
        {socialMedia?.facebook && (
          <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
            <Facebook className="h-4 w-4 text-muted-foreground" /> Facebook <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {socialMedia?.instagram && (
          <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
            <Instagram className="h-4 w-4 text-muted-foreground" /> Instagram <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </DialogContent>
  </Dialog>
);

export default StoreInfoDialog;
