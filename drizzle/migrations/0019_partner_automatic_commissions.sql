CREATE TABLE public.referral_partners (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), wallet uuid NOT NULL REFERENCES public.device_wallet_access(credential_handle), code text NOT NULL UNIQUE,
 livemode boolean NOT NULL, stripe_account text UNIQUE, contact_email text NOT NULL, country text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(wallet,livemode)
);
GRANT ALL ON public.referral_partners TO service_role;
ALTER TABLE public.referral_partners ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.referral_commissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), partner_id uuid NOT NULL REFERENCES public.referral_partners(id), invoice_id text NOT NULL UNIQUE,
 charge_id text NOT NULL, currency text NOT NULL, tier_minor bigint NOT NULL CHECK(tier_minor > 0), share_minor bigint NOT NULL CHECK(share_minor >= 0),
 livemode boolean NOT NULL, eligible_at timestamptz NOT NULL DEFAULT (now()+interval '30 days'),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','setup_required','transferred','failed','reversed','review')),
 transfer_id text UNIQUE, transferred_minor bigint NOT NULL DEFAULT 0, reversed_minor bigint NOT NULL DEFAULT 0,
 lease_until timestamptz, next_attempt timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.referral_commissions TO service_role;
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;
CREATE INDEX referral_commission_retry ON public.referral_commissions(next_attempt,eligible_at);
CREATE FUNCTION public.claim_referral_commissions(p_live boolean) RETURNS SETOF public.referral_commissions LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 UPDATE public.referral_commissions SET lease_until=now()+interval '5 minutes'
 WHERE id IN (SELECT id FROM public.referral_commissions WHERE livemode=p_live AND eligible_at<=now() AND next_attempt<=now() AND (lease_until IS NULL OR lease_until<now()) AND status IN ('pending','setup_required','failed','transferred') ORDER BY next_attempt LIMIT 10 FOR UPDATE SKIP LOCKED) RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.claim_referral_commissions(boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_referral_commissions(boolean) TO service_role;