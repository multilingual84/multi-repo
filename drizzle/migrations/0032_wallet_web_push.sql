CREATE TABLE public.wallet_push_subscriptions (endpoint text PRIMARY KEY, wallet uuid NOT NULL, subscription jsonb NOT NULL, locale text NOT NULL DEFAULT 'en', origin text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.wallet_push_subscriptions TO service_role;
ALTER TABLE public.wallet_push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE INDEX wallet_push_owner ON public.wallet_push_subscriptions(wallet);
CREATE TABLE public.wallet_push_invites (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sender uuid NOT NULL, recipient uuid NOT NULL, window_key bigint NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(sender,recipient,window_key));
GRANT ALL ON public.wallet_push_invites TO service_role;
ALTER TABLE public.wallet_push_invites ENABLE ROW LEVEL SECURITY;