-- Transactional RPC regression: synthetic principals, no Auth accounts or emails.
BEGIN;
-- Seed expired identities in this isolated test only; production keeps its trigger enabled.
ALTER TABLE public.private_mailboxes DISABLE TRIGGER private_mailbox_identity;
INSERT INTO public.private_mailboxes(user_id,mailbox_id,nickname,public_key,trial_started_at) VALUES
('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Paid fixture',repeat('A',43)||'=','2026-01-01'),
('10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','Free fixture',repeat('B',43)||'=','2026-01-01'),
('10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000003','Other fixture',repeat('C',43)||'=','2026-01-01');
ALTER TABLE public.private_mailboxes ENABLE TRIGGER private_mailbox_identity;
INSERT INTO public.private_message_plans(user_id,paid_until) VALUES('10000000-0000-4000-8000-000000000001',now()+interval '1 day');
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
SELECT public.send_private_message('20000000-0000-4000-8000-000000000002',repeat('A',24),repeat('A',32),repeat('A',43)||'=','text');
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
DO $$ DECLARE message_id uuid; opened integer; BEGIN
 SELECT id INTO message_id FROM public.private_message_envelopes WHERE recipient_id=auth.uid();
 SELECT count(*) INTO opened FROM public.consume_private_message(message_id);
 IF opened<>1 THEN RAISE EXCEPTION 'Unpaid recipient could not open'; END IF;
 SELECT count(*) INTO opened FROM public.consume_private_message(message_id);
 IF opened<>0 THEN RAISE EXCEPTION 'Message opened twice'; END IF;
 IF (SELECT count(*) FROM public.list_private_reply_contacts())<>1 THEN RAISE EXCEPTION 'Paid reply contact missing after consumption'; END IF;
END $$;
SELECT public.send_private_message('20000000-0000-4000-8000-000000000001',repeat('B',24),repeat('B',32),repeat('B',43)||'=','text');
SELECT public.send_private_message('20000000-0000-4000-8000-000000000001',repeat('C',24),repeat('C',32),repeat('C',43)||'=','audio');
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
DO $$ DECLARE item record; opened integer; BEGIN
 IF (SELECT count(*) FROM public.private_message_envelopes WHERE recipient_id=auth.uid())<>2 THEN RAISE EXCEPTION 'Replies not delivered to paid sender'; END IF;
 FOR item IN SELECT id FROM public.private_message_envelopes WHERE recipient_id=auth.uid() LOOP
  SELECT count(*) INTO opened FROM public.consume_private_message(item.id);
  IF opened<>1 THEN RAISE EXCEPTION 'Paid sender could not open reply'; END IF;
 END LOOP;
END $$;
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
DO $$ BEGIN
 BEGIN
  PERFORM public.send_private_message('20000000-0000-4000-8000-000000000003',repeat('A',24),repeat('A',32),repeat('A',43)||'=','text');
  RAISE EXCEPTION 'Unpaid user initiated unrelated conversation';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM<>'Sending access expired' THEN RAISE; END IF; END;
END $$;
UPDATE public.private_message_plans SET paid_until=now()-interval '1 second' WHERE user_id='10000000-0000-4000-8000-000000000001';
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.list_private_reply_contacts()) THEN RAISE EXCEPTION 'Expired paid sender retained reply access'; END IF;
 BEGIN
  PERFORM public.send_private_message('20000000-0000-4000-8000-000000000001',repeat('A',24),repeat('A',32),repeat('A',43)||'=','text');
  RAISE EXCEPTION 'Expired sponsor permitted reply';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM<>'Sending access expired' THEN RAISE; END IF; END;
END $$;
ROLLBACK;