import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db, restoreMaterial, softDeleteMaterial, deleteMaterial } from "@/lib/db";
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
      return NextResponse.json({ error: "Nenhum ID de material fornecido." }, { status: 400 });
    }

    const results = [];
    for (const id of ids) {
      if (action === "restore") {
        results.push(await restoreMaterial(id));
      } else if (action === "permanent_delete") {
        results.push(await deleteMaterial(id));
      } else if (action === "soft_delete") {
        results.push(await softDeleteMaterial(id));
      }
    }

    try {
      const actionLabel = action === "restore" ? "batch_restore_material" : action === "permanent_delete" ? "batch_permanent_delete_material" : "batch_soft_delete_material";
      await db.insert(adminActivityLogs).values({
        userId: admin.id || null,
        userEmail: admin.email || "palafozanderson@gmail.com",
        userName: admin.name || "Administrador",
        action: actionLabel,
        targetType: "material",
        targetIds: ids.join(","),
        details: `Executada operação em lote (${action}) em ${ids.length} material(is).`,
      });
    } catch (logErr) {
      console.error("Erro ao registrar log de auditoria de materiais:", logErr);
    }

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error("Erro em operação em lote de materiais:", error);
    return NextResponse.json({ error: "Falha ao processar operação em lote de materiais." }, { status: 500 });
  }
}
