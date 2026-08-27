export type ConsistencySeverity = "error" | "warning";

export type ConsistencyFinding = {
  code: string;
  severity: ConsistencySeverity;
  externalClassId: number;
  offerId?: number;
  message: string;
  details?: Record<string, unknown>;
};

export type LegacyStudentSnapshot = {
  id: number;
  userId?: number | null;
  name: string;
  email?: string | null;
  status?: string | null;
};

export type LegacyAttendanceSnapshot = {
  date: string;
  attendanceData: string;
};

export type LegacyClassSnapshot = {
  id: number;
  courseName: string;
  academicTerm: string;
  teacherId: number;
  studentIds: LegacyStudentSnapshot[];
  attendance: LegacyAttendanceSnapshot[];
  assignmentTeacherIds: number[];
};

export type OfferStudentSnapshot = {
  id: number;
  externalStudentId?: number | null;
  userId?: number | null;
  name: string;
  email?: string | null;
  status?: string | null;
};

export type OfferAttendanceSnapshot = {
  date: string;
  attendanceData: string;
};

export type CourseOfferSnapshot = {
  id: number;
  courseId: number;
  offerName: string;
  academicTerm: string;
  ownerTeacherId: number;
  sourceExternalClassId?: number | null;
  students: OfferStudentSnapshot[];
  attendance: OfferAttendanceSnapshot[];
  teacherIds: number[];
};

function parseAttendance(data: string): Record<string, string> {
  try {
    const parsed = JSON.parse(data);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, string> : {};
  } catch {
    return {};
  }
}

function normalize(value: string | null | undefined): string {
  return String(value ?? "").trim().toLocaleLowerCase();
}

export function auditCourseOfferConsistency(
  legacy: LegacyClassSnapshot,
  offer: CourseOfferSnapshot | null,
): ConsistencyFinding[] {
  const findings: ConsistencyFinding[] = [];
  const base = { externalClassId: legacy.id, ...(offer ? { offerId: offer.id } : {}) };
  if (!offer) {
    findings.push({ ...base, code: "MISSING_OFFER", severity: "error", message: "A turma legada não possui oferta correspondente." });
    return findings;
  }
  if (offer.sourceExternalClassId !== legacy.id) {
    findings.push({ ...base, code: "SOURCE_LINK_MISMATCH", severity: "error", message: "A oferta aponta para outra turma legada.", details: { expected: legacy.id, actual: offer.sourceExternalClassId } });
  }
  if (normalize(offer.academicTerm) !== normalize(legacy.academicTerm)) {
    findings.push({ ...base, code: "ACADEMIC_TERM_MISMATCH", severity: "warning", message: "O período acadêmico da oferta diverge da turma legada.", details: { expected: legacy.academicTerm, actual: offer.academicTerm } });
  }
  if (offer.ownerTeacherId !== legacy.teacherId) {
    findings.push({ ...base, code: "OWNER_TEACHER_MISMATCH", severity: "error", message: "O professor proprietário da oferta diverge da turma legada.", details: { expected: legacy.teacherId, actual: offer.ownerTeacherId } });
  }

  const legacyById = new Map(legacy.studentIds.map((student) => [student.id, student]));
  const offerByExternalId = new Map<number, OfferStudentSnapshot>();
  for (const student of offer.students) {
    if (student.externalStudentId != null) {
      if (offerByExternalId.has(student.externalStudentId)) {
        findings.push({ ...base, code: "DUPLICATE_STUDENT_MAPPING", severity: "error", message: "O mesmo aluno legado foi mapeado mais de uma vez na oferta.", details: { externalStudentId: student.externalStudentId } });
      }
      offerByExternalId.set(student.externalStudentId, student);
    }
  }
  const missingStudents = legacy.studentIds.filter((student) => !offerByExternalId.has(student.id));
  if (missingStudents.length > 0) {
    findings.push({ ...base, code: "MISSING_STUDENTS", severity: "error", message: "Há alunos legados ausentes na matrícula contextual.", details: { count: missingStudents.length, externalStudentIds: missingStudents.map((student) => student.id) } });
  }
  const extraStudents = offer.students.filter((student) => student.externalStudentId != null && !legacyById.has(student.externalStudentId));
  if (extraStudents.length > 0) {
    findings.push({ ...base, code: "ORPHAN_OFFER_STUDENTS", severity: "warning", message: "Há matrículas contextuais sem aluno correspondente na turma legada.", details: { count: extraStudents.length, externalStudentIds: extraStudents.map((student) => student.externalStudentId) } });
  }
  for (const legacyStudent of legacy.studentIds) {
    const contextual = offerByExternalId.get(legacyStudent.id);
    if (contextual && legacyStudent.userId && contextual.userId && legacyStudent.userId !== contextual.userId) {
      findings.push({ ...base, code: "STUDENT_USER_MISMATCH", severity: "error", message: "O aluno contextual está vinculado a outro usuário.", details: { externalStudentId: legacyStudent.id, expectedUserId: legacyStudent.userId, actualUserId: contextual.userId } });
    }
  }

  const legacyDates = new Set(legacy.attendance.map((row) => row.date));
  const offerDates = new Set(offer.attendance.map((row) => row.date));
  const missingDates = [...legacyDates].filter((date) => !offerDates.has(date));
  const extraDates = [...offerDates].filter((date) => !legacyDates.has(date));
  if (missingDates.length > 0) {
    findings.push({ ...base, code: "MISSING_ATTENDANCE_DATES", severity: "error", message: "Há chamadas legadas ausentes na oferta.", details: { dates: missingDates } });
  }
  if (extraDates.length > 0) {
    findings.push({ ...base, code: "ORPHAN_ATTENDANCE_DATES", severity: "warning", message: "Há chamadas na oferta sem data correspondente na turma legada.", details: { dates: extraDates } });
  }
  const offerAttendanceByDate = new Map(offer.attendance.map((row) => [row.date, row]));
  for (const legacyRow of legacy.attendance) {
    const offerRow = offerAttendanceByDate.get(legacyRow.date);
    if (!offerRow) continue;
    const legacyData = parseAttendance(legacyRow.attendanceData);
    const offerData = parseAttendance(offerRow.attendanceData);
    for (const [legacyStudentId, legacyStatus] of Object.entries(legacyData)) {
      const contextual = offerByExternalId.get(Number(legacyStudentId));
      if (!contextual) continue;
      if (offerData[String(contextual.id)] !== legacyStatus) {
        findings.push({ ...base, code: "ATTENDANCE_STATUS_MISMATCH", severity: "error", message: "O status de presença diverge após o remapeamento do aluno.", details: { date: legacyRow.date, externalStudentId: Number(legacyStudentId), offerStudentId: contextual.id, expected: legacyStatus, actual: offerData[String(contextual.id)] } });
      }
    }
  }

  const expectedTeachers = new Set([legacy.teacherId, ...legacy.assignmentTeacherIds]);
  const actualTeachers = new Set(offer.teacherIds);
  const missingTeachers = [...expectedTeachers].filter((teacherId) => !actualTeachers.has(teacherId));
  if (missingTeachers.length > 0) {
    findings.push({ ...base, code: "MISSING_TEACHER_ASSIGNMENTS", severity: "error", message: "Há professores legados ausentes nas atribuições da oferta.", details: { teacherIds: missingTeachers } });
  }
  return findings;
}

export function summarizeConsistency(findings: ConsistencyFinding[]) {
  return {
    total: findings.length,
    errors: findings.filter((finding) => finding.severity === "error").length,
    warnings: findings.filter((finding) => finding.severity === "warning").length,
    ok: findings.length === 0,
  };
}
