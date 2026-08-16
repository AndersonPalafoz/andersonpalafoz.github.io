import { describe, expect, it } from "vitest";
import { validateMediaImage } from "./media-image";

describe("educational image validation", () => {
  it("accepts supported image formats within the limit", () => {
    expect(validateMediaImage({ mimeType: "image/png", size: 1024 })).toEqual({ valid: true });
    expect(validateMediaImage({ mimeType: "image/webp", size: 10 * 1024 * 1024 })).toEqual({ valid: true });
  });

  it("rejects unsafe formats and oversized files", () => {
    expect(validateMediaImage({ mimeType: "image/svg+xml", size: 1024 }).valid).toBe(false);
    expect(validateMediaImage({ mimeType: "image/png", size: 10 * 1024 * 1024 + 1 }).error).toContain("10 MB");
  });
});
