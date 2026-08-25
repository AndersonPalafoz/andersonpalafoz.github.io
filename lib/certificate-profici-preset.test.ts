import { describe, expect, it } from "vitest";
import { createProficiCertificateElements } from "./certificate-element-presets";

describe("PROFICI certificate preset", () => {
  it("contains the extracted institutional layers and dynamic fields", () => {
    const elements = createProficiCertificateElements();
    expect(elements).toHaveLength(13);
    expect(elements.find(element => element.id.startsWith("profici-crest_"))?.content).toContain("ufba-crest");
    expect(elements.find(element => element.id.startsWith("profici-header_"))?.content).toContain("image4-reference");
    expect(elements.find(element => element.id.startsWith("profici-signature_"))?.content).toContain("profici-wordmark");
    expect(elements.some(element => element.content.includes("{{level}}"))).toBe(true);
    expect(elements.some(element => element.content.includes("{{period}}"))).toBe(true);
    expect(elements.some(element => element.content.includes("{{workloadHours}}"))).toBe(true);
  });
});
