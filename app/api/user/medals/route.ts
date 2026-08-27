import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { medalsCatalog, userMedals } from "@/drizzle/schema";
import { PILOT_MEDALS } from "@/lib/medal-pilot-catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404, headers: { "Cache-Control": "no-store" } });

  const [storedCatalog, grants] = await Promise.all([
    db.select({
    id: medalsCatalog.id,
    code: medalsCatalog.code,
    title: medalsCatalog.title,
    description: medalsCatalog.description,
    icon: medalsCatalog.icon,
    category: medalsCatalog.category,
    requirement: medalsCatalog.requirement,
  })
      .from(medalsCatalog),
    db.select({ medalCode: userMedals.medalCode, awardedAt: userMedals.createdAt, grantType: userMedals.grantType, notes: userMedals.notes })
      .from(userMedals)
      .where(eq(userMedals.userId, user.id)),
  ]);

  const storedCodes = new Set(storedCatalog.map((medal) => medal.code));
  const grantsByCode = new Map(grants.map((grant) => [grant.medalCode, grant]));
  const catalog = [
    ...storedCatalog,
    ...PILOT_MEDALS.filter((medal) => !storedCodes.has(medal.code)).map((medal) => ({ ...medal, id: -1 })),
  ].sort((a, b) => a.category.localeCompare(b.category, "pt-BR") || a.title.localeCompare(b.title, "pt-BR"));

  return NextResponse.json({ medals: catalog.map((medal) => {
    const grant = grantsByCode.get(medal.code);
    return { ...medal, awardedAt: grant?.awardedAt ?? null, grantType: grant?.grantType ?? null, notes: grant?.notes ?? null, unlocked: Boolean(grant) };
  }) }, { headers: { "Cache-Control": "no-store" } });
}
