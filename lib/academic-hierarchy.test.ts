import { describe, expect, it } from "vitest";
import { isCompleteOrder, isMaterialLinkedToLesson, reindexEntities } from "./academic-hierarchy";

describe("academic hierarchy rules", () => {
  it("accepts a complete module order without duplicates", () => {
    expect(isCompleteOrder([3, 1, 2], [1, 2, 3])).toBe(true);
    expect(isCompleteOrder([3, 1], [1, 2, 3])).toBe(false);
    expect(isCompleteOrder([1, 1, 2], [1, 2, 3])).toBe(false);
  });

  it("rejects IDs that do not belong to the course", () => {
    expect(isCompleteOrder([1, 4], [1, 2])).toBe(false);
    expect(isCompleteOrder([0, 1], [1, 2])).toBe(false);
  });

  it("reindexes entities according to the requested order", () => {
    const result = reindexEntities(
      [{ id: 10, title: "A", order: 9 }, { id: 20, title: "B", order: 1 }],
      [20, 10],
    );
    expect(result.map((item) => [item.id, item.order])).toEqual([[20, 1], [10, 2]]);
  });

  it("requires both the lesson and course to match a linked material", () => {
    expect(isMaterialLinkedToLesson({ courseId: 5, lessonId: 7 }, { courseId: 5, id: 7 })).toBe(true);
    expect(isMaterialLinkedToLesson({ courseId: 9, lessonId: 7 }, { courseId: 5, id: 7 })).toBe(false);
    expect(isMaterialLinkedToLesson({ courseId: 5, lessonId: 8 }, { courseId: 5, id: 7 })).toBe(false);
  });
});
