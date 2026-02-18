
-- Platform-level referral configuration (single row)
CREATE TABLE public.platform_referral_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active boolean NOT NULL DEFAULT false,
  commission_type text NOT NULL DEFAULT 'percentage',
  commission_value numeric NOT NULL DEFAULT 10,
  min_plan_price numeric NOT NULL DEFAULT 0,
  welcome_message text DEFAULT 'Refiere amigos y gana comisiones por cada plan contratado.',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_referral_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view platform referral config" ON public.platform_referral_config FOR SELECT USING (true);
CREATE POLICY "Admins can insert platform referral config" ON public.platform_referral_config FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update platform referral config" ON public.platform_referral_config FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete platform referral config" ON public.platform_referral_config FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Platform referrers (can be linked to a user or manual)
CREATE TABLE public.platform_referrers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text DEFAULT '',
  referral_code text NOT NULL UNIQUE,
  total_earned numeric NOT NULL DEFAULT 0,
  total_referrals integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_referrers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active platform referrers" ON public.platform_referrers FOR SELECT USING (true);
CREATE POLICY "Admins can insert platform referrers" ON public.platform_referrers FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update platform referrers" ON public.platform_referrers FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete platform referrers" ON public.platform_referrers FOR DELETE USING (has_role(auth.uid(), 'admin'));
-- Users can also insert themselves as referrers
CREATE POLICY "Users can insert own platform referrer" ON public.platform_referrers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Platform referrals (tracks each conversion)
CREATE TABLE public.platform_referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES public.platform_referrers(id) ON DELETE CASCADE,
  referrer_code text NOT NULL,
  referred_user_id uuid,
  referred_email text NOT NULL DEFAULT '',
  referred_store_name text DEFAULT '',
  plan_name text DEFAULT '',
  plan_price numeric NOT NULL DEFAULT 0,
  commission_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all platform referrals" ON public.platform_referrals FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Referrers can view own platform referrals" ON public.platform_referrals FOR SELECT USING (
  EXISTS (SELECT 1 FROM platform_referrers WHERE platform_referrers.id = platform_referrals.referrer_id AND platform_referrers.user_id = auth.uid())
);
CREATE POLICY "Admins can insert platform referrals" ON public.platform_referrals FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert platform referrals" ON public.platform_referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update platform referrals" ON public.platform_referrals FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete platform referrals" ON public.platform_referrals FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Insert default config
INSERT INTO public.platform_referral_config (is_active, commission_type, commission_value)
VALUES (false, 'percentage', 10);
