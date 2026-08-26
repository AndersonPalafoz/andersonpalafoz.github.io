import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { and, eq, inArray } from "drizzle-orm";
import JSZip from "jszip";
import { authOptions } from "@/lib/auth";
import { canManageCourse, type AdminAuthSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { buildCertificatePdf } from "@/lib/certificate-pdf";
import { createSignedCertificateUrl } from "@/lib/learning-storage";
import { certificates, courses, users } from "@/drizzle/schema";

export const dynamic = "force-dynamic";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";

type BatchRequest = { certificateIds?: unknown };

type CertificateRow = {
  id: number;
  userId: number | null;
  level: string | null;
  certificateCode: string | null;
  issuedAt: Date | null;
  signedPdfUrl: string | null;
  certificateUrl: string | null;
  studentName: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  recipientCpf: string | null;
  courseTitle: string | null;
  workloadHours: number | null;
  courseId: number;
};

function normalizeIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map(item => (typeof item === "number" ? item : Number(item)))
        .filter(item => Number.isInteger(item) && item > 0),
    ),
  );
}

function isElevatedUser(user: { email?: string | null; role?: string | null }) {
  const email = user.email?.toLowerCase();
  return email === SUPER_ADMIN_EMAIL || user.role === "admin" || user.role === "super_admin";
}

async function readCertificates(ids: number[]): Promise<CertificateRow[]> {
  if (ids.length === 0) return [];
  return db
    .select({
      id: certificates.id,
      userId: certificates.userId,
      level: certificates.level,
      certificateCode: certificates.certificateCode,
      issuedAt: certificates.issuedAt,
      signedPdfUrl: certificates.signedPdfUrl,
      certificateUrl: certificates.certificateUrl,
      studentName: users.name,
      recipientName: certificates.recipientName,
      recipientEmail: certificates.recipientEmail,
      recipientCpf: certificates.recipientCpf,
      courseTitle: courses.title,
      workloadHours: courses.workloadHours,
      courseId: certificates.courseId,
    })
    .from(certificates)
    .leftJoin(users, eq(certificates.userId, users.id))
    .leftJoin(courses, eq(certificates.courseId, courses.id))
    .where(inArray(certificates.id, ids));
}

async function authorizeBatch(
  rows: CertificateRow[],
  currentUser: { id: number; email: string | null; role: string | null },
) {
  const elevated = isElevatedUser(currentUser);
  if (elevated) return true;

  for (const row of rows) {
    if (row.userId === currentUser.id) continue;
    if (currentUser.role !== "professor") return false;
    const teacherSession = { user: currentUser } as AdminAuthSession;
    if (!(await canManageCourse(teacherSession, row.courseId))) return false;
  }
  return true;
}

async function buildZip(rows: CertificateRow[], fallbackStudentName: string) {
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const row of rows) {
    const title = row.courseTitle || "Curso";
    const studentName = row.studentName || row.recipientName || fallbackStudentName;
    const baseName = `Certificado_${title.replace(/[^a-zA-Z0-9À-ÿ]+/g, "_").replace(/^_+|_+$/g, "") || "Curso"}`;
    let fileName = `${baseName}_${row.id}.pdf`;
    let suffix = 2;
    while (usedNames.has(fileName)) fileName = `${baseName}_${row.id}_${suffix++}.pdf`;
    usedNames.add(fileName);

    let pdfBytes: Uint8Array;
    if (row.signedPdfUrl) {
      const signedUrl = await createSignedCertificateUrl(row.signedPdfUrl);
      const response = await fetch(signedUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`Não foi possível obter o PDF assinado do certificado ${row.id}.`);
      pdfBytes = new Uint8Array(await response.arrayBuffer());
    } else {
      pdfBytes = await buildCertificatePdf({
        studentName: studentName || "Aluno",
        courseTitle: title,
        level: row.level || "Geral",
        issuedAt: row.issuedAt || new Date(),
        certificateCode: row.certificateCode || "VERIFICADO",
        workloadHours: row.workloadHours || 40,
      });
    }
    zip.file(fileName, Buffer.from(pdfBytes));
  }

  return zip.generateAsync({ type: "nodebuffer" });
}

async function handleBatch(request: NextRequest, ids: number[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Faça login para baixar certificados." }, { status: 401 });

  const currentUser = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
  if (!currentUser) return NextResponse.json({ error: "Usuário autenticado não encontrado." }, { status: 403 });

  const rows = await readCertificates(ids);
  if (rows.length !== ids.length) return NextResponse.json({ error: "Um ou mais certificados não foram encontrados." }, { status: 404 });
  if (!(await authorizeBatch(rows, currentUser))) return NextResponse.json({ error: "Você não tem permissão para exportar um ou mais certificados selecionados." }, { status: 403 });

  const zipContent = await buildZip(rows, session.user.name || session.user.email);
  const rolePrefix = isElevatedUser(currentUser) || currentUser.role === "professor" ? "certificados-gestao" : "meus-certificados";
  return new NextResponse(new Uint8Array(zipContent), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${rolePrefix}-${Date.now()}.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Faça login para baixar seus certificados." }, { status: 401 });
    const currentUser = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    if (!currentUser) return NextResponse.json({ error: "Usuário autenticado não encontrado." }, { status: 403 });
    const rows = await db.select({ id: certificates.id }).from(certificates).where(eq(certificates.userId, currentUser.id));
    if (rows.length === 0) return NextResponse.json({ error: "Nenhum certificado encontrado para download." }, { status: 404 });
    return handleBatch(request, rows.map(row => row.id));
  } catch (error) {
    console.error("Error generating certificates batch download:", error);
    return NextResponse.json({ error: "Erro ao gerar arquivo compactado de certificados." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BatchRequest;
    const ids = normalizeIds(body.certificateIds);
    if (ids.length === 0) return NextResponse.json({ error: "Selecione ao menos um certificado." }, { status: 400 });
    return handleBatch(request, ids);
  } catch (error) {
    console.error("Error generating selected certificates batch:", error);
    return NextResponse.json({ error: "Erro ao gerar o lote de certificados selecionado." }, { status: 500 });
  }
}
