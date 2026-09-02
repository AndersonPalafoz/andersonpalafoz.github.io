import { timingSafeEqual } from "node:crypto";

export function isAuthorizedClassroomCron(request: Request) {
  const configuredSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization") || "";
  if (!configuredSecret || !authorization.startsWith("Bearer ")) return false;
  const provided = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(configuredSecret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export function cronUserId(request: Request) {
  if (!isAuthorizedClassroomCron(request)) return null;
  const value = Number(request.headers.get("x-classroom-user-id"));
  return Number.isInteger(value) && value > 0 ? value : null;
}
