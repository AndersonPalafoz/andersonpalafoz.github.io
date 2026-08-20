import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Stripe webhook contract", () => {
  const source = readFileSync(join(process.cwd(), "app/api/stripe/webhook/route.ts"), "utf8");

  it("verifies the raw request body with Stripe's signature before fulfillment", () => {
    expect(source).toContain('const body = await request.text();');
    expect(source).toContain("stripe.webhooks.constructEvent(body, signature, webhookSecret)");
    expect(source).toContain("fulfillCoursePurchase");
    expect(source).not.toContain("evt_test_");
  });

  it("returns explicit operational codes for configuration and metadata failures", () => {
    expect(source).toContain("STRIPE_WEBHOOK_NOT_CONFIGURED");
    expect(source).toContain("STRIPE_METADATA_INVALID");
    expect(source).toContain("STRIPE_WEBHOOK_SIGNATURE_INVALID");
  });
});
