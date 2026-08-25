import { describe, expect, it } from "vitest";
import {
  parseCertificateComposition,
  serializeCertificateComposition,
} from "@/lib/certificate-composition";
import {
  CERTIFICATE_VISUAL_VARIANT_LIST,
  getCertificateVisualVariant,
} from "@/lib/certificate-visual-variants";

describe("certificate visual variants", () => {
  it("exposes the four institutional variants with distinct visual motifs", () => {
    const variantIds = CERTIFICATE_VISUAL_VARIANT_LIST.map(variant => variant.id);
    expect(variantIds).toEqual(expect.arrayContaining([
      "standard",
      "isf",
      "profici",
      "minimal",
    ]));
    expect(new Set(CERTIFICATE_VISUAL_VARIANT_LIST.map(variant => variant.motif)).size).toBeGreaterThanOrEqual(4);
    expect(CERTIFICATE_VISUAL_VARIANT_LIST.every(variant => /^#[0-9A-F]{6}$/i.test(variant.accent))).toBe(true);
  });

  it("falls back safely for an unknown variant", () => {
    expect(getCertificateVisualVariant("unknown").id).toBe("standard");
    expect(getCertificateVisualVariant(null).id).toBe("standard");
  });

  it("persists the selected variant through the unified composition contract", () => {
    const composition = parseCertificateComposition({
      visualVariant: "profici",
      fieldMappings: {},
      elements: [],
    });
    expect(composition.visualVariant).toBe("profici");

    const serialized = serializeCertificateComposition(composition);
    expect(JSON.parse(serialized).visualVariant).toBe("profici");

    expect(parseCertificateComposition({ visualVariant: "not-a-variant" }).visualVariant).toBe("standard");
  });
});
