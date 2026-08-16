export type BulkAttendanceStatus = "present" | "absent";

export interface AttendanceSelectionRecord {
  attendanceId: number;
  sessionId: number;
}

export function buildBulkAttendancePayload(records: AttendanceSelectionRecord[], status: BulkAttendanceStatus) {
  return records.map((record) => ({ ...record, status }));
}
