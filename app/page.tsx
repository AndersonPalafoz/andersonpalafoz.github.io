import { cookies } from "next/headers";
import { HomepageContentHighlights } from "@/components/homepage-content-highlights";
import { HomepageExperience } from "@/components/homepage-experience";
import { getPublicArticles, getPublicMaterials } from "@/lib/public-content";
import { getCmsContent } from "@/lib/public-cms";

export const metadata = {
  title: "Anderson Palafoz | Professor de Inglês",
  description: "Professor de inglês em Salvador. Conheça cursos, materiais autorais e artigos para estudar com clareza e conversar sobre seus objetivos."
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [cookieStore, cmsHeroTitle, publicArticles, publicMaterials] = await Promise.all([
    cookies(),
    getCmsContent("home", "hero_title", "Aprenda inglês com clareza, confiança e propósito."),
    getPublicArticles(3),
    getPublicMaterials(3),
  ]);
  const heroTitle = cmsHeroTitle.trim() || "Aprenda inglês com clareza, confiança e propósito.";
  const showCookieNotice = !cookieStore.get("site-cookie-consent")?.value;
  const articles = publicArticles.articles.map((article) => ({
    title: article.title,
    slug: article.slug,
    category: article.category,
    published: new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "America/Bahia" }).format(article.published!),
    readingTime: article.readingTime,
    excerpt: article.content?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) ?? "",
  }));
  const materials = publicMaterials.materials.map(({ id, title, description, category, level }) => ({
    id,
    title,
    description,
    category,
    level,
  }));

  return (
    <HomepageExperience showCookieNotice={showCookieNotice} heroTitle={heroTitle}>
      <HomepageContentHighlights articles={articles} materials={materials} />
    </HomepageExperience>
  );
}
