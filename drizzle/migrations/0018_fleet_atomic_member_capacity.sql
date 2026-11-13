CREATE FUNCTION public.configure_fleet_member(p_owner uuid,p_member uuid,p_approved boolean,p_minutes integer,p_seats integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE f public.fleet_accounts%ROWTYPE; m public.fleet_members%ROWTYPE; n integer;
BEGIN
SELECT * INTO f FROM public.fleet_accounts WHERE owner_wallet=p_owner FOR UPDATE;
IF NOT FOUND OR p_seats<2 OR p_minutes<0 OR p_minutes>1440 THEN RAISE EXCEPTION 'Fleet unavailable'; END IF;
SELECT * INTO m FROM public.fleet_members WHERE fleet_id=f.id AND wallet=p_member FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Member unavailable'; END IF;
IF p_approved AND NOT m.approved THEN SELECT count(*) INTO n FROM public.fleet_members WHERE fleet_id=f.id AND approved;IF n>=p_seats-1 THEN RAISE EXCEPTION 'Seat capacity reached';END IF;END IF;
UPDATE public.fleet_members SET approved=p_approved,daily_minutes=p_minutes WHERE fleet_id=f.id AND wallet=p_member;
END $$;
REVOKE ALL ON FUNCTION public.configure_fleet_member(uuid,uuid,boolean,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.configure_fleet_member(uuid,uuid,boolean,integer,integer) TO service_role;