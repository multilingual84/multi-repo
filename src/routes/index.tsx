import { createFileRoute } from "@tanstack/react-router";
import StagingLab from "@/components/staging/StagingLab";

const TITLE = "Bricktown Staging Lab — Virtual Staging for Real Estate in Every Language";
const DESCRIPTION = "Snap an empty room and get an MLS-ready staged photo in about a minute. Picture packages from $0.99, local-currency prices and a 50% partner referral QR.";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Bricktown Staging Lab",
        serviceType: "Virtual staging for real estate",
        offers: { "@type": "AggregateOffer", lowPrice: "0.99", highPrice: "20.00", priceCurrency: "USD" },
        provider: {
          "@type": "Organization",
          name: "Bricktown Software Systems LLC",
          email: "support@multi-lingual.tech",
          address: { "@type": "PostalAddress", streetAddress: "629 W Main St #1025", addressLocality: "Oklahoma City", addressRegion: "OK", postalCode: "73102", addressCountry: "US" },
        },
      }),
    }],
  }),
  component: StagingLab,
});
