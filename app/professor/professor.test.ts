import { describe, expect, it } from "vitest";
import { getTeacherDashboardData } from "@/lib/teacher";
import { isTeacherOrAdminRole } from "@/lib/teacher-auth";

describe("Teacher panel helper and permissions", () => {
  it("identifies teacher and admin roles correctly", () => {
    expect(isTeacherOrAdminRole("professor")).toBe(true);
    expect(isTeacherOrAdminRole("admin")).toBe(true);
    expect(isTeacherOrAdminRole("user")).toBe(false);
    expect(isTeacherOrAdminRole(undefined)).toBe(false);
  });

  it("fetches teacher dashboard aggregate data successfully", async () => {
    const data = await getTeacherDashboardData();
    expect(data).toBeTruthy();
    expect(data.stats).toHaveProperty("totalCourses");
    expect(data.stats).toHaveProperty("totalStudents");
    expect(data.stats).toHaveProperty("totalMaterials");
    expect(data.stats).toHaveProperty("totalActivities");
    expect(data.stats).toHaveProperty("totalEnrollments");
    expect(Array.isArray(data.recentCourses)).toBe(true);
    expect(Array.isArray(data.recentMaterials)).toBe(true);
  });
});
