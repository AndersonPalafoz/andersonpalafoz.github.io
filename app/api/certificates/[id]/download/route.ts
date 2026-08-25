import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { certificates, users } from "@/drizzle/schema";
import { authOptions } from "@/lib/auth";
import { canManageCourse, type AdminAuthSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { createSignedCertificateUrl } from "@/lib/learning-storage";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Faça login para baixar este certificado." }, { status: 401 });
    }

    const certificateId = Number((await params).id);
    if (!Number.isInteger(certificateId) || certificateId <= 0) {
      return NextResponse.json({ error: "Certificado inválido." }, { status: 400 });
    }

    const currentUser = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    if (!currentUser) {
      return NextResponse.json({ error: "Usuário autenticado não encontrado." }, { status: 403 });
    }

    const certificate = await db.query.certificates.findFirst({
      where: eq(certificates.id, certificateId),
    });
    if (!certificate) {
      return NextResponse.json({ error: "Certificado não encontrado." }, { status: 404 });
    }
    if (!certificate.signedPdfUrl) {
      return NextResponse.json({ error: "Este certificado ainda não possui um PDF assinado." }, { status: 404 });
    }

    const isOwner = certificate.userId === currentUser.id;
    const isGlobalAdmin = currentUser.email?.toLowerCase() === "palafozanderson@gmail.com" || currentUser.role === "admin";
    const canManage = !isOwner && currentUser.role === "professor"
      ? await canManageCourse({ user: { id: currentUser.id, email: currentUser.email, name: currentUser.name, role: currentUser.role } } as AdminAuthSession, certificate.courseId)
      : false;

    if (!isOwner && !isGlobalAdmin && !canManage) {
      return NextResponse.json({ error: "Você não tem permissão para baixar este certificado." }, { status: 403 });
    }

    const signedUrl = await createSignedCertificateUrl(certificate.signedPdfUrl);
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Erro ao gerar download do certificado assinado:", error);
    return NextResponse.json({ error: "Não foi possível preparar o download do certificado." }, { status: 500 });
  }
}
