DROP POLICY IF EXISTS anon_select_sessions ON public.sessions;
DROP POLICY IF EXISTS anon_insert_sessions ON public.sessions;
DROP POLICY IF EXISTS anon_select_users ON public.users;
DROP POLICY IF EXISTS anon_insert_users ON public.users;
DROP POLICY IF EXISTS anon_update_free_lifetime ON public.users;
DROP POLICY IF EXISTS anon_select_affiliates ON public.affiliates;
REVOKE ALL ON public.sessions, public.users, public.affiliates FROM anon;
GRANT ALL ON public.sessions, public.users, public.affiliates TO service_role;