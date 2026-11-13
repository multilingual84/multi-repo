CREATE TABLE public.private_mailboxes (
 user_id uuid PRIMARY KEY, mailbox_id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(), nickname text NOT NULL DEFAULT 'Guest', public_key text NOT NULL, trial_started_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(), CONSTRAINT nickname_length CHECK (char_length(nickname) BETWEEN 1 AND 40), CONSTRAINT key_length CHECK (char_length(public_key)=44)
);
GRANT SELECT, INSERT, UPDATE ON public.private_mailboxes TO authenticated;
GRANT ALL ON public.private_mailboxes TO service_role;
ALTER TABLE public.private_mailboxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY mailbox_owner_read ON public.private_mailboxes FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY mailbox_owner_insert ON public.private_mailboxes FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY mailbox_owner_nickname ON public.private_mailboxes FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
REVOKE UPDATE ON public.private_mailboxes FROM authenticated;
GRANT UPDATE(nickname) ON public.private_mailboxes TO authenticated;

CREATE TABLE public.private_message_envelopes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sender_id uuid NOT NULL, recipient_id uuid NOT NULL, ciphertext text NOT NULL, nonce text NOT NULL, sender_key text NOT NULL, kind text NOT NULL DEFAULT 'text', created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT (now()+interval '7 days'), CONSTRAINT envelope_size CHECK (char_length(ciphertext) BETWEEN 24 AND 2000000), CONSTRAINT envelope_kind CHECK (kind IN ('text','audio')), CONSTRAINT envelope_nonce CHECK (char_length(nonce)=32), CONSTRAINT envelope_key CHECK (char_length(sender_key)=44)
);
GRANT ALL ON public.private_message_envelopes TO service_role;
ALTER TABLE public.private_message_envelopes ENABLE ROW LEVEL SECURITY;
CREATE INDEX private_message_recipient ON public.private_message_envelopes(recipient_id,created_at);

CREATE TABLE public.private_message_blocks (
 user_id uuid NOT NULL, blocked_id uuid NOT NULL, PRIMARY KEY(user_id,blocked_id)
);
GRANT SELECT, INSERT, DELETE ON public.private_message_blocks TO authenticated;
GRANT ALL ON public.private_message_blocks TO service_role;
ALTER TABLE public.private_message_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY block_owner ON public.private_message_blocks TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.private_message_plans (
 user_id uuid PRIMARY KEY, stripe_subscription_id text UNIQUE, paid_until timestamptz, seat_limit integer NOT NULL DEFAULT 2
);
GRANT SELECT ON public.private_message_plans TO authenticated;
GRANT ALL ON public.private_message_plans TO service_role;
ALTER TABLE public.private_message_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY plan_owner_read ON public.private_message_plans FOR SELECT TO authenticated USING (user_id=auth.uid());

CREATE FUNCTION public.consume_private_message(message_id uuid) RETURNS TABLE(ciphertext text, nonce text, sender_key text, kind text) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 RETURN QUERY DELETE FROM public.private_message_envelopes e WHERE e.id=message_id AND e.recipient_id=auth.uid() AND e.expires_at>now() RETURNING e.ciphertext,e.nonce,e.sender_key,e.kind;
END; $$;
REVOKE ALL ON FUNCTION public.consume_private_message(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.consume_private_message(uuid) TO authenticated;

CREATE FUNCTION public.send_private_message(recipient_mailbox uuid, encrypted_text text, message_nonce text, ephemeral_key text, message_kind text DEFAULT 'text') RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE me uuid:=auth.uid(); recipient uuid; message_id uuid; start_time timestamptz;
BEGIN
 IF me IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 SELECT trial_started_at INTO start_time FROM public.private_mailboxes WHERE user_id=me;
 IF start_time IS NULL THEN RAISE EXCEPTION 'Mailbox required'; END IF;
 IF now()>=start_time+interval '7 days' AND NOT EXISTS(SELECT 1 FROM public.private_message_plans WHERE user_id=me AND paid_until>now()) THEN RAISE EXCEPTION 'Sending access expired'; END IF;
 SELECT user_id INTO recipient FROM public.private_mailboxes WHERE mailbox_id=recipient_mailbox;
 IF recipient IS NULL THEN RAISE EXCEPTION 'Recipient unavailable'; END IF;
 IF EXISTS(SELECT 1 FROM public.private_message_blocks WHERE user_id=recipient AND blocked_id=me) THEN RAISE EXCEPTION 'Recipient unavailable'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(me::text,0));
 IF (SELECT count(*) FROM public.private_message_envelopes WHERE sender_id=me AND created_at>now()-interval '1 minute')>=10 THEN RAISE EXCEPTION 'Please wait before sending more messages'; END IF;
 INSERT INTO public.private_message_envelopes(sender_id,recipient_id,ciphertext,nonce,sender_key,kind) VALUES(me,recipient,encrypted_text,message_nonce,ephemeral_key,message_kind) RETURNING id INTO message_id;
 RETURN message_id;
END; $$;
REVOKE ALL ON FUNCTION public.send_private_message(uuid,text,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.send_private_message(uuid,text,text,text,text) TO authenticated;