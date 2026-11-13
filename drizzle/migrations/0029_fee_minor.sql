ALTER TABLE public.referral_commissions ADD COLUMN IF NOT EXISTS fee_minor integer NOT NULL DEFAULT 0;
GRANT ALL ON public.referral_commissions TO service_role;