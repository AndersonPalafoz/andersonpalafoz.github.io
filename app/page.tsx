import { cookies } from "next/headers";
import { HomepageExperience } from "@/components/homepage-experience";
import { getCmsContent } from "@/lib/public-cms";

export const metadata = {
  title: "Anderson Palafoz | Professor de Inglês",
  description: "Aprenda inglês com Anderson Palafoz por meio de aulas e materiais autorais. Explore os cursos e converse diretamente sobre seus objetivos."
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  await getCmsContent("home", "hero_title", "Aprenda inglês com clareza, confiança e propósito.");
  const showCookieNotice = !cookieStore.get("site-cookie-consent")?.value;
  return <HomepageExperience showCookieNotice={showCookieNotice} />;
}
