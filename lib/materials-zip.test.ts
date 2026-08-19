import { describe, expect, it } from "vitest";
import { unzipSync } from "fflate";
import { createMaterialsZip, MAX_ZIP_ENTRIES, MAX_ZIP_INPUT_BYTES } from "./materials-zip";

describe("materials ZIP selection", () => {
  it("creates a ZIP only from the selected entries and normalizes duplicate names", () => {
    const zip = createMaterialsZip([
      { name: "Grammar: Present.pdf", data: new TextEncoder().encode("one") },
      { name: "Grammar: Present.pdf", data: new TextEncoder().encode("two") },
    ]);
    const files = unzipSync(zip);
    expect(Object.keys(files)).toEqual(["Grammar-Present.pdf", "Grammar-Present-2.pdf"]);
    expect(new TextDecoder().decode(files["Grammar-Present.pdf"])).toBe("one");
    expect(new TextDecoder().decode(files["Grammar-Present-2.pdf"])).toBe("two");
  });

  it("rejects an empty selection", () => {
    expect(() => createMaterialsZip([])).toThrow("Selecione pelo menos um material");
  });

  it("rejects more than the configured number of entries", () => {
    const entries = Array.from({ length: MAX_ZIP_ENTRIES + 1 }, (_, index) => ({
      name: `material-${index}.txt`,
      data: new Uint8Array([index % 255]),
    }));
    expect(() => createMaterialsZip(entries)).toThrow("no máximo");
  });

  it("rejects a selection that exceeds the input byte limit", () => {
    const oversized = new Uint8Array(MAX_ZIP_INPUT_BYTES + 1);
    expect(() => createMaterialsZip([{ name: "oversized.bin", data: oversized }])).toThrow("40 MB");
  });
});
