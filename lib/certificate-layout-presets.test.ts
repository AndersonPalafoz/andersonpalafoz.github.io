import { describe, expect, it } from "vitest";
import { DEFAULT_FIELD_MAPPINGS, type CertificateVisualVariant } from "@/lib/certificate-composition";
import {
  CERTIFICATE_VISUAL_VARIANT_LIST,
  getCertificateVisualVariant,
} from "@/lib/certificate-visual-variants";
import { getCertificateLayoutPreset } from "@/lib/certificate-layout-presets";

describe("certificate layout presets", () => {
  it("provides a complete, bounded composition for every visual model", () => {
    for (const variant of CERTIFICATE_VISUAL_VARIANT_LIST) {
      const preset = getCertificateLayoutPreset(variant.id);
      for (const key of Object.keys(DEFAULT_FIELD_MAPPINGS) as Array<keyof typeof DEFAULT_FIELD_MAPPINGS>) {
        const mapping = preset[key];
        expect(mapping, `${variant.id}.${key}`).toBeDefined();
        expect(mapping!.x).toBeGreaterThanOrEqual(0);
        expect(mapping!.x).toBeLessThanOrEqual(842);
        expect(mapping!.y).toBeGreaterThanOrEqual(0);
        expect(mapping!.y).toBeLessThanOrEqual(595);
        expect(mapping!.size).toBeGreaterThanOrEqual(6);
        expect(mapping!.size).toBeLessThanOrEqual(96);
      }
    }
  });

  it("keeps the new models serializable through the unified contract", () => {
    const variants: CertificateVisualVariant[] = ["laureate", "botanical", "geometric", "midnight"];
    expect(variants.map(getCertificateVisualVariant)).toHaveLength(4);
    expect(variants.every(variant => getCertificateVisualVariant(variant).id === variant)).toBe(true);
  });
});
