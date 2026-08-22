import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("./certificate-fabric-prototype.tsx", import.meta.url),
  "utf8"
);
const pdfSource = readFileSync(
  new URL("../lib/certificate-pdf-generator.ts", import.meta.url),
  "utf8"
);

describe("contrato do editor Fabric para elementos livres", () => {
  it("permite adicionar textos, badges, linhas e imagens", () => {
    expect(source).toContain("handleAddElement('text')");
    expect(source).toContain("handleAddElement('badge')");
    expect(source).toContain("handleAddElement('line')");
    expect(source).toContain("handleImageUpload");
    expect(source).toContain("accept=\"image/*\"");
  });

  it("mantém edição, arraste e remoção dos elementos na prancheta", () => {
    expect(source).toContain("handleUpdateElement");
    expect(source).toContain("handleElementDragEnd");
    expect(source).toContain("handleNewElementDragStart");
    expect(source).toContain("handleNewElementDrop");
    expect(source).toContain("handleUpdateElement");
    expect(source).toContain("handleRemoveElement");
    expect(source).toContain("artboardRef");
  });

  it("envia os elementos livres ao gerador PDF", () => {
    expect(source).toContain("additionalElements: extraElements");
    expect(pdfSource).toContain('type: \"text\" | \"badge\" | \"line\" | \"image\"');
    expect(pdfSource).toContain("options.additionalElements");
    expect(pdfSource).toContain("doc.addImage");
  });
});
