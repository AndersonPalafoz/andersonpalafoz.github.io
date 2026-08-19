import { beforeEach, describe, expect, it, vi } from "vitest";

const driveState = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
}));

vi.mock("googleapis", () => ({
  google: {
    auth: { OAuth2: vi.fn(() => ({ setCredentials: vi.fn() })) },
    drive: vi.fn(() => ({ files: { list: driveState.list, create: driveState.create } })),
  },
}));

import { uploadToGoogleDrive } from "./google-drive-upload";

describe("Google Drive real upload retry", () => {
  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = "client-id";
    process.env.GOOGLE_CLIENT_SECRET = "client-secret";
    process.env.GOOGLE_REFRESH_TOKEN = "refresh-token";
    driveState.list.mockReset();
    driveState.create.mockReset();
    driveState.list.mockResolvedValue({ data: { files: [{ id: "folder-1", name: "Anderson Palafoz Platform" }] } });
    driveState.create.mockResolvedValue({ data: { id: "file-1", webViewLink: "https://drive.google.com/file/d/file-1/view" } });
  });

  it("realiza o upload pelo cliente Google e retorna metadados reais", async () => {
    const fakeFile = new File(["conteúdo de teste didático"], "apostila.pdf", { type: "application/pdf" });
    const result = await uploadToGoogleDrive(fakeFile, "Anderson Palafoz Platform", "storage@gmail.com", 3);

    expect(result.fileId).toBe("file-1");
    expect(result.webViewLink).toContain("drive.google.com");
    expect(result.size).toBeGreaterThan(0);
    expect(result.account).toBe("storage@gmail.com");
    expect(result.attempts).toBe(1);
    expect(result.realUpload).toBe(true);
  });

  it("repete falhas transitórias com backoff e informa a tentativa final", async () => {
    driveState.list.mockRejectedValueOnce({ response: { status: 503 } });
    const fakeFile = new File(["retry"], "retry.txt", { type: "text/plain" });
    const result = await uploadToGoogleDrive(fakeFile, "Anderson Palafoz Platform", undefined, 2);

    expect(result.fileId).toBe("file-1");
    expect(result.attempts).toBe(2);
    expect(driveState.list).toHaveBeenCalledTimes(2);
  }, 5_000);

  it("não fabrica um ID quando as credenciais reais estão ausentes", async () => {
    const previous = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    };
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GOOGLE_REFRESH_TOKEN;

    await expect(uploadToGoogleDrive(new File(["x"], "sem-config.txt"))).rejects.toThrow("upload real");

    process.env.GOOGLE_CLIENT_ID = previous.clientId;
    process.env.GOOGLE_CLIENT_SECRET = previous.clientSecret;
    process.env.GOOGLE_REFRESH_TOKEN = previous.refreshToken;
  });
});
