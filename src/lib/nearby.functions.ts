import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';

// Phones sharing one internet connection (same Wi-Fi) get the same short-lived,
// one-way key. The raw address never leaves the server and is never stored.
export const getNearbyKey = createServerFn({ method: 'GET' }).handler(async () => {
  const ip = (getRequestHeader('cf-connecting-ip') || getRequestHeader('x-forwarded-for') || '').split(',')[0]?.trim() || 'unknown';
  const day = new Date().toISOString().slice(0, 10);
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`ml-nearby|${day}|${ip}`));
  const key = Array.from(new Uint8Array(bytes).slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join('');
  return { key };
});
