import { describe, expect, it } from "vitest";
import { auditCourseOfferConsistency, summarizeConsistency, type CourseOfferSnapshot, type LegacyClassSnapshot } from "./course-offer-consistency";

const legacy: LegacyClassSnapshot = {
  id: 10,
  courseName: "Inglês",
  academicTerm: "2026.1",
  teacherId: 7,
  studentIds: [
    { id: 1, userId: 101, name: "Ana" },
    { id: 2, userId: 102, name: "Bruno" },
  ],
  attendance: [{ date: "2026-06-01", attendanceData: JSON.stringify({ "1": "present", "2": "absent" }) }],
  assignmentTeacherIds: [8],
};

const offer: CourseOfferSnapshot = {
  id: 20,
  courseId: 3,
  offerName: "Turma manhã",
  academicTerm: "2026.1",
  ownerTeacherId: 7,
  sourceExternalClassId: 10,
  students: [
    { id: 201, externalStudentId: 1, userId: 101, name: "Ana" },
    { id: 202, externalStudentId: 2, userId: 102, name: "Bruno" },
  ],
  attendance: [{ date: "2026-06-01", attendanceData: JSON.stringify({ "201": "present", "202": "absent" }) }],
  teacherIds: [7, 8],
};

describe("course offer consistency", () => {
  it("returns no findings for a consistent migration", () => {
    expect(auditCourseOfferConsistency(legacy, offer)).toEqual([]);
  });

  it("detects a missing offer", () => {
    const findings = auditCourseOfferConsistency(legacy, null);
    expect(findings.map((finding) => finding.code)).toContain("MISSING_OFFER");
    expect(summarizeConsistency(findings).errors).toBe(1);
  });

  it("detects missing students, calls and teacher assignments", () => {
    const findings = auditCourseOfferConsistency(legacy, { ...offer, students: [offer.students[0]], attendance: [], teacherIds: [7] });
    expect(findings.map((finding) => finding.code)).toEqual(expect.arrayContaining(["MISSING_STUDENTS", "MISSING_ATTENDANCE_DATES", "MISSING_TEACHER_ASSIGNMENTS"]));
  });

  it("detects mismatched attendance after student id remapping", () => {
    const findings = auditCourseOfferConsistency(legacy, { ...offer, attendance: [{ date: "2026-06-01", attendanceData: JSON.stringify({ "201": "absent", "202": "absent" }) }] });
    expect(findings.map((finding) => finding.code)).toContain("ATTENDANCE_STATUS_MISMATCH");
  });
});
