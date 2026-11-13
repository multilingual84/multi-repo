import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

// Public, stateless draft generation only. Never include delivery or private records here.
export const generateFavorCampaign = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.object({
    targetId: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
    locale: z.enum(['en', 'es', 'tl', 'zh', 'de', 'ja']),
    sector: z.enum(['retail', 'airport', 'taxi', 'corporate']).optional(),
  }).strict().parse(input))
  .handler(async ({ data }) => {
    const { buildFavorCampaign } = await import('./favorCampaign.server');
    return buildFavorCampaign(data);
  });