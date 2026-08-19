import { describe, expect, it } from "vitest";
import { strFromU8, unzipSync } from "fflate";
import {
  MAX_ZIP_ENTRIES,
  MAX_ZIP_SOURCE_BYTES,
  createMaterialsZip,
} from "./materials-zip";

describe("Materials ZIP export", () => {
  it("creates a valid ZIP with unique safe filenames", () => {
    const result = createMaterialsZip([
      { name: "Grammar: Week 1.pdf", data: new TextEncoder().encode("first") },
      { name: "Grammar: Week 1.pdf", data: new TextEncoder().encode("second") },
    ]);

    const files = unzipSync(result.data);
    expect(result.mimeType).toBe("application/zip");
    expect(result.entryCount).toBe(2);
    expect(Object.keys(files)).toEqual(["Grammar_ Week 1.pdf", "Grammar_ Week 1 (2).pdf"]);
    expect(strFromU8(files["Grammar_ Week 1.pdf"])).toBe("first");
    expect(strFromU8(files["Grammar_ Week 1 (2).pdf"])).toBe("second");
  });

  it("rejects empty selections and empty materials", () => {
    expect(() => createMaterialsZip([])).toThrow("pelo menos um material");
    expect(() => createMaterialsZip([{ name: "empty.pdf", data: new Uint8Array() }])).toThrow("está vazio");
  });

  it("enforces the entry and source-size limits", () => {
    const tooMany = Array.from({ length: MAX_ZIP_ENTRIES + 1 }, (_, index) => ({
      name: `material-${index}.txt`,
      data: new Uint8Array([index % 255]),
    }));
    expect(() => createMaterialsZip(tooMany)).toThrow("no máximo");

    const oversized = new Uint8Array(MAX_ZIP_SOURCE_BYTES + 1);
    expect(() => createMaterialsZip([{ name: "large.bin", data: oversized }])).toThrow("40 MB");
  });
});
