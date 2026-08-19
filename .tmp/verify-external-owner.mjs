import { db } from "../lib/db.ts";
import { externalClasses, users } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

async function run() {
  const adminUser = await db.query.users.findFirst({ where: eq(users.email, "palafozanderson@gmail.com") });
  console.log("Admin user in DB:", adminUser);

  const classes = await db.select().from(externalClasses);
  for (const c of classes) {
    const owner = await db.query.users.findFirst({ where: eq(users.id, c.teacherId) });
    console.log(`Turma #${c.id} (${c.className}) pertence ao teacherId ${c.teacherId} (${owner?.email || 'desconhecido'})`);
  }
  process.exit(0);
}

run();
