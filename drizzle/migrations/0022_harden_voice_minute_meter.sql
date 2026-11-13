CREATE OR REPLACE FUNCTION public.tick_premium_voice_minutes(p_wallet uuid,p_session uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a premium_voice_accounts; s premium_voice_sessions; stop_at timestamptz; ms bigint; total_ms bigint; spent bigint; cost bigint; debit bigint; billed_ms bigint;
BEGIN
 SELECT * INTO a FROM premium_voice_accounts WHERE wallet=p_wallet FOR UPDATE;
 SELECT * INTO s FROM premium_voice_sessions WHERE id=p_session AND wallet=p_wallet FOR UPDATE;
 IF a.wallet IS NULL OR s.id IS NULL OR NOT s.minute_billing THEN RETURN false; END IF;
 stop_at=greatest(s.started_at,least(now(),coalesce(s.ended_at,now()),s.started_at+interval '90 minutes',s.last_activity_at+interval '2 minutes'));
 total_ms=greatest(0,floor(extract(epoch FROM (stop_at-s.started_at))*1000));
 SELECT coalesce(sum(units),0),coalesce(sum(milliseconds),0) INTO spent,billed_ms FROM premium_voice_minute_usage WHERE session_id=p_session;
 cost=greatest(0,ceil(total_ms::numeric*1600/60000)::bigint-spent);
 debit=least(cost,greatest(0,a.available_characters));
 IF debit<cost THEN total_ms=least(total_ms,floor((spent+debit)::numeric*60000/1600)::bigint); stop_at=s.started_at+total_ms*interval '1 millisecond'; END IF;
 ms=greatest(0,total_ms-billed_ms);
 IF debit>0 THEN
 INSERT INTO premium_voice_minute_usage(wallet,session_id,milliseconds,units) VALUES(p_wallet,p_session,ms,debit);
 UPDATE premium_voice_accounts SET available_characters=available_characters-debit,used_characters=used_characters+debit WHERE wallet=p_wallet;
 END IF;
 UPDATE premium_voice_sessions SET metered_at=greatest(s.metered_at,stop_at),ended_at=CASE WHEN debit>=a.available_characters OR stop_at<now() OR a.blocked_reason IS NOT NULL THEN coalesce(ended_at,stop_at) ELSE ended_at END WHERE id=p_session;
 RETURN debit<a.available_characters AND s.ended_at IS NULL AND stop_at>=now() AND a.blocked_reason IS NULL;
END $$;
CREATE OR REPLACE FUNCTION public.start_premium_voice_minutes(p_wallet uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE old_id uuid; result uuid;
BEGIN
 PERFORM 1 FROM premium_voice_accounts WHERE wallet=p_wallet FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Premium credit unavailable'; END IF;
 FOR old_id IN SELECT id FROM premium_voice_sessions WHERE wallet=p_wallet AND minute_billing AND ended_at IS NULL LOOP PERFORM tick_premium_voice_minutes(p_wallet,old_id); END LOOP;
 IF EXISTS(SELECT 1 FROM premium_voice_sessions WHERE wallet=p_wallet AND minute_billing AND ended_at IS NULL) THEN RAISE EXCEPTION 'Premium session already active'; END IF;
 PERFORM 1 FROM premium_voice_accounts WHERE wallet=p_wallet AND available_characters>0 AND blocked_reason IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'Premium credit unavailable'; END IF;
 INSERT INTO premium_voice_sessions(wallet,minute_billing) VALUES(p_wallet,true) RETURNING id INTO result; RETURN result;
END $$;
CREATE OR REPLACE FUNCTION public.settle_premium_voice_minutes(p_wallet uuid,p_request uuid,p_state text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r premium_voice_requests;
BEGIN
 IF p_state NOT IN ('succeeded','failed','uncertain') THEN RAISE EXCEPTION 'Invalid settlement'; END IF;
 SELECT * INTO r FROM premium_voice_requests WHERE id=p_request AND wallet=p_wallet AND billing_basis='minutes' FOR UPDATE;
 IF r.id IS NULL THEN RAISE EXCEPTION 'Request unavailable'; END IF;
 IF r.state<>'reserved' THEN RETURN; END IF;
 UPDATE premium_voice_requests SET state=p_state,settled_at=now() WHERE id=p_request;
 PERFORM tick_premium_voice_minutes(p_wallet,r.session_id);
 IF p_state IN ('failed','uncertain') THEN UPDATE premium_voice_sessions SET ended_at=coalesce(ended_at,now()) WHERE id=r.session_id AND wallet=p_wallet; END IF;
END $$;
REVOKE ALL ON FUNCTION public.tick_premium_voice_minutes(uuid,uuid),public.start_premium_voice_minutes(uuid),public.settle_premium_voice_minutes(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.tick_premium_voice_minutes(uuid,uuid),public.start_premium_voice_minutes(uuid),public.settle_premium_voice_minutes(uuid,uuid,text) TO service_role;