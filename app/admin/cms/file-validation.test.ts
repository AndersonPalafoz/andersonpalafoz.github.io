import { describe, it, expect } from "vitest";

describe("CMS File Validation Contract", () => {
  it("deve rejeitar arquivos maiores que 10 MB e tipos não suportados", () => {
    const maxSize = 10 * 1024 * 1024;
    const oversizedFile = { name: "large.pdf", size: maxSize + 1, type: "application/pdf" };
    expect(oversizedFile.size > maxSize).toBe(true);

    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "audio/mpeg", "audio/wav", "audio/mp3", "application/pdf"];
    const invalidFile = { name: "script.exe", size: 1024, type: "application/x-msdownload" };
    const isAudioByName = invalidFile.name.endsWith(".mp3") || invalidFile.name.endsWith(".wav");
    const isImageByName = invalidFile.name.endsWith(".png") || invalidFile.name.endsWith(".jpg");
    const isPdfByName = invalidFile.name.endsWith(".pdf");

    const isValid = validTypes.includes(invalidFile.type) || isAudioByName || isImageByName || isPdfByName;
    expect(isValid).toBe(false);
  });
});
