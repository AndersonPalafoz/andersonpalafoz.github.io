import { describe, expect, it } from "vitest";

describe("Resend credentials", () => {
  it("authenticates the API key and accepts a valid sender address", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    const sender = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !sender) {
      return;
    }
    expect(sender).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    const response = await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${apiKey}` } });
    expect(response.status, "A chave do Resend foi rejeitada").toBe(200);
  }, 15000);
});
