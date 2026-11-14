import { count } from "drizzle-orm";
import { HomepageExperience } from "@/components/homepage-experience";
import { getCmsContent } from "@/lib/public-cms";
import { db } from "@/lib/db";
import { lessons } from "@/drizzle/schema";

export const metadata = {
  title: "Anderson Palafoz | Professor de Inglês",
  description: "Aprenda inglês com clareza, confiança e propósito através de aulas e materiais autorais.",
};

export const dynamic = "force-dynamic";

async function getPublishedLessonCount() {
  try {
    const [result] = await db.select({ value: count() }).from(lessons);
    return Number(result?.value ?? 0);
  } catch {
    return 0;
  }
}

export default async function HomePage() {
  await getCmsContent("home", "hero_title", "Aprenda inglês com clareza, confiança e propósito.");
  const lessonCount = await getPublishedLessonCount();
  return <HomepageExperience lessonCount={lessonCount} />;
}
