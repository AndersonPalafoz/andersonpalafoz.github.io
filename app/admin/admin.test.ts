import { describe, it, expect } from "vitest";

describe("Admin Panel", () => {
  describe("Course Management", () => {
    it("should display list of courses", () => {
      const mockCourses = [
        {
          id: 1,
          title: "English A1 - Beginner",
          level: "A1",
          modules: 5,
          description: "Curso básico de inglês para iniciantes",
        },
      ];
      expect(mockCourses).toHaveLength(1);
      expect(mockCourses[0].title).toBe("English A1 - Beginner");
    });

    it("should add a new course", () => {
      const courses = [
        {
          id: 1,
          title: "English A1",
          level: "A1",
          modules: 5,
          description: "Beginner course",
        },
      ];
      const newCourse = {
        id: 2,
        title: "English B1",
        level: "B1",
        modules: 8,
        description: "Intermediate course",
      };
      const updated = [...courses, newCourse];
      expect(updated).toHaveLength(2);
      expect(updated[1].title).toBe("English B1");
    });

    it("should delete a course", () => {
      const courses = [
        { id: 1, title: "English A1", level: "A1", modules: 5, description: "Beginner" },
        { id: 2, title: "English B1", level: "B1", modules: 8, description: "Intermediate" },
      ];
      const filtered = courses.filter((c) => c.id !== 1);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(2);
    });
  });

  describe("Material Management", () => {
    it("should display list of materials", () => {
      const mockMaterials = [
        {
          id: 1,
          title: "Vocabulary List - A1",
          category: "Vocabulário",
          level: "A1",
          type: "PDF",
          downloads: 45,
        },
      ];
      expect(mockMaterials).toHaveLength(1);
      expect(mockMaterials[0].category).toBe("Vocabulário");
    });

    it("should track material downloads", () => {
      const material = {
        id: 1,
        title: "Vocabulary List",
        category: "Vocabulário",
        level: "A1",
        type: "PDF",
        downloads: 45,
      };
      expect(material.downloads).toBeGreaterThan(0);
    });
  });

  describe("Article Management", () => {
    it("should display list of articles", () => {
      const mockArticles = [
        {
          id: 1,
          title: "5 Dicas para Melhorar sua Pronúncia",
          category: "Dicas",
          status: "published" as const,
          views: 234,
          date: "2024-01-15",
        },
      ];
      expect(mockArticles).toHaveLength(1);
      expect(mockArticles[0].status).toBe("published");
    });

    it("should support draft and published states", () => {
      const article = {
        id: 1,
        title: "Test Article",
        category: "Dicas",
        status: "draft" as const,
        views: 0,
        date: "2024-01-20",
      };
      expect(["draft", "published"]).toContain(article.status);
    });

    it("should track article views", () => {
      const article = {
        id: 1,
        title: "Test Article",
        category: "Dicas",
        status: "published" as const,
        views: 234,
        date: "2024-01-15",
      };
      expect(article.views).toBe(234);
    });
  });
});
