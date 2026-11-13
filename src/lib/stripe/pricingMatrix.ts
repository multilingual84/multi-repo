// Central price-mapping configuration: single source of truth for billing.
// Derived from the approved six packages in src/lib/pricing.ts — amounts, seat
// limits and opt-in billing defaults must never diverge from that module.
// Presentation is frozen; this file carries no styling or copy.
import { paidPackages, defaultBillingPreferences, stripeFixedProcessingFee } from "@/lib/pricing";

export interface PriceTier {
  id: string;
  name: string;
  usdAmount: number;
  stripePriceId: string;
  seatLimit: number;
  autoRenewDefault: boolean;
}

const PACKAGE_NAMES: Record<string, string> = {
  single: "Solo Pass",
  team: "Team Pass",
  hub: "Hub Pass",
  "duo-yearly": "Duo Yearly Pass",
  community: "Community Pass",
  enterprise: "Enterprise Global Tier",
};

// Placeholder IDs until the owner pastes the live Stripe price IDs.
const STRIPE_PRICE_IDS: Record<string, string> = {
  single: "price_PASTE_STRIPE_SINGLE_ID_HERE",
  team: "price_PASTE_STRIPE_TEAM_ID_HERE",
  hub: "price_PASTE_STRIPE_HUB_ID_HERE",
  "duo-yearly": "price_PASTE_STRIPE_DUO_YEARLY_ID_HERE",
  community: "price_PASTE_STRIPE_COMMUNITY_ID_HERE",
  enterprise: "price_PASTE_STRIPE_ENTERPRISE_ID_HERE",
};

export const CURRENT_PRICING_MATRIX: Record<string, PriceTier> = Object.fromEntries(
  paidPackages.map((pkg) => [
    pkg.id,
    {
      id: pkg.id,
      name: PACKAGE_NAMES[pkg.id] ?? pkg.id,
      usdAmount: pkg.price,
      stripePriceId: STRIPE_PRICE_IDS[pkg.id] ?? `price_PASTE_STRIPE_${pkg.id.toUpperCase()}_ID_HERE`,
      seatLimit: pkg.seats,
      // Owner decision (2026-10-24): Auto pay is pre-checked at checkout but
      // visitors can untick it — billing stays opt-in, never forced.
      autoRenewDefault: defaultBillingPreferences.autoPay,
    },
  ]),
);

export { stripeFixedProcessingFee };
