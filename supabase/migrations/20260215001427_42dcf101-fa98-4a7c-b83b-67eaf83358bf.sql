
-- Create storage bucket for store assets (logos, banners)
INSERT INTO storage.buckets (id, name, public) VALUES ('stores', 'stores', true);

-- Public read access
CREATE POLICY "Public read access for store assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'stores');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload store assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'stores' AND auth.role() = 'authenticated');

-- Authenticated users can update
CREATE POLICY "Authenticated users can update store assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'stores' AND auth.role() = 'authenticated');

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete store assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'stores' AND auth.role() = 'authenticated');
