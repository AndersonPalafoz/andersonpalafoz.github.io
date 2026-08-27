import { describe, expect, it } from "vitest";
import { buildPedagogicalInterventions } from "./pedagogical-interventions";

const student = { id: 7, name: "Ana", email: "ana@example.com" };
const baseProgress = {
  id: 11,
  userId: 7,
  activityId: 21,
  status: "completed",
  submittedAt: "2026-08-27T10:00:00.000Z",
  activity: { type: "speaking", title: "Apresentação pessoal" },
};
const attempts = [{ id: 1, userId: 7, activityId: 21, attemptNumber: 1, submittedAt: "2026-08-27T10:00:00.000Z" }];

describe("buildPedagogicalInterventions", () => {
  it("prioriza uma gravação no escopo docente que ainda aguarda feedback", () => {
    const queue = buildPedagogicalInterventions({ students: [student], activityProgress: [baseProgress], speakingAttempts: attempts });
    expect(queue).toMatchObject([{ priority: "ação agora", reason: "Gravação recebida e aguardando feedback docente.", studentName: "Ana" }]);
  });

  it("mantém uma nova tentativa orientada como acompanhamento explicável", () => {
    const queue = buildPedagogicalInterventions({
      students: [student],
      activityProgress: [{ ...baseProgress, status: "in_progress", teacherFeedback: "Revise a ligação entre as palavras antes de regravar." }],
      speakingAttempts: attempts,
    });
    expect(queue).toMatchObject([{ priority: "acompanhar", actionLabel: "Acompanhar orientação" }]);
  });

  it("não mantém na fila uma orientação concluída após o novo envio", () => {
    const queue = buildPedagogicalInterventions({
      students: [student],
      activityProgress: [{ ...baseProgress, teacherFeedback: "Boa evolução." }],
      speakingAttempts: [...attempts, { ...attempts[0], id: 2, attemptNumber: 2 }],
    });
    expect(queue).toEqual([]);
  });

  it("não vaza alunos fora do escopo recebido", () => {
    const queue = buildPedagogicalInterventions({
      students: [student],
      activityProgress: [{ ...baseProgress, userId: 99 }],
      speakingAttempts: attempts,
    });
    expect(queue).toEqual([]);
  });
});
