CREATE TABLE public.premium_voice_accounts (wallet uuid PRIMARY KEY, available_characters bigint NOT NULL DEFAULT 0 CHECK(available_characters>=0), purchased_characters bigint NOT NULL DEFAULT 0, used_characters bigint NOT NULL DEFAULT 0, blocked_reason text, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.premium_voice_accounts TO service_role;
ALTER TABLE public.premium_voice_accounts ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.premium_voice_credits (checkout_id text PRIMARY KEY, wallet uuid NOT NULL REFERENCES public.premium_voice_accounts(wallet), cents integer NOT NULL CHECK(cents IN (100,500,1000)), characters bigint NOT NULL CHECK(characters=cents*100), created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.premium_voice_credits TO service_role;
ALTER TABLE public.premium_voice_credits ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.premium_voice_sessions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), wallet uuid NOT NULL REFERENCES public.premium_voice_accounts(wallet), started_at timestamptz NOT NULL DEFAULT now(), last_activity_at timestamptz NOT NULL DEFAULT now(), ended_at timestamptz);
GRANT ALL ON public.premium_voice_sessions TO service_role;
ALTER TABLE public.premium_voice_sessions ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX premium_voice_one_active_session ON public.premium_voice_sessions(wallet) WHERE ended_at IS NULL;
CREATE TABLE public.premium_voice_requests (id uuid PRIMARY KEY, wallet uuid NOT NULL REFERENCES public.premium_voice_accounts(wallet), session_id uuid NOT NULL REFERENCES public.premium_voice_sessions(id), characters integer NOT NULL CHECK(characters>0 AND characters<=4000), state text NOT NULL DEFAULT 'reserved' CHECK(state IN ('reserved','succeeded','failed','uncertain')), created_at timestamptz NOT NULL DEFAULT now(), settled_at timestamptz);
GRANT ALL ON public.premium_voice_requests TO service_role;
ALTER TABLE public.premium_voice_requests ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.premium_voice_requests IS 'Content-free usage ledger. No audio, spoken text, or voice identity. Uncertain reservations require reconciliation; never retry generation automatically.';
CREATE OR REPLACE FUNCTION public.credit_premium_voice(p_wallet uuid,p_checkout text,p_cents integer) RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n bigint; inserted_count integer;
BEGIN
 IF p_cents NOT IN (100,500,1000) THEN RAISE EXCEPTION 'Invalid budget'; END IF;
 INSERT INTO premium_voice_accounts(wallet) VALUES(p_wallet) ON CONFLICT DO NOTHING;
 PERFORM 1 FROM premium_voice_accounts WHERE wallet=p_wallet FOR UPDATE;
 IF EXISTS(SELECT 1 FROM premium_voice_credits WHERE checkout_id=p_checkout AND (wallet<>p_wallet OR cents<>p_cents)) THEN RAISE EXCEPTION 'Credit ownership mismatch'; END IF;
 INSERT INTO premium_voice_credits(checkout_id,wallet,cents,characters) VALUES(p_checkout,p_wallet,p_cents,p_cents*100) ON CONFLICT DO NOTHING;
 GET DIAGNOSTICS inserted_count=ROW_COUNT;
 IF inserted_count=1 THEN UPDATE premium_voice_accounts SET available_characters=available_characters+p_cents*100,purchased_characters=purchased_characters+p_cents*100 WHERE wallet=p_wallet; END IF;
 SELECT available_characters INTO n FROM premium_voice_accounts WHERE wallet=p_wallet; RETURN n;
END $$;
CREATE OR REPLACE FUNCTION public.start_premium_voice(p_wallet uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result uuid;
BEGIN
 PERFORM 1 FROM premium_voice_accounts WHERE wallet=p_wallet AND available_characters>0 AND blocked_reason IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Premium credit unavailable'; END IF;
 UPDATE premium_voice_sessions SET ended_at=now() WHERE wallet=p_wallet AND ended_at IS NULL;
 INSERT INTO premium_voice_sessions(wallet) VALUES(p_wallet) RETURNING id INTO result; RETURN result;
END $$;
CREATE OR REPLACE FUNCTION public.reserve_premium_voice(p_wallet uuid,p_session uuid,p_request uuid,p_characters integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s premium_voice_sessions; a premium_voice_accounts;
BEGIN
 SELECT * INTO a FROM premium_voice_accounts WHERE wallet=p_wallet FOR UPDATE;
 IF NOT FOUND OR a.blocked_reason IS NOT NULL THEN RAISE EXCEPTION 'Premium service paused'; END IF;
 SELECT * INTO s FROM premium_voice_sessions WHERE id=p_session AND wallet=p_wallet FOR UPDATE;
 IF NOT FOUND OR s.ended_at IS NOT NULL OR now()>=s.started_at+interval '90 minutes' OR now()>=s.last_activity_at+interval '2 minutes' THEN RAISE EXCEPTION 'Premium session ended'; END IF;
 IF p_characters<1 OR p_characters>4000 THEN RAISE EXCEPTION 'Invalid character count'; END IF;
 IF a.available_characters<p_characters THEN RAISE EXCEPTION 'Insufficient premium credit'; END IF;
 IF EXISTS(SELECT 1 FROM premium_voice_requests WHERE id=p_request) THEN RAISE EXCEPTION 'Request already reserved'; END IF;
 IF EXISTS(SELECT 1 FROM premium_voice_requests WHERE session_id=p_session AND state IN ('reserved','uncertain')) THEN RAISE EXCEPTION 'Previous generation pending reconciliation'; END IF;
 INSERT INTO premium_voice_requests(id,wallet,session_id,characters) VALUES(p_request,p_wallet,p_session,p_characters);
 UPDATE premium_voice_accounts SET available_characters=available_characters-p_characters WHERE wallet=p_wallet;
 UPDATE premium_voice_sessions SET last_activity_at=now() WHERE id=p_session;
END $$;
CREATE OR REPLACE FUNCTION public.settle_premium_voice(p_wallet uuid,p_request uuid,p_state text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r premium_voice_requests;
BEGIN
 IF p_state NOT IN ('succeeded','failed','uncertain') THEN RAISE EXCEPTION 'Invalid settlement'; END IF;
 PERFORM 1 FROM premium_voice_accounts WHERE wallet=p_wallet FOR UPDATE;
 SELECT * INTO r FROM premium_voice_requests WHERE id=p_request AND wallet=p_wallet FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Request unavailable'; END IF;
 IF r.state<>'reserved' THEN RETURN; END IF;
 UPDATE premium_voice_requests SET state=p_state,settled_at=now() WHERE id=p_request;
 IF p_state='failed' THEN UPDATE premium_voice_accounts SET available_characters=available_characters+r.characters WHERE wallet=p_wallet;
 ELSIF p_state='succeeded' THEN UPDATE premium_voice_accounts SET used_characters=used_characters+r.characters WHERE wallet=p_wallet; END IF;
END $$;
REVOKE ALL ON FUNCTION public.credit_premium_voice(uuid,text,integer),public.start_premium_voice(uuid),public.reserve_premium_voice(uuid,uuid,uuid,integer),public.settle_premium_voice(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.credit_premium_voice(uuid,text,integer),public.start_premium_voice(uuid),public.reserve_premium_voice(uuid,uuid,uuid,integer),public.settle_premium_voice(uuid,uuid,text) TO service_role;