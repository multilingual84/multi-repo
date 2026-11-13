CREATE TABLE public.premium_voice_sandbox_credits (checkout_id text PRIMARY KEY, wallet uuid NOT NULL, cents integer NOT NULL CHECK(cents IN (100,500,1000)), characters bigint NOT NULL CHECK(characters=cents*100), created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.premium_voice_sandbox_credits TO service_role;
ALTER TABLE public.premium_voice_sandbox_credits ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.premium_voice_sandbox_credits IS 'Stripe sandbox payment verification only. These credits never authorize live voice synthesis or paid plan access.';
CREATE OR REPLACE FUNCTION public.credit_sandbox_voice(p_wallet uuid,p_checkout text,p_cents integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF p_checkout NOT LIKE 'cs_test_%' OR p_cents NOT IN (100,500,1000) THEN RAISE EXCEPTION 'Invalid sandbox credit'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext(p_checkout));
 IF EXISTS(SELECT 1 FROM premium_voice_sandbox_credits WHERE checkout_id=p_checkout AND (wallet<>p_wallet OR cents<>p_cents)) THEN RAISE EXCEPTION 'Credit ownership mismatch'; END IF;
 INSERT INTO premium_voice_sandbox_credits(checkout_id,wallet,cents,characters) VALUES(p_checkout,p_wallet,p_cents,p_cents*100) ON CONFLICT DO NOTHING;
END $$;
REVOKE ALL ON FUNCTION public.credit_sandbox_voice(uuid,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.credit_sandbox_voice(uuid,text,integer) TO service_role;