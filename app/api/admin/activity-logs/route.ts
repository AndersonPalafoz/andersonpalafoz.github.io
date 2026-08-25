import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { adminActivityLogs } from "@/drizzle/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });

    const logs = await db
      .select()
      .from(adminActivityLogs)
      .orderBy(desc(adminActivityLogs.createdAt))
      .limit(100);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Erro ao carregar logs administrativos:", error);
    return NextResponse.json({ error: "Não foi possível carregar os logs administrativos." }, { status: 500 });
  }
}
