import { describe, it, expect } from "vitest";
import { uploadToGoogleDrive } from "./google-drive-upload";

describe("Google Drive Upload Retry & Resilience Mechanism", () => {
  it("deve realizar upload com sucesso e retornar metadados válidos incluindo tentativas", async () => {
    const fakeFile = new File(["conteúdo de teste didático"], "apostila.pdf", { type: "application/pdf" });
    const result = await uploadToGoogleDrive(fakeFile, "Anderson Palafoz Platform", "storage@gmail.com", 3);

    expect(result).toBeDefined();
    expect(result.fileId).toContain("gdrive_");
    expect(result.webViewLink).toContain("drive.google.com");
    expect(result.size).toBeGreaterThan(0);
    expect(result.account).toBe("storage@gmail.com");
    expect(result.attempts).toBeGreaterThan(0);
    expect(result.attempts).toBeLessThanOrEqual(3);
  });
});
