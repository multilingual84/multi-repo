import { createFileRoute } from '@tanstack/react-router';
import ReachoutComposer from '@/components/ReachoutComposer';

export const Route = createFileRoute('/reachout')({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: 'Reachout Drafts — Multi-Lingual™' },
      { name: 'description', content: 'Prepare outreach email drafts by audience and language. Nothing is sent or tracked; you copy and deliver each draft yourself.' },
      { property: 'og:title', content: 'Reachout Drafts — Multi-Lingual™' },
      { property: 'og:description', content: 'Draft-only outreach emails by audience and language; you copy and send them yourself.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ReachoutPage,
});

function ReachoutPage() {
  return (
    <main className="mx-auto max-w-3xl px-3 py-6 sm:px-6">
      <ReachoutComposer />
    </main>
  );
}
