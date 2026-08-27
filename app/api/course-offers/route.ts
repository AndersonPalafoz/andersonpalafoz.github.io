import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { courses, users } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { requireTeacherOrAdmin } from "@/lib/admin-auth";
import { createCourseOffer, listCourseOffers } from "@/lib/course-offer-service";

const GLOBAL_ROLES = new Set(["admin", "super_admin"]);

async function resolveUser(session: Awaited<ReturnType<typeof requireTeacherOrAdmin>>) {
  const email = session?.user.email?.toLowerCase();
  if (!email) return undefined;
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export async function GET(request: NextRequest) {
  const session = await requireTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const user = await resolveUser(session);
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  const includeDeleted = request.nextUrl.searchParams.get("includeDeleted") === "true" && GLOBAL_ROLES.has(user.role);
  const offers = await listCourseOffers({ userId: user.id, globalAdmin: GLOBAL_ROLES.has(user.role), includeDeleted });
  return NextResponse.json({ offers });
}

export async function POST(request: NextRequest) {
  const session = await requireTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const user = await resolveUser(session);
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  try {
    const body = await request.json();
    const courseId = Number(body.courseId);
    const offerName = String(body.offerName ?? "").trim();
    const academicTerm = String(body.academicTerm ?? "").trim();
    if (!Number.isInteger(courseId) || courseId <= 0 || !offerName || !academicTerm) {
      return NextResponse.json({ error: "Curso, nome da oferta e período acadêmico são obrigatórios." }, { status: 400 });
    }
    const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
    if (!course) return NextResponse.json({ error: "Curso não encontrado." }, { status: 404 });

    const globalAdmin = GLOBAL_ROLES.has(user.role);
    const ownerTeacherId = globalAdmin && Number.isInteger(Number(body.ownerTeacherId)) ? Number(body.ownerTeacherId) : user.id;
    if (!globalAdmin && ownerTeacherId !== user.id) {
      return NextResponse.json({ error: "Professor não pode criar oferta em nome de outro usuário." }, { status: 403 });
    }
    const offer = await createCourseOffer({
      courseId,
      sourceExternalClassId: body.sourceExternalClassId ? Number(body.sourceExternalClassId) : null,
      institution: body.institution ? String(body.institution).trim() : null,
      offerName,
      academicTerm,
      ownerTeacherId,
      description: body.description ? String(body.description).trim() : null,
      classDays: body.classDays ? String(body.classDays).trim() : null,
      classTime: body.classTime ? String(body.classTime).trim() : null,
      workloadHours: body.workloadHours ? Number(body.workloadHours) : 40,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      durationType: body.durationType ? String(body.durationType) : "semester",
      durationValue: body.durationValue ? Number(body.durationValue) : null,
      durationUnit: body.durationUnit ? String(body.durationUnit) : null,
      modality: body.modality ? String(body.modality) : "Remota",
      meetingLink: body.meetingLink ? String(body.meetingLink).trim() : null,
      classroomLocation: body.classroomLocation ? String(body.classroomLocation).trim() : null,
      maxAbsencePercent: body.maxAbsencePercent !== undefined ? Number(body.maxAbsencePercent) : 25,
      hasUnits: Boolean(body.hasUnits),
      unitCount: body.unitCount ? Number(body.unitCount) : 1,
      gradingScope: body.gradingScope === "unit" ? "unit" : "course",
      gradingPolicy: ["standard", "unit", "simal"].includes(body.gradingPolicy) ? body.gradingPolicy : "standard",
      passingAverage: body.passingAverage !== undefined ? String(body.passingAverage).replace(",", ".") : "6",
      unitPassingAverages: body.unitPassingAverages ? String(body.unitPassingAverages) : null,
      gradeStatus: "open",
      status: body.status === "published" ? "published" : "draft",
    });
    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    console.error("Error creating course offer:", error);
    return NextResponse.json({ error: "Não foi possível criar a oferta." }, { status: 500 });
  }
}
