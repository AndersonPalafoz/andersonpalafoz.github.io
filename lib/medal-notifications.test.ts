import { describe, expect, it } from "vitest";
import { getNewUnreadMedalNotifications, isUnreadMedalNotification, type StudentNotification } from "./medal-notifications";

const medalNotification: StudentNotification = {
  id: 31,
  type: "achievement",
  title: "Conquista desbloqueada: Primeiro Passo",
  message: "Você recebeu uma nova medalha por seu progresso na plataforma.",
  metadata: JSON.stringify({ medalCode: "primeiro-passo", grantType: "automatic" }),
  readAt: null,
  createdAt: "2026-08-27T03:00:00.000Z",
};

describe("notificações de medalhas", () => {
  it("reconhece somente concessões de medalha ainda não lidas", () => {
    expect(isUnreadMedalNotification(medalNotification)).toBe(true);
    expect(isUnreadMedalNotification({ ...medalNotification, readAt: "2026-08-27T03:01:00.000Z" })).toBe(false);
    expect(isUnreadMedalNotification({ ...medalNotification, type: "info" })).toBe(false);
    expect(isUnreadMedalNotification({ ...medalNotification, metadata: JSON.stringify({ courseId: 8 }) })).toBe(false);
    expect(isUnreadMedalNotification({ ...medalNotification, metadata: "{" })).toBe(false);
  });

  it("não reapresenta ao aluno alertas que já foram exibidos nesta sessão", () => {
    const newItems = getNewUnreadMedalNotifications([
      medalNotification,
      { ...medalNotification, id: 32, metadata: JSON.stringify({ medalCode: "trilha-iniciada" }) },
    ], new Set([31]));

    expect(newItems.map((item) => item.id)).toEqual([32]);
  });
});
