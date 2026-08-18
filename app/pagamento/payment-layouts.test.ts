import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");
const successPage = read("app/pagamento/sucesso/page.tsx");
const receiptPage = read("app/pagamento/recibo/[id]/page.tsx");
const receiptRoute = read("app/api/stripe/purchases/[id]/route.ts");
const sessionRoute = read("app/api/stripe/session/route.ts");

describe("payment auxiliary layouts", () => {
  it("validates a checkout session without cache and exposes recoverable loading/error states", () => {
    expect(successPage).toContain("/api/stripe/session?session_id=");
    expect(successPage).toContain('cache: "no-store"');
    expect(successPage).toContain("Sessão de pagamento não encontrada");
    expect(successPage).toContain("Tentar novamente");
    expect(successPage).toContain("role=\"status\"");
    expect(successPage).toContain('payload?.session?.paymentStatus !== "paid"');
  });

  it("keeps checkout-session ownership enforced by the authenticated database user", () => {
    expect(sessionRoute).toContain("getServerSession(authOptions)");
    expect(sessionRoute).toContain("stripeSession.metadata?.user_id !== String(user.id)");
    expect(sessionRoute).toContain('status: 403');
  });

  it("loads the receipt from a protected server endpoint instead of filtering a public client list", () => {
    expect(receiptPage).toContain("/api/stripe/purchases/${encodeURIComponent(receiptId)}");
    expect(receiptPage).not.toContain("/api/stripe/purchases`");
    expect(receiptRoute).toContain("getServerSession(authOptions)");
    expect(receiptRoute).toContain("getCoursePurchases(user.id)");
    expect(receiptRoute).toContain("matched.purchase.id");
    expect(receiptRoute).toContain("Recibo não encontrado ou acesso não autorizado.");
    expect(receiptRoute).toContain('"Cache-Control": "no-store"');
    expect(receiptRoute).toContain("checkout.metadata?.user_id !== String(user.id)");
    expect(receiptRoute).toContain('checkout.payment_status !== "paid"');
  });

  it("links paid purchases to the protected internal receipt route", () => {
    const purchasesPage = read("app/dashboard/compras/page.tsx");
    expect(purchasesPage).toContain("/pagamento/recibo/${item.id}");
    expect(purchasesPage).toContain('item.payment?.paymentStatus === "paid"');
  });

  it("does not retain the previous invented course name, fixed price, or fallback order id", () => {
    expect(receiptPage).not.toContain("ORD-98421");
    expect(receiptPage).not.toContain("English Mastery A1–B2 Complete Suite");
    expect(receiptPage).not.toContain("R$ 497,00");
    expect(receiptPage).toContain("data.course?.title");
    expect(receiptPage).toContain("data.purchase.amount");
  });
});
