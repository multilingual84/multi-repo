ALTER TABLE public.device_wallet_usage ADD COLUMN IF NOT EXISTS share_bonus_expires_at timestamptz;
CREATE OR REPLACE FUNCTION public.claim_qr_daily_bonus(p_handle uuid) RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u public.device_wallet_usage;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.device_wallet_access WHERE credential_handle=p_handle) THEN RAISE EXCEPTION 'Wallet unavailable'; END IF;
 INSERT INTO public.device_wallet_usage(credential_handle) VALUES(p_handle) ON CONFLICT DO NOTHING;
 SELECT * INTO u FROM public.device_wallet_usage WHERE credential_handle=p_handle FOR UPDATE;
 IF u.window_started+interval '24 hours'<=now() THEN
  u.window_started:=now(); u.used_seconds:=0; u.last_tick:=NULL;
 END IF;
 UPDATE public.device_wallet_usage SET window_started=u.window_started,used_seconds=u.used_seconds,last_tick=u.last_tick,share_bonus_expires_at=u.window_started+interval '24 hours' WHERE credential_handle=p_handle;
 RETURN u.window_started+interval '24 hours';
END $$;
REVOKE ALL ON FUNCTION public.claim_qr_daily_bonus(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_qr_daily_bonus(uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.tick_device_wallet_usage(p_handle uuid) RETURNS TABLE(used_seconds integer,resets_at timestamptz) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u public.device_wallet_usage; cap integer;
BEGIN
 INSERT INTO public.device_wallet_usage(credential_handle) VALUES(p_handle) ON CONFLICT DO NOTHING;
 SELECT * INTO u FROM public.device_wallet_usage WHERE credential_handle=p_handle FOR UPDATE;
 IF u.window_started+interval '24 hours'<=now() THEN
  u.window_started:=now();u.used_seconds:=0;u.last_tick:=NULL;u.share_bonus_expires_at:=NULL;
 END IF;
 cap:=CASE WHEN u.share_bonus_expires_at>now() THEN 3600 ELSE 1800 END;
 IF u.last_tick IS NOT NULL THEN u.used_seconds:=LEAST(cap,u.used_seconds+GREATEST(0,LEAST(5,floor(extract(epoch FROM now()-u.last_tick))::integer))); END IF;
 UPDATE public.device_wallet_usage SET window_started=u.window_started,used_seconds=u.used_seconds,last_tick=now(),share_bonus_expires_at=u.share_bonus_expires_at WHERE credential_handle=p_handle;
 RETURN QUERY SELECT u.used_seconds,u.window_started+interval '24 hours';
END $$;
REVOKE ALL ON FUNCTION public.tick_device_wallet_usage(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.tick_device_wallet_usage(uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.start_premium_voice_minutes(p_wallet uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN RAISE EXCEPTION 'Enhanced voice retired'; END $$;
CREATE OR REPLACE FUNCTION public.start_premium_voice(p_wallet uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN RAISE EXCEPTION 'Enhanced voice retired'; END $$;
CREATE OR REPLACE FUNCTION public.tick_premium_voice_minutes(p_wallet uuid,p_session uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN RETURN false; END $$;
CREATE OR REPLACE FUNCTION public.reserve_premium_voice_minutes(p_wallet uuid,p_session uuid,p_request uuid,p_characters integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN RAISE EXCEPTION 'Enhanced voice retired'; END $$;
CREATE OR REPLACE FUNCTION public.reserve_premium_voice(p_wallet uuid,p_session uuid,p_request uuid,p_characters integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN RAISE EXCEPTION 'Enhanced voice retired'; END $$;
CREATE OR REPLACE FUNCTION public.claim_voice_funding(p_wallet uuid,p_live boolean) RETURNS SETOF public.premium_voice_funding_attempts LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN RETURN; END $$;
REVOKE ALL ON FUNCTION public.start_premium_voice_minutes(uuid),public.start_premium_voice(uuid),public.tick_premium_voice_minutes(uuid,uuid),public.reserve_premium_voice_minutes(uuid,uuid,uuid,integer),public.reserve_premium_voice(uuid,uuid,uuid,integer),public.claim_voice_funding(uuid,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.start_premium_voice_minutes(uuid),public.start_premium_voice(uuid),public.tick_premium_voice_minutes(uuid,uuid),public.reserve_premium_voice_minutes(uuid,uuid,uuid,integer),public.reserve_premium_voice(uuid,uuid,uuid,integer),public.claim_voice_funding(uuid,boolean) TO service_role;
COMMENT ON TABLE public.premium_voice_accounts IS 'DEPRECATED: enhanced synthesis retired; preserve historical balances for reconciliation only.';
COMMENT ON TABLE public.premium_voice_funding IS 'DEPRECATED: no new card setup or refill; preserve historical payment ownership.';
COMMENT ON TABLE public.premium_voice_minute_usage IS 'DEPRECATED: enhanced synthesis retired; historical ledger only, no new charges.';