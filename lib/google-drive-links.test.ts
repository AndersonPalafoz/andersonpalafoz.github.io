import { describe, expect, it } from "vitest";
import { parseGoogleDriveLinks } from "@/lib/google-drive-links";

describe("parseGoogleDriveLinks", () => {
  it("aceita links HTTPS do Drive e do Docs", () => {
    expect(parseGoogleDriveLinks([
      "https://drive.google.com/file/d/abc/view",
      "https://docs.google.com/document/d/xyz/edit",
    ])).toEqual([
      "https://drive.google.com/file/d/abc/view",
      "https://docs.google.com/document/d/xyz/edit",
    ]);
  });

  it("aceita JSON ou texto separado por linhas e remove duplicados", () => {
    expect(parseGoogleDriveLinks(JSON.stringify([
      " https://drive.google.com/drive/folders/abc ",
      "https://drive.google.com/drive/folders/abc",
    ]))).toEqual(["https://drive.google.com/drive/folders/abc"]);

    expect(parseGoogleDriveLinks("https://docs.google.com/spreadsheets/d/abc/edit\nhttps://drive.google.com/file/d/def/view")).toHaveLength(2);
  });

  it("rejeita HTTP, hosts externos e valores não textuais", () => {
    expect(parseGoogleDriveLinks([
      "http://drive.google.com/file/d/abc/view",
      "https://example.com/material.pdf",
      "not-a-url",
      42,
      null,
    ])).toEqual([]);
  });
});
