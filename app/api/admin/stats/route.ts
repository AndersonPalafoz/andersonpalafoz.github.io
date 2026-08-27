import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getAdminCommerceStats, getAdminStats } from "@/lib/db";
import { isSuperadmin } from "@/lib/role-capabilities";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase();
    const role = session?.user?.role;
    const isAuthorized = email === "palafozanderson@gmail.com" || role === "admin" || role === "super_admin" || role === "professor";

    if (!session?.user || !isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getAdminStats();
    const commerce = isSuperadmin({ email, role }) ? await getAdminCommerceStats() : null;
    return NextResponse.json({ ...stats, commerce });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
