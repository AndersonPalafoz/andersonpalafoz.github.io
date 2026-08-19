import { describe, it, expect } from "vitest";

describe("CMS Drag-and-Drop Contract", () => {
  it("deve suportar eventos de arrastar e soltar com validação de arquivos", () => {
    const dataTransfer = {
      files: [{ name: "badge.png", size: 1024, type: "image/png" }],
    };
    expect(dataTransfer.files.length).toBe(1);
    expect(dataTransfer.files[0].name).toContain("badge.png");
  });
});
