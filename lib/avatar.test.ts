import { describe, expect, it } from "vitest";
import { AVATAR_MAX_BYTES, validateAvatarInput } from "./avatar";

describe("avatar validation", () => {
  it("accepts supported image formats under the size limit", () => {
    expect(validateAvatarInput({ mimeType: "image/jpeg", size: 120_000 })).toEqual({ valid: true });
    expect(validateAvatarInput({ mimeType: "image/png", size: AVATAR_MAX_BYTES })).toEqual({ valid: true });
    expect(validateAvatarInput({ mimeType: "image/webp", size: 500_000 })).toEqual({ valid: true });
  });

  it("rejects unsupported formats", () => {
    const result = validateAvatarInput({ mimeType: "image/svg+xml", size: 20_000 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("JPG");
  });

  it("rejects files larger than 2 MB or empty files", () => {
    expect(validateAvatarInput({ mimeType: "image/png", size: AVATAR_MAX_BYTES + 1 }).valid).toBe(false);
    expect(validateAvatarInput({ mimeType: "image/png", size: 0 }).valid).toBe(false);
  });
});
