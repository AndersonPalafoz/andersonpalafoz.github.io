import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { and, asc, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { medalsCatalog, userMedals } from "@/drizzle/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404, headers: { "Cache-Control": "no-store" } });

  const rows = await db.select({
    id: medalsCatalog.id,
    code: medalsCatalog.code,
    title: medalsCatalog.title,
    description: medalsCatalog.description,
    icon: medalsCatalog.icon,
    category: medalsCatalog.category,
    requirement: medalsCatalog.requirement,
    awardedAt: userMedals.createdAt,
  })
    .from(medalsCatalog)
    .leftJoin(userMedals, and(eq(userMedals.medalCode, medalsCatalog.code), eq(userMedals.userId, user.id)))
    .orderBy(asc(medalsCatalog.category), asc(medalsCatalog.title));

  return NextResponse.json({ medals: rows.map((row) => ({ ...row, unlocked: Boolean(row.awardedAt) })) }, { headers: { "Cache-Control": "no-store" } });
}
