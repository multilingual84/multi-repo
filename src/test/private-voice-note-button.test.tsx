import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const state = { mailbox: { mailbox_id: 'abc', nickname: 'me', public_key: 'k', trial_started_at: new Date().toISOString() }, paidUntil: null, messages: [], replyContacts: [], deliveries: [], sandboxTier: null };
vi.mock('@tanstack/react-start', async (orig) => ({ ...(await orig<object>()), useServerFn: (fn: unknown) => fn }));
vi.mock('@/lib/private-messages.functions', () => ({ mailboxStateFn: async () => state, enrollMailboxFn: vi.fn(), recipientMailboxFn: vi.fn(), sendPrivateMessageFn: vi.fn(), openPrivateMessageFn: vi.fn(), renameMailboxFn: vi.fn() }));
vi.mock('@/lib/message-translation.functions', () => ({ translateOpenedMessageFn: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: {
  getUser: async () => ({ data: { user: { id: 'u1' } } }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
  signOut: async () => ({}) } } }));
vi.mock('qrcode', () => ({ toDataURL: async () => 'data:,' }));

import PrivateMessaging from '@/components/PrivateMessaging';

describe('voice note mic beside Send encrypted', () => {
  it('renders the mic button in the same row as Send encrypted', async () => {
    render(<PrivateMessaging locale="en" pricePlan={{} as never} freeLifetime />);
    const [mic, send] = await waitFor(() => { const m = screen.getByRole('button', { name: /Send voice note/ }); const s = screen.getByRole('button', { name: /Send encrypted/ }); screen.getByRole('button', { name: /Refresh/ }); return [m, s]; });
    expect(mic.parentElement).toBe(send.parentElement);
    expect(mic).not.toBeDisabled();
  });
  it('also shows the voice note button beside Send encrypted when signed out', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({ data: { user: null } } as never);
    render(<PrivateMessaging locale="en" pricePlan={{} as never} freeLifetime />);
    const mic = screen.getByRole('button', { name: /Send voice note/ });
    expect(mic.parentElement).toBe(screen.getByRole('button', { name: /Send encrypted/ }).parentElement);
  });
});
