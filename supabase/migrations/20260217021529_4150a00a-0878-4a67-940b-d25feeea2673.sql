
-- Add enabled_modules column to pricing_plans for feature toggles per plan
ALTER TABLE public.pricing_plans 
ADD COLUMN enabled_modules jsonb NOT NULL DEFAULT '{"referrals": false, "linkbox": false}'::jsonb;
