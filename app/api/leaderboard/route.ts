import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const rawData = await db.execute(sql`
      SELECT 
        u.id as userId,
        u.name,
        COALESCE(g.totalXp, 0) as totalXp,
        COALESCE(g.streakDays, 0) as streakDays,
        COUNT(m.id) as medalsCount
      FROM users u
      LEFT JOIN user_gamification_points g ON u.id = g.userId
      LEFT JOIN user_medals m ON u.id = m.userId
      WHERE u.role != 'admin' AND u.deletedAt IS NULL
      GROUP BY u.id, u.name, g.totalXp, g.streakDays
      ORDER BY totalXp DESC
      LIMIT 20
    `);

    // @ts-ignore
    const rows = rawData[0] || rawData;

    const leaderboard = (Array.isArray(rows) ? rows : []).map((item: any, index: number) => ({
      rank: index + 1,
      name: item.name || "Estudante",
      totalXp: Number(item.totalXp || 0),
      streakDays: Number(item.streakDays || 0),
      medalsCount: Number(item.medalsCount || 0),
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Falha ao carregar ranking" }, { status: 500 });
  }
}
