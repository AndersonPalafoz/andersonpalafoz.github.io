import { createHmac } from "node:crypto";
import { lt, sql } from "drizzle-orm";
import { contactRateLimits } from "@/drizzle/schema";
import { db } from "@/lib/db";

export const CONTACT_RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_RETENTION_MS = 24 * RATE_LIMIT_WINDOW_MS;

export function hashContactRateLimitKey(ip: string, secret: string) {
  return createHmac("sha256", secret)
    .update(`contact-rate-limit:${ip}`)
    .digest("hex");
}

export function isContactRequestAllowed(requestCount: number) {
  return requestCount <= CONTACT_RATE_LIMIT_MAX;
}

export async function allowLimitedRequest(scope: string, identifier: string, maximum: number) {
  const secret =
    process.env.NEXTAUTH_SECRET ||
    process.env.JWT_SECRET ||
    process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error("A configured application secret is required for contact rate limiting.");
  }

  const keyHash = hashContactRateLimitKey(`${scope}:${identifier}`, secret);
  const [bucket] = await db
    .insert(contactRateLimits)
    .values({
      keyHash,
      windowStartedAt: new Date(),
      requestCount: 1,
    })
    .onConflictDoUpdate({
      target: contactRateLimits.keyHash,
      set: {
        windowStartedAt: sql`CASE WHEN ${contactRateLimits.windowStartedAt} <= now() - interval '1 hour' THEN now() ELSE ${contactRateLimits.windowStartedAt} END`,
        requestCount: sql`CASE WHEN ${contactRateLimits.windowStartedAt} <= now() - interval '1 hour' THEN 1 ELSE ${contactRateLimits.requestCount} + 1 END`,
      },
    })
    .returning({ requestCount: contactRateLimits.requestCount });

  if (!bucket) {
    throw new Error("The rate limit bucket could not be updated.");
  }

  if (Math.random() < 0.01) {
    try {
      await db
        .delete(contactRateLimits)
        .where(
          lt(
            contactRateLimits.windowStartedAt,
            new Date(Date.now() - RATE_LIMIT_RETENTION_MS),
          ),
        );
    } catch (error) {
      console.warn(
        "Não foi possível limpar janelas antigas do limite de contato:",
        error instanceof Error ? error.message : "erro desconhecido",
      );
    }
  }

  return bucket.requestCount <= maximum;
}

export function getRequestIp(headers: Headers | Record<string, string | string[] | undefined>) {
  const get = (name: string) => headers instanceof Headers ? headers.get(name) : headers[name] as string | undefined;
  const forwardedFor = get("x-forwarded-for");
  const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0]?.trim();
  return (get("x-real-ip") || forwardedIp || "unknown").trim();
}

export async function allowContactRequest(ip: string) {
  return allowLimitedRequest("contact", ip, CONTACT_RATE_LIMIT_MAX);
}
