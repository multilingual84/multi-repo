CREATE OR REPLACE FUNCTION public.credit_voice_funding(p_attempt uuid,p_wallet uuid,p_payment text,p_cents integer,p_customer text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a premium_voice_funding_attempts; f premium_voice_funding;
BEGIN
 SELECT * INTO f FROM premium_voice_funding WHERE wallet=p_wallet AND livemode=true FOR UPDATE;
 SELECT * INTO a FROM premium_voice_funding_attempts WHERE id=p_attempt AND wallet=p_wallet AND livemode=true FOR UPDATE;
 IF a.id IS NULL OR f.customer_id IS DISTINCT FROM p_customer OR a.cents<>p_cents OR (a.payment_intent IS NOT NULL AND a.payment_intent<>p_payment) OR a.state NOT IN ('pending','succeeded') THEN RAISE EXCEPTION 'Funding ownership mismatch'; END IF;
 IF a.state='succeeded' THEN IF a.payment_intent=p_payment THEN RETURN; ELSE RAISE EXCEPTION 'Funding ownership mismatch'; END IF; END IF;
 PERFORM credit_premium_voice(p_wallet,p_payment,p_cents);
 UPDATE premium_voice_funding_attempts SET state='succeeded',payment_intent=p_payment WHERE id=p_attempt;
END $$;
REVOKE ALL ON FUNCTION public.credit_voice_funding(uuid,uuid,text,integer,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.credit_voice_funding(uuid,uuid,text,integer,text) TO service_role;