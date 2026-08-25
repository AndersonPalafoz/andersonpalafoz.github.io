import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("security inactivity and dashboard avatar contracts", () => {
  it("only starts inactivity timers for authenticated sessions and reacts to preference changes", () => {
    const source = read("components/inactivity-monitor.tsx");
    expect(source).toContain("useSession");
    expect(source).toContain('status !== "authenticated"');
    expect(source).toContain('ap:inactivity-changed');
    expect(source).toContain('storage');
    expect(source).toContain('signOut({ callbackUrl: "/login?reason=inactivity" })');
  });

  it("persists the setting and notifies the monitor in the same tab", () => {
    const source = read("components/profile-inactivity-settings.tsx");
    expect(source).toContain('localStorage.setItem("ap_inactivity_minutes"');
    expect(source).toContain('new CustomEvent("ap:inactivity-changed")');
  });

  it("uses the uploaded profile avatar before falling back to session image or initials", () => {
    const source = read("app/dashboard/dashboard-shell.tsx");
    expect(source).toContain("avatarUrl || session?.user?.image");
    expect(source).toContain("onError={() => setAvatarLoadFailed(true)}");
    expect(source).toContain("getInitials(session?.user?.name)");
  });
});

export {};
