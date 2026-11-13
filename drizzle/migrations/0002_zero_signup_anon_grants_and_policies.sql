GRANT INSERT (credential_handle) ON public.users TO anon;
GRANT SELECT (id, trial_expires_at, is_subscription_active, free_lifetime_activated) ON public.users TO anon;
GRANT UPDATE (free_lifetime_activated) ON public.users TO anon;
GRANT ALL ON public.users TO service_role;

GRANT INSERT (user_id, room_token, active_channel_type) ON public.sessions TO anon;
GRANT SELECT (room_token, active_channel_type, created_at) ON public.sessions TO anon;
GRANT ALL ON public.sessions TO service_role;

GRANT SELECT (influencer_code) ON public.affiliates TO anon;
GRANT ALL ON public.affiliates TO service_role;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_insert_users ON public.users;
CREATE POLICY anon_insert_users ON public.users FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS anon_select_users ON public.users;
CREATE POLICY anon_select_users ON public.users FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS anon_update_free_lifetime ON public.users;
CREATE POLICY anon_update_free_lifetime ON public.users FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS anon_insert_sessions ON public.sessions;
CREATE POLICY anon_insert_sessions ON public.sessions FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS anon_select_sessions ON public.sessions;
CREATE POLICY anon_select_sessions ON public.sessions FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS anon_select_affiliates ON public.affiliates;
CREATE POLICY anon_select_affiliates ON public.affiliates FOR SELECT TO anon USING (true);