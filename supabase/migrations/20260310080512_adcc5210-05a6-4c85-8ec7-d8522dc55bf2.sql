-- Fix storage policies: restrict uploads to store owners only

-- Drop existing overly permissive policies for products bucket
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;

-- Drop existing overly permissive policies for stores bucket
DROP POLICY IF EXISTS "Authenticated users can upload store assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own store assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own store assets" ON storage.objects;

-- Products bucket: ownership-based policies
CREATE POLICY "Store owners can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'products' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id::text = split_part(name, '/', 1)
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Store owners can update product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id::text = split_part(name, '/', 1)
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Store owners can delete product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id::text = split_part(name, '/', 1)
    AND stores.user_id = auth.uid()
  )
);

-- Stores bucket: ownership-based policies
CREATE POLICY "Store owners can upload store assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'stores' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id::text = split_part(name, '/', 1)
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Store owners can update store assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'stores' AND
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id::text = split_part(name, '/', 1)
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Store owners can delete store assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'stores' AND
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id::text = split_part(name, '/', 1)
    AND stores.user_id = auth.uid()
  )
);