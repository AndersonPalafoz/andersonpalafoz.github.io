import { db } from './lib/db';
import { siteContentBlocks } from './drizzle/schema';

async function test() {
  try {
    const blocks = await db.select().from(siteContentBlocks);
    console.log("Blocks loaded successfully count:", blocks.length);
  } catch (err) {
    console.error("Failed to load CMS blocks:", err);
  }
}
test();
