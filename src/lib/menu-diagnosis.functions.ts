import { createServerFn } from '@tanstack/react-start';

// Public visitor-facing endpoint: validates input, then delegates to the
// server-only gateway module. No private data is read or returned.
export const diagnoseMenuLayoutFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { description?: string; device?: string }) => {
    const description = (input?.description ?? '').trim();
    if (description.length < 10) throw new Error('Please describe the issue in a few more words.');
    if (description.length > 2000) throw new Error('Please keep the description under 2000 characters.');
    return { description, device: (input?.device ?? '').slice(0, 500) };
  })
  .handler(async ({ data }) => {
    const { diagnoseMenuLayout } = await import('@/lib/ai/menu-diagnosis.server');
    const diagnosis = await diagnoseMenuLayout(data);
    return { diagnosis };
  });
