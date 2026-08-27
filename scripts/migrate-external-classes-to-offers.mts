import { and, eq, ilike, isNull } from "drizzle-orm";
import {
  courseOfferAttendance,
  courseOfferStudents,
  courseOfferTeacherAssignments,
  courseOffers,
  courses,
  externalClassAttendance,
  externalClassTeacherAssignments,
  externalClasses,
  externalStudents,
} from "@/drizzle/schema";
import { db } from "@/lib/db";
import {
  buildOfferMigrationPlan,
  inferGradingPolicy,
  remapAttendanceData,
  studentDisplayName,
  type MigrationDecision,
} from "@/lib/course-offer-migration";

const apply = process.argv.includes("--apply");
const classIdArgument = process.argv.find((value) => value.startsWith("--class-id="));
const classId = classIdArgument ? Number(classIdArgument.split("=")[1]) : null;

function logPlan(plan: ReturnType<typeof buildOfferMigrationPlan>) {
  console.log(JSON.stringify(plan));
}

async function migrateClass(legacyClass: typeof externalClasses.$inferSelect, dryRun: boolean) {
  const students = await db.query.externalStudents.findMany({ where: eq(externalStudents.externalClassId, legacyClass.id) });
  const attendance = await db.query.externalClassAttendance.findMany({ where: eq(externalClassAttendance.externalClassId, legacyClass.id) });
  const existingOffer = await db.query.courseOffers.findFirst({ where: eq(courseOffers.sourceExternalClassId, legacyClass.id) });
  const matchingCourse = await db.query.courses.findFirst({
    where: and(ilike(courses.title, legacyClass.courseName.trim()), isNull(courses.deletedAt)),
  });
  const plan = buildOfferMigrationPlan({
    legacyClass,
    existingCourseId: matchingCourse?.id,
    existingOfferId: existingOffer?.id,
    studentCount: students.length,
    attendanceCount: attendance.length,
  });
  logPlan(plan);
  if (dryRun || plan.decision === "already-migrated") return plan.decision;

  await db.transaction(async (tx) => {
    let courseId = matchingCourse?.id;
    if (!courseId) {
      const [course] = await tx.insert(courses).values({
        title: plan.courseTitle,
        description: legacyClass.description,
        level: legacyClass.level ?? "Básico (A1-A2)",
        instructor: legacyClass.instructorName ?? null,
        modality: legacyClass.modality ?? "Remota",
        classDays: legacyClass.classDays,
        classTime: legacyClass.classTime,
        workloadHours: legacyClass.workloadHours ?? 40,
        startDate: legacyClass.startDate,
        endDate: legacyClass.endDate,
        durationType: legacyClass.durationType ?? "semester",
        durationValue: legacyClass.durationValue,
        durationUnit: legacyClass.durationUnit,
        maxAbsencePercent: legacyClass.maxAbsencePercent ?? 25,
        hasUnits: legacyClass.hasUnits,
        unitCount: legacyClass.unitCount ?? 1,
        gradingScope: legacyClass.gradingScope,
        passingAverage: legacyClass.passingAverage,
        unitPassingAverages: legacyClass.unitPassingAverages,
      }).returning({ id: courses.id });
      courseId = course?.id;
    }
    if (!courseId) throw new Error(`Não foi possível criar/encontrar curso para a turma ${legacyClass.id}`);

    const [offer] = await tx.insert(courseOffers).values({
      courseId,
      sourceExternalClassId: legacyClass.id,
      institution: legacyClass.institution,
      offerName: plan.offerName,
      academicTerm: legacyClass.academicTerm,
      ownerTeacherId: legacyClass.teacherId,
      description: legacyClass.description,
      classDays: legacyClass.classDays,
      classTime: legacyClass.classTime,
      workloadHours: legacyClass.workloadHours ?? 40,
      startDate: legacyClass.startDate,
      endDate: legacyClass.endDate,
      durationType: legacyClass.durationType ?? "semester",
      durationValue: legacyClass.durationValue,
      durationUnit: legacyClass.durationUnit,
      modality: legacyClass.modality ?? "Remota",
      meetingLink: legacyClass.meetingLink,
      classroomLocation: legacyClass.classroomLocation,
      maxAbsencePercent: legacyClass.maxAbsencePercent ?? 25,
      hasUnits: legacyClass.hasUnits,
      unitCount: legacyClass.unitCount ?? 1,
      gradingScope: legacyClass.gradingScope,
      gradingPolicy: inferGradingPolicy(legacyClass.institution),
      passingAverage: legacyClass.passingAverage,
      unitPassingAverages: legacyClass.unitPassingAverages,
      gradeStatus: legacyClass.gradeStatus,
      status: "published",
    }).returning({ id: courseOffers.id });
    if (!offer) throw new Error(`Não foi possível criar oferta para a turma ${legacyClass.id}`);

    const studentIdMap = new Map<number, number>();
    for (const legacyStudent of students) {
      const [student] = await tx.insert(courseOfferStudents).values({
        offerId: offer.id,
        userId: legacyStudent.userId,
        externalStudentId: legacyStudent.id,
        name: studentDisplayName(legacyStudent),
        socialName: legacyStudent.socialName,
        email: legacyStudent.email,
        studentIdNumber: legacyStudent.studentIdNumber,
        status: legacyStudent.status,
        notes: legacyStudent.notes,
      }).onConflictDoNothing().returning({ id: courseOfferStudents.id });
      if (student) studentIdMap.set(legacyStudent.id, student.id);
      else {
        const existing = await tx.query.courseOfferStudents.findFirst({ where: and(eq(courseOfferStudents.offerId, offer.id), eq(courseOfferStudents.externalStudentId, legacyStudent.id)) });
        if (existing) studentIdMap.set(legacyStudent.id, existing.id);
      }
    }

    for (const legacyAttendance of attendance) {
      const remapped = remapAttendanceData(legacyAttendance.attendanceData, studentIdMap);
      await tx.insert(courseOfferAttendance).values({
        offerId: offer.id,
        date: legacyAttendance.date,
        attendanceData: remapped,
        createdAt: legacyAttendance.createdAt,
        updatedAt: new Date(),
      }).onConflictDoNothing();
    }

    const assignments = await tx.query.externalClassTeacherAssignments.findMany({ where: eq(externalClassTeacherAssignments.externalClassId, legacyClass.id) });
    for (const assignment of assignments) {
      await tx.insert(courseOfferTeacherAssignments).values({
        offerId: offer.id,
        teacherId: assignment.teacherId,
        assignedBy: assignment.assignedBy,
        createdAt: assignment.createdAt,
      }).onConflictDoNothing();
    }
  });
  return plan.decision;
}

async function main() {
  const legacyClasses = await db.query.externalClasses.findMany({
    where: classId ? eq(externalClasses.id, classId) : isNull(externalClasses.deletedAt),
  });
  if (legacyClasses.length === 0) {
    console.log(JSON.stringify({ message: "Nenhuma turma legada encontrada.", apply, classId }));
    return;
  }
  const decisions: MigrationDecision[] = [];
  for (const legacyClass of legacyClasses) {
    decisions.push(await migrateClass(legacyClass, !apply));
  }
  console.log(JSON.stringify({ message: apply ? "Migração concluída." : "Prévia concluída; nenhuma gravação foi feita.", apply, count: decisions.length, decisions }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
