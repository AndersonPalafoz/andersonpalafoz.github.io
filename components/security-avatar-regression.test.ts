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

  it("renders the server-provided avatar eagerly before hydration and keeps a per-user cache fallback", () => {
    const source = read("app/dashboard/dashboard-shell.tsx");
    const dashboardLayout = read("app/dashboard/layout.tsx");
    const adminLayout = read("app/admin/layout.tsx");
    const teacherLayout = read("app/professor/layout.tsx");
    const avatarStorage = read("lib/avatar.ts");
    expect(source).toContain("initialAvatarUrl");
    expect(source).toContain("AVATAR_CACHE_KEY_PREFIX");
    expect(source).toContain("session.user?.avatarUrl || session.user?.image");
    expect(source).toContain("avatarLoading");
    expect(source).toContain("animate-pulse bg-slate-200");
    expect(source).toContain('fetchPriority="high"');
    expect(source).toContain('loading="eager"');
    expect(source).toContain("onLoad={() => setAvatarLoading(false)}");
    expect(source).toContain("getInitials(session?.user?.name)");
    for (const layout of [dashboardLayout, adminLayout, teacherLayout]) {
      expect(layout).toContain("initialAvatarUrl={session.user.avatarUrl || session.user.image || null}");
    }
    expect(avatarStorage).toContain('cacheControl: "31536000"');
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
