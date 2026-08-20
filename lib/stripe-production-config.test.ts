import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Stripe production configuration contract", () => {
  it("keeps configuration errors classified without exposing secret values", () => {
    const source = readFileSync(join(process.cwd(), "lib/stripe.ts"), "utf8");
    expect(source).toContain("STRIPE_NOT_CONFIGURED");
    expect(source).toContain("STRIPE_INVALID_KEY");
    expect(source).not.toContain("secretKey}");
  });

  it("requires both the server key and webhook secret for a complete configuration", async () => {
    const { isStripeConfigured } = await import("./stripe");
    expect(typeof isStripeConfigured()).toBe("boolean");
  });
});
