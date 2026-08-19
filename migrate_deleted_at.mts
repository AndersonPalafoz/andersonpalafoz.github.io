import { db } from './lib/db.ts';
import { sql } from 'drizzle-orm';

async function run() {
  try {
    console.log('Adicionando deleted_at em courses...');
    await db.execute(sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;`);
    console.log('Adicionando deleted_at em external_classes...');
    await db.execute(sql`ALTER TABLE external_classes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;`);
    console.log('Migração de lixeira concluída com sucesso!');
  } catch (e) {
    console.error('Erro na migração:', e);
  }
  process.exit(0);
}

run();
