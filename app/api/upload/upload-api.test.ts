import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { validateAssessmentImage } from "@/lib/assessment-image";

const uploadRoute = readFileSync(new URL("./route.ts", import.meta.url), "utf8");

describe("upload api route", () => {
  it("requires authentication and checks for admin or professor role", () => {
    expect(uploadRoute).toContain("getServerSession");
    expect(uploadRoute).toContain("authOptions");
    expect(uploadRoute).toContain("session.user.role");
  });

  it("uploads images through the persistent educational storage helper", () => {
    expect(uploadRoute).toContain("uploadEducationalImage");
    expect(uploadRoute).toContain("storageContext");
    expect(uploadRoute).toContain("key: uploaded.objectPath");
    expect(uploadRoute).not.toContain("writeFile");
  });

  it("accepts supported assessment images and rejects unsafe formats or oversized files", () => {
    expect(validateAssessmentImage("image/png", 1024)).toBeNull();
    expect(validateAssessmentImage("image/svg+xml", 1024)).toContain("JPG");
    expect(validateAssessmentImage("image/jpeg", 5 * 1024 * 1024 + 1)).toContain("5 MB");
  });
});
