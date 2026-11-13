CREATE TABLE public.device_wallet_access (
 credential_handle uuid PRIMARY KEY,
 pin_verifier text NOT NULL,
 failed_attempts integer NOT NULL DEFAULT 0,
 locked_until timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.device_wallet_access TO service_role;
ALTER TABLE public.device_wallet_access ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.device_wallet_usage (
 credential_handle uuid PRIMARY KEY REFERENCES public.device_wallet_access(credential_handle) ON DELETE CASCADE,
 window_started timestamptz NOT NULL DEFAULT now(),
 used_seconds integer NOT NULL DEFAULT 0,
 last_tick timestamptz
);
GRANT ALL ON public.device_wallet_usage TO service_role;
ALTER TABLE public.device_wallet_usage ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.verify_device_wallet_pin(p_handle uuid, p_verifier text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE account public.device_wallet_access%ROWTYPE;
BEGIN
 SELECT * INTO account FROM public.device_wallet_access WHERE credential_handle=p_handle FOR UPDATE;
 IF NOT FOUND OR account.locked_until > now() THEN RETURN false; END IF;
 IF account.pin_verifier <> p_verifier THEN
  UPDATE public.device_wallet_access SET failed_attempts=CASE WHEN failed_attempts >= 4 THEN 0 ELSE failed_attempts+1 END,
   locked_until=CASE WHEN failed_attempts >= 4 THEN now()+interval '15 minutes' ELSE locked_until END WHERE credential_handle=p_handle;
  RETURN false;
 END IF;
 UPDATE public.device_wallet_access SET failed_attempts=0,locked_until=NULL WHERE credential_handle=p_handle;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.verify_device_wallet_pin(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.verify_device_wallet_pin(uuid,text) TO service_role;
CREATE OR REPLACE FUNCTION public.tick_device_wallet_usage(p_handle uuid)
RETURNS TABLE(used_seconds integer, resets_at timestamptz) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE usage public.device_wallet_usage%ROWTYPE;
BEGIN
 INSERT INTO public.device_wallet_usage(credential_handle) VALUES(p_handle) ON CONFLICT DO NOTHING;
 SELECT * INTO usage FROM public.device_wallet_usage WHERE credential_handle=p_handle FOR UPDATE;
 IF usage.window_started + interval '24 hours' <= now() THEN
  usage.window_started:=now(); usage.used_seconds:=0; usage.last_tick:=NULL;
 END IF;
 IF usage.last_tick IS NOT NULL THEN
  usage.used_seconds:=LEAST(1800,usage.used_seconds+GREATEST(0,LEAST(5,floor(extract(epoch FROM now()-usage.last_tick))::integer)));
 END IF;
 UPDATE public.device_wallet_usage SET window_started=usage.window_started,used_seconds=usage.used_seconds,last_tick=now() WHERE credential_handle=p_handle;
 RETURN QUERY SELECT usage.used_seconds,usage.window_started+interval '24 hours';
END $$;
REVOKE ALL ON FUNCTION public.tick_device_wallet_usage(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.tick_device_wallet_usage(uuid) TO service_role;