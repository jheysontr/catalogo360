import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/CartContext";
import { getFinalPrice, generateWhatsAppUrl } from "@/utils/whatsapp";
import { supabase } from "@/integrations/supabase/client";

interface CartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  storePhone: string;
  primaryColor: string;
}

const CartModal = ({ open, onOpenChange, storeId, storePhone, primaryColor }: CartModalProps) => {
  const { toast } = useToast();
  const { items, cartTotal, clearCart } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || name.trim().length < 3) {
      toast({ title: "Error", description: "Ingresa tu nombre completo (min 3 caracteres)", variant: "destructive" });
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Error", description: "Ingresa un email válido", variant: "destructive" });
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      toast({ title: "Error", description: "Ingresa un teléfono válido", variant: "destructive" });
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);

    const orderItems = items.map((i) => ({
      product_id: i.product.id,
      name: i.product.name,
      price: getFinalPrice(i.product),
      quantity: i.quantity,
    }));

    await supabase.from("orders").insert({
      store_id: storeId,
      customer_name: name.trim(),
      customer_email: email.trim(),
      customer_phone: phone.trim(),
      items: orderItems as any,
      total_price: cartTotal,
      status: "pending",
    });

    const waUrl = generateWhatsAppUrl(
      storePhone,
      items,
      { name: name.trim(), email: email.trim(), phone: phone.trim(), address: address.trim() || undefined, note: note.trim() || undefined },
      cartTotal
    );

    setSubmitting(false);
    onOpenChange(false);
    clearCart();
    setName(""); setEmail(""); setPhone(""); setAddress(""); setNote("");

    toast({ title: "¡Pedido enviado!" });
    window.open(waUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Completar pedido</DialogTitle>
          <DialogDescription>Ingresa tus datos para enviar el pedido por WhatsApp</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="cust-name">Nombre completo *</Label>
            <Input id="cust-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre completo" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="cust-email">Email *</Label>
            <Input id="cust-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="cust-phone">Teléfono *</Label>
            <Input id="cust-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+591 12345678" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="cust-address">Dirección (opcional)</Label>
            <Input id="cust-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Tu dirección de entrega" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="cust-note">Nota de pedido (opcional)</Label>
            <Textarea id="cust-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Instrucciones especiales..." className="mt-1.5" rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-2 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar y enviar a WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
