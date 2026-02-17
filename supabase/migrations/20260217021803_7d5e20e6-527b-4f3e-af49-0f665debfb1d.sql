
ALTER TABLE public.pricing_plans 
ALTER COLUMN enabled_modules SET DEFAULT '{"referrals": false, "linkbox": false, "coupons": false, "shipments": false, "analytics": false}'::jsonb;
