CREATE TABLE public.pass_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id text NOT NULL,
  email text NOT NULL,
  expires_at timestamptz NOT NULL,
  reminded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pass_id, email)
);
GRANT ALL ON public.pass_reminders TO service_role;
ALTER TABLE public.pass_reminders ENABLE ROW LEVEL SECURITY;