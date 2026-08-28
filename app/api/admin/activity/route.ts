import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, desc, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminAuditLogs } from "@/drizzle/schema";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";

const ACTIONS = ["approve", "reject", "role_change", "soft_delete", "restore", "create"] as const;

function extractOfferId(details: string | null) {
  if (!details) return null;
  const match = details.match(/(?:offerId|oferta)\D+(\d+)/i);
  return match ? Number(match[1]) : null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Acesso restrito ao super-admin." }, { status: 403 });
    }

    const params = request.nextUrl.searchParams;
    const action = params.get("action")?.trim() || "";
    const parsedLimit = Number(params.get("limit"));
    const parsedOffset = Number(params.get("offset"));
    const limit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 25;
    const offset = Number.isInteger(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
    if (action && !ACTIONS.includes(action as (typeof ACTIONS)[number])) return NextResponse.json({ error: "Ação inválida." }, { status: 400 });

    const activities = await db.query.adminAuditLogs.findMany({
      where: action ? and(eq(adminAuditLogs.action, action as (typeof ACTIONS)[number])) : undefined,
      orderBy: [desc(adminAuditLogs.createdAt)],
      limit,
      offset,
    });

    const contextualActivities = activities.map((activity) => ({ ...activity, offerId: extractOfferId(activity.details) }));
    return NextResponse.json({ activities: contextualActivities, pagination: { limit, offset, hasMore: activities.length === limit }, actions: ACTIONS });
  } catch (error) {
    console.error("Error fetching admin activity:", error);
    return NextResponse.json({ error: "Não foi possível carregar o histórico." }, { status: 500 });
  }
}
