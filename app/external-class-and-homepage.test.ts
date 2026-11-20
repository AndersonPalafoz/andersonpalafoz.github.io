import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

describe("external class deletion safeguards", () => {
  const page = read("app/professor/turmas-externas/page.tsx");
  const route = read("app/api/professor/external-classes/route.ts");

  it("opens an accessible confirmation dialog before issuing the destructive request", () => {
    expect(page).toContain("classPendingDeletion");
    expect(page).toContain('role="dialog"');
    expect(page).toContain('aria-modal="true"');
    expect(page).toContain("aria-labelledby=\"delete-external-class-title\"");
    expect(page).toContain("Excluir definitivamente");
    expect(page).toContain("onClick={() => handleDeleteClass(cls.id)}");
    const deletionHandler = page.slice(page.indexOf("const handleDeleteClass"), page.indexOf("const handleSaveStudent"));
    expect(deletionHandler).not.toContain("window.confirm(");
  });

  it("keeps server-side ownership and trash/permanent deletion for external classes", () => {
    expect(route).toContain('action === "deleteClass"');
    expect(route).toContain('action === "restoreClass"');
    expect(route).toContain('action === "permanentDeleteClass"');
    expect(route).toContain("const canManageClass = (classId: number, ownerId: number)");
    expect(route).toContain("ownerId === teacher.id || delegatedClassIds.has(classId)");
    expect(route).toContain("deletedAt");
  });
});

describe("homepage content contract", () => {
  const page = read("app/page.tsx");
  const experience = read("components/homepage-experience.tsx");
  const hero = read("components/homepage-hero.tsx");
  const credibility = read("components/homepage-credibility-strip.tsx");
  const footer = read("components/footer.tsx");

  it("passes published CMS hero copy to the client component and keeps a fallback", () => {
    expect(page).toContain('getCmsContent("home", "hero_title"');
    expect(page).toContain("heroTitle={heroTitle}");
    expect(page).toContain('cmsHeroTitle.trim() || "Aprenda inglês com clareza, confiança e propósito."');
    expect(experience).toContain("<HomepageHero title={heroTitle} />");
    expect(hero).toContain("HomepageHero({ title }: { title: string })");
    expect(hero).toContain("{title}");
  });

  it("preserves readable contrast for the WhatsApp CTA in dark mode", () => {
    const styles = read("app/globals.css");
    expect(hero).toContain("homepage-hero-primary-cta");
    expect(styles).toContain(".dark .homepage .homepage-hero-primary-cta");
    expect(styles).toContain("background-color: #ffffff !important");
  });

  it("uses the Portuguese home label in the footer navigation", () => {
    expect(footer).toContain('["Início", "/"]');
    expect(footer).not.toContain('["Home", "/"]');
  });

  it("shows only verified academic and learning-scope claims", () => {
    expect(credibility).toContain("Professor de inglês licenciado");
    expect(credibility).toContain("Trajetória na UFBA");
    expect(credibility).toContain("Aulas do A1 ao B2; materiais de apoio até C1 e C2.");
  });
});
