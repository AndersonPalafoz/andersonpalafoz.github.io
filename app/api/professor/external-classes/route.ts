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
  users,
  notifications,
} from "@/drizzle/schema";
import { eq, desc, and, isNull, isNotNull, inArray } from "drizzle-orm";

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

function validateGrade(score: unknown, maxScore: unknown) {
  const scoreNumber = Number(String(score ?? "").replace(",", "."));
  const maxNumber = Number(String(maxScore ?? "10").replace(",", "."));
  if (!Number.isFinite(scoreNumber) || !Number.isFinite(maxNumber) || maxNumber <= 0) return "A nota e o valor máximo devem ser numéricos.";
  if (scoreNumber < 0 || scoreNumber > maxNumber) return `A nota deve estar entre 0 e ${maxNumber}.`;
  return null;
}

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

    let teacher = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!teacher) {
      const inserted = await db.insert(users).values({
        openId: `admin_${Date.now()}`,
        name: session.user.name || "Anderson Palafoz",
        email: email,
        role: "admin",
        approvalStatus: "approved",
      }).returning();
      teacher = inserted[0];
    }

    const isGlobalAdmin = userRole === "admin" || userRole === "super_admin" || userEmail === "palafozanderson@gmail.com" || email === "palafozanderson@gmail.com";
    const mode = searchParams.get("mode");

    let classesQuery;
    if (mode === "trash") {
      classesQuery = isGlobalAdmin
        ? db.select().from(externalClasses).where(isNotNull(externalClasses.deletedAt)).orderBy(desc(externalClasses.deletedAt))
        : db.select().from(externalClasses).where(and(eq(externalClasses.teacherId, teacher.id), isNotNull(externalClasses.deletedAt))).orderBy(desc(externalClasses.deletedAt));
    } else {
      classesQuery = isGlobalAdmin
        ? db.select().from(externalClasses).where(isNull(externalClasses.deletedAt)).orderBy(desc(externalClasses.createdAt))
        : db.select().from(externalClasses).where(and(eq(externalClasses.teacherId, teacher.id), isNull(externalClasses.deletedAt))).orderBy(desc(externalClasses.createdAt));
    }

    const classes = await classesQuery;
    
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

    return NextResponse.json({ success: true, classes: result });
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

    let teacher = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!teacher) {
      const inserted = await db.insert(users).values({
        openId: `admin_${Date.now()}`,
        name: session.user.name || "Anderson Palafoz",
        email: email,
        role: "admin",
        approvalStatus: "approved",
      }).returning();
      teacher = inserted[0];
    }

    const isGlobalAdmin = userRole === "admin" || userRole === "super_admin" || userRole === "professor" || userEmail === "palafozanderson@gmail.com" || email === "palafozanderson@gmail.com";

    const body = await request.json();
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
      materialTitle,
      fileUrl,
      materialDescription,
      materialId,
    } = body;

    if (action === "createClass") {
      if (!institution || !className || !courseName || !academicTerm) {
        return NextResponse.json({ error: "Instituição, nome da turma, nome do curso e período são obrigatórios." }, { status: 400 });
      }

      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        return NextResponse.json({ error: "A data final não pode ser anterior à data inicial." }, { status: 400 });
      }
      if (maxAbsencePercent !== undefined && (Number(maxAbsencePercent) < 0 || Number(maxAbsencePercent) > 100)) {
        return NextResponse.json({ error: "O limite máximo de faltas deve estar entre 0% e 100%." }, { status: 400 });
      }
      const allowedDurationTypes = ["annual", "semester", "workload", "custom"];
      if (hasUnits && (!Number.isInteger(Number(unitCount)) || Number(unitCount) < 1 || Number(unitCount) > 100)) return NextResponse.json({ error: "A quantidade de unidades deve estar entre 1 e 100." }, { status: 400 });
      if (gradingScope !== undefined && !["course", "unit"].includes(String(gradingScope))) return NextResponse.json({ error: "Escopo de média inválido." }, { status: 400 });
      if (passingAverage !== undefined && (!Number.isFinite(Number(passingAverage)) || Number(passingAverage) < 0 || Number(passingAverage) > 10)) return NextResponse.json({ error: "A média mínima deve estar entre 0 e 10." }, { status: 400 });
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
        maxAbsencePercent: maxAbsencePercent ? Number(maxAbsencePercent) : 25,
        hasUnits: Boolean(hasUnits),
        unitCount: hasUnits ? Number(unitCount || 1) : 1,
        gradingScope: hasUnits && gradingScope === "unit" ? "unit" : "course",
        passingAverage: String(passingAverage ?? 5),
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
      if (!isGlobalAdmin && existing.teacherId !== teacher.id) {
        return NextResponse.json({ error: "Acesso negado para editar esta turma." }, { status: 403 });
      }

      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        return NextResponse.json({ error: "A data final não pode ser anterior à data inicial." }, { status: 400 });
      }
      if (maxAbsencePercent !== undefined && (Number(maxAbsencePercent) < 0 || Number(maxAbsencePercent) > 100)) {
        return NextResponse.json({ error: "O limite máximo de faltas deve estar entre 0% e 100%." }, { status: 400 });
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
          maxAbsencePercent: maxAbsencePercent !== undefined ? Number(maxAbsencePercent) : existing.maxAbsencePercent,
          hasUnits: hasUnits !== undefined ? Boolean(hasUnits) : existing.hasUnits,
          unitCount: hasUnits !== undefined ? (hasUnits ? Number(unitCount || 1) : 1) : existing.unitCount,
          gradingScope: gradingScope !== undefined ? (hasUnits === false ? "course" : String(gradingScope)) : existing.gradingScope,
          passingAverage: passingAverage !== undefined ? String(passingAverage) : existing.passingAverage,
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
      if (!isGlobalAdmin && existing.teacherId !== teacher.id) return NextResponse.json({ error: "Acesso negado para duplicar esta turma." }, { status: 403 });

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
      if (!isGlobalAdmin && existingClass.teacherId !== teacher.id) {
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
        notes: studentNotes ? studentNotes.trim() : null,
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
      if (existingClass && !isGlobalAdmin && existingClass.teacherId !== teacher.id) {
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
          notes: studentNotes !== undefined ? studentNotes.trim() : student.notes,
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

      const externalClassId = Number(classId);
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, externalClassId) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (!isGlobalAdmin && existingClass.teacherId !== teacher.id) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }

      const metadata = classMetadata && typeof classMetadata === "object" ? classMetadata as Record<string, unknown> : {};
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

      for (const rawRow of csvData) {
        const row = rawRow as Record<string, unknown>;
        const name = row.name || row.nome || row["nome completo"];
        if (!name) {
          skippedCount++;
          continue;
        }
        const normalizedEmail = String(row.email || row.e_mail || row["e-mail"] || "").trim().toLowerCase();
        const normalizedCpf = String(row.cpf || "").trim().replace(/\D/g, "");
        const normalizedId = String(row.studentIdNumber || row.matricula || row.id || row["número de matrícula"] || "").trim();
        const normalizedCategory = String(row.category || row.categoria || "").trim();
        const normalizedUniversity = String(row.university || row.universidade || row.instituicao || "").trim();
        const normalizedComponent = String(row.component || row.componente || row.nivel || "").trim();

        const duplicateWhere = normalizedEmail
          ? and(eq(externalStudents.externalClassId, externalClassId), eq(externalStudents.email, normalizedEmail))
          : normalizedCpf
            ? and(eq(externalStudents.externalClassId, externalClassId), eq(externalStudents.cpf, normalizedCpf))
            : null;
        const existingStudent = duplicateWhere ? await db.query.externalStudents.findFirst({ where: duplicateWhere }) : null;
        let studentRecord;

        if (existingStudent) {
          const updated = await db.update(externalStudents).set({
            name: String(name).trim(),
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
            name: String(name).trim(),
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

    if (action === "deleteStudent") {
      if (!studentId) {
        return NextResponse.json({ error: "ID do aluno não informado." }, { status: 400 });
      }

      const student = await db.query.externalStudents.findFirst({ where: eq(externalStudents.id, Number(studentId)) });
      if (student) {
        const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, student.externalClassId) });
        if (existingClass && !isGlobalAdmin && existingClass.teacherId !== teacher.id) {
          return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
        }
        await db.delete(externalStudents).where(eq(externalStudents.id, Number(studentId)));
      }

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

      if (!isGlobalAdmin && session.user.role !== "super_admin" && userEmail !== "palafozanderson@gmail.com" && existingClass.teacherId !== teacher.id) {
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
      if (!isGlobalAdmin && existingClass.teacherId !== teacher.id) {
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
      if (!isGlobalAdmin && existingClass.teacherId !== teacher.id) {
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

      if (!isGlobalAdmin && existingClass.teacherId !== teacher.id) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }

      const [softDeleted] = await db.update(externalClasses).set({ deletedAt: new Date() }).where(eq(externalClasses.id, Number(classId))).returning();

      return NextResponse.json({
        success: true,
        message: "Turma externa movida para a lixeira.",
        class: softDeleted,
      });
    }

    // Ações de Chamada (Attendance)
    if (action === "saveAttendance") {
      if (!classId || !date || !attendanceData) {
        return NextResponse.json({ error: "ID da turma, data e dados de frequência são obrigatórios." }, { status: 400 });
      }
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (!isGlobalAdmin && existingClass.teacherId !== teacher.id) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
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
      if (!classId || !assessmentTitle || !Array.isArray(gradesList) || gradesList.length === 0) {
        return NextResponse.json({ error: "Turma, título da avaliação e lista de notas são obrigatórios." }, { status: 400 });
      }

      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (!isGlobalAdmin && existingClass.teacherId !== teacher.id) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }

      const classStudents = await db.select().from(externalStudents).where(eq(externalStudents.externalClassId, Number(classId)));
      const validStudentIds = new Set(classStudents.map(s => s.id));

      let processedCount = 0;
      const errors = [];

      for (const item of gradesList) {
        const studentIdNum = Number(item.studentId);
        const scoreVal = String(item.score ?? "").trim();
        if (!validStudentIds.has(studentIdNum)) {
          errors.push(`Aluno ID ${studentIdNum} não pertence a esta turma.`);
          continue;
        }
        if (!scoreVal) {
          continue; // Pular notas vazias
        }
        const gradeError = validateGrade(scoreVal, maxScore || "10.0");
        if (gradeError) {
          errors.push(`Aluno ID ${studentIdNum}: ${gradeError}`);
          continue;
        }

        await db.insert(externalClassGrades).values({
          externalClassId: Number(classId),
          studentId: studentIdNum,
          assessmentTitle: String(assessmentTitle).trim(),
          assessmentType: assessmentType ? String(assessmentType).trim() : "custom",
          assessmentVersion: assessmentVersion ? String(assessmentVersion).trim() : null,
          assessmentComponent: assessmentComponent ? String(assessmentComponent).trim() : null,
          score: scoreVal,
          maxScore: maxScore ? String(maxScore).trim() : "10.0",
          rubricScores: item.rubricScores ? JSON.stringify(item.rubricScores) : (rubricScores ? String(rubricScores) : null),
          assessmentDate: assessmentDate ? String(assessmentDate).trim() : null,
          unitNumber: unitNumber !== undefined && unitNumber !== null && unitNumber !== "" ? Number(unitNumber) : null,
          feedback: item.feedback ? String(item.feedback).trim() : null,
        });

        processedCount++;

        // Notificar aluno se houver conta vinculada
        const targetStudent = classStudents.find(s => s.id === studentIdNum);
        if (targetStudent?.email) {
          const userAccount = await db.query.users.findFirst({ where: eq(users.email, targetStudent.email) });
          if (userAccount) {
            await db.insert(notifications).values({
              userId: userAccount.id,
              type: "grade",
              title: `Nova Nota em Lote: ${assessmentTitle}`,
              message: `Você recebeu nota ${scoreVal}/${maxScore || "10.0"} na turma ${existingClass.className} (${existingClass.institution}).`,
              metadata: JSON.stringify({ classId: Number(classId) }),
            });
          }
        }
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
      if (!classId || !studentId || !assessmentTitle || !score) {
        return NextResponse.json({ error: "Turma, aluno, título da avaliação e nota são obrigatórios." }, { status: 400 });
      }
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (!isGlobalAdmin && existingClass.teacherId !== teacher.id) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
      const gradeError = validateGrade(score, maxScore || "10.0");
      if (gradeError) return NextResponse.json({ error: gradeError }, { status: 400 });

      const inserted = await db.insert(externalClassGrades).values({
        externalClassId: Number(classId),
        studentId: Number(studentId),
        assessmentTitle: String(assessmentTitle).trim(),
        assessmentType: assessmentType ? String(assessmentType).trim() : "custom",
        assessmentVersion: assessmentVersion ? String(assessmentVersion).trim() : null,
        assessmentComponent: assessmentComponent ? String(assessmentComponent).trim() : null,
        score: String(score).trim(),
        maxScore: maxScore ? String(maxScore).trim() : "10.0",
        rubricScores: rubricScores ? String(rubricScores) : null,
        assessmentDate: assessmentDate ? String(assessmentDate).trim() : null,
        unitNumber: unitNumber !== undefined && unitNumber !== null && unitNumber !== "" ? Number(unitNumber) : null,
        feedback: feedback ? String(feedback).trim() : null,
      }).returning();

      // Notificar aluno se tiver usuário cadastrado com o e-mail
      const targetStudent = await db.query.externalStudents.findFirst({ where: eq(externalStudents.id, Number(studentId)) });
      if (targetStudent?.email) {
        const userAccount = await db.query.users.findFirst({ where: eq(users.email, targetStudent.email) });
        if (userAccount) {
          await db.insert(notifications).values({
            userId: userAccount.id,
            type: "grade",
            title: `Nova Nota: ${assessmentTitle}`,
            message: `Você recebeu nota ${score}/${maxScore} na turma ${existingClass.className} (${existingClass.institution}).`,
            metadata: JSON.stringify({ classId: Number(classId) }),
          });
        }
      }

      return NextResponse.json({ success: true, grade: inserted[0] });
    }

    if (action === "deleteGrade") {
      if (!gradeId) {
        return NextResponse.json({ error: "ID da nota não informado." }, { status: 400 });
      }
      const grade = await db.query.externalClassGrades.findFirst({ where: eq(externalClassGrades.id, Number(gradeId)) });
      if (grade) {
        const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, grade.externalClassId) });
        if (existingClass && !isGlobalAdmin && existingClass.teacherId !== teacher.id) {
          return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
        }
        await db.delete(externalClassGrades).where(eq(externalClassGrades.id, Number(gradeId)));
      }
      return NextResponse.json({ success: true });
    }

    // Ações de Materiais (Materials)
    if (action === "addMaterial") {
      if (!classId || !materialTitle || !fileUrl) {
        return NextResponse.json({ error: "Turma, título do material e URL/link do arquivo são obrigatórios." }, { status: 400 });
      }
      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (!isGlobalAdmin && existingClass.teacherId !== teacher.id) {
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
      if (mat) {
        const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, mat.externalClassId) });
        if (existingClass && !isGlobalAdmin && existingClass.teacherId !== teacher.id) {
          return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
        }
        await db.delete(externalClassMaterials).where(eq(externalClassMaterials.id, Number(materialId)));
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    console.error("Erro na API de turmas externas:", error);
    return NextResponse.json({ error: "Erro interno ao processar requisição." }, { status: 500 });
  }
}
