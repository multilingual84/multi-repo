CREATE TABLE public.fleet_group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id uuid NOT NULL REFERENCES public.fleet_accounts(id) ON DELETE CASCADE,
  sender_wallet uuid NOT NULL,
  sender_name text NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '24 hours'
);
GRANT ALL ON public.fleet_group_messages TO service_role;
ALTER TABLE public.fleet_group_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX fleet_group_messages_fleet_idx ON public.fleet_group_messages(fleet_id, created_at DESC);