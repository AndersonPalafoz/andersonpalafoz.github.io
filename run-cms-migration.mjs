import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
const sql = neon(connectionString);

async function run() {
  try {
    console.log("Running CMS tables migration...");
    await sql`
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
    `;
    console.log("Table site_content_blocks ensured.");

    await sql`
      CREATE TABLE IF NOT EXISTS site_content_revisions (
        id SERIAL PRIMARY KEY,
        "blockId" INTEGER NOT NULL REFERENCES site_content_blocks(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(32) DEFAULT 'published' NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    console.log("Table site_content_revisions ensured.");
    console.log("CMS migration completed successfully!");
  } catch (err) {
    console.error("CMS migration failed:", err);
  }
}

run();
