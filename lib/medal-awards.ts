import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { medalsCatalog, notifications, userMedals } from "@/drizzle/schema";
import { getPilotMedal } from "@/lib/medal-pilot-catalog";

export type AwardMedalInput = {
  userId: number;
  medalCode: string;
  awardedBy?: number | null;
  grantType?: "automatic" | "manual";
  notes?: string | null;
  notify?: boolean;
};

export type AwardMedalResult =
  | { awarded: true; medal: typeof userMedals.$inferSelect }
  | { awarded: false; reason: "already-awarded" | "catalog-not-found" };

/**
 * Concede uma medalha uma única vez por aluno/código. A consulta anterior ao insert
 * torna o fluxo idempotente em condições normais; o tratamento de conflito mantém
 * a operação segura enquanto a restrição única é aplicada no banco ativo.
 */
export async function awardMedalIfEligible(input: AwardMedalInput): Promise<AwardMedalResult> {
  const medal = getPilotMedal(input.medalCode)
    ?? await db.query.medalsCatalog.findFirst({ where: eq(medalsCatalog.code, input.medalCode) });
  if (!medal) return { awarded: false, reason: "catalog-not-found" };

  const existing = await db.query.userMedals.findFirst({
    where: and(eq(userMedals.userId, input.userId), eq(userMedals.medalCode, input.medalCode)),
  });
  if (existing) return { awarded: false, reason: "already-awarded" };

  try {
    const inserted = await db.insert(userMedals).values({
      userId: input.userId,
      medalCode: input.medalCode,
      awardedBy: input.awardedBy ?? null,
      grantType: input.grantType ?? "automatic",
      notes: input.notes ?? null,
    }).returning();
    const created = inserted[0];
    if (!created) return { awarded: false, reason: "already-awarded" };

    if (input.notify !== false) {
      await db.insert(notifications).values({
        userId: input.userId,
        title: `Conquista desbloqueada: ${medal.title}`,
        message: "Você recebeu uma nova medalha por seu progresso na plataforma.",
        type: "achievement",
        metadata: JSON.stringify({ medalCode: input.medalCode, grantType: input.grantType ?? "automatic" }),
        readAt: null,
      });
    }

    return { awarded: true, medal: created };
  } catch (error) {
    // Uma concessão concorrente pode vencer entre o SELECT e o INSERT. Se o banco
    // rejeitar a duplicata, confirmamos o estado final em vez de exibir falso erro.
    const duplicate = await db.query.userMedals.findFirst({
      where: and(eq(userMedals.userId, input.userId), eq(userMedals.medalCode, input.medalCode)),
    });
    if (duplicate) return { awarded: false, reason: "already-awarded" };
    throw error;
  }
}
