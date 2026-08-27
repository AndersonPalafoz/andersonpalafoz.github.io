import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  externalClasses,
  externalStudents,
  externalClassAttendance,
  externalClassGrades,
  externalClassMaterials,
  externalClassTeacherAssignments,
  users,
  notifications,
} from "@/drizzle/schema";
import { eq, desc, and, or, isNull, isNotNull, inArray } from "drizzle-orm";
import { normalizeGradeInput } from "@/lib/course-grading";

type ExternalClassesDbError = Error & {
  code?: string;
  query?: string;
};

function logExternalClassesError(operation: string, error: unknown) {
  const dbError = error as ExternalClassesDbError;
  console.error("[external-classes] database operation failed", {
    operation,
    code: dbError?.code ?? "unknown",
    message: dbError?.message ?? String(error),
    query: dbError?.query ?? undefined,
  });
}

function parseDecimalInput(value: unknown) {
  if (value === undefined || value === null || String(value).trim() === "") return undefined;
  const parsed = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function validateGrade(score: unknown, maxScore: unknown) {
  const normalizedScore = normalizeGradeInput(score);
  const normalizedMaxScore = normalizeGradeInput(maxScore ?? "10");
  const scoreNumber = normalizedScore === null ? Number.NaN : Number(normalizedScore);
  const maxNumber = normalizedMaxScore === null ? Number.NaN : Number(normalizedMaxScore);
  if (!Number.isFinite(scoreNumber) || !Number.isFinite(maxNumber) || maxNumber <= 0) return "A nota e o valor máximo devem ser numéricos.";
  if (scoreNumber < 0 || scoreNumber > maxNumber) return `A nota deve estar entre 0 e ${maxNumber}.`;
  return null;
}

function validateMaterialUrl(value: unknown) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "O link do material é obrigatório.";
  if (normalized.startsWith("/manus-storage/")) return null;
  try {
    const parsed = new URL(normalized);
    if (!["http:", "https:"].includes(parsed.protocol)) return "Informe uma URL HTTP ou HTTPS válida.";
  } catch {
    return "Informe uma URL HTTP ou HTTPS válida.";
  }
  return null;
}

const MAX_IMPORTED_STUDENT_ROWS = 1_000;
const MAX_ATTENDANCE_RECORDS_PER_IMPORTED_STUDENT = 160;
const MAX_IMPORTED_TEXT_LENGTH = 500;
const MAX_STUDENT_NOTES_LENGTH = 2_000;
const VALID_ATTENDANCE_STATUSES = new Set(["present", "absent", "late", "excused"]);

const firstImportedText = (row: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value !== "string" && typeof value !== "number") continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return "";
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role;
    const userEmail = session?.user?.email;
    const isAdminOrTeacher = userRole === "admin" || userRole === "super_admin" || userRole === "professor" || userEmail === "palafozanderson@gmail.com";
    if (!session?.user || !isAdminOrTeacher) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const email = userEmail;
    if (!email) return NextResponse.json({ error: "E-mail não encontrado na sessão." }, { status: 400 });

    const isGlobalAdmin = userRole === "admin" || userRole === "super_admin" || userEmail === "palafozanderson@gmail.com" || email === "palafozanderson@gmail.com";
    const teacher = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!teacher && !isGlobalAdmin) return NextResponse.json({ error: "Professor não encontrado na plataforma." }, { status: 404 });
    const mode = searchParams.get("mode");

    const delegatedRows = !isGlobalAdmin
      ? await db.select({ externalClassId: externalClassTeacherAssignments.externalClassId })
        .from(externalClassTeacherAssignments)
        .where(eq(externalClassTeacherAssignments.teacherId, teacher!.id))
      : [];
    const delegatedClassIds = delegatedRows.map((row) => row.externalClassId);
    const visibilityFilter = delegatedClassIds.length
      ? or(eq(externalClasses.teacherId, teacher!.id), inArray(externalClasses.id, delegatedClassIds))
      : eq(externalClasses.teacherId, teacher!.id);
    const lifecycleFilter = mode === "trash" ? isNotNull(externalClasses.deletedAt) : isNull(externalClasses.deletedAt);
    const classes = isGlobalAdmin
      ? await db.select().from(externalClasses).where(lifecycleFilter).orderBy(mode === "trash" ? desc(externalClasses.deletedAt) : desc(externalClasses.createdAt))
      : await db.select().from(externalClasses).where(and(visibilityFilter, lifecycleFilter)).orderBy(mode === "trash" ? desc(externalClasses.deletedAt) : desc(externalClasses.createdAt));

    const classIds = classes.map((item) => item.id);
    const assignmentRows = classIds.length
      ? await db.select({
        externalClassId: externalClassTeacherAssignments.externalClassId,
        teacherId: users.id,
        teacherName: users.name,
        teacherEmail: users.email,
      }).from(externalClassTeacherAssignments)
        .innerJoin(users, eq(externalClassTeacherAssignments.teacherId, users.id))
        .where(inArray(externalClassTeacherAssignments.externalClassId, classIds))
      : [];
    const assignmentsByClass = new Map<number, typeof assignmentRows>();
    for (const assignment of assignmentRows) {
      const current = assignmentsByClass.get(assignment.externalClassId) ?? [];
      current.push(assignment);
      assignmentsByClass.set(assignment.externalClassId, current);
    }
    const availableTeachers = isGlobalAdmin
      ? await db.select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(and(eq(users.role, "professor"), isNull(users.deletedAt)))
        .orderBy(users.name)
      : [];
    
    const result = [];
    for (const cls of classes) {
      const students = await db.select().from(externalStudents).where(eq(externalStudents.externalClassId, cls.id));
      const linkedUserIds = students.map((student) => student.userId).filter((id): id is number => Number.isInteger(id));
      const linkedUsers = linkedUserIds.length ? await db.select({ id: users.id, lastSignedIn: users.lastSignedIn, mustChangePassword: users.mustChangePassword }).from(users).where(inArray(users.id, linkedUserIds)) : [];
      const lastAccessByUserId = new Map(linkedUsers.map((user) => [user.id, user.mustChangePassword ? null : user.lastSignedIn]));
      const studentsWithAccess = students.map((student) => ({ ...student, lastSignedIn: student.userId ? lastAccessByUserId.get(student.userId) || null : null }));
      const attendance = await db.select().from(externalClassAttendance).where(eq(externalClassAttendance.externalClassId, cls.id)).orderBy(desc(externalClassAttendance.createdAt));
      const grades = await db.select().from(externalClassGrades).where(eq(externalClassGrades.externalClassId, cls.id)).orderBy(desc(externalClassGrades.createdAt));
      const materials = await db.select().from(externalClassMaterials).where(eq(externalClassMaterials.externalClassId, cls.id)).orderBy(desc(externalClassMaterials.createdAt));
      
      const totalStudents = students.length;
      const activeStudents = students.filter(s => s.status === "active").length;
      const completedStudents = students.filter(s => s.status === "completed").length;

      result.push({
        ...cls,
        students: studentsWithAccess,
        assignedTeachers: assignmentsByClass.get(cls.id) ?? [],
        attendance,
        grades,
        materials,
        stats: {
          total: totalStudents,
          active: activeStudents,
          completed: completedStudents,
        }
      });
    }

    return NextResponse.json({ success: true, classes: result, availableTeachers, access: { isGlobalAdmin } });
  } catch (error) {
    logExternalClassesError("GET /api/professor/external-classes", error);
    return NextResponse.json({ error: "Erro interno ao buscar turmas externas." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role;
    const userEmail = session?.user?.email;
    const isAdminOrTeacher = userRole === "admin" || userRole === "super_admin" || userRole === "professor" || userEmail === "palafozanderson@gmail.com";
    if (!session?.user || !isAdminOrTeacher) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const email = userEmail;
    if (!email) return NextResponse.json({ error: "E-mail não encontrado na sessão." }, { status: 400 });

    const isGlobalAdmin = userRole === "admin" || userRole === "super_admin" || userEmail === "palafozanderson@gmail.com" || email === "palafozanderson@gmail.com";
    const teacher = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!teacher) return NextResponse.json({ error: "Sua conta administrativa/profissional ainda não está registrada na plataforma." }, { status: 404 });
    const delegatedRows = !isGlobalAdmin
      ? await db.select({ externalClassId: externalClassTeacherAssignments.externalClassId })
        .from(externalClassTeacherAssignments)
        .where(eq(externalClassTeacherAssignments.teacherId, teacher.id))
      : [];
    const delegatedClassIds = new Set(delegatedRows.map((row) => row.externalClassId));
    const canManageClass = (classId: number, ownerId: number) => isGlobalAdmin || ownerId === teacher.id || delegatedClassIds.has(classId);
    const notifyGradeChange = async (grade: { id: number; studentId: number; score: string; maxScore: string; assessmentTitle: string; updatedAt: Date | null }, classInfo: { id: number; className: string; institution: string }, event: "created" | "updated") => {
      const student = await db.query.externalStudents.findFirst({ where: eq(externalStudents.id, grade.studentId) });
      if (!student?.email) return false;
      const userAccount = await db.query.users.findFirst({ where: eq(users.email, student.email) });
      if (!userAccount) return false;
      const eventKey = `external-grade:${event}:${grade.id}:${grade.updatedAt?.toISOString() || grade.score}`;
      const metadata = JSON.stringify({ classId: classInfo.id, gradeId: grade.id, event, eventKey });
      const duplicate = await db.query.notifications.findFirst({ where: and(eq(notifications.userId, userAccount.id), eq(notifications.type, "grade"), eq(notifications.metadata, metadata)) });
      if (duplicate) return false;
      await db.insert(notifications).values({
        userId: userAccount.id,
        type: "grade",
        title: event === "created" ? "Nova nota lançada" : "Nota atualizada",
        message: `${event === "created" ? "Uma nova nota foi lançada" : "Uma avaliação foi atualizada"}: ${grade.assessmentTitle} — ${grade.score}/${grade.maxScore} na turma ${classInfo.className} (${classInfo.institution}).`,
        metadata,
      });
      return true;
    };

    const body = await request.json();
    const maxAbsenceValue = parseDecimalInput(body.maxAbsencePercent);
    const passingAverageValue = parseDecimalInput(body.passingAverage);
      const {
      action,
      institution,
      className,
      courseName,
      academicTerm,
      description,
      classDays,
      classTime,
      workloadHours,
      durationType,
      durationValue,
      durationUnit,
      startDate,
      endDate,
      maxAbsencePercent,
      hasUnits,
      unitCount,
      gradingScope,
      passingAverage,
      unitPassingAverages,
      modality,
      meetingLink,
      classroomLocation,
      level,
      instructorName,
      monitors,
      classId,
      studentName,
      studentEmail,
      studentIdNumber,
      studentCpf,
      studentCategory,
      studentUniversity,
      studentComponent,
      studentNotes,
      studentStatus,
      studentId,
      csvData,
      classMetadata,
      // Attendance, Grades, Materials fields
      date,
      attendanceData,
      assessmentTitle,
      assessmentType,
      assessmentVersion,
      assessmentComponent,
      score,
      maxScore,
      rubricScores,
      assessmentDate,
      unitNumber,
      feedback,
      gradeId,
      manualAverage,
      manualAverageReason,
      materialTitle,
      fileUrl,
      materialDescription,
      materialId,
      teacherIds,
    } = body;

    if (studentNotes !== undefined && studentNotes !== null && (typeof studentNotes !== "string" || studentNotes.length > MAX_STUDENT_NOTES_LENGTH)) {
      return NextResponse.json({ error: `As anotações do professor devem ter no máximo ${MAX_STUDENT_NOTES_LENGTH} caracteres.` }, { status: 400 });
    }

    if (action === "setTeacherAssignments") {
      if (!isGlobalAdmin) return NextResponse.json({ error: "Somente administradores podem atribuir professores a uma turma." }, { status: 403 });
      if (!classId || !Array.isArray(teacherIds)) return NextResponse.json({ error: "Informe a turma e a lista de professores." }, { status: 400 });
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      const normalizedTeacherIds = Array.from(new Set(teacherIds.map(Number).filter(Number.isInteger)));
      const selectedTeachers = normalizedTeacherIds.length
        ? await db.select({ id: users.id }).from(users).where(and(inArray(users.id, normalizedTeacherIds), eq(users.role, "professor"), isNull(users.deletedAt)))
        : [];
      if (selectedTeachers.length !== normalizedTeacherIds.length) return NextResponse.json({ error: "Selecione somente professores ativos cadastrados na plataforma." }, { status: 400 });
      await db.delete(externalClassTeacherAssignments).where(eq(externalClassTeacherAssignments.externalClassId, Number(classId)));
      if (selectedTeachers.length) {
        await db.insert(externalClassTeacherAssignments).values(selectedTeachers.map((selected) => ({
          externalClassId: Number(classId),
          teacherId: selected.id,
          assignedBy: teacher.id,
        })));
      }
      return NextResponse.json({ success: true, message: "Professores atribuídos à turma com sucesso." });
    }

    if (action === "createClass") {
      if (!institution || !className || !courseName || !academicTerm) {
        return NextResponse.json({ error: "Instituição, nome da turma, nome do curso e período são obrigatórios." }, { status: 400 });
      }

      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        return NextResponse.json({ error: "A data final não pode ser anterior à data inicial." }, { status: 400 });
      }
      if (maxAbsenceValue === null || (maxAbsenceValue !== undefined && (maxAbsenceValue < 0 || maxAbsenceValue > 100))) {
        return NextResponse.json({ error: "O limite máximo de faltas deve ser um percentual entre 0% e 100%." }, { status: 400 });
      }
      const allowedDurationTypes = ["annual", "semester", "workload", "custom"];
      if (hasUnits && (!Number.isInteger(Number(unitCount)) || Number(unitCount) < 1 || Number(unitCount) > 100)) return NextResponse.json({ error: "A quantidade de unidades deve estar entre 1 e 100." }, { status: 400 });
      if (gradingScope !== undefined && !["course", "unit"].includes(String(gradingScope))) return NextResponse.json({ error: "Escopo de média inválido." }, { status: 400 });
      if (passingAverageValue === null || (passingAverageValue !== undefined && (passingAverageValue < 0 || passingAverageValue > 10))) return NextResponse.json({ error: "A média mínima deve ser um número entre 0 e 10." }, { status: 400 });
      const normalizedDurationType = allowedDurationTypes.includes(String(durationType || "semester")) ? String(durationType || "semester") : "semester";
      if (durationValue !== undefined && durationValue !== null && (!Number.isFinite(Number(durationValue)) || Number(durationValue) <= 0)) {
        return NextResponse.json({ error: "O valor da duração deve ser maior que zero." }, { status: 400 });
      }

      const inserted = await db.insert(externalClasses).values({
        teacherId: teacher.id,
        institution: institution.trim(),
        className: className.trim(),
        courseName: courseName.trim(),
        academicTerm: academicTerm.trim(),
        description: description ? description.trim() : null,
        classDays: classDays ? classDays.trim() : null,
        classTime: classTime ? classTime.trim() : null,
        workloadHours: workloadHours ? Number(workloadHours) : 40,
        durationType: normalizedDurationType,
        durationValue: durationValue ? Number(durationValue) : null,
        durationUnit: durationUnit ? String(durationUnit).trim() : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        maxAbsencePercent: maxAbsenceValue ?? 25,
        hasUnits: Boolean(hasUnits),
        unitCount: hasUnits ? Number(unitCount || 1) : 1,
        gradingScope: hasUnits && gradingScope === "unit" ? "unit" : "course",
        passingAverage: String(passingAverageValue ?? 6),
        unitPassingAverages: hasUnits && gradingScope === "unit" ? (unitPassingAverages ? String(unitPassingAverages) : null) : null,
        modality: modality ? modality.trim() : "Remota",
        meetingLink: meetingLink ? meetingLink.trim() : null,
        classroomLocation: classroomLocation ? classroomLocation.trim() : null,
        level: level ? level.trim() : "Básico (A1-A2)",
        instructorName: instructorName ? instructorName.trim() : null,
        monitors: monitors ? monitors.trim() : null,
      }).returning();

      return NextResponse.json({ success: true, classItem: inserted[0] });
    }

    if (action === "updateClass") {
      if (!classId || !institution || !className || !courseName || !academicTerm) {
        return NextResponse.json({ error: "Dados incompletos para atualização." }, { status: 400 });
      }

      const existing = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existing) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (!canManageClass(existing.id, existing.teacherId)) {
        return NextResponse.json({ error: "Acesso negado para editar esta turma." }, { status: 403 });
      }

      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        return NextResponse.json({ error: "A data final não pode ser anterior à data inicial." }, { status: 400 });
      }
      if (maxAbsenceValue === null || (maxAbsenceValue !== undefined && (maxAbsenceValue < 0 || maxAbsenceValue > 100))) {
        return NextResponse.json({ error: "O limite máximo de faltas deve ser um percentual entre 0% e 100%." }, { status: 400 });
      }
      const allowedDurationTypes = ["annual", "semester", "workload", "custom"];
      if (durationType !== undefined && !allowedDurationTypes.includes(String(durationType))) {
        return NextResponse.json({ error: "Formato de duração inválido." }, { status: 400 });
      }
      if (durationValue !== undefined && durationValue !== null && (!Number.isFinite(Number(durationValue)) || Number(durationValue) <= 0)) {
        return NextResponse.json({ error: "O valor da duração deve ser maior que zero." }, { status: 400 });
      }

      const updated = await db.update(externalClasses)
        .set({
          institution: institution.trim(),
          className: className.trim(),
          courseName: courseName.trim(),
          academicTerm: academicTerm.trim(),
          description: description ? description.trim() : null,
          classDays: classDays !== undefined ? (classDays ? classDays.trim() : null) : existing.classDays,
          classTime: classTime !== undefined ? (classTime ? classTime.trim() : null) : existing.classTime,
          workloadHours: workloadHours !== undefined ? Number(workloadHours) : existing.workloadHours,
          durationType: durationType !== undefined ? String(durationType) : existing.durationType,
          durationValue: durationValue !== undefined ? (durationValue === null ? null : Number(durationValue)) : existing.durationValue,
          durationUnit: durationUnit !== undefined ? (durationUnit ? String(durationUnit).trim() : null) : existing.durationUnit,
          startDate: startDate ? new Date(startDate) : existing.startDate,
          endDate: endDate ? new Date(endDate) : existing.endDate,
          maxAbsencePercent: maxAbsenceValue !== undefined ? maxAbsenceValue : existing.maxAbsencePercent,
          hasUnits: hasUnits !== undefined ? Boolean(hasUnits) : existing.hasUnits,
          unitCount: hasUnits !== undefined ? (hasUnits ? Number(unitCount || 1) : 1) : existing.unitCount,
          gradingScope: gradingScope !== undefined ? (hasUnits === false ? "course" : String(gradingScope)) : existing.gradingScope,
          passingAverage: passingAverageValue !== undefined ? String(passingAverageValue) : existing.passingAverage,
          unitPassingAverages: unitPassingAverages !== undefined ? (gradingScope === "unit" ? String(unitPassingAverages) : null) : existing.unitPassingAverages,
          modality: modality !== undefined ? (modality ? modality.trim() : "Remota") : existing.modality,
          meetingLink: meetingLink !== undefined ? (meetingLink ? meetingLink.trim() : null) : existing.meetingLink,
          classroomLocation: classroomLocation !== undefined ? (classroomLocation ? classroomLocation.trim() : null) : existing.classroomLocation,
          level: level !== undefined ? (level ? level.trim() : "Básico (A1-A2)") : existing.level,
          instructorName: instructorName !== undefined ? (instructorName ? instructorName.trim() : null) : existing.instructorName,
          monitors: monitors !== undefined ? (monitors ? monitors.trim() : null) : existing.monitors,
          updatedAt: new Date(),
        })
        .where(eq(externalClasses.id, Number(classId)))
        .returning();

      return NextResponse.json({ success: true, classItem: updated[0] });
    }

    if (action === "duplicateClass") {
      if (!classId) return NextResponse.json({ error: "ID da turma é obrigatório." }, { status: 400 });
      const existing = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existing) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (!canManageClass(existing.id, existing.teacherId)) return NextResponse.json({ error: "Acesso negado para duplicar esta turma." }, { status: 403 });

      const [duplicated] = await db.insert(externalClasses).values({
        teacherId: existing.teacherId,
        institution: existing.institution,
        className: `${existing.className} (cópia)`,
        courseName: existing.courseName,
        academicTerm: existing.academicTerm,
        description: existing.description,
        classDays: existing.classDays,
        classTime: existing.classTime,
        workloadHours: existing.workloadHours,
        durationType: existing.durationType,
        durationValue: existing.durationValue,
        durationUnit: existing.durationUnit,
        startDate: existing.startDate,
        endDate: existing.endDate,
        maxAbsencePercent: existing.maxAbsencePercent,
        hasUnits: existing.hasUnits,
        unitCount: existing.unitCount,
        gradingScope: existing.gradingScope,
        passingAverage: existing.passingAverage,
        unitPassingAverages: existing.unitPassingAverages,
        modality: existing.modality,
        meetingLink: existing.meetingLink,
        classroomLocation: existing.classroomLocation,
        level: existing.level,
        instructorName: existing.instructorName,
        monitors: existing.monitors,
      }).returning();
      return NextResponse.json({ success: true, classItem: duplicated, copiedStudents: 0 });
    }

    if (action === "addStudent") {
      if (!classId || !studentName) {
        return NextResponse.json({ error: "ID da turma e nome do aluno são obrigatórios." }, { status: 400 });
      }

      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (!canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado para gerenciar alunos desta turma." }, { status: 403 });
      }

      if (studentEmail) {
        const existingByEmail = await db.query.externalStudents.findFirst({
          where: and(
            eq(externalStudents.externalClassId, Number(classId)),
            eq(externalStudents.email, studentEmail.trim().toLowerCase())
          )
        });
        if (existingByEmail) {
          return NextResponse.json({ error: "Já existe um aluno matriculado com este e-mail nesta turma." }, { status: 400 });
        }
      }

      if (studentIdNumber) {
        const existingByIdNum = await db.query.externalStudents.findFirst({
          where: and(
            eq(externalStudents.externalClassId, Number(classId)),
            eq(externalStudents.studentIdNumber, studentIdNumber.trim())
          )
        });
        if (existingByIdNum) {
          return NextResponse.json({ error: "Já existe um aluno matriculado com este número de ID/matrícula nesta turma." }, { status: 400 });
        }
      }

      const inserted = await db.insert(externalStudents).values({
        externalClassId: Number(classId),
        name: studentName.trim(),
        email: studentEmail ? studentEmail.trim().toLowerCase() : null,
        studentIdNumber: studentIdNumber ? studentIdNumber.trim() : null,
        cpf: studentCpf ? studentCpf.trim() : null,
        category: studentCategory ? studentCategory.trim() : null,
        university: studentUniversity ? studentUniversity.trim() : null,
        component: studentComponent ? studentComponent.trim() : null,
        status: studentStatus ? studentStatus.trim() : "active",
        notes: typeof studentNotes === "string" && studentNotes.trim() ? studentNotes.trim() : null,
      }).returning();

      return NextResponse.json({ success: true, student: inserted[0] });
    }

    if (action === "updateStudent") {
      if (!studentId || !studentName) {
        return NextResponse.json({ error: "ID do aluno e nome são obrigatórios." }, { status: 400 });
      }

      const student = await db.query.externalStudents.findFirst({ where: eq(externalStudents.id, Number(studentId)) });
      if (!student) return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });

      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, student.externalClassId) });
      if (existingClass && !canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }

      const updated = await db.update(externalStudents)
        .set({
          name: studentName.trim(),
          email: studentEmail ? studentEmail.trim().toLowerCase() : null,
          studentIdNumber: studentIdNumber ? studentIdNumber.trim() : null,
          cpf: studentCpf !== undefined ? (studentCpf ? studentCpf.trim() : null) : student.cpf,
          category: studentCategory !== undefined ? (studentCategory ? studentCategory.trim() : null) : student.category,
          university: studentUniversity !== undefined ? (studentUniversity ? studentUniversity.trim() : null) : student.university,
          component: studentComponent !== undefined ? (studentComponent ? studentComponent.trim() : null) : student.component,
          status: studentStatus ? studentStatus.trim() : student.status,
          notes: studentNotes !== undefined ? (typeof studentNotes === "string" && studentNotes.trim() ? studentNotes.trim() : null) : student.notes,
          updatedAt: new Date(),
        })
        .where(eq(externalStudents.id, Number(studentId)))
        .returning();

      return NextResponse.json({ success: true, student: updated[0] });
    }

    if (action === "importCsvStudents") {
      if (!classId || !csvData || !Array.isArray(csvData)) {
        return NextResponse.json({ error: "Dados CSV inválidos ou turma não informada." }, { status: 400 });
      }
      if (csvData.length > MAX_IMPORTED_STUDENT_ROWS) {
        return NextResponse.json({ error: "A importação excede o limite de 1.000 alunos por arquivo." }, { status: 413 });
      }
      const importedRows = csvData as Array<Record<string, unknown>>;
      const hasInvalidPayload = importedRows.some((row) => {
        if (!row || typeof row !== "object" || Array.isArray(row)) return true;
        if (Object.values(row).some((value) => typeof value === "string" && value.length > MAX_IMPORTED_TEXT_LENGTH)) return true;
        const attendanceRecords = row.attendanceRecords;
        return Array.isArray(attendanceRecords) && attendanceRecords.length > MAX_ATTENDANCE_RECORDS_PER_IMPORTED_STUDENT;
      });
      if (hasInvalidPayload) {
        return NextResponse.json({ error: "O arquivo contém dados acima dos limites permitidos para uma importação segura." }, { status: 413 });
      }

      const externalClassId = Number(classId);
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, externalClassId) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (!canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }

      const metadata = classMetadata && typeof classMetadata === "object" ? classMetadata as Record<string, unknown> : {};
      if (Object.values(metadata).some((value) => typeof value === "string" && value.length > MAX_IMPORTED_TEXT_LENGTH)) {
        return NextResponse.json({ error: "Os dados complementares da turma excedem o limite permitido." }, { status: 413 });
      }
      const importedClassDays = typeof metadata.classDays === "string" ? metadata.classDays.trim() : "";
      const importedClassTime = typeof metadata.classTime === "string" ? metadata.classTime.trim() : "";
      const importedLevel = typeof metadata.level === "string" ? metadata.level.trim() : "";
      const importedInstructor = typeof metadata.instructorName === "string" ? metadata.instructorName.trim() : "";
      const importedMonitors = typeof metadata.monitors === "string" ? metadata.monitors.trim() : "";
      const importedWorkload = Number(metadata.workloadHours);
      const hasClassMetadata = Boolean(importedClassDays || importedClassTime || importedLevel || importedInstructor || importedMonitors || (Number.isFinite(importedWorkload) && importedWorkload > 0));

      if (hasClassMetadata) {
        await db.update(externalClasses).set({
          classDays: importedClassDays || existingClass.classDays,
          classTime: importedClassTime || existingClass.classTime,
          level: importedLevel || existingClass.level,
          instructorName: importedInstructor || existingClass.instructorName,
          monitors: importedMonitors || existingClass.monitors,
          workloadHours: Number.isFinite(importedWorkload) && importedWorkload > 0 ? importedWorkload : existingClass.workloadHours,
          updatedAt: new Date(),
        }).where(eq(externalClasses.id, externalClassId));
      }

      const attendanceByDate = new Map<string, Record<string, string>>();
      let importedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      let attendanceImportedCount = 0;

      for (const row of importedRows) {
        const name = firstImportedText(row, "name", "nome", "nome completo");
        if (!name) {
          skippedCount++;
          continue;
        }
        const normalizedEmail = firstImportedText(row, "email", "e_mail", "e-mail").toLowerCase();
        const normalizedCpf = firstImportedText(row, "cpf").replace(/\D/g, "");
        const normalizedId = firstImportedText(row, "studentIdNumber", "matricula", "id", "número de matrícula");
        const normalizedCategory = firstImportedText(row, "category", "categoria");
        const normalizedUniversity = firstImportedText(row, "university", "universidade", "instituicao");
        const normalizedComponent = firstImportedText(row, "component", "componente", "nivel");

        const duplicateWhere = normalizedEmail
          ? and(eq(externalStudents.externalClassId, externalClassId), eq(externalStudents.email, normalizedEmail))
          : normalizedCpf
            ? and(eq(externalStudents.externalClassId, externalClassId), eq(externalStudents.cpf, normalizedCpf))
            : null;
        const existingStudent = duplicateWhere ? await db.query.externalStudents.findFirst({ where: duplicateWhere }) : null;
        let studentRecord;

        if (existingStudent) {
          const updated = await db.update(externalStudents).set({
            name,
            email: normalizedEmail || existingStudent.email,
            studentIdNumber: normalizedId || existingStudent.studentIdNumber,
            cpf: normalizedCpf || existingStudent.cpf,
            category: normalizedCategory || existingStudent.category,
            university: normalizedUniversity || existingStudent.university,
            component: normalizedComponent || existingStudent.component,
            updatedAt: new Date(),
          }).where(eq(externalStudents.id, existingStudent.id)).returning();
          studentRecord = updated[0];
          updatedCount++;
        } else {
          const inserted = await db.insert(externalStudents).values({
            externalClassId,
            name,
            email: normalizedEmail || null,
            studentIdNumber: normalizedId || null,
            cpf: normalizedCpf || null,
            category: normalizedCategory || null,
            university: normalizedUniversity || null,
            component: normalizedComponent || null,
            status: "active",
          }).returning();
          studentRecord = inserted[0];
          importedCount++;
        }

        const attendanceRecords = Array.isArray(row.attendanceRecords) ? row.attendanceRecords : [];
        for (const rawAttendance of attendanceRecords) {
          const attendance = rawAttendance as { date?: unknown; status?: unknown };
          const attendanceDate = String(attendance.date || "").trim();
          const attendanceStatus = String(attendance.status || "").trim();
          if (!studentRecord?.id || !/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate) || !["present", "absent", "late", "excused"].includes(attendanceStatus)) continue;
          const dateMap = attendanceByDate.get(attendanceDate) || {};
          dateMap[String(studentRecord.id)] = attendanceStatus;
          attendanceByDate.set(attendanceDate, dateMap);
        }
      }

      for (const [attendanceDate, attendanceData] of attendanceByDate.entries()) {
        const existingAttendance = await db.query.externalClassAttendance.findFirst({
          where: and(eq(externalClassAttendance.externalClassId, externalClassId), eq(externalClassAttendance.date, attendanceDate)),
        });
        let currentData: Record<string, string> = {};
        if (existingAttendance) {
          try {
            const parsed = JSON.parse(existingAttendance.attendanceData);
            if (parsed && typeof parsed === "object") currentData = parsed as Record<string, string>;
          } catch {
            currentData = {};
          }
        }
        const mergedAttendance = { ...currentData, ...attendanceData };
        if (existingAttendance) {
          await db.update(externalClassAttendance).set({ attendanceData: JSON.stringify(mergedAttendance) }).where(eq(externalClassAttendance.id, existingAttendance.id));
        } else {
          await db.insert(externalClassAttendance).values({ externalClassId, date: attendanceDate, attendanceData: JSON.stringify(mergedAttendance) });
        }
        attendanceImportedCount += Object.keys(attendanceData).length;
      }

      return NextResponse.json({ success: true, importedCount, updatedCount, skippedCount, attendanceImportedCount });
    }

    if (action === "setManualAverage") {
      if (!studentId) return NextResponse.json({ error: "ID do aluno não informado." }, { status: 400 });
      const targetStudent = await db.query.externalStudents.findFirst({ where: eq(externalStudents.id, Number(studentId)) });
      if (!targetStudent) return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, targetStudent.externalClassId) });
      if (!existingClass) return NextResponse.json({ error: "Turma associada não encontrada." }, { status: 404 });
      if (!canManageClass(existingClass.id, existingClass.teacherId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      if (existingClass.gradeStatus === "closed") return NextResponse.json({ error: "As notas desta turma estão fechadas. Reabra o lançamento antes de ajustar a média." }, { status: 409 });

      const parsedManualAverage = parseDecimalInput(manualAverage);
      const normalizedManualAverage: number | null = manualAverage === undefined || manualAverage === null || String(manualAverage).trim() === "" ? null : parsedManualAverage === undefined ? null : parsedManualAverage;
      if (manualAverage !== undefined && manualAverage !== null && String(manualAverage).trim() !== "" && normalizedManualAverage === null) {
        return NextResponse.json({ error: "A média manual deve ser um número válido. Use ponto ou vírgula para casas decimais." }, { status: 400 });
      }
      if (normalizedManualAverage !== null && (normalizedManualAverage < 0 || normalizedManualAverage > 10)) {
        return NextResponse.json({ error: "A média manual deve estar entre 0 e 10." }, { status: 400 });
      }
      const normalizedReason = typeof manualAverageReason === "string" ? manualAverageReason.trim() : "";
      if (normalizedManualAverage !== null && normalizedReason.length < 8) {
        return NextResponse.json({ error: "Informe uma justificativa com pelo menos 8 caracteres para o ajuste manual." }, { status: 400 });
      }
      if (normalizedReason.length > MAX_IMPORTED_TEXT_LENGTH) {
        return NextResponse.json({ error: `A justificativa deve ter no máximo ${MAX_IMPORTED_TEXT_LENGTH} caracteres.` }, { status: 400 });
      }

      const [updatedStudent] = await db.update(externalStudents).set({
        manualAverage: normalizedManualAverage === null ? null : String(normalizedManualAverage),
        manualAverageReason: normalizedManualAverage === null ? null : normalizedReason,
        manualAverageUpdatedAt: normalizedManualAverage === null ? null : new Date(),
        manualAverageUpdatedBy: normalizedManualAverage === null ? null : teacher.id,
        updatedAt: new Date(),
      }).where(eq(externalStudents.id, targetStudent.id)).returning();
      return NextResponse.json({ success: true, student: updatedStudent, message: normalizedManualAverage === null ? "Ajuste manual removido; média calculada restaurada." : "Média manual ajustada com sucesso." });
    }

    if (action === "deleteStudent") {
      if (!studentId) {
        return NextResponse.json({ error: "ID do aluno não informado." }, { status: 400 });
      }

      const student = await db.query.externalStudents.findFirst({ where: eq(externalStudents.id, Number(studentId)) });
      if (!student) return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, student.externalClassId) });
      if (existingClass && !canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
      await db.delete(externalStudents).where(eq(externalStudents.id, Number(studentId)));

      return NextResponse.json({ success: true });
    }

    if (action === "sendWelcomeEmail") {
      const { studentId } = body;
      if (!studentId) {
        return NextResponse.json({ error: "ID do aluno não informado." }, { status: 400 });
      }

      const student = await db.query.externalStudents.findFirst({ where: eq(externalStudents.id, Number(studentId)) });
      if (!student || !student.email) {
        return NextResponse.json({ error: "Aluno não encontrado ou sem e-mail cadastrado." }, { status: 404 });
      }

      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, student.externalClassId) });
      if (!existingClass) {
        return NextResponse.json({ error: "Turma associada não encontrada." }, { status: 404 });
      }

      if (!canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }

      // Tenta obter o token do Google associado ao admin/professor na sessão
      // Se a conta for Google, o token pode estar disponível na sessão ou usamos notificação padrão.
      // Como a chave GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET está ativa, disparamos a notificação por e-mail:
      const subject = `Boas-vindas à Turma: ${existingClass.className} (${existingClass.institution})`;
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #dc2626; margin-top: 0;">Bem-vindo(a) ao Curso, ${student.name}!</h2>
          <p>Você foi cadastrado(a) com sucesso na turma <strong>${existingClass.className}</strong> (${existingClass.courseName}), vinculada à instituição <strong>${existingClass.institution}</strong> para o período <strong>${existingClass.academicTerm}</strong>.</p>
          <p>O professor <strong>Anderson Palafoz</strong> gerencia este espaço com materiais didáticos, chamadas e notas integradas em nossa plataforma acadêmica.</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Seus Dados de Cadastro:</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #4b5563;">E-mail: ${student.email}<br/>Matrícula/ID: ${student.studentIdNumber || 'Não informada'}</p>
          </div>
          <p>Acesse a plataforma para acompanhar suas aulas, materiais e notas oficiais.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 11px; color: #9ca3af; text-align: center;">Anderson Palafoz Platform - Sistema Acadêmico Integrado</p>
        </div>
      `;

      // Dispara via serviço de email padrão com suporte a Gmail/Resend
      const { sendEmailNotification } = await import("@/lib/email");
      await sendEmailNotification({
        to: student.email,
        subject,
        htmlContent: htmlBody,
      });

      return NextResponse.json({ success: true, message: `E-mail de boas-vindas enviado com sucesso para ${student.email}` });
    }

    if (action === "restoreClass") {
      if (!classId) {
        return NextResponse.json({ error: "ID da turma não informado." }, { status: 400 });
      }
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) {
        return NextResponse.json({ error: "Turma externa não encontrada." }, { status: 404 });
      }
      if (!canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }

      const [restored] = await db.update(externalClasses).set({ deletedAt: null }).where(eq(externalClasses.id, Number(classId))).returning();
      return NextResponse.json({ success: true, class: restored });
    }

    if (action === "permanentDeleteClass") {
      if (!classId) {
        return NextResponse.json({ error: "ID da turma não informado." }, { status: 400 });
      }
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) {
        return NextResponse.json({ error: "Turma externa não encontrada." }, { status: 404 });
      }
      if (!canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }

      await db.delete(externalStudents).where(eq(externalStudents.externalClassId, Number(classId)));
      await db.delete(externalClassAttendance).where(eq(externalClassAttendance.externalClassId, Number(classId)));
      await db.delete(externalClassGrades).where(eq(externalClassGrades.externalClassId, Number(classId)));
      await db.delete(externalClassMaterials).where(eq(externalClassMaterials.externalClassId, Number(classId)));
      await db.delete(externalClasses).where(eq(externalClasses.id, Number(classId)));

      return NextResponse.json({ success: true, message: "Turma externa excluída permanentemente." });
    }

    if (action === "deleteClass") {
      if (!classId) {
        return NextResponse.json({ error: "ID da turma não informado." }, { status: 400 });
      }

      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) {
        return NextResponse.json({ error: "Turma externa não encontrada." }, { status: 404 });
      }

      if (!canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }

      const [softDeleted] = await db.update(externalClasses).set({ deletedAt: new Date() }).where(eq(externalClasses.id, Number(classId))).returning();

      return NextResponse.json({
        success: true,
        message: "Turma externa movida para a lixeira.",
        class: softDeleted,
      });
    }

    if (action === "setGradeStatus") {
      const requestedStatus = String(body.gradeStatus ?? "").trim();
      if (!classId || !["open", "closed"].includes(requestedStatus)) {
        return NextResponse.json({ error: "Informe a turma e um estado de notas válido." }, { status: 400 });
      }
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (!canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
      const [updatedClass] = await db.update(externalClasses).set({
        gradeStatus: requestedStatus,
        gradesClosedAt: requestedStatus === "closed" ? new Date() : null,
        gradesClosedBy: requestedStatus === "closed" ? teacher.id : null,
        updatedAt: new Date(),
      }).where(eq(externalClasses.id, Number(classId))).returning();
      return NextResponse.json({ success: true, gradeStatus: updatedClass.gradeStatus, class: updatedClass });
    }

    // Ações de Chamada (Attendance)
    if (action === "saveAttendance") {
      if (!classId || !date || !attendanceData) {
        return NextResponse.json({ error: "ID da turma, data e dados de frequência são obrigatórios." }, { status: 400 });
      }
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (!canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
      if (!attendanceData || typeof attendanceData !== "object" || Array.isArray(attendanceData)) {
        return NextResponse.json({ error: "Os dados de frequência devem ser um mapa de aluno para status." }, { status: 400 });
      }
      const invalidStatuses = Object.values(attendanceData as Record<string, unknown>).filter((status) => !VALID_ATTENDANCE_STATUSES.has(String(status)));
      if (invalidStatuses.length > 0) {
        return NextResponse.json({ error: "Há um status de frequência inválido. Use presente, ausente, atrasado ou justificado." }, { status: 400 });
      }

      const attendanceStudents = await db.select({ id: externalStudents.id }).from(externalStudents).where(eq(externalStudents.externalClassId, Number(classId)));
      const attendanceStudentIds = new Set(attendanceStudents.map((student) => student.id));
      const unknownAttendanceStudentIds = Object.keys(attendanceData as Record<string, unknown>)
        .map(Number)
        .filter((id) => !Number.isInteger(id) || !attendanceStudentIds.has(id));
      if (unknownAttendanceStudentIds.length > 0) {
        return NextResponse.json({ error: "Há aluno(s) que não pertencem a esta turma na chamada." }, { status: 400 });
      }

      // Verificar se já existe chamada para esta data
      const existingAtt = await db.query.externalClassAttendance.findFirst({
        where: and(
          eq(externalClassAttendance.externalClassId, Number(classId)),
          eq(externalClassAttendance.date, String(date).trim())
        )
      });

      if (existingAtt) {
        await db.update(externalClassAttendance)
          .set({ attendanceData: JSON.stringify(attendanceData) })
          .where(eq(externalClassAttendance.id, existingAtt.id));
      } else {
        await db.insert(externalClassAttendance).values({
          externalClassId: Number(classId),
          date: String(date).trim(),
          attendanceData: JSON.stringify(attendanceData),
        });
      }

      return NextResponse.json({ success: true, message: "Chamada salva com sucesso!" });
    }

    // Ações em Lote para Notas (Batch Grades)
    if (action === "saveBatchGrades") {
      const { assessmentTitle, maxScore, gradesList } = body;
      const normalizedBatchMaxScore = normalizeGradeInput(maxScore || "10.0");
      if (normalizedBatchMaxScore === null) return NextResponse.json({ error: "O valor máximo deve ser um número decimal válido." }, { status: 400 });
      if (!classId || !assessmentTitle || !Array.isArray(gradesList) || gradesList.length === 0) {
        return NextResponse.json({ error: "Turma, título da avaliação e lista de notas são obrigatórios." }, { status: 400 });
      }

      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
            if (!canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
      if (existingClass.gradeStatus === "closed") {
        return NextResponse.json({ error: "As notas desta turma estão fechadas. Reabra o lançamento antes de alterar avaliações." }, { status: 409 });
      }
      const classStudents = await db.select().from(externalStudents).where(eq(externalStudents.externalClassId, Number(classId)));
      const validStudentIds = new Set(classStudents.map(s => s.id));
      let processedCount = 0;
      const errors = [];

      for (const item of gradesList) {
        const studentIdNum = Number(item.studentId);
        const scoreVal = normalizeGradeInput(item.score);
        if (!validStudentIds.has(studentIdNum)) {
          errors.push(`Aluno ID ${studentIdNum} não pertence a esta turma.`);
          continue;
        }
        if (scoreVal === null) {
          if (String(item.score ?? "").trim() === "") continue; // Pular notas vazias
          errors.push(`Aluno ID ${studentIdNum}: informe uma nota decimal válida.`);
          continue;
        }
        const gradeError = validateGrade(scoreVal, normalizedBatchMaxScore);
        if (gradeError) {
          errors.push(`Aluno ID ${studentIdNum}: ${gradeError}`);
          continue;
        }

        const [savedGrade] = await db.insert(externalClassGrades).values({
          externalClassId: Number(classId),
          studentId: studentIdNum,
          assessmentTitle: String(assessmentTitle).trim(),
          assessmentType: assessmentType ? String(assessmentType).trim() : "custom",
          assessmentVersion: assessmentVersion ? String(assessmentVersion).trim() : null,
          assessmentComponent: assessmentComponent ? String(assessmentComponent).trim() : null,
          score: scoreVal,
          maxScore: normalizedBatchMaxScore,
          rubricScores: item.rubricScores ? JSON.stringify(item.rubricScores) : (rubricScores ? String(rubricScores) : null),
          assessmentDate: assessmentDate ? String(assessmentDate).trim() : null,
          unitNumber: unitNumber !== undefined && unitNumber !== null && unitNumber !== "" ? Number(unitNumber) : null,
                    feedback: item.feedback ? String(item.feedback).trim() : null,
        }).returning();
        processedCount++;

        if (savedGrade) await notifyGradeChange(savedGrade, existingClass, "created");
      }

      return NextResponse.json({
        success: true,
        message: `Lote de notas processado: ${processedCount} registradas com sucesso.`,
        processedCount,
        errors,
      });
    }

    // Ações de Notas (Grades)
    if (action === "saveGrade") {
      if (!classId || !studentId || !assessmentTitle || score === undefined || score === null || String(score).trim() === "") {
        return NextResponse.json({ error: "Turma, aluno, título da avaliação e nota são obrigatórios." }, { status: 400 });
      }
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (!canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
      if (existingClass.gradeStatus === "closed") {
        return NextResponse.json({ error: "As notas desta turma estão fechadas. Reabra o lançamento antes de alterar avaliações." }, { status: 409 });
      }
      const targetStudent = await db.query.externalStudents.findFirst({ where: eq(externalStudents.id, Number(studentId)) });
      if (!targetStudent || targetStudent.externalClassId !== Number(classId)) {
        return NextResponse.json({ error: "O aluno selecionado não pertence a esta turma." }, { status: 400 });
      }
      const normalizedScore = normalizeGradeInput(score);
      const normalizedMaxScore = normalizeGradeInput(maxScore || "10.0");
      const gradeError = validateGrade(normalizedScore, normalizedMaxScore);
      if (gradeError) return NextResponse.json({ error: gradeError }, { status: 400 });
        const inserted = await db.insert(externalClassGrades).values({
          externalClassId: Number(classId),
        studentId: Number(studentId),
        assessmentTitle: String(assessmentTitle).trim(),
        assessmentType: assessmentType ? String(assessmentType).trim() : "custom",
        assessmentVersion: assessmentVersion ? String(assessmentVersion).trim() : null,
        assessmentComponent: assessmentComponent ? String(assessmentComponent).trim() : null,
        score: normalizedScore as string,
        maxScore: normalizedMaxScore as string,
        rubricScores: rubricScores ? String(rubricScores) : null,
        assessmentDate: assessmentDate ? String(assessmentDate).trim() : null,
        unitNumber: unitNumber !== undefined && unitNumber !== null && unitNumber !== "" ? Number(unitNumber) : null,
        feedback: feedback ? String(feedback).trim() : null,
      }).returning();

      await notifyGradeChange(inserted[0], existingClass, "created");
      return NextResponse.json({ success: true, grade: inserted[0] });
    }

    if (action === "updateGrade") {
      if (!gradeId || !assessmentTitle || score === undefined || score === null || String(score).trim() === "") {
        return NextResponse.json({ error: "Nota, título da avaliação e valor são obrigatórios." }, { status: 400 });
      }
      const existingGrade = await db.query.externalClassGrades.findFirst({ where: eq(externalClassGrades.id, Number(gradeId)) });
      if (!existingGrade) return NextResponse.json({ error: "Avaliação não encontrada." }, { status: 404 });
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, existingGrade.externalClassId) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (!canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
      if (existingClass.gradeStatus === "closed") {
        return NextResponse.json({ error: "As notas desta turma estão fechadas. Reabra o lançamento antes de editar avaliações." }, { status: 409 });
      }
      const normalizedScore = normalizeGradeInput(score);
      const normalizedMaxScore = normalizeGradeInput(maxScore || existingGrade.maxScore || "10.0");
      const gradeError = validateGrade(normalizedScore, normalizedMaxScore);
      if (gradeError) return NextResponse.json({ error: gradeError }, { status: 400 });
      const [updated] = await db.update(externalClassGrades).set({
        assessmentTitle: String(assessmentTitle).trim(),
        assessmentType: assessmentType ? String(assessmentType).trim() : existingGrade.assessmentType,
        assessmentVersion: assessmentVersion ? String(assessmentVersion).trim() : null,
        assessmentComponent: assessmentComponent ? String(assessmentComponent).trim() : null,
        score: normalizedScore as string,
        maxScore: normalizedMaxScore as string,
        rubricScores: rubricScores ? String(rubricScores) : null,
        assessmentDate: assessmentDate ? String(assessmentDate).trim() : null,
        unitNumber: unitNumber !== undefined && unitNumber !== null && unitNumber !== "" ? Number(unitNumber) : null,
        feedback: feedback ? String(feedback).trim() : null,
        updatedAt: new Date(),
      }).where(eq(externalClassGrades.id, Number(gradeId))).returning();
            await notifyGradeChange(updated, existingClass, "updated");
      return NextResponse.json({ success: true, grade: updated });
    }
    if (action === "deleteGrade") {
      if (!gradeId) {
        return NextResponse.json({ error: "ID da nota não informado." }, { status: 400 });
      }
      const grade = await db.query.externalClassGrades.findFirst({ where: eq(externalClassGrades.id, Number(gradeId)) });
      if (!grade) return NextResponse.json({ error: "Avaliação não encontrada." }, { status: 404 });
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, grade.externalClassId) });
      if (existingClass && !canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
      await db.delete(externalClassGrades).where(eq(externalClassGrades.id, Number(gradeId)));
      return NextResponse.json({ success: true });
    }

    // Ações de Materiais (Materials)
    if (action === "addMaterial") {
      if (!classId || !materialTitle || !fileUrl) {
        return NextResponse.json({ error: "Turma, título do material e URL/link do arquivo são obrigatórios." }, { status: 400 });
      }
      const materialUrlError = validateMaterialUrl(fileUrl);
      if (materialUrlError) return NextResponse.json({ error: materialUrlError }, { status: 400 });
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (!canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }

      const inserted = await db.insert(externalClassMaterials).values({
        externalClassId: Number(classId),
        title: String(materialTitle).trim(),
        fileUrl: String(fileUrl).trim(),
        description: materialDescription ? String(materialDescription).trim() : null,
      }).returning();

      // Notificar todos os alunos ativos da turma que possuem conta na plataforma
      const classStudents = await db.select().from(externalStudents).where(eq(externalStudents.externalClassId, Number(classId)));
      for (const st of classStudents) {
        if (!st.email) continue;
        const userAccount = await db.query.users.findFirst({ where: eq(users.email, st.email) });
        if (userAccount) {
          await db.insert(notifications).values({
            userId: userAccount.id,
            type: "material",
            title: `Novo Material: ${materialTitle}`,
            message: `Um novo material didático foi disponibilizado na turma ${existingClass.className} (${existingClass.institution}).`,
            metadata: JSON.stringify({ classId: Number(classId) }),
          });
        }
      }

      return NextResponse.json({ success: true, material: inserted[0] });
    }

    if (action === "deleteMaterial") {
      if (!materialId) {
        return NextResponse.json({ error: "ID do material não informado." }, { status: 400 });
      }
      const mat = await db.query.externalClassMaterials.findFirst({ where: eq(externalClassMaterials.id, Number(materialId)) });
      if (!mat) return NextResponse.json({ error: "Material não encontrado." }, { status: 404 });
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, mat.externalClassId) });
      if (existingClass && !canManageClass(existingClass.id, existingClass.teacherId)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
      await db.delete(externalClassMaterials).where(eq(externalClassMaterials.id, Number(materialId)));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    console.error("Erro na API de turmas externas:", error);
    return NextResponse.json({ error: "Erro interno ao processar requisição." }, { status: 500 });
  }
}
