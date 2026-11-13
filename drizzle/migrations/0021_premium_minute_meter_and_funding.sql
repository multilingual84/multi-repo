ALTER TABLE public.premium_voice_accounts ADD COLUMN minute_billing_started_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.premium_voice_sessions ADD COLUMN minute_billing boolean NOT NULL DEFAULT false, ADD COLUMN metered_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.premium_voice_requests ADD COLUMN billing_basis text NOT NULL DEFAULT 'characters';
CREATE TABLE public.premium_voice_minute_usage(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wallet uuid NOT NULL REFERENCES public.premium_voice_accounts(wallet),session_id uuid NOT NULL REFERENCES public.premium_voice_sessions(id),milliseconds bigint NOT NULL,units bigint NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.premium_voice_minute_usage TO service_role;
ALTER TABLE public.premium_voice_minute_usage ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.premium_voice_minute_usage IS 'Server-observed enhanced session time. Units retain historical wallet value: 10000 units = one USD; 1600 units per minute. No content.';
CREATE TABLE public.premium_voice_funding(wallet uuid NOT NULL REFERENCES public.device_wallet_access(credential_handle),livemode boolean NOT NULL,customer_id text NOT NULL,setup_id text,enabled boolean NOT NULL DEFAULT false,amount_cents integer NOT NULL DEFAULT 500 CHECK(amount_cents IN (500,1000)),monthly_limit_cents integer NOT NULL DEFAULT 1000 CHECK(monthly_limit_cents BETWEEN 500 AND 100000),consent_at timestamptz,PRIMARY KEY(wallet,livemode));
GRANT ALL ON public.premium_voice_funding TO service_role;
ALTER TABLE public.premium_voice_funding ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.premium_voice_funding_attempts(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wallet uuid NOT NULL,livemode boolean NOT NULL,cents integer NOT NULL,state text NOT NULL DEFAULT 'pending',payment_intent text UNIQUE,created_at timestamptz NOT NULL DEFAULT now(),FOREIGN KEY(wallet,livemode) REFERENCES public.premium_voice_funding(wallet,livemode));
GRANT ALL ON public.premium_voice_funding_attempts TO service_role;
ALTER TABLE public.premium_voice_funding_attempts ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.tick_premium_voice_minutes(p_wallet uuid,p_session uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a premium_voice_accounts; s premium_voice_sessions; stop_at timestamptz; ms bigint; cost bigint; spent bigint; start_units bigint;
BEGIN
 SELECT * INTO a FROM premium_voice_accounts WHERE wallet=p_wallet FOR UPDATE;
 SELECT * INTO s FROM premium_voice_sessions WHERE id=p_session AND wallet=p_wallet FOR UPDATE;
 IF s.id IS NULL OR NOT s.minute_billing THEN RETURN false; END IF;
 stop_at=least(now(),coalesce(s.ended_at,now()),s.started_at+interval '90 minutes',s.last_activity_at+interval '2 minutes');
 ms=greatest(0,floor(extract(epoch FROM (stop_at-s.metered_at))*1000));
 SELECT coalesce(sum(units),0) INTO spent FROM premium_voice_minute_usage WHERE session_id=p_session;
 cost=greatest(0,ceil(extract(epoch FROM (stop_at-s.started_at))*1600/60)::bigint-spent);
 start_units=least(cost,a.available_characters);
 IF start_units>0 THEN
 INSERT INTO premium_voice_minute_usage(wallet,session_id,milliseconds,units) VALUES(p_wallet,p_session,ms,start_units);
 UPDATE premium_voice_accounts SET available_characters=available_characters-start_units,used_characters=used_characters+start_units WHERE wallet=p_wallet;
 END IF;
 UPDATE premium_voice_sessions SET metered_at=greatest(s.metered_at,stop_at),ended_at=CASE WHEN cost>=a.available_characters OR stop_at<now() THEN coalesce(ended_at,stop_at) ELSE ended_at END WHERE id=p_session;
 RETURN cost<a.available_characters AND s.ended_at IS NULL AND stop_at>=now() AND a.blocked_reason IS NULL;
END $$;
CREATE OR REPLACE FUNCTION public.start_premium_voice_minutes(p_wallet uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE old_id uuid; result uuid;
BEGIN
 PERFORM 1 FROM premium_voice_accounts WHERE wallet=p_wallet FOR UPDATE;
 FOR old_id IN SELECT id FROM premium_voice_sessions WHERE wallet=p_wallet AND ended_at IS NULL LOOP PERFORM tick_premium_voice_minutes(p_wallet,old_id); END LOOP;
 UPDATE premium_voice_sessions SET ended_at=now() WHERE wallet=p_wallet AND ended_at IS NULL;
 PERFORM 1 FROM premium_voice_accounts WHERE wallet=p_wallet AND available_characters>0 AND blocked_reason IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'Premium credit unavailable'; END IF;
 INSERT INTO premium_voice_sessions(wallet,minute_billing) VALUES(p_wallet,true) RETURNING id INTO result; RETURN result;
END $$;
CREATE OR REPLACE FUNCTION public.reserve_premium_voice_minutes(p_wallet uuid,p_session uuid,p_request uuid,p_characters integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE recent_chars bigint;
BEGIN
 IF NOT tick_premium_voice_minutes(p_wallet,p_session) THEN RAISE EXCEPTION 'Premium session ended or credit unavailable'; END IF;
 IF p_characters<1 OR p_characters>4000 THEN RAISE EXCEPTION 'Invalid character count'; END IF;
 IF EXISTS(SELECT 1 FROM premium_voice_requests WHERE session_id=p_session AND state IN ('reserved','uncertain')) THEN RAISE EXCEPTION 'Previous generation pending reconciliation'; END IF;
 SELECT coalesce(sum(characters),0) INTO recent_chars FROM premium_voice_requests WHERE wallet=p_wallet AND created_at>now()-interval '1 minute';
 IF recent_chars+p_characters>1200 THEN RAISE EXCEPTION 'Voice capacity reached; wait before requesting more speech'; END IF;
 INSERT INTO premium_voice_requests(id,wallet,session_id,characters,billing_basis) VALUES(p_request,p_wallet,p_session,p_characters,'minutes');
 UPDATE premium_voice_sessions SET last_activity_at=now() WHERE id=p_session;
END $$;
CREATE OR REPLACE FUNCTION public.settle_premium_voice_minutes(p_wallet uuid,p_request uuid,p_state text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF p_state NOT IN ('succeeded','failed','uncertain') THEN RAISE EXCEPTION 'Invalid settlement'; END IF;
 UPDATE premium_voice_requests SET state=p_state,settled_at=now() WHERE id=p_request AND wallet=p_wallet AND billing_basis='minutes' AND state='reserved';
END $$;
CREATE OR REPLACE FUNCTION public.claim_voice_funding(p_wallet uuid,p_live boolean) RETURNS SETOF premium_voice_funding_attempts LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE f premium_voice_funding; spent bigint; attempt premium_voice_funding_attempts;
BEGIN
 SELECT * INTO f FROM premium_voice_funding WHERE wallet=p_wallet AND livemode=p_live FOR UPDATE;
 IF f.wallet IS NULL OR NOT f.enabled OR f.consent_at IS NULL THEN RETURN; END IF;
 IF EXISTS(SELECT 1 FROM premium_voice_funding_attempts WHERE wallet=p_wallet AND livemode=p_live AND state='pending') THEN RETURN; END IF;
 IF EXISTS(SELECT 1 FROM premium_voice_funding_attempts WHERE wallet=p_wallet AND livemode=p_live AND created_at>now()-interval '1 hour' AND state='failed') THEN RETURN; END IF;
 SELECT coalesce(sum(cents),0) INTO spent FROM premium_voice_funding_attempts WHERE wallet=p_wallet AND livemode=p_live AND created_at>=date_trunc('month',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AND state IN ('pending','succeeded');
 IF spent+f.amount_cents>f.monthly_limit_cents THEN RETURN; END IF;
 INSERT INTO premium_voice_funding_attempts(wallet,livemode,cents) VALUES(p_wallet,p_live,f.amount_cents) RETURNING * INTO attempt; RETURN NEXT attempt;
END $$;
REVOKE ALL ON FUNCTION public.tick_premium_voice_minutes(uuid,uuid),public.start_premium_voice_minutes(uuid),public.reserve_premium_voice_minutes(uuid,uuid,uuid,integer),public.settle_premium_voice_minutes(uuid,uuid,text),public.claim_voice_funding(uuid,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.tick_premium_voice_minutes(uuid,uuid),public.start_premium_voice_minutes(uuid),public.reserve_premium_voice_minutes(uuid,uuid,uuid,integer),public.settle_premium_voice_minutes(uuid,uuid,text),public.claim_voice_funding(uuid,boolean) TO service_role;