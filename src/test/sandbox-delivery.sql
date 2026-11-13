BEGIN;
INSERT INTO public.communication_sandbox_accounts(user_id,tier) VALUES('10000000-0000-4000-8000-000000000001','paid'),('10000000-0000-4000-8000-000000000002','free');
INSERT INTO public.private_mailboxes(user_id,nickname,public_key) VALUES('10000000-0000-4000-8000-000000000001','Paid',repeat('A',43)||'='),('10000000-0000-4000-8000-000000000002','Free',repeat('B',43)||'='),('10000000-0000-4000-8000-000000000003','Real',repeat('C',43)||'=');
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.private_mailboxes WHERE user_id IN('10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002') AND trial_started_at>now()-interval '7 days') THEN RAISE EXCEPTION 'Sandbox trial not expired'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
SELECT public.send_private_message((SELECT mailbox_id FROM public.private_mailboxes WHERE user_id='10000000-0000-4000-8000-000000000002'),repeat('A',24),repeat('A',32),repeat('A',43)||'=','text');
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.private_message_delivery_status WHERE received_at IS NULL AND replied_at IS NULL AND expires_at=delivered_at+interval '24 hours') THEN RAISE EXCEPTION 'Delivery or 24h expiry wrong'; END IF;
 BEGIN
 PERFORM public.send_private_message((SELECT mailbox_id FROM public.private_mailboxes WHERE user_id='10000000-0000-4000-8000-000000000003'),repeat('A',24),repeat('A',32),repeat('A',43)||'=','text');
 RAISE EXCEPTION 'Sandbox reached customer';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM<>'Sandbox messages can only reach active sandbox accounts' THEN RAISE;END IF;END;
END $$;
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
SELECT public.acknowledge_private_inbox();
SELECT public.send_private_message((SELECT mailbox_id FROM public.private_mailboxes WHERE user_id='10000000-0000-4000-8000-000000000001'),repeat('B',24),repeat('B',32),repeat('B',43)||'=','text');
DO $$ BEGIN IF NOT EXISTS(SELECT 1 FROM public.private_message_delivery_status WHERE sender_id='10000000-0000-4000-8000-000000000001' AND received_at IS NOT NULL AND replied_at IS NOT NULL) THEN RAISE EXCEPTION 'Receipt or free response missing'; END IF; END $$;
ROLLBACK;