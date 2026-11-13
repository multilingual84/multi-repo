CREATE TABLE public.fleet_accounts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_wallet uuid NOT NULL UNIQUE REFERENCES public.device_wallet_access(credential_handle), created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.fleet_accounts TO service_role;
ALTER TABLE public.fleet_accounts ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.fleet_members (fleet_id uuid NOT NULL REFERENCES public.fleet_accounts(id), wallet uuid NOT NULL REFERENCES public.device_wallet_access(credential_handle), nickname text NOT NULL, approved boolean NOT NULL DEFAULT false, daily_minutes integer NOT NULL DEFAULT 30 CHECK(daily_minutes BETWEEN 0 AND 1440), used_seconds integer NOT NULL DEFAULT 0, window_started timestamptz NOT NULL DEFAULT now(), last_tick timestamptz, PRIMARY KEY(fleet_id,wallet), UNIQUE(wallet));
GRANT ALL ON public.fleet_members TO service_role;
ALTER TABLE public.fleet_members ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.tick_fleet_usage(p_wallet uuid) RETURNS TABLE(used_seconds integer, remaining_seconds integer, resets_at timestamptz) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE m public.fleet_members%ROWTYPE;
BEGIN
SELECT * INTO m FROM public.fleet_members WHERE wallet=p_wallet AND approved FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Fleet access unavailable'; END IF;
IF m.window_started+interval '24 hours'<=now() THEN m.window_started:=now();m.used_seconds:=0;m.last_tick:=NULL;END IF;
IF m.last_tick IS NOT NULL THEN m.used_seconds:=LEAST(m.daily_minutes*60,m.used_seconds+GREATEST(0,LEAST(5,floor(extract(epoch FROM now()-m.last_tick))::integer)));END IF;
UPDATE public.fleet_members SET used_seconds=m.used_seconds,window_started=m.window_started,last_tick=now() WHERE wallet=p_wallet;
RETURN QUERY SELECT m.used_seconds,GREATEST(0,m.daily_minutes*60-m.used_seconds),m.window_started+interval '24 hours';
END $$;
REVOKE ALL ON FUNCTION public.tick_fleet_usage(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.tick_fleet_usage(uuid) TO service_role;