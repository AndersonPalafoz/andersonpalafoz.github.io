import { describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { db, getAdminStats, getUserActivityProgress, getUserEnrollments } from "./db";

describe("Neon database connection", () => {
  it("uses a PostgreSQL DSN and answers a lightweight health query", async () => {
    const connectionString = process.env.NEON_DATABASE_URL;
    expect(connectionString).toMatch(/^postgres(?:ql)?:\/\//);

    const result = await db.execute(sql`select 1 as ok`);
    expect(result).toBeTruthy();

    const stats = await getAdminStats();
    expect(stats).toEqual(expect.objectContaining({
      totalCourses: expect.any(Number),
      totalMaterials: expect.any(Number),
      totalArticles: expect.any(Number),
      totalUsers: expect.any(Number),
      totalEnrollments: expect.any(Number),
    }));

    await expect(getUserEnrollments(-1)).resolves.toEqual([]);
    await expect(getUserActivityProgress(-1)).resolves.toEqual([]);
  }, 15_000);
});
