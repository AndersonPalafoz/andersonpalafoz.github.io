import { describe, expect, it } from "vitest";
import { hashPassword, isPasswordAcceptable, verifyPassword } from "./password";

describe("password security", () => {
  it("hashes and verifies a valid password without storing plaintext", () => {
    const password = "English123";
    const stored = hashPassword(password);
    expect(stored).not.toContain(password);
    expect(verifyPassword(password, stored)).toBe(true);
    expect(verifyPassword("Wrong123", stored)).toBe(false);
  });

  it("requires length, letters and numbers", () => {
    expect(isPasswordAcceptable("short1")).toBe(false);
    expect(isPasswordAcceptable("abcdefgh")).toBe(false);
    expect(isPasswordAcceptable("English123")).toBe(true);
  });
});
