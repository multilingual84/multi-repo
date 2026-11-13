import { createFileRoute } from '@tanstack/react-router';
import { validReminderRequest } from '@/lib/pass-reminder-policy';

// Public signup for the one-time 24-hour pass reminder. Validates the request
// shape and returns nothing private; duplicates collapse on (pass_id, email).
export const Route = createFileRoute('/api/public/pass-reminder')({
  staticData: { sitemap: false },
  server: { handlers: { POST: async ({ request }) => {
    let body: unknown;
    try { body = await request.json(); } catch { return Response.json({ saved: false }, { status: 400 }); }
    const reminder = validReminderRequest(body);
    if (!reminder) return Response.json({ saved: false }, { status: 400 });
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin.from('pass_reminders').upsert(
      { pass_id: reminder.passId, email: reminder.email, expires_at: new Date(reminder.expiresAt).toISOString() },
      { onConflict: 'pass_id,email' },
    );
    if (error) return Response.json({ saved: false }, { status: 500 });
    return Response.json({ saved: true });
  } } },
});
