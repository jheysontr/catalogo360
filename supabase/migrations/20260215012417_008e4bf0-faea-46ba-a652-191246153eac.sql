
-- Create links table for Linkbox feature
CREATE TABLE public.links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  icon text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Anyone can view active links (public linkbox page)
CREATE POLICY "Anyone can view active links"
  ON public.links FOR SELECT
  USING (true);

-- Store owner can insert links
CREATE POLICY "Store owner can insert links"
  ON public.links FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM stores WHERE stores.id = links.store_id AND stores.user_id = auth.uid()
  ));

-- Store owner can update links
CREATE POLICY "Store owner can update links"
  ON public.links FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM stores WHERE stores.id = links.store_id AND stores.user_id = auth.uid()
  ));

-- Store owner can delete links
CREATE POLICY "Store owner can delete links"
  ON public.links FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM stores WHERE stores.id = links.store_id AND stores.user_id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
