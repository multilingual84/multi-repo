import { paidPackages } from '@/lib/pricing';
import { packageDurationDays } from '@/lib/package-duration';

const tierIds: Record<string, string> = {
  solo: 'single', team: 'team', hub: 'hub', yearly: 'duo-yearly',
  community: 'community', enterprise_global: 'enterprise',
};

export function entitlementPolicy(tier: string) {
  const id = tierIds[tier];
  const pack = paidPackages.find(p => p.id === id);
  if (!pack) throw new Error('Unknown paid tier');
  return { tier, seats: pack.seats, days: packageDurationDays(pack.id) };
}

export function isPaidCheckout(session: { payment_status?: unknown; status?: unknown }) {
  // Complete also describes sessions with payment still pending.
  return session.payment_status === 'paid' && session.status === 'complete';
}
