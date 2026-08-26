import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const issueRoute = readFileSync(join(process.cwd(), "app/api/admin/certificates/issue/route.ts"), "utf8");
const notesStudentsRoute = readFileSync(join(process.cwd(), "app/api/admin/notes/students/route.ts"), "utf8");
const usersRoute = readFileSync(join(process.cwd(), "app/api/admin/users/route.ts"), "utf8");

describe("non-registered certificate recipient boundary", () => {
  it("persists an external recipient without inserting a user account", () => {
    expect(issueRoute).toContain("externalRecipient");
    expect(issueRoute).toContain("recipientName: externalRecipient?.name");
    expect(issueRoute).toContain("recipientEmail: externalRecipient?.email");
    expect(issueRoute).not.toContain('loginMethod: "manual_external"');
    expect(issueRoute).not.toContain("@external.placeholder");
  });

  it("excludes technical recipients from the notes student picker", () => {
    expect(notesStudentsRoute).toContain('ne(user.loginMethod, "manual_external")');
    expect(notesStudentsRoute).toContain('ilike(user.email, "%@external.placeholder")');
    expect(notesStudentsRoute).toContain("isNull(user.deletedAt)");
  });

  it("excludes technical recipients from the canonical admin user list", () => {
    expect(usersRoute).toContain('ne(users.loginMethod, "manual_external")');
    expect(usersRoute).toContain('ilike(users.email, "%@external.placeholder")');
  });
});

