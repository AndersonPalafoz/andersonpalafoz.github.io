export interface AttendanceFilterRecord {
  scheduledAt: Date | string;
  courseTitle: string | null;
  status: string;
}

export interface AttendanceFilters {
  status?: string;
  courseTitle?: string;
  startDate?: string;
  endDate?: string;
}

export function filterAttendanceRecords<T extends AttendanceFilterRecord>(records: T[], filters: AttendanceFilters) {
  return records.filter((record) => {
    if (filters.status && filters.status !== "all" && record.status !== filters.status) return false;
    if (filters.courseTitle && filters.courseTitle !== "all" && record.courseTitle !== filters.courseTitle) return false;
    const recordDate = new Date(record.scheduledAt);
    if (filters.startDate && recordDate < new Date(`${filters.startDate}T00:00:00`)) return false;
    if (filters.endDate && recordDate > new Date(`${filters.endDate}T23:59:59`)) return false;
    return true;
  });
}
