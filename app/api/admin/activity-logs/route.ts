import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { adminActivityLogs } from "@/drizzle/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await db.select().from(adminActivityLogs).orderBy(desc(adminActivityLogs.createdAt)).limit(50);
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Erro ao buscar logs de atividades administrativas:", error);
    return NextResponse.json({ error: "Falha ao carregar registros de auditoria." }, { status: 500 });
  }
}
