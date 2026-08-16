import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { desc } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminAuditLogs } from "@/drizzle/schema";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Acesso restrito ao super-admin." }, { status: 403 });
    }

    const activities = await db.query.adminAuditLogs.findMany({
      orderBy: [desc(adminAuditLogs.createdAt)],
      limit: 100,
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching admin activity:", error);
    return NextResponse.json({ error: "Não foi possível carregar o histórico." }, { status: 500 });
  }
}
