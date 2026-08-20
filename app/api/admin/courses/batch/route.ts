import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db, restoreCourse, softDeleteCourse, deleteCourse } from "@/lib/db";
import { adminActivityLogs } from "@/drizzle/schema";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, ids } = body as { action: "restore" | "permanent_delete" | "soft_delete"; ids: number[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Nenhum ID de curso fornecido." }, { status: 400 });
    }

    const results = [];
    for (const id of ids) {
      if (action === "restore") {
        results.push(await restoreCourse(id));
      } else if (action === "permanent_delete") {
        results.push(await deleteCourse(id));
      } else if (action === "soft_delete") {
        results.push(await softDeleteCourse(id));
      }
    }

    // Registrar no log de atividades administrativas
    try {
      const actionLabel = action === "restore" ? "batch_restore" : action === "permanent_delete" ? "batch_permanent_delete" : "batch_soft_delete";
      await db.insert(adminActivityLogs).values({
        userId: admin.id || null,
        userEmail: admin.email || "palafozanderson@gmail.com",
        userName: admin.name || "Administrador",
        action: actionLabel,
        targetType: "course",
        targetIds: ids.join(","),
        details: `Executada operação em lote (${action}) em ${ids.length} curso(s).`,
      });
    } catch (logErr) {
      console.error("Erro ao registrar log de auditoria em lote:", logErr);
    }

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error("Erro em operação em lote de cursos:", error);
    return NextResponse.json({ error: "Falha ao processar operação em lote." }, { status: 500 });
  }
}
