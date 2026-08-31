import { sql } from "drizzle-orm";

const jsonOnly = process.argv.includes("--json");
const failOnEvent = process.argv.includes("--fail-on-event");

async function main() {
  if (!process.env.NEON_DATABASE_URL && !process.env.DATABASE_URL) {
    console.log(JSON.stringify({ status: "skipped", reason: "NEON_DATABASE_URL ou DATABASE_URL não configurada" }));
    return;
  }
  const [{ db }] = await Promise.all([import("@/lib/db")]);
  const rows = await db.execute(sql`
    SELECT COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '24 hours')::int AS last_24h,
           COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '7 days')::int AS last_7d
    FROM event_logs
    WHERE "eventType" = 'legacy_fallback_read'
    LIMIT 1
  `);
  const row = rows[0] as Record<string, unknown> | undefined;
  const result = {
    generatedAt: new Date().toISOString(),
    status: Number(row?.last_24h ?? 0) > 0 ? "fallback-detected" : "clean",
    total: Number(row?.total ?? 0),
    last24h: Number(row?.last_24h ?? 0),
    last7d: Number(row?.last_7d ?? 0),
    threshold: failOnEvent ? "zero-events-in-last-24h" : "informational",
  };
  if (jsonOnly) console.log(JSON.stringify(result));
  else console.log(`Fallback legado: ${result.status} | últimas 24h: ${result.last24h} | últimos 7 dias: ${result.last7d}`);
  if (failOnEvent && result.last24h > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
