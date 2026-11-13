import { z } from 'zod';
export const qrCredentialSchema = z.object({version:z.literal(2),id:z.string().uuid(),seed:z.string().regex(/^[a-f0-9]{64}$/)});
export type QrCredential = z.infer<typeof qrCredentialSchema>;
export const QR_ACCESS_STORAGE = 'ml-private-qr-access-v2';
export const QR_DEVICE_STORAGE = 'ml-qr-device-v2';
export function parseAccessQr(value:string):QrCredential { return qrCredentialSchema.parse(JSON.parse(value)); }
export function validDeviceSession(stored:{device_hash:string;generation:number},session:{deviceHash?:string;generation?:number}) { return stored.device_hash===session.deviceHash&&stored.generation===session.generation; }
export function randomDeviceSecret() { return Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join(''); }
export function freshLegacyOwnership(session:{handle?:string;legacyVerifiedAt?:number},id:string,now:number) { const verified=session.legacyVerifiedAt;return session.handle===id&&typeof verified==='number'&&verified<=now&&now-verified<300000; }