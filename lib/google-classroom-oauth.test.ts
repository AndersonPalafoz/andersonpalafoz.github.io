import { afterEach, describe, expect, it } from "vitest";
import {
  decryptClassroomToken,
  encryptClassroomToken,
  hasClassroomReadonlyScope,
  GOOGLE_CLASSROOM_READONLY_SCOPES,
} from "@/lib/google-classroom-crypto";

const previousAuthSecret = process.env.NEXTAUTH_SECRET;

afterEach(() => {
  if (previousAuthSecret === undefined) delete process.env.NEXTAUTH_SECRET;
  else process.env.NEXTAUTH_SECRET = previousAuthSecret;
});

describe("Google Classroom OAuth", () => {
  it("recognizes a required readonly scope", () => {
    expect(hasClassroomReadonlyScope(GOOGLE_CLASSROOM_READONLY_SCOPES[0])).toBe(true);
    expect(hasClassroomReadonlyScope("openid email profile")).toBe(false);
  });

  it("round-trips tokens without storing plaintext", () => {
    process.env.NEXTAUTH_SECRET = "test-secret";
    const token = "classroom-access-token";
    const encrypted = encryptClassroomToken(token);

    expect(encrypted).not.toContain(token);
    expect(decryptClassroomToken(encrypted)).toBe(token);
  });

  it("rejects malformed encrypted values", () => {
    expect(() => decryptClassroomToken("invalid-token")).toThrow("Formato de token Classroom inválido");
  });
});
