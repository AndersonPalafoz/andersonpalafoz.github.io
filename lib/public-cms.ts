import { db } from "@/lib/db";
import { siteContentBlocks } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function getCmsContent(pageKey: string, sectionKey: string, fallback: string): Promise<string> {
  try {
    const block = await db.query.siteContentBlocks.findFirst({
      where: and(
        eq(siteContentBlocks.pageKey, pageKey),
        eq(siteContentBlocks.sectionKey, sectionKey),
        eq(siteContentBlocks.status, "published")
      ),
    });
    return block?.content ?? fallback;
  } catch {
    return fallback;
  }
}
