import { z } from 'zod';
import { campaignCopy, sectorCopy } from './campaign-copy';

export const campaignInput = z.object({
  targetId: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
  locale: z.enum(['en', 'es', 'tl', 'zh', 'de', 'ja']),
  sector: z.enum(['retail', 'airport', 'taxi', 'corporate']).optional(),
}).strict();

/** Pure draft factory: no recipient discovery, dispatch, storage or activation. */
export async function buildFavorCampaign(input: unknown) {
  const { targetId, locale, sector } = campaignInput.parse(input);
  const copy = campaignCopy[locale];
  const link = new URL('https://multi-lingual.tech');
  link.searchParams.set('ref', targetId);
  const referralUrl = link.toString();
  const sectorTemplate = sector ? sectorCopy[sector] : null;
  const subject = `${sectorTemplate ? sectorTemplate.subject : copy.subject} #${targetId}`;
  const body = sectorTemplate
    ? [sectorTemplate.body, copy.access, referralUrl, copy.privacy].join('\n\n')
    : [copy.introduction, copy.access, referralUrl, copy.privacy].join('\n\n');
  return {
    locale, targetId, sector: sector ?? null, referralUrl, subject, toDepartment: copy.to,
    ccDepartments: [...copy.departments], body,
    draft: [`Subject: ${subject}`, `To: ${copy.to}`, `CC: ${copy.departments.join(' / ')}`, '', body].join('\n'),
    deliveryStatus: 'not_sent' as const,
  };
}