import { createServerFn } from '@tanstack/react-start';

// Zero-signup free-tier pipeline. Anonymous visitors hold only a random
// credential handle in their own browser storage; the rows carry no personal
// data, and the anon role may only insert rows, read trial state, and flip
// free_lifetime_activated (column-limited grants + RLS).

// Rows are only reachable server-side; the anon role has no table access.
async function publicClient() {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  return supabaseAdmin;
}

const handleValidator = (input: { credentialHandle: string }) => {
  if (typeof input?.credentialHandle !== 'string' || !/^[a-f0-9-]{36}$/.test(input.credentialHandle)) {
    throw new Error('Invalid credential handle');
  }
  return input;
};

export const startFreeSession = createServerFn({ method: 'POST' })
  .inputValidator((input: { credentialHandle: string; channelType?: string }) => ({
    ...handleValidator(input),
    channelType: typeof input.channelType === 'string' && input.channelType.length <= 40 ? input.channelType : 'camera',
  }))
  .handler(async ({ data }) => {
    const supabase = await publicClient();
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({ credential_handle: data.credentialHandle }, { onConflict: 'credential_handle' })
      .select('id, trial_expires_at, is_subscription_active, free_lifetime_activated')
      .single();
    if (userError || !user) throw new Error(userError?.message ?? 'Could not start free session');
    const { walletSession }=await import('@/lib/wallet/access.server');
    const verified=(await walletSession()).data.handle===data.credentialHandle;
    const roomToken = crypto.randomUUID();
    await supabase.from('sessions').insert({ user_id: user.id, room_token: roomToken, active_channel_type: data.channelType });
    return {
      userId: user.id,
      roomToken,
      trialExpiresAt: user.trial_expires_at,
      isSubscriptionActive: verified && user.is_subscription_active,
      freeLifetimeActivated: user.free_lifetime_activated,
    };
  });

export const getFreeSessionState = createServerFn({ method: 'POST' })
  .inputValidator(handleValidator)
  .handler(async ({ data }) => {
    const supabase = await publicClient();
    const { data: user } = await supabase
      .from('users')
      .select('id, trial_expires_at, is_subscription_active, free_lifetime_activated')
      .eq('credential_handle', data.credentialHandle)
      .maybeSingle();
    if (!user) return null;
    const { walletSession }=await import('@/lib/wallet/access.server');
    const verified=(await walletSession()).data.handle===data.credentialHandle;
    return {
      userId: user.id,
      trialExpiresAt: user.trial_expires_at,
      isSubscriptionActive: verified && user.is_subscription_active,
      freeLifetimeActivated: user.free_lifetime_activated,
    };
  });

export const activateFreeLifetime = createServerFn({ method: 'POST' })
  .inputValidator(handleValidator)
  .handler(async ({ data }) => {
    const supabase = await publicClient();
    const { error } = await supabase
      .from('users')
      .update({ free_lifetime_activated: true })
      .eq('credential_handle', data.credentialHandle);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
