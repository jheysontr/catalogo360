import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Calculator, X, RotateCcw } from "lucide-react";

const SalesCalculator = () => {
  const [open, setOpen] = useState(false);
  const [costPrice, setCostPrice] = useState("");
  const [profitMargin, setProfitMargin] = useState("30");
  const [shippingCost, setShippingCost] = useState("");
  const [packagingCost, setPackagingCost] = useState("");
  const [otherCosts, setOtherCosts] = useState("");
  const [quantity, setQuantity] = useState("1");

  const cost = parseFloat(costPrice) || 0;
  const margin = parseFloat(profitMargin) || 0;
  const shipping = parseFloat(shippingCost) || 0;
  const packaging = parseFloat(packagingCost) || 0;
  const other = parseFloat(otherCosts) || 0;
  const qty = parseInt(quantity) || 1;

  const totalCost = cost + shipping + packaging + other;
  const profitAmount = totalCost * (margin / 100);
  const salePrice = totalCost + profitAmount;
  const totalSale = salePrice * qty;
  const totalProfit = profitAmount * qty;

  const reset = () => {
    setCostPrice("");
    setProfitMargin("30");
    setShippingCost("");
    setPackagingCost("");
    setOtherCosts("");
    setQuantity("1");
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        title="Calculadora de costos"
      >
        <Calculator className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Calculator className="h-5 w-5 text-primary" />
              Calculadora de Costos
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Costo del producto (Bs)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Margen de ganancia (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="1000"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(e.target.value)}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Envío (Bs)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Empaque (Bs)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Otros (Bs)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={otherCosts}
                  onChange={(e) => setOtherCosts(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Cantidad</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
              />
            </div>

            {/* Results */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-3 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Costo total unitario</span>
                  <span className="font-semibold text-foreground">Bs{totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ganancia unitaria ({margin}%)</span>
                  <span className="font-semibold text-green-600">+Bs{profitAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-foreground">Precio de venta sugerido</span>
                    <span className="text-lg font-bold text-primary">Bs{salePrice.toFixed(2)}</span>
                  </div>
                </div>
                {qty > 1 && (
                  <div className="border-t pt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Venta total ({qty} uds.)</span>
                      <span className="font-semibold text-foreground">Bs{totalSale.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ganancia total</span>
                      <span className="font-semibold text-green-600">+Bs{totalProfit.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button variant="outline" onClick={reset} className="w-full gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Limpiar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SalesCalculator;
