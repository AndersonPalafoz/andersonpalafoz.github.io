import { db } from './lib/db.ts';
import { sql } from 'drizzle-orm';

async function run() {
  try {
    console.log('Adicionando colunas de calendário e faltas em courses...');
    await db.execute(sql`
      ALTER TABLE courses 
      ADD COLUMN IF NOT EXISTS class_days VARCHAR(255),
      ADD COLUMN IF NOT EXISTS class_time VARCHAR(100),
      ADD COLUMN IF NOT EXISTS workload_hours INTEGER DEFAULT 40,
      ADD COLUMN IF NOT EXISTS start_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS end_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS max_absence_percent INTEGER DEFAULT 25;
    `);

    console.log('Adicionando colunas de calendário e faltas em external_classes...');
    await db.execute(sql`
      ALTER TABLE external_classes 
      ADD COLUMN IF NOT EXISTS class_days VARCHAR(255),
      ADD COLUMN IF NOT EXISTS class_time VARCHAR(100),
      ADD COLUMN IF NOT EXISTS workload_hours INTEGER DEFAULT 40,
      ADD COLUMN IF NOT EXISTS start_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS end_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS max_absence_percent INTEGER DEFAULT 25;
    `);

    console.log('Migração de calendário e percentual de faltas concluída com sucesso!');
  } catch (e) {
    console.error('Erro na migração de calendário:', e);
  }
  process.exit(0);
}

run();
