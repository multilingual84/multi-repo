CREATE TABLE public.stager_accounts (
  user_id uuid PRIMARY KEY,
  credits integer NOT NULL DEFAULT 0 CHECK (credits >= 0),
  free_trial_used boolean NOT NULL DEFAULT false,
  referral_code text NOT NULL UNIQUE,
  referred_by_code text,
  stripe_customer_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stager_accounts TO authenticated;
GRANT ALL ON public.stager_accounts TO service_role;
ALTER TABLE public.stager_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own staging account" ON public.stager_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.stager_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_ref text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  package_id text NOT NULL,
  pics integer NOT NULL,
  amount_cents integer NOT NULL,
  auto_pay boolean NOT NULL DEFAULT false,
  referral_code text,
  livemode boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stager_purchases TO authenticated;
GRANT ALL ON public.stager_purchases TO service_role;
ALTER TABLE public.stager_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own staging purchases" ON public.stager_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.stager_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_ref text NOT NULL UNIQUE,
  referrer_user_id uuid NOT NULL,
  base_cents integer NOT NULL,
  commission_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'held' CHECK (status IN ('held','payable','paid','void')),
  payable_after timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  paid_at timestamptz,
  livemode boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stager_commissions TO authenticated;
GRANT ALL ON public.stager_commissions TO service_role;
ALTER TABLE public.stager_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own referral earnings" ON public.stager_commissions FOR SELECT TO authenticated USING (auth.uid() = referrer_user_id);

-- Atomic, idempotent credit grant (one row per Stripe session/invoice).
CREATE OR REPLACE FUNCTION public.stager_grant_purchase(
  p_ref text, p_user uuid, p_package text, p_pics integer, p_amount integer,
  p_auto_pay boolean, p_referral text, p_livemode boolean
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_referrer uuid;
BEGIN
  INSERT INTO public.stager_purchases(purchase_ref,user_id,package_id,pics,amount_cents,auto_pay,referral_code,livemode)
  VALUES (p_ref,p_user,p_package,p_pics,p_amount,p_auto_pay,p_referral,p_livemode)
  ON CONFLICT (purchase_ref) DO NOTHING;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE public.stager_accounts SET credits = credits + p_pics WHERE user_id = p_user;
  IF p_referral IS NOT NULL THEN
    SELECT user_id INTO v_referrer FROM public.stager_accounts WHERE referral_code = p_referral;
    IF v_referrer IS NOT NULL AND v_referrer <> p_user THEN
      INSERT INTO public.stager_commissions(purchase_ref,referrer_user_id,base_cents,commission_cents,livemode)
      VALUES (p_ref,v_referrer,p_amount,round(p_amount * 0.5)::integer,p_livemode)
      ON CONFLICT (purchase_ref) DO NOTHING;
    END IF;
  END IF;
  RETURN true;
END $$;

-- Atomically spend one picture credit, or the single free trial.
CREATE OR REPLACE FUNCTION public.stager_spend(p_user uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.stager_accounts SET credits = credits - 1 WHERE user_id = p_user AND credits > 0;
  IF FOUND THEN RETURN 'paid'; END IF;
  UPDATE public.stager_accounts SET free_trial_used = true WHERE user_id = p_user AND free_trial_used = false;
  IF FOUND THEN RETURN 'trial'; END IF;
  RETURN 'none';
END $$;

CREATE OR REPLACE FUNCTION public.stager_refund(p_user uuid, p_kind text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_kind = 'paid' THEN UPDATE public.stager_accounts SET credits = credits + 1 WHERE user_id = p_user;
  ELSIF p_kind = 'trial' THEN UPDATE public.stager_accounts SET free_trial_used = false WHERE user_id = p_user; END IF;
END $$;

REVOKE ALL ON FUNCTION public.stager_grant_purchase(text,uuid,text,integer,integer,boolean,text,boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.stager_spend(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.stager_refund(uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.stager_grant_purchase(text,uuid,text,integer,integer,boolean,text,boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.stager_spend(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.stager_refund(uuid,text) TO service_role;