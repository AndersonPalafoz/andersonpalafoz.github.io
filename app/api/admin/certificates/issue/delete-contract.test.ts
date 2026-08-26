import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("admin certificate deletion contract", () => {
  const route = readFileSync(
    join(process.cwd(), "app/api/admin/certificates/issue/route.ts"),
    "utf8",
  );
  const manager = readFileSync(
    join(process.cwd(), "components/certificate-standard-manager.tsx"),
    "utf8",
  );

  it("deletes every certificate status through the same database path and reports actual ids", () => {
    expect(route).toContain('export async function DELETE(request: NextRequest)');
    expect(route).toContain("existingCertificates");
    expect(route).toContain("await db.delete(certificates).where(inArray(certificates.id, existingIds))");
    expect(route).toContain("deletedIds: existingIds");
    expect(route).toContain('status: 404');
    expect(route).not.toContain("signatureType");
    expect(route).not.toContain("signedPdfUrl");
  });

  it("keeps a confirmation and success/error feedback in the admin UI", () => {
    expect(manager).toContain("confirm(");
    expect(manager).toContain("toast.success");
    expect(manager).toContain("toast.error");
    expect(manager).toContain("method: \"DELETE\"");
  });
});
