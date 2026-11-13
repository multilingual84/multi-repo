ALTER TABLE public.stager_accounts ADD COLUMN IF NOT EXISTS free_downloads_left integer NOT NULL DEFAULT 10 CHECK (free_downloads_left >= 0);
UPDATE public.stager_accounts SET free_downloads_left = 9 WHERE free_trial_used = true;
COMMENT ON COLUMN public.stager_accounts.free_trial_used IS 'DEPRECATED: replaced by free_downloads_left';

-- Spend one free download first (10 per new account), then a paid credit.
CREATE OR REPLACE FUNCTION public.stager_spend(p_user uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.stager_accounts SET free_downloads_left = free_downloads_left - 1, free_trial_used = true
   WHERE user_id = p_user AND free_downloads_left > 0;
  IF FOUND THEN RETURN 'trial'; END IF;
  UPDATE public.stager_accounts SET credits = credits - 1 WHERE user_id = p_user AND credits > 0;
  IF FOUND THEN RETURN 'paid'; END IF;
  RETURN 'none';
END $$;

CREATE OR REPLACE FUNCTION public.stager_refund(p_user uuid, p_kind text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_kind = 'paid' THEN UPDATE public.stager_accounts SET credits = credits + 1 WHERE user_id = p_user;
  ELSIF p_kind = 'trial' THEN UPDATE public.stager_accounts SET free_downloads_left = free_downloads_left + 1 WHERE user_id = p_user; END IF;
END $$;

REVOKE ALL ON FUNCTION public.stager_spend(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.stager_refund(uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.stager_spend(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.stager_refund(uuid,text) TO service_role;