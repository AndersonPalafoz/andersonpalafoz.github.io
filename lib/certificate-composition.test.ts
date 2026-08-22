import { describe, expect, it } from "vitest";
import { parseCertificateComposition, resolveCertificateText } from "./certificate-composition";
import { createCertificateElementPreset } from "./certificate-element-presets";

describe("certificate composition capabilities", () => {
  it("normalizes shape and advanced visual properties safely", () => {
    const composition = parseCertificateComposition({
      fieldMappings: {
        studentName: {
          x: 421,
          y: 355,
          size: 32,
          fontFamily: "serif",
          letterSpacing: 1.2,
        },
      },
      elements: [
        {
          id: "seal",
          type: "shape",
          content: "Selo",
          x: 720,
          y: 470,
          width: 80,
          height: 80,
          shape: "circle",
          fill: "#fef3c7",
          stroke: "#b45309",
          strokeWidth: 2,
          rotation: 24,
          opacity: 0.75,
          zIndex: 14,
        },
      ],
    });

    expect(composition.fieldMappings.studentName).toMatchObject({
      fontFamily: "serif",
      letterSpacing: 1.2,
    });
    expect(composition.elements[0]).toMatchObject({
      type: "shape",
      shape: "circle",
      fill: "#fef3c7",
      stroke: "#b45309",
      rotation: 24,
      opacity: 0.75,
    });
  });

  it("keeps template variables usable inside reusable element presets", () => {
    const element = createCertificateElementPreset("verification", 2);
    expect(element).not.toBeNull();
    expect(resolveCertificateText(element!.content, { certificateCode: "AP-2026-1234" })).toContain("AP-2026-1234");
  });
});
