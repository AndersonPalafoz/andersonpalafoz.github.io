import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";
import { and, lt, isNotNull } from "drizzle-orm";
import { sdk } from "@/server/_core/sdk";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await sdk.authenticateRequest(request);
    if (!user.isCron || !user.taskUid) {
      return NextResponse.json({ error: "Acesso restrito a tarefas agendadas (Heartbeat)." }, { status: 403 });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Limpeza automática de cursos expirados na lixeira
    const expiredCourses = await db
      .delete(schema.courses)
      .where(and(isNotNull(schema.courses.deletedAt), lt(schema.courses.deletedAt, thirtyDaysAgo)))
      .returning({ id: schema.courses.id });

    // Limpeza automática de materiais expirados na lixeira
    const expiredMaterials = await db
      .delete(schema.materials)
      .where(and(isNotNull(schema.materials.deletedAt), lt(schema.materials.deletedAt, thirtyDaysAgo)))
      .returning({ id: schema.materials.id });

    console.log(`[Trash Cleanup Cron] Removidos permanentemente: ${expiredCourses.length} cursos e ${expiredMaterials.length} materiais.`);

    return NextResponse.json({
      ok: true,
      deletedCourses: expiredCourses.length,
      deletedMaterials: expiredMaterials.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Trash Cleanup Cron Error]", error);
    return NextResponse.json(
      {
        error: error.message || "Erro interno ao executar limpeza da lixeira.",
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
