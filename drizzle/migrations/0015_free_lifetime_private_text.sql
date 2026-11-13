CREATE OR REPLACE FUNCTION public.send_private_message(recipient_mailbox uuid, encrypted_text text, message_nonce text, ephemeral_key text, message_kind text DEFAULT 'text') RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE me uuid:=auth.uid(); recipient uuid; message_id uuid; start_time timestamptz; paid_until timestamptz;
BEGIN
 IF me IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 SELECT trial_started_at INTO start_time FROM public.private_mailboxes WHERE user_id=me;
 IF start_time IS NULL THEN RAISE EXCEPTION 'Mailbox required'; END IF;
 SELECT user_id INTO recipient FROM public.private_mailboxes WHERE mailbox_id=recipient_mailbox;
 IF recipient IS NULL THEN RAISE EXCEPTION 'Recipient unavailable'; END IF;
 paid_until:=public.private_message_paid_until(me);
 IF message_kind<>'text' AND now()>=start_time+interval '7 days' AND paid_until IS NULL AND NOT EXISTS (
 SELECT 1 FROM public.private_message_reply_access r WHERE r.recipient_id=me AND r.paid_sender_id=recipient AND public.private_message_paid_until(recipient)>now()
 ) THEN RAISE EXCEPTION 'Audio sending access expired'; END IF;
 IF EXISTS(SELECT 1 FROM public.private_message_blocks WHERE (user_id=recipient AND blocked_id=me) OR (user_id=me AND blocked_id=recipient)) THEN RAISE EXCEPTION 'Recipient unavailable'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(me::text,0));
 IF (SELECT count(*) FROM public.private_message_envelopes WHERE sender_id=me AND created_at>now()-interval '1 minute')>=10 THEN RAISE EXCEPTION 'Please wait before sending more messages'; END IF;
 INSERT INTO public.private_message_envelopes(sender_id,recipient_id,ciphertext,nonce,sender_key,kind) VALUES(me,recipient,encrypted_text,message_nonce,ephemeral_key,message_kind) RETURNING id INTO message_id;
 IF paid_until IS NOT NULL THEN INSERT INTO public.private_message_reply_access(recipient_id,paid_sender_id) VALUES(recipient,me) ON CONFLICT DO NOTHING; END IF;
 RETURN message_id;
END; $$;
REVOKE ALL ON FUNCTION public.send_private_message(uuid,text,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.send_private_message(uuid,text,text,text,text) TO authenticated;
COMMENT ON FUNCTION public.send_private_message(uuid,text,text,text,text) IS 'Authenticated enrolled text sending is free for life. Audio retains existing trial/paid/reply eligibility. Encryption, blocking, abuse throttle and sandbox isolation remain.';