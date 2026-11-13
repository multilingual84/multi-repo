import { createServerFn } from '@tanstack/react-start';

// Public: visitors leave an idea or problem. Stored for the owner's daily AI digest only.
export const submitSuggestionFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { message?: string; page?: string; locale?: string; device?: string }) => {
    const message = (input?.message ?? '').trim();
    if (message.length < 8) throw new Error('Please add a few more words.');
    if (message.length > 1500) throw new Error('Please keep it under 1500 characters.');
    return { message, page: (input?.page ?? '').slice(0, 100), locale: (input?.locale ?? '').slice(0, 10), device: (input?.device ?? '').slice(0, 300) };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const since = new Date(Date.now() - 86400000).toISOString();
    const { count } = await supabaseAdmin.from('site_suggestions').select('id', { count: 'exact', head: true }).gte('created_at', since);
    if ((count ?? 0) > 500) throw new Error('Too many notes today, please try tomorrow.');
    const { error } = await supabaseAdmin.from('site_suggestions').insert(data);
    if (error) throw new Error('Could not save your note.');
    return { ok: true };
  });
