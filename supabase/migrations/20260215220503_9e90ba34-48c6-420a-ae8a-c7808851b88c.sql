
-- Add linkbox_config column to stores for Linkbox customization (theme, bio, button style, etc.)
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS linkbox_config jsonb DEFAULT '{}';
