import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { materialProgress, materials } from "@/drizzle/schema";

async function currentUser() {
  const session = await getServerSession(authOptions);
  return session?.user?.email ? getUserByEmail(session.user.email) : null;
}

function materialIdFrom(params: { id: string }) {
  const value = Number(params.id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const materialId = materialIdFrom(await context.params);
  const user = await currentUser();
  if (!materialId) return NextResponse.json({ error: "Material inválido." }, { status: 400 });
  if (!user) return NextResponse.json({ completed: false, authenticated: false });
  const progress = await db.query.materialProgress.findFirst({ where: and(eq(materialProgress.userId, user.id), eq(materialProgress.materialId, materialId)) });
  return NextResponse.json({ completed: Boolean(progress?.completed), progress: progress || null, authenticated: true });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const materialId = materialIdFrom(await context.params);
  const user = await currentUser();
  if (!materialId || !user) return NextResponse.json({ error: "Autenticação e material válidos são necessários." }, { status: 401 });
  const material = await db.query.materials.findFirst({ where: eq(materials.id, materialId) });
  if (!material) return NextResponse.json({ error: "Material não encontrado." }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const completed = body.completed !== false;
  const record = (await db.insert(materialProgress).values({ userId: user.id, materialId, completed, completedAt: completed ? new Date() : null, updatedAt: new Date() }).onConflictDoUpdate({ target: [materialProgress.userId, materialProgress.materialId], set: { completed, completedAt: completed ? new Date() : null, updatedAt: new Date() } }).returning())[0];
  return NextResponse.json({ success: true, progress: record, completed });
}
