import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { contactMessages } from "@/drizzle/schema";
import { eq, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "super_admin", "professor"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const unreadResult = await db.select({ count: count() }).from(contactMessages).where(eq(contactMessages.isRead, false));
    const totalResult = await db.select({ count: count() }).from(contactMessages);

    return NextResponse.json({
      unread: unreadResult[0]?.count || 0,
      total: totalResult[0]?.count || 0,
    });
  } catch (error) {
    console.error("Error fetching message count:", error);
    return NextResponse.json({ unread: 0, total: 0 });
  }
}
