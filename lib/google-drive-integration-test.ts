import { describe, it, expect } from "vitest";
import { uploadToGoogleDrive } from "./google-drive-upload";

describe("Google Drive Dedicated Account Integration", () => {
  it("deve executar o fluxo de upload apontando corretamente para andersonpalafoznupel@gmail.com", async () => {
    const fakeFile = new File(["test sample content"], "test-sample.txt", { type: "text/plain" });
    const result = await uploadToGoogleDrive(fakeFile, "Anderson Palafoz Platform", "andersonpalafoznupel@gmail.com");

    expect(result).toBeDefined();
    expect(result.account).toBe("andersonpalafoznupel@gmail.com");
    expect(result.fileId).toBeDefined();
    expect(result.webViewLink).toContain("drive.google.com");
    expect(result.size).toBeGreaterThan(0);
  });
});
