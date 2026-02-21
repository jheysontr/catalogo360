-- Add variant_prices JSONB column to products
ALTER TABLE public.products ADD COLUMN variant_prices jsonb NOT NULL DEFAULT '{}'::jsonb;