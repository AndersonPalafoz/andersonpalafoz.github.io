import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { adminActivityLogs } from "@/drizzle/schema";
import { desc, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get("limit") || "15", 10);
    const offsetParam = parseInt(searchParams.get("offset") || "0", 10);

    const limit = isNaN(limitParam) ? 15 : Math.max(1, Math.min(100, limitParam));
    const offset = isNaN(offsetParam) ? 0 : Math.max(0, offsetParam);

    const [totalResult] = await db.select({ count: count() }).from(adminActivityLogs);
    const total = totalResult?.count || 0;

    const logs = await db
      .select()
      .from(adminActivityLogs)
      .orderBy(desc(adminActivityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + logs.length < total,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar logs de atividades administrativas:", error);
    return NextResponse.json({ error: "Falha ao carregar registros de auditoria." }, { status: 500 });
  }
}
