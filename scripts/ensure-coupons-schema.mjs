import postgres from "postgres";

const sql = postgres(process.env.NEON_DATABASE_URL, { prepare: false });
try {
  await sql`
    CREATE TABLE IF NOT EXISTS coupons (
      id SERIAL PRIMARY KEY,
      code VARCHAR(64) NOT NULL UNIQUE,
      "stripeCouponId" VARCHAR(255) NOT NULL UNIQUE,
      "percentOff" VARCHAR(32),
      "amountOff" VARCHAR(32),
      currency VARCHAR(3) NOT NULL DEFAULT 'brl',
      "maxRedemptions" INTEGER,
      "redeemBy" TIMESTAMP,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      "createdBy" INTEGER NOT NULL REFERENCES users(id),
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log(JSON.stringify({ success: true }));
} finally {
  await sql.end({ timeout: 5 });
}
