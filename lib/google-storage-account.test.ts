import { beforeEach, describe, expect, it } from "vitest";
import { getGoogleDriveStorageAccount } from "./google-drive-upload";

describe("Google Drive Dedicated Storage Account Configuration", () => {
  const original = process.env.GOOGLE_STORAGE_ACCOUNT;

  beforeEach(() => {
    delete process.env.GOOGLE_STORAGE_ACCOUNT;
  });

  it("usa a conta dedicada configurada como destino padrão", () => {
    expect(getGoogleDriveStorageAccount()).toBe("andersonpalafoznupel@gmail.com");
  });

  it("respeita explicitamente a conta dedicada configurada pelo ambiente", () => {
    process.env.GOOGLE_STORAGE_ACCOUNT = "andersonpalafoznupel@gmail.com";
    expect(getGoogleDriveStorageAccount()).toBe("andersonpalafoznupel@gmail.com");
    if (original) process.env.GOOGLE_STORAGE_ACCOUNT = original;
  });
});
