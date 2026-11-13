import { createFileRoute } from '@tanstack/react-router';
import ComplaintAdminPanel from '@/components/ComplaintAdminPanel';

export const Route = createFileRoute('/complaint-desk')({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: 'Complaint Approval Desk — Multi-Lingual™' },
      { name: 'description', content: 'Owner-only complaint review: approve a full refund plus six months of free service before it is offered.' },
      { property: 'og:title', content: 'Complaint Approval Desk — Multi-Lingual™' },
      { property: 'og:description', content: 'Owner-only complaint review page. Approval code required.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ComplaintAdminPanel,
});
