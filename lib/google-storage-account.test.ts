import { describe, it, expect } from "vitest";
import { uploadToGoogleDrive } from "./google-drive-upload";

describe("Google Drive Dedicated Storage Account Configuration", () => {
  it("deve direcionar os arquivos para a conta dedicada andersonpalafoznupel@gmail.com", async () => {
    const fakeFile = new File(["teste de armazenamento dedicado"], "curso.mp4", { type: "video/mp4" });
    const result = await uploadToGoogleDrive(fakeFile);

    expect(result.account).toBe("andersonpalafoznupel@gmail.com");
  });
});
