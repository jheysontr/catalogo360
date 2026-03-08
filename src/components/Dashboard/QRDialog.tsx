import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface QRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeName?: string;
  storeSlug?: string;
}

const QRDialog = ({ open, onOpenChange, storeName, storeSlug }: QRDialogProps) => {
  const storeUrl = `${window.location.origin}/store/${storeSlug}`;

  const handleDownload = () => {
    const svg = document.querySelector("#dashboard-qr-container svg") as SVGSVGElement;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      const a = document.createElement("a");
      a.download = `${storeSlug}-qr.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">{storeName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div id="dashboard-qr-container" className="rounded-xl border bg-white p-4">
            <QRCodeSVG value={storeUrl} size={200} level="H" />
          </div>
          <p className="text-xs text-muted-foreground text-center break-all">{storeUrl}</p>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Descargar PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRDialog;
