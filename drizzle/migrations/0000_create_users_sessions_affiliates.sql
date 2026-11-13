CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_handle TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  trial_expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days',
  vocal_token_expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '30 days',
  is_subscription_active BOOLEAN DEFAULT false
);
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  room_token TEXT UNIQUE NOT NULL,
  active_channel_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_code TEXT UNIQUE NOT NULL,
  associated_user_id UUID REFERENCES public.users(id),
  accumulated_split_balance NUMERIC(10, 2) DEFAULT 0.00,
  payout_hold_escrow_until TIMESTAMPTZ DEFAULT now() + INTERVAL '30 days'
);
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.sessions TO service_role;
GRANT ALL ON public.affiliates TO service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;