import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { materialProgress } from "@/drizzle/schema";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ authenticated: false, completedMaterialIds: [] });
  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ authenticated: false, completedMaterialIds: [] });
  const rows = await db.select({ materialId: materialProgress.materialId }).from(materialProgress).where(eq(materialProgress.userId, user.id));
  return NextResponse.json({ authenticated: true, completedMaterialIds: rows.map((row) => row.materialId) });
}
