
-- Referral configuration per store
CREATE TABLE public.referral_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  commission_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  commission_value NUMERIC NOT NULL DEFAULT 5,
  referral_discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  referral_discount_value NUMERIC NOT NULL DEFAULT 10,
  max_commission_orders INTEGER NOT NULL DEFAULT 3, -- first N purchases
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id)
);

-- Referral tracking
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  referrer_code TEXT NOT NULL,
  referrer_name TEXT NOT NULL DEFAULT '',
  referrer_email TEXT NOT NULL DEFAULT '',
  referrer_phone TEXT DEFAULT '',
  referred_email TEXT DEFAULT '',
  referred_order_id UUID REFERENCES public.orders(id),
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'paid'
  order_count INTEGER NOT NULL DEFAULT 0, -- tracks how many orders from this referred customer
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Referrer profiles (people who refer others)
CREATE TABLE public.referrers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  referral_code TEXT NOT NULL,
  total_earned NUMERIC NOT NULL DEFAULT 0,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, referral_code),
  UNIQUE(store_id, email)
);

-- Enable RLS
ALTER TABLE public.referral_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrers ENABLE ROW LEVEL SECURITY;

-- RLS for referral_config
CREATE POLICY "Anyone can view referral config" ON public.referral_config FOR SELECT USING (true);
CREATE POLICY "Store owner can insert referral config" ON public.referral_config FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = referral_config.store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Store owner can update referral config" ON public.referral_config FOR UPDATE USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = referral_config.store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Store owner can delete referral config" ON public.referral_config FOR DELETE USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = referral_config.store_id AND stores.user_id = auth.uid()));

-- RLS for referrals
CREATE POLICY "Anyone can insert referrals" ON public.referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "Store owner can view referrals" ON public.referrals FOR SELECT USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = referrals.store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Store owner can update referrals" ON public.referrals FOR UPDATE USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = referrals.store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Store owner can delete referrals" ON public.referrals FOR DELETE USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = referrals.store_id AND stores.user_id = auth.uid()));

-- RLS for referrers
CREATE POLICY "Anyone can view referrers" ON public.referrers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert referrers" ON public.referrers FOR INSERT WITH CHECK (true);
CREATE POLICY "Store owner can update referrers" ON public.referrers FOR UPDATE USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = referrers.store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Store owner can delete referrers" ON public.referrers FOR DELETE USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = referrers.store_id AND stores.user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_referrers_code ON public.referrers(store_id, referral_code);
CREATE INDEX idx_referrals_store ON public.referrals(store_id);
CREATE INDEX idx_referrals_referrer_code ON public.referrals(referrer_code);
