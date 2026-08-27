import type { ExternalClass, ExternalStudent } from "@/drizzle/schema";
import { externalClassAttendance } from "@/drizzle/schema";

export type MigrationDecision = "create-course-and-offer" | "create-offer" | "already-migrated" | "conflict";

export type OfferMigrationPlan = {
  externalClassId: number;
  courseTitle: string;
  offerName: string;
  academicTerm: string;
  ownerTeacherId: number;
  decision: MigrationDecision;
  reason?: string;
  studentCount: number;
  attendanceCount: number;
};

export function normalizeLegacyText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function chooseCourseTitle(legacyClass: Pick<ExternalClass, "courseName" | "className">): string {
  return String(legacyClass.courseName || legacyClass.className).trim();
}

export function chooseOfferName(legacyClass: Pick<ExternalClass, "className" | "academicTerm">): string {
  return `${String(legacyClass.className).trim()} — ${String(legacyClass.academicTerm).trim()}`;
}

export function inferGradingPolicy(institution: string | null | undefined): "standard" | "simal" {
  return normalizeLegacyText(institution).includes("simal") ? "simal" : "standard";
}

export function buildOfferMigrationPlan(input: {
  legacyClass: Pick<ExternalClass, "id" | "institution" | "courseName" | "className" | "academicTerm" | "teacherId">;
  existingCourseId?: number;
  existingOfferId?: number;
  studentCount: number;
  attendanceCount: number;
}): OfferMigrationPlan {
  const courseTitle = chooseCourseTitle(input.legacyClass);
  if (input.existingOfferId) {
    return {
      externalClassId: input.legacyClass.id,
      courseTitle,
      offerName: chooseOfferName(input.legacyClass),
      academicTerm: input.legacyClass.academicTerm,
      ownerTeacherId: input.legacyClass.teacherId,
      decision: "already-migrated",
      reason: `oferta ${input.existingOfferId} já vinculada à turma legada`,
      studentCount: input.studentCount,
      attendanceCount: input.attendanceCount,
    };
  }
  return {
    externalClassId: input.legacyClass.id,
    courseTitle,
    offerName: chooseOfferName(input.legacyClass),
    academicTerm: input.legacyClass.academicTerm,
    ownerTeacherId: input.legacyClass.teacherId,
    decision: input.existingCourseId ? "create-offer" : "create-course-and-offer",
    reason: input.existingCourseId ? `curso interno ${input.existingCourseId} encontrado por título` : "curso interno não encontrado por título",
    studentCount: input.studentCount,
    attendanceCount: input.attendanceCount,
  };
}

export function remapAttendanceData(attendanceData: string, studentIdMap: Map<number, number>): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(attendanceData);
  } catch {
    throw new Error("attendanceData legado não é JSON válido");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("attendanceData legado deve ser um mapa JSON");
  }
  const remapped: Record<string, string> = {};
  for (const [legacyId, status] of Object.entries(parsed as Record<string, unknown>)) {
    const newId = studentIdMap.get(Number(legacyId));
    if (!newId) continue;
    remapped[String(newId)] = String(status);
  }
  return JSON.stringify(remapped);
}

export function countAttendanceStudents(record: Pick<typeof externalClassAttendance.$inferSelect, "attendanceData">): number {
  try {
    const parsed = JSON.parse(record.attendanceData);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? Object.keys(parsed).length : 0;
  } catch {
    return 0;
  }
}

export function studentDisplayName(student: Pick<ExternalStudent, "name" | "socialName">): string {
  return String(student.socialName || student.name).trim();
}
