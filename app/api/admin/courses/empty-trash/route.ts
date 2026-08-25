import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db, getTrashCourses, deleteCourse } from "@/lib/db";
import { adminActivityLogs } from "@/drizzle/schema";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = admin.user.email?.toLowerCase();
    const isGlobal = email === "palafozanderson@gmail.com" || admin.user.role === "admin" || admin.user.role === "super_admin";
    const instructorFilter = !isGlobal ? admin.user.name || email : null;

    const trashCourses = await getTrashCourses(instructorFilter);
    if (!trashCourses || trashCourses.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "A lixeira já está vazia." });
    }

    const ids = trashCourses.map((c) => c.id);
    for (const id of ids) {
      await deleteCourse(id);
    }

    try {
      await db.insert(adminActivityLogs).values({
        userId: admin.user.id || null,
        userEmail: admin.user.email || "palafozanderson@gmail.com",
        userName: admin.user.name || "Administrador",
        action: "empty_trash",
        targetType: "course",
        targetIds: ids.join(","),
        details: `Lixeira esvaziada completamente: ${ids.length} curso(s) excluído(s) permanentemente.`,
      });
    } catch (logErr) {
      console.error("Erro ao registrar log de auditoria ao esvaziar lixeira:", logErr);
    }

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error("Erro ao esvaziar lixeira:", error);
    return NextResponse.json({ error: "Falha ao esvaziar lixeira." }, { status: 500 });
  }
}
