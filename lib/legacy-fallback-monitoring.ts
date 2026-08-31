import { eventLogs } from "@/drizzle/schema";
import { db } from "@/lib/db";

export type LegacyFallbackReason = "class-id-compatibility" | "legacy-only-fallback";

export function recordLegacyFallbackRead({
  classId,
  reason,
}: {
  classId: number;
  reason: LegacyFallbackReason;
}) {
  const database = db as typeof db & { insert?: typeof db.insert };
  if (typeof database.insert !== "function") return;
  void database.insert.call(db, eventLogs).values({
    eventType: "legacy_fallback_read",
    details: JSON.stringify({ source: "academic-context", classId, reason }),
  }).catch((error) => {
    console.warn("Não foi possível registrar leitura de fallback legado:", error);
  });
}
