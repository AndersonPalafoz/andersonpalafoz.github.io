import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));

import {
  CONTACT_RATE_LIMIT_MAX,
  hashContactRateLimitKey,
  isContactRequestAllowed,
} from "@/lib/contact-rate-limit";

describe("limite persistente do formulário de contato", () => {
  it("gera um identificador estável e não reversível diretamente a partir do IP", () => {
    const ip = "203.0.113.42";
    const secret = "segredo-de-teste";
    const hash = hashContactRateLimitKey(ip, secret);

    expect(hashContactRateLimitKey(ip, secret)).toBe(hash);
    expect(hash).not.toContain(ip);
    expect(hashContactRateLimitKey(ip, "outro-segredo")).not.toBe(hash);
  });

  it("permite até cinco envios por janela e bloqueia o seguinte", () => {
    expect(CONTACT_RATE_LIMIT_MAX).toBe(5);
    expect(isContactRequestAllowed(5)).toBe(true);
    expect(isContactRequestAllowed(6)).toBe(false);
  });
});
