import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { and, eq, inArray } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { materials, savedMaterials } from "@/drizzle/schema";

function currentUserId(session: { user?: { id?: string | null } } | null) {
  const value = Number(session?.user?.id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function materialIdFrom(value: unknown) {
  const materialId = Number(value);
  return Number.isInteger(materialId) && materialId > 0 ? materialId : null;
}

export async function GET(request: Request) {
  const userId = currentUserId(await getServerSession(authOptions));
  if (!userId) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });

  const idsParam = new URL(request.url).searchParams.get("ids");
  const ids = idsParam?.split(",").map(materialIdFrom).filter((id): id is number => id !== null).slice(0, 30);
  const where = ids?.length ? and(eq(savedMaterials.userId, userId), inArray(savedMaterials.materialId, ids)) : eq(savedMaterials.userId, userId);
  const items = await db.query.savedMaterials.findMany({ where, with: { material: true } });
  return NextResponse.json({ materialIds: items.map((item) => item.materialId), items }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const userId = currentUserId(await getServerSession(authOptions));
  if (!userId) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const materialId = materialIdFrom(body?.materialId);
  if (!materialId) return NextResponse.json({ error: "Material inválido." }, { status: 400 });

  const material = await db.query.materials.findFirst({ where: and(eq(materials.id, materialId), eq(materials.isPublic, true)) });
  if (!material) return NextResponse.json({ error: "Material não encontrado ou indisponível." }, { status: 404 });
  const existing = await db.query.savedMaterials.findFirst({ where: and(eq(savedMaterials.userId, userId), eq(savedMaterials.materialId, materialId)) });
  if (existing) return NextResponse.json({ saved: true, materialId });
  await db.insert(savedMaterials).values({ userId, materialId });
  return NextResponse.json({ saved: true, materialId }, { status: 201 });
}

export async function DELETE(request: Request) {
  const userId = currentUserId(await getServerSession(authOptions));
  if (!userId) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  const materialId = materialIdFrom(new URL(request.url).searchParams.get("materialId"));
  if (!materialId) return NextResponse.json({ error: "Material inválido." }, { status: 400 });
  await db.delete(savedMaterials).where(and(eq(savedMaterials.userId, userId), eq(savedMaterials.materialId, materialId)));
  return NextResponse.json({ saved: false, materialId });
}
