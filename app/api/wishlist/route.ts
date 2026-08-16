import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { wishlistItems } from "@/drizzle/schema";

function currentUserId(session: { user?: { id?: string | null } } | null) {
  const value = Number(session?.user?.id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function GET() {
  const userId = currentUserId(await getServerSession(authOptions));
  if (!userId) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  const items = await db.query.wishlistItems.findMany({ where: eq(wishlistItems.userId, userId), with: { course: true } });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const userId = currentUserId(await getServerSession(authOptions));
  if (!userId) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  const body = await request.json();
  const courseId = Number(body.courseId);
  if (!Number.isInteger(courseId) || courseId <= 0) return NextResponse.json({ error: "Curso inválido." }, { status: 400 });
  const existing = await db.query.wishlistItems.findFirst({ where: and(eq(wishlistItems.userId, userId), eq(wishlistItems.courseId, courseId)) });
  if (existing) return NextResponse.json({ item: existing });
  const [item] = await db.insert(wishlistItems).values({ userId, courseId }).returning();
  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(request: Request) {
  const userId = currentUserId(await getServerSession(authOptions));
  if (!userId) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const courseId = Number(searchParams.get("courseId"));
  if (!Number.isInteger(courseId) || courseId <= 0) return NextResponse.json({ error: "Curso inválido." }, { status: 400 });
  await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.courseId, courseId)));
  return NextResponse.json({ removed: true });
}
