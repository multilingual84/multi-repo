import { z } from 'zod';
export const PIN_LENGTH = 4;
export const PIN_MAX_ATTEMPTS = 5;
export const PIN_LOCK_MINUTES = 15;
export const walletIdentitySchema = z.object({ version: z.literal(1), id: z.string().uuid(), nickname: z.string().trim().min(1).max(40), language: z.string().regex(/^[a-z]{2,3}(?:-[A-Za-z]{2,8})?$/), preferences: z.record(z.string().max(200)).default({}) });
export type WalletIdentity = z.infer<typeof walletIdentitySchema>;
export const pinSchema = z.string().regex(/^\d{4}$/);
export const walletLoginSchema = z.object({ id: z.string().uuid(), pin: pinSchema });
export const walletQrSchema = z.object({ kind: z.literal('multi-lingual-wallet'), version: z.literal(1), id: z.string().uuid(), salt: z.string().max(100), iv: z.string().max(100), ciphertext: z.string().max(5000) });
export type WalletQr = z.infer<typeof walletQrSchema>;
export function parseWalletQr(raw: string): WalletQr { if(raw.length>6000)throw new Error('Invalid wallet QR'); return walletQrSchema.parse(JSON.parse(raw)); }
export function paidWalletAccess(verified: boolean, active: boolean|null, renews: string|null, now=Date.now()) { return verified && active === true && !!renews && Date.parse(renews)>now; }
