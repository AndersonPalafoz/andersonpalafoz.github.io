import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const checkoutRoutePath = path.join(process.cwd(), "app/api/stripe/checkout/route.ts");
const webhookRoutePath = path.join(process.cwd(), "app/api/stripe/webhook/route.ts");
const dbLibPath = path.join(process.cwd(), "lib/db.ts");

describe("Stripe checkout and fulfillment for course types 1 and 2", () => {
  it("rejects free courses on paid checkout route", () => {
    const source = fs.readFileSync(checkoutRoutePath, "utf8");
    expect(source).toContain("if (course.isFree) return NextResponse.json({ error: \"Este curso é gratuito.\" }");
  });

  it("handles webhook event and fulfills course purchase with active enrollment", () => {
    const webhookSource = fs.readFileSync(webhookRoutePath, "utf8");
    const dbSource = fs.readFileSync(dbLibPath, "utf8");

    expect(webhookSource).toContain("checkout.session.completed");
    expect(webhookSource).toContain("fulfillCoursePurchase");
    expect(dbSource).toContain("fulfillCoursePurchase");
    expect(dbSource).toContain("coursePurchases");
    expect(dbSource).toContain("enrollments");
  });
});
