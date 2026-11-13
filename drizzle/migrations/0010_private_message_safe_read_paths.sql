GRANT SELECT(id,kind,created_at,recipient_id,expires_at) ON public.private_message_envelopes TO authenticated;
CREATE POLICY inbox_owner_metadata ON public.private_message_envelopes FOR SELECT TO authenticated USING(recipient_id=auth.uid());
CREATE FUNCTION public.lookup_private_mailbox(address uuid) RETURNS TABLE(mailbox_id uuid,nickname text,public_key text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT m.mailbox_id,m.nickname,m.public_key FROM public.private_mailboxes m WHERE m.mailbox_id=address AND auth.uid() IS NOT NULL $$;
REVOKE ALL ON FUNCTION public.lookup_private_mailbox(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.lookup_private_mailbox(uuid) TO authenticated;