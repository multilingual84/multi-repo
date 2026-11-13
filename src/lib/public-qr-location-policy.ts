import { paidPackages } from '@/lib/pricing';
import { isFreeForLife } from '@/lib/free-allowance-policy';
export const PUBLIC_QR_VISITOR_FREE_FOR_LIFE = true;
export const PUBLIC_QR_REQUIRES_SOLO_SEAT_PER_LOCATION = true;
export const PUBLIC_QR_ONE_DEVICE_AT_A_TIME = true;
export const soloPack = paidPackages.find(p => p.id === 'single')!;
export function publicQrVisitorFeatureFree(feature: string): boolean {
  return PUBLIC_QR_VISITOR_FREE_FOR_LIFE && (isFreeForLife(feature) || feature === 'public-qr-talk' || feature === 'qr-translator');
}
export function locationNeedsSoloSeat(seatsOwned: number): boolean {
  return PUBLIC_QR_REQUIRES_SOLO_SEAT_PER_LOCATION && seatsOwned < (soloPack.seats ?? 1);
}
export function qrBoundToThisDevice(enrolled: { device_hash: string; generation: number }, session: { deviceHash?: string; generation?: number }): boolean {
  if (!PUBLIC_QR_ONE_DEVICE_AT_A_TIME) return true;
  return enrolled.device_hash === session.deviceHash && enrolled.generation === session.generation;
}
