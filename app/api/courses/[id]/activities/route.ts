import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getActivities } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    const courseId = Number((await params).id);
    if (!Number.isInteger(courseId) || courseId <= 0) return NextResponse.json({ error: "Curso inválido." }, { status: 400 });
    return NextResponse.json({ activities: await getActivities(courseId) });
  } catch (error) {
    console.error("Error loading course activities:", error);
    return NextResponse.json({ error: "Não foi possível carregar as atividades." }, { status: 500 });
  }
}
