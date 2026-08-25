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
    expect(source).toContain("avatarLoading");
    expect(source).toContain("animate-pulse bg-slate-200");
    expect(source).toContain("onLoad={() => setAvatarLoading(false)}");
    expect(source).toContain("getInitials(session?.user?.name)");
  });
  it("uses the reusable confirmation dialog and success/error toasts for note deletion", () => {
    const studentPage = read("app/dashboard/anotacoes/page.tsx");
    const lessonPage = read("app/cursos/[id]/aulas/[lessonId]/page.tsx");
    const adminPage = read("app/admin/anotacoes/page.tsx");
    for (const source of [studentPage, lessonPage, adminPage]) {
      expect(source).toContain("ConfirmDialog");
      expect(source).toContain("toast.success");
      expect(source).toContain("toast.error");
      expect(source).not.toContain("window.confirm");
    }
  });
});

export {};
