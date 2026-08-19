import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { teacherZipExports, users } from "@/drizzle/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (!session?.user || (role !== "professor" && role !== "admin")) {
      return NextResponse.json({ error: "Acesso restrito a professores e administradores." }, { status: 403 });
    }

    const dbUser = await db.query.users.findFirst({
      where: and(eq(users.email, session.user.email ?? ""), isNull(users.deletedAt)),
    });
    if (!dbUser) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const exportsList = await db
      .select({
        id: teacherZipExports.id,
        filename: teacherZipExports.filename,
        materialCount: teacherZipExports.materialCount,
        totalBytes: teacherZipExports.totalBytes,
        createdAt: teacherZipExports.createdAt,
      })
      .from(teacherZipExports)
      .where(eq(teacherZipExports.userId, dbUser.id))
      .orderBy(desc(teacherZipExports.createdAt))
      .limit(500);

    const headers = ["ID", "Nome do Arquivo", "Quantidade de Materiais", "Tamanho (Bytes)", "Data e Hora"];
    const rows = exportsList.map((item) => [
      item.id,
      `"${String(item.filename).replace(/"/g, '""')}"`,
      item.materialCount,
      item.totalBytes,
      `"${new Date(item.createdAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    // UTF-8 BOM for proper Excel rendering of Portuguese characters
    const bom = "\uFEFF";
    const body = bom + csvContent;

    const dateStr = new Date().toISOString().slice(0, 10);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="historico-exportacoes-zip-${dateStr}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Error exporting teacher ZIP history CSV:", error);
    return NextResponse.json({ error: "Não foi possível gerar o arquivo CSV." }, { status: 500 });
  }
}
