import { afterEach, describe, expect, it, vi } from "vitest";
import { getAuthSecret } from "./auth-secret";

describe("getAuthSecret", () => {
  const originalNextAuth = process.env.NEXTAUTH_SECRET;
  const originalJwt = process.env.JWT_SECRET;

  afterEach(() => {
    if (originalNextAuth === undefined) delete process.env.NEXTAUTH_SECRET;
    else process.env.NEXTAUTH_SECRET = originalNextAuth;
    if (originalJwt === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwt;
    vi.unstubAllEnvs();
  });

  it("prefers NEXTAUTH_SECRET when both secrets exist", () => {
    process.env.NEXTAUTH_SECRET = "nextauth-secret";
    process.env.JWT_SECRET = "legacy-secret";
    expect(getAuthSecret()).toBe("nextauth-secret");
  });

  it("uses JWT_SECRET for legacy local environments", () => {
    delete process.env.NEXTAUTH_SECRET;
    process.env.JWT_SECRET = "legacy-secret";
    expect(getAuthSecret()).toBe("legacy-secret");
  });

  it("keeps a development fallback when no secret is configured outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.JWT_SECRET;
    expect(getAuthSecret()).toBe("fallback-secret-for-development");
  });

  it("fails closed in production when no secret is configured", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.JWT_SECRET;
    expect(() => getAuthSecret()).toThrow("must be configured in production");
  });
});
