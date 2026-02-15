
-- Add shipping configuration to stores
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS shipping_config jsonb DEFAULT '{}'::jsonb;

-- Create shipments table
CREATE TABLE public.shipments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  shipping_method text NOT NULL DEFAULT 'pickup' CHECK (shipping_method IN ('pickup', 'local', 'national')),
  tracking_number text DEFAULT '',
  cost numeric NOT NULL DEFAULT 0,
  address text DEFAULT '',
  city text DEFAULT '',
  postal_code text DEFAULT '',
  phone text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered')),
  estimated_delivery_date timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Store owner can view shipments
CREATE POLICY "Store owner can view shipments" ON public.shipments FOR SELECT
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = shipments.store_id AND stores.user_id = auth.uid()));

-- Anyone can insert shipments (created during checkout)
CREATE POLICY "Anyone can insert shipments" ON public.shipments FOR INSERT
  WITH CHECK (true);

-- Store owner can update shipments
CREATE POLICY "Store owner can update shipments" ON public.shipments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = shipments.store_id AND stores.user_id = auth.uid()));

-- Store owner can delete shipments
CREATE POLICY "Store owner can delete shipments" ON public.shipments FOR DELETE
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = shipments.store_id AND stores.user_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate tracking number
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := 'TRK-';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;
