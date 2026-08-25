import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { lessonProgress, userActivityProgress } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { calculateStreakDays } from "@/lib/gamification";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ streakDays: 0, recentDays: [] }, { headers: { "Cache-Control": "no-store" } });
    }
    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ streakDays: 0, recentDays: [] }, { headers: { "Cache-Control": "no-store" } });
    }

    const [lessons, activities] = await Promise.all([
      db.select({ updatedAt: lessonProgress.updatedAt }).from(lessonProgress).where(eq(lessonProgress.userId, user.id)),
      db.select({ submittedAt: userActivityProgress.submittedAt }).from(userActivityProgress).where(eq(userActivityProgress.userId, user.id)),
    ]);

    const dates: Date[] = [
      ...lessons.map((l) => new Date(l.updatedAt)),
      ...activities.map((a) => new Date(a.submittedAt || 0)),
    ].filter((d) => !isNaN(d.getTime()));

    const streakDays = calculateStreakDays(dates);

    // Gerar últimos 7 dias para o calendário visual do popover
    const today = new Date();
    const recentDays = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - (6 - i));
      const dateKey = d.toISOString().slice(0, 10);
      const active = dates.some((dt) => dt.toISOString().slice(0, 10) === dateKey);
      return {
        dateKey,
        dayLabel: d.toLocaleDateString("pt-BR", { weekday: "narrow", day: "numeric", timeZone: "UTC" }),
        active,
      };
    });

    return NextResponse.json({ streakDays, recentDays }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Erro ao buscar streak de ofensiva:", error);
    return NextResponse.json({ streakDays: 0, recentDays: [] }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
