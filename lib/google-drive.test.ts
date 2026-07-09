import { describe, it, expect } from "vitest";
import {
  extractGoogleDriveFileId,
  getGoogleDrivePreviewUrl,
  getGoogleDriveExportUrl,
  isValidGoogleDriveUrl,
  getGoogleDriveEmbedUrl,
  normalizeGoogleDriveUrl,
} from "./google-drive";

describe("Google Drive Helper Functions", () => {
  describe("extractGoogleDriveFileId", () => {
    it("should extract ID from /file/d/ID/view URL", () => {
      const url = "https://drive.google.com/file/d/1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O/view";
      expect(extractGoogleDriveFileId(url)).toBe("1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O");
    });

    it("should extract ID from ?id= URL", () => {
      const url = "https://drive.google.com/open?id=1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O";
      expect(extractGoogleDriveFileId(url)).toBe("1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O");
    });

    it("should recognize raw file ID", () => {
      const id = "1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O";
      expect(extractGoogleDriveFileId(id)).toBe(id);
    });

    it("should return null for invalid URL", () => {
      const url = "https://example.com";
      expect(extractGoogleDriveFileId(url)).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(extractGoogleDriveFileId("")).toBeNull();
    });

    it("should validate ID format (20+ alphanumeric with - and _)", () => {
      const validId = "1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O";
      expect(extractGoogleDriveFileId(validId)).toBe(validId);

      const invalidId = "short";
      expect(extractGoogleDriveFileId(invalidId)).toBeNull();
    });
  });

  describe("getGoogleDrivePreviewUrl", () => {
    it("should generate correct preview URL", () => {
      const id = "1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O";
      const expected = "https://drive.google.com/file/d/1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O/preview";
      expect(getGoogleDrivePreviewUrl(id)).toBe(expected);
    });
  });

  describe("getGoogleDriveExportUrl", () => {
    const id = "1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O";

    it("should generate PDF export URL by default", () => {
      const url = getGoogleDriveExportUrl(id);
      expect(url).toContain("/export");
      expect(url).toContain("application%2Fpdf");
    });

    it("should generate DOCX export URL", () => {
      const url = getGoogleDriveExportUrl(id, "docx");
      expect(url).toContain("/export");
      expect(url).toContain("mimeType=");
    });

    it("should generate XLSX export URL", () => {
      const url = getGoogleDriveExportUrl(id, "xlsx");
      expect(url).toContain("/export");
      expect(url).toContain("mimeType=");
    });

    it("should generate PPTX export URL", () => {
      const url = getGoogleDriveExportUrl(id, "pptx");
      expect(url).toContain("/export");
      expect(url).toContain("mimeType=");
    });
  });

  describe("isValidGoogleDriveUrl", () => {
    it("should validate correct Google Drive URL", () => {
      expect(isValidGoogleDriveUrl("https://drive.google.com/file/d/1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O/view")).toBe(true);
      expect(isValidGoogleDriveUrl("https://drive.google.com/open?id=1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O")).toBe(true);
      expect(isValidGoogleDriveUrl("1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O")).toBe(true);
    });

    it("should reject invalid URL", () => {
      expect(isValidGoogleDriveUrl("https://example.com")).toBe(false);
      expect(isValidGoogleDriveUrl("invalid")).toBe(false);
      expect(isValidGoogleDriveUrl("")).toBe(false);
    });
  });

  describe("getGoogleDriveEmbedUrl", () => {
    it("should generate embed URL", () => {
      const id = "1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O";
      const expected = "https://drive.google.com/file/d/1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O/preview";
      expect(getGoogleDriveEmbedUrl(id)).toBe(expected);
    });
  });

  describe("normalizeGoogleDriveUrl", () => {
    it("should normalize various URL formats to preview URL", () => {
      const expected = "https://drive.google.com/file/d/1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O/preview";
      expect(normalizeGoogleDriveUrl("https://drive.google.com/file/d/1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O/view")).toBe(expected);
      expect(normalizeGoogleDriveUrl("1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O")).toBe(expected);
    });

    it("should return null for invalid URL", () => {
      expect(normalizeGoogleDriveUrl("https://example.com")).toBeNull();
      expect(normalizeGoogleDriveUrl("")).toBeNull();
    });
  });

  describe("File ID Format Validation", () => {
    it("should validate Google Drive file ID format", () => {
      const validId = "1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O";
      expect(/^[a-zA-Z0-9_-]{20,}$/.test(validId)).toBe(true);
    });

    it("should reject short IDs", () => {
      const shortId = "abc123";
      expect(/^[a-zA-Z0-9_-]{20,}$/.test(shortId)).toBe(false);
    });
  });

  describe("URL Pattern Matching", () => {
    it("should match various Google Drive URL patterns", () => {
      const patterns = [
        "https://drive.google.com/file/d/1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O/view",
        "https://drive.google.com/open?id=1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O",
      ];

      patterns.forEach((pattern) => {
        expect(isValidGoogleDriveUrl(pattern)).toBe(true);
      });
    });
  });

  describe("Export Format Support", () => {
    const id = "1BxiMVs0XRA5nsoKWoNEAqBiJiyptP-p_O";

    it("should support all export formats", () => {
      const formats = ["pdf", "docx", "xlsx", "pptx"] as const;
      formats.forEach((format) => {
        const url = getGoogleDriveExportUrl(id, format);
        expect(url).toContain("/export");
        expect(url).toContain("mimeType=");
      });
    });
  });
});
