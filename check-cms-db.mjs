import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);
async function run() {
  try {
    const res = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
    console.log('Tables in DB:', res.map(r => r.table_name));
    
    // Test select from site_content_blocks if exists
    const blocks = await sql`SELECT count(*) FROM site_content_blocks`;
    console.log('site_content_blocks count:', blocks[0].count);
  } catch (err) {
    console.error('DB Check Error:', err);
  }
}
run();
