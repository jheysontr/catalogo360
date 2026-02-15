
-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);

-- Allow anyone to view product images
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Allow users to update their own product images
CREATE POLICY "Users can update own product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Allow users to delete their own product images
CREATE POLICY "Users can delete own product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND auth.role() = 'authenticated');
