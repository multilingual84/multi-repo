import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';

export const Route = createFileRoute('/api/public/jobs/suggestion-digest')({
  staticData: { sitemap: false },
  server: { handlers: { POST: async ({ request }) => {
    const failure = await authenticateCronRequest(request); if (failure) return failure;
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: pending } = await supabaseAdmin.from('site_suggestions').select('id').is('digested_at', null).order('created_at').limit(100);
    if (!pending?.length) return Response.json({ sent: false, count: 0 });
    // Atomic claim: a concurrent run gets no rows back.
    const { data: claimed, error } = await supabaseAdmin.from('site_suggestions')
      .update({ digested_at: new Date().toISOString() }).in('id', pending.map(p => p.id)).is('digested_at', null)
      .select('id,message,page,locale');
    if (error || !claimed?.length) return Response.json({ sent: false, count: 0 });
    try {
      const { triageSuggestions } = await import('@/lib/ai/suggestion-triage.server');
      const digest = await triageSuggestions(claimed);
      const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
      const day = new Date().toISOString().slice(0, 10);
      await sendTemplateEmail('suggestion-digest', 'bricktownvirtualstaging@gmail.com', { templateData: { count: claimed.length, digest }, idempotencyKey: `suggestion-digest-${day}` });
      return Response.json({ sent: true, count: claimed.length });
    } catch (e) {
      // Release the claim so tomorrow's run retries these notes.
      await supabaseAdmin.from('site_suggestions').update({ digested_at: null }).in('id', claimed.map(c => c.id));
      return Response.json({ sent: false, error: e instanceof Error ? e.message : 'failed' }, { status: 500 });
    }
  } } },
});
