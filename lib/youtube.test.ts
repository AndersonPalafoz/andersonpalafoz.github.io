import { describe, it, expect } from "vitest";
import {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
  isValidYouTubeUrl,
  normalizeYouTubeUrl,
} from "./youtube";

describe("YouTube Helper Functions", () => {
  describe("extractYouTubeId", () => {
    it("should extract ID from youtube.com/watch?v= URL", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      expect(extractYouTubeId(url)).toBe("dQw4w9WgXcQ");
    });

    it("should extract ID from youtu.be URL", () => {
      const url = "https://youtu.be/dQw4w9WgXcQ";
      expect(extractYouTubeId(url)).toBe("dQw4w9WgXcQ");
    });

    it("should extract ID from youtube.com/embed/ URL", () => {
      const url = "https://www.youtube.com/embed/dQw4w9WgXcQ";
      expect(extractYouTubeId(url)).toBe("dQw4w9WgXcQ");
    });

    it("should extract ID from youtube.com/v/ URL", () => {
      const url = "https://www.youtube.com/v/dQw4w9WgXcQ";
      expect(extractYouTubeId(url)).toBe("dQw4w9WgXcQ");
    });

    it("should recognize raw video ID", () => {
      const id = "dQw4w9WgXcQ";
      expect(extractYouTubeId(id)).toBe("dQw4w9WgXcQ");
    });

    it("should handle URL with additional parameters", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s";
      expect(extractYouTubeId(url)).toBe("dQw4w9WgXcQ");
    });

    it("should return null for invalid URL", () => {
      const url = "https://example.com";
      expect(extractYouTubeId(url)).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(extractYouTubeId("")).toBeNull();
    });

    it("should validate ID format (11 alphanumeric with - and _)", () => {
      const validId = "dQw4w9WgXcQ";
      expect(extractYouTubeId(validId)).toBe(validId);

      const invalidId = "short";
      expect(extractYouTubeId(invalidId)).toBeNull();
    });
  });

  describe("getYouTubeEmbedUrl", () => {
    it("should generate correct embed URL", () => {
      const id = "dQw4w9WgXcQ";
      const expected = "https://www.youtube.com/embed/dQw4w9WgXcQ";
      expect(getYouTubeEmbedUrl(id)).toBe(expected);
    });
  });

  describe("getYouTubeThumbnail", () => {
    it("should generate high quality thumbnail by default", () => {
      const id = "dQw4w9WgXcQ";
      const expected = "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg";
      expect(getYouTubeThumbnail(id)).toBe(expected);
    });

    it("should generate default thumbnail", () => {
      const id = "dQw4w9WgXcQ";
      const expected = "https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg";
      expect(getYouTubeThumbnail(id, "default")).toBe(expected);
    });

    it("should generate medium thumbnail", () => {
      const id = "dQw4w9WgXcQ";
      const expected = "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg";
      expect(getYouTubeThumbnail(id, "medium")).toBe(expected);
    });

    it("should generate maxres thumbnail", () => {
      const id = "dQw4w9WgXcQ";
      const expected = "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg";
      expect(getYouTubeThumbnail(id, "maxres")).toBe(expected);
    });
  });

  describe("isValidYouTubeUrl", () => {
    it("should validate correct YouTube URL", () => {
      expect(isValidYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
      expect(isValidYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
      expect(isValidYouTubeUrl("dQw4w9WgXcQ")).toBe(true);
    });

    it("should reject invalid URL", () => {
      expect(isValidYouTubeUrl("https://example.com")).toBe(false);
      expect(isValidYouTubeUrl("invalid")).toBe(false);
      expect(isValidYouTubeUrl("")).toBe(false);
    });
  });

  describe("normalizeYouTubeUrl", () => {
    it("should normalize various URL formats to embed URL", () => {
      const expected = "https://www.youtube.com/embed/dQw4w9WgXcQ";
      expect(normalizeYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(expected);
      expect(normalizeYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(expected);
      expect(normalizeYouTubeUrl("dQw4w9WgXcQ")).toBe(expected);
    });

    it("should return null for invalid URL", () => {
      expect(normalizeYouTubeUrl("https://example.com")).toBeNull();
      expect(normalizeYouTubeUrl("")).toBeNull();
    });
  });
});
