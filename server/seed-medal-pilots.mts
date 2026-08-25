import { db } from "@/lib/db";
import { medalsCatalog } from "@/drizzle/schema";
import { PILOT_MEDALS } from "@/lib/medal-pilot-catalog";

async function main() {
  for (const medal of PILOT_MEDALS) {
    await db.insert(medalsCatalog).values(medal).onConflictDoNothing({ target: medalsCatalog.code });
  }
  console.log(`Catálogo de medalhas: ${PILOT_MEDALS.length} pilotos verificados.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Falha ao registrar pilotos de medalhas:", error);
  process.exitCode = 1;
});
