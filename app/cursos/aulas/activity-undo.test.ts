import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Activity completion undo", () => {
  it("exposes an undo action for both listening and speaking success toasts", () => {
    const player = readFileSync(join(process.cwd(), "app/cursos/[id]/aulas/[lessonId]/page.tsx"), "utf8");
    expect(player).toContain('label: "Desfazer"');
    expect(player).toContain("updateListeningProgress(false)");
    expect(player).toContain("undoSpeakingCompletion");
  });

  it("reverts progress without deleting the speaking attempt history", () => {
    const route = readFileSync(join(process.cwd(), "app/api/activities/[id]/progress/route.ts"), "utf8");
    expect(route).toContain('["listening", "speaking"].includes(activity.type)');
    expect(route).toContain('completed ? "completed" : "pending"');
    expect(route).toContain("completedAt: completed ? new Date() : null");
    expect(route).not.toContain("delete(speakingAttempts)");
  });
});
