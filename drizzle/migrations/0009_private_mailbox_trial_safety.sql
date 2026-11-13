CREATE FUNCTION public.protect_private_mailbox_identity() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF TG_OP='INSERT' THEN
 NEW.trial_started_at:=now(); NEW.created_at:=now(); NEW.mailbox_id:=gen_random_uuid();
 ELSE
 IF NEW.trial_started_at IS DISTINCT FROM OLD.trial_started_at OR NEW.public_key IS DISTINCT FROM OLD.public_key OR NEW.mailbox_id IS DISTINCT FROM OLD.mailbox_id OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN RAISE EXCEPTION 'Mailbox identity cannot be changed'; END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER private_mailbox_identity BEFORE INSERT OR UPDATE ON public.private_mailboxes FOR EACH ROW EXECUTE FUNCTION public.protect_private_mailbox_identity();
CREATE TABLE public.private_message_send_limits (
 user_id uuid PRIMARY KEY, window_started timestamptz NOT NULL DEFAULT now(), send_count integer NOT NULL DEFAULT 0
);
GRANT ALL ON public.private_message_send_limits TO service_role;
ALTER TABLE public.private_message_send_limits ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.limit_private_message_send() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE counter integer;
BEGIN
 INSERT INTO public.private_message_send_limits(user_id,window_started,send_count) VALUES(NEW.sender_id,now(),1)
 ON CONFLICT(user_id) DO UPDATE SET window_started=CASE WHEN private_message_send_limits.window_started<=now()-interval '1 minute' THEN now() ELSE private_message_send_limits.window_started END,
 send_count=CASE WHEN private_message_send_limits.window_started<=now()-interval '1 minute' THEN 1 ELSE private_message_send_limits.send_count+1 END RETURNING send_count INTO counter;
 IF counter>10 THEN RAISE EXCEPTION 'Please wait before sending more messages'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER private_message_rate_limit BEFORE INSERT ON public.private_message_envelopes FOR EACH ROW EXECUTE FUNCTION public.limit_private_message_send();