ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_tier text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_renews_at timestamp with time zone;

-- These columns are written only by the server after a verified Stripe checkout.
-- Anonymous visitors must never be able to flip their own subscription state.
REVOKE UPDATE (subscription_tier, stripe_customer_id, stripe_subscription_id, subscription_renews_at) ON public.users FROM anon;
REVOKE UPDATE (subscription_tier, stripe_customer_id, stripe_subscription_id, subscription_renews_at) ON public.users FROM authenticated;