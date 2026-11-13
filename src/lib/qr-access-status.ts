export function qrAccessPackage(state: { verified: boolean; paid: boolean; tier: string; renewsAt: string | null; trialExpiresAt?:string|null }, now = Date.now()): 'weekly' | 'paid' | 'limited' | 'eligible' {
  if(state.verified&&state.trialExpiresAt===null&&!state.paid)return 'eligible';
  if (!state.verified || !state.paid || !state.renewsAt || Date.parse(state.renewsAt) <= now) return 'limited';
  return state.tier === 'trial' ? 'weekly' : 'paid';
}