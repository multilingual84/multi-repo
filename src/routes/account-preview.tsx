import { createFileRoute } from '@tanstack/react-router';
import AccountCockpitPreview from '@/components/AccountCockpitPreview';

export const Route = createFileRoute('/account-preview')({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: 'Account Preview — Multi-Lingual™' },
      { name: 'description', content: 'Sample Multi-Lingual account health and connection history. Live services are not connected.' },
      { property: 'og:title', content: 'Account Preview — Multi-Lingual™' },
      { property: 'og:description', content: 'Sample account overview and connection ledgers, without live services or account activation.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AccountCockpitPreview,
});