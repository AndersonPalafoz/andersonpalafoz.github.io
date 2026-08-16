import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    console.log("Running CMS migration via lib/db.ts...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_content_blocks (
        id SERIAL PRIMARY KEY,
        "pageKey" VARCHAR(100) NOT NULL,
        "sectionKey" VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(32) DEFAULT 'published' NOT NULL,
        "contentType" VARCHAR(32) DEFAULT 'text' NOT NULL,
        "orderIndex" INTEGER DEFAULT 0 NOT NULL,
        tag VARCHAR(64) DEFAULT 'Geral' NOT NULL,
        "scheduledPublishAt" TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Table site_content_blocks created/verified successfully!");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_content_revisions (
        id SERIAL PRIMARY KEY,
        "blockId" INTEGER NOT NULL REFERENCES site_content_blocks(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(32) DEFAULT 'published' NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Table site_content_revisions created/verified successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  }
  process.exit(0);
}

migrate();
