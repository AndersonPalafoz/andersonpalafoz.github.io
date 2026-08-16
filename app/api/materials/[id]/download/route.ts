import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { materials, users, coursePurchases, enrollments } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const materialId = Number(id);
    if (isNaN(materialId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const material = await db.query.materials.findFirst({
      where: eq(materials.id, materialId),
    });

    if (!material) {
      return NextResponse.json({ error: "Material não encontrado" }, { status: 404 });
    }

    // Se for público, permite o download direto
    if (material.isPublic) {
      await db.update(materials)
        .set({ downloads: (material.downloads || 0) + 1 })
        .where(eq(materials.id, materialId));

      return NextResponse.json({ success: true, fileUrl: material.fileUrl });
    }

    // Conteúdo Pago / Privado: Exige autenticação e autorização
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Acesso negado. Este é um conteúdo pago exclusivo. Faça login com uma conta autorizada ou adquira o curso." },
        { status: 403 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });
    }

    // Admins e professores aprovados têm acesso total
    if (user.role === "admin" || user.role === "professor") {
      await db.update(materials)
        .set({ downloads: (material.downloads || 0) + 1 })
        .where(eq(materials.id, materialId));

      return NextResponse.json({ success: true, fileUrl: material.fileUrl });
    }

    // Se o material estiver vinculado a um curso, verifica se o aluno comprou ou está matriculado
    if (material.courseId) {
      const hasPurchased = await db.query.coursePurchases.findFirst({
        where: and(
          eq(coursePurchases.userId, user.id),
          eq(coursePurchases.courseId, material.courseId)
        ),
      });

      const isEnrolled = await db.query.enrollments.findFirst({
        where: and(
          eq(enrollments.userId, user.id),
          eq(enrollments.courseId, material.courseId)
        ),
      });

      if (hasPurchased || isEnrolled) {
        await db.update(materials)
          .set({ downloads: (material.downloads || 0) + 1 })
          .where(eq(materials.id, materialId));

        return NextResponse.json({ success: true, fileUrl: material.fileUrl });
      }
    }

    return NextResponse.json(
      { error: "Acesso negado. Este conteúdo pago requer autorização do administrador ou aquisição do curso correspondente." },
      { status: 403 }
    );
  } catch (error) {
    console.error("Erro ao processar download seguro:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
