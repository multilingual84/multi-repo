import { describe, expect, it } from "vitest";
import { CURRENT_PRICING_MATRIX } from "@/lib/stripe/pricingMatrix";
import { paidPackages } from "@/lib/pricing";

describe("CURRENT_PRICING_MATRIX", () => {
  it("contains exactly the six approved packages", () => {
    expect(Object.keys(CURRENT_PRICING_MATRIX).sort()).toEqual(
      paidPackages.map((p) => p.id).sort(),
    );
  });

  it("matches the approved USD amounts and seat limits", () => {
    for (const pkg of paidPackages) {
      const tier = CURRENT_PRICING_MATRIX[pkg.id];
      expect(tier).toBeDefined();
      expect(tier!.usdAmount).toBe(pkg.price);
      expect(tier!.seatLimit).toBe(pkg.seats);
    }
  });

  it("keeps Auto pay pre-checked but opt-out (owner decision 2026-10-24)", () => {
    for (const tier of Object.values(CURRENT_PRICING_MATRIX)) {
      expect(tier.autoRenewDefault).toBe(true);
    }
  });
});
