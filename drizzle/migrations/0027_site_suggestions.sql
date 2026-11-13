CREATE TABLE public.site_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  page text,
  locale text,
  device text,
  created_at timestamptz NOT NULL DEFAULT now(),
  digested_at timestamptz
);
GRANT ALL ON public.site_suggestions TO service_role;
ALTER TABLE public.site_suggestions ENABLE ROW LEVEL SECURITY;
CREATE INDEX site_suggestions_pending_idx ON public.site_suggestions (created_at) WHERE digested_at IS NULL;