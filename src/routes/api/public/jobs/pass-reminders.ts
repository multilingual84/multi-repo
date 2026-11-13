import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';

// Hourly job: emails the one-time 24-hour reminder for passes nearing their end.
export const Route = createFileRoute('/api/public/jobs/pass-reminders')({
  staticData: { sitemap: false },
  server: { handlers: { POST: async ({ request }) => {
    const failure = await authenticateCronRequest(request); if (failure) return failure;
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const now = Date.now();
    const dueBefore = new Date(now + 24 * 60 * 60 * 1000).toISOString();
    const { data: due } = await supabaseAdmin.from('pass_reminders')
      .select('id,email,expires_at')
      .is('reminded_at', null)
      .gt('expires_at', new Date(now).toISOString())
      .lte('expires_at', dueBefore)
      .order('expires_at')
      .limit(50);
    if (!due?.length) return Response.json({ sent: 0 });
    // Atomic claim: a concurrent run gets no rows back.
    const { data: claimed, error } = await supabaseAdmin.from('pass_reminders')
      .update({ reminded_at: new Date(now).toISOString() })
      .in('id', due.map(d => d.id))
      .is('reminded_at', null)
      .select('id,email,expires_at');
    if (error || !claimed?.length) return Response.json({ sent: 0 });
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
    let sent = 0;
    const failed: string[] = [];
    for (const row of claimed) {
      try {
        const result = await sendTemplateEmail('pass-reminder', row.email, {
          templateData: { expiresAt: new Date(row.expires_at).toUTCString(), link: 'https://multi-lingual.tech' },
          idempotencyKey: `pass-reminder-${row.id}`,
        });
        if (result.sent) sent++;
      } catch {
        failed.push(row.id);
      }
    }
    // Release failed rows so the next run retries them.
    if (failed.length) await supabaseAdmin.from('pass_reminders').update({ reminded_at: null }).in('id', failed);
    return Response.json({ sent, failed: failed.length });
  } } },
});
