CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE,
  credential_handle text,
  contact text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  resolution_note text,
  refund_amount_cents integer,
  refund_currency text,
  free_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE INDEX complaints_status_idx ON public.complaints (status, created_at);