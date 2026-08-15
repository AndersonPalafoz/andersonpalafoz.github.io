import { getArticles, getMaterials } from "./db";

export async function getPublicArticles() {
  try {
    return {
      articles: await getArticles(),
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

export async function getPublicMaterials() {
  try {
    return {
      materials: await getMaterials(),
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
