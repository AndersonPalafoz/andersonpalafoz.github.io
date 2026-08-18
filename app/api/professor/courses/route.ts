import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const rows = await db.query.courses.findMany({ orderBy: (table, { desc }) => desc(table.updatedAt) });
  if (session.user.role === "admin") return NextResponse.json(rows);
  const teacher = session.user.email ? await db.query.users.findFirst({ where: eq(users.email, session.user.email) }) : null;
  return NextResponse.json(rows.filter((course) => course.instructor === "Anderson Palafoz" || course.instructor === teacher?.name));
}
