import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { eventLogs } from "@/drizzle/schema";
import { requireSuperAdmin } from "@/lib/admin-auth";

const EVENT_TYPES = ["login", "material_submission", "activity_complete", "course_enroll", "role_change", "legacy_fallback_read"] as const;
const MAX_LIMIT = 100;

function parseInteger(value: string | null, fallback: number) {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue >= 0 ? numberValue : fallback;
}

function parseDate(value: string | null, endOfDay = false) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) date.setUTCHours(23, 59, 59, 999);
  return date;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Acesso restrito ao superadministrador." }, { status: 403 });
    }

    const params = request.nextUrl.searchParams;
    const limit = Math.min(Math.max(parseInteger(params.get("limit"), 25) || 25, 1), MAX_LIMIT);
    const offset = parseInteger(params.get("offset"), 0);
    const eventType = params.get("eventType")?.trim() || "";
    const userSearch = params.get("userSearch")?.trim().slice(0, 120) || "";
    const from = parseDate(params.get("from"));
    const to = parseDate(params.get("to"), true);

    if (eventType && !EVENT_TYPES.includes(eventType as (typeof EVENT_TYPES)[number])) {
      return NextResponse.json({ error: "Tipo de evento inválido." }, { status: 400 });
    }
    if (params.get("from") && !from) return NextResponse.json({ error: "Data inicial inválida." }, { status: 400 });
    if (params.get("to") && !to) return NextResponse.json({ error: "Data final inválida." }, { status: 400 });

    const filters = [
      ...(eventType ? [eq(eventLogs.eventType, eventType as (typeof EVENT_TYPES)[number])] : []),
      ...(userSearch ? [ilike(eventLogs.userEmail, `%${userSearch}%`)] : []),
      ...(from ? [gte(eventLogs.createdAt, from)] : []),
      ...(to ? [lte(eventLogs.createdAt, to)] : []),
    ];
    const events = await db.query.eventLogs.findMany({
      where: filters.length ? and(...filters) : undefined,
      orderBy: [desc(eventLogs.createdAt)],
      limit,
      offset,
    });

    return NextResponse.json({ events, pagination: { limit, offset, hasMore: events.length === limit }, eventTypes: EVENT_TYPES, filters: { eventType, userSearch, from: params.get("from") || "", to: params.get("to") || "" } });
  } catch (error) {
    console.error("Error loading access audit logs:", error);
    return NextResponse.json({ error: "Não foi possível carregar os logs reais de acesso." }, { status: 500 });
  }
}
