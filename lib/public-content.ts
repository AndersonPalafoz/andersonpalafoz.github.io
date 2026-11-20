import { and, desc, eq, isNotNull, isNull, lte } from "drizzle-orm";
import { articles, materials } from "@/drizzle/schema";
import { db } from "./db";

export async function getPublicArticles(limit?: number) {
  try {
    const publishedBefore = new Date();
    const rows = await db.query.articles.findMany({
      where: and(
        isNull(articles.deletedAt),
        isNotNull(articles.published),
        lte(articles.published, publishedBefore),
      ),
      orderBy: desc(articles.published),
      ...(limit ? { limit } : {}),
    });

    return {
      articles: rows,
      available: true as const,
    };
  } catch (error) {
    console.info("Public articles are temporarily unavailable:", error);

    return {
      articles: [],
      available: false as const,
    };
  }
}

export async function getPublicMaterials(limit?: number) {
  try {
    const rows = await db.query.materials.findMany({
      where: and(eq(materials.isPublic, true), isNull(materials.deletedAt)),
      orderBy: desc(materials.createdAt),
      ...(limit ? { limit } : {}),
    });

    return {
      materials: rows,
      available: true as const,
    };
  } catch (error) {
    console.info("Public materials are temporarily unavailable:", error);

    return {
      materials: [],
      available: false as const,
    };
  }
}
