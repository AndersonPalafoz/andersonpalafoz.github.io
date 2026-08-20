import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db, restoreUser, softDeleteUser, deleteUserPermanently } from "@/lib/db";
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
      return NextResponse.json({ error: "Nenhum ID de usuário fornecido." }, { status: 400 });
    }

    const results = [];
    for (const id of ids) {
      if (action === "restore") {
        results.push(await restoreUser(id));
      } else if (action === "permanent_delete") {
        results.push(await deleteUserPermanently(id));
      } else if (action === "soft_delete") {
        results.push(await softDeleteUser(id));
      }
    }

    try {
      const actionLabel = action === "restore" ? "batch_restore_user" : action === "permanent_delete" ? "batch_permanent_delete_user" : "batch_soft_delete_user";
      await db.insert(adminActivityLogs).values({
        userId: admin.id || null,
        userEmail: admin.email || "palafozanderson@gmail.com",
        userName: admin.name || "Administrador",
        action: actionLabel,
        targetType: "user",
        targetIds: ids.join(","),
        details: `Executada operação em lote (${action}) em ${ids.length} usuário(s).`,
      });
    } catch (logErr) {
      console.error("Erro ao registrar log de auditoria de usuários:", logErr);
    }

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error("Erro em operação em lote de usuários:", error);
    return NextResponse.json({ error: "Falha ao processar operação em lote de usuários." }, { status: 500 });
  }
}
