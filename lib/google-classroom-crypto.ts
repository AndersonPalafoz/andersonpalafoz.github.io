import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getAuthSecret } from "@/lib/auth-secret";

const TOKEN_PREFIX = "v1";

export const GOOGLE_CLASSROOM_TEACHER_SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
  "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.profile.emails",
] as const;

export const GOOGLE_CLASSROOM_STUDENT_SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly",
  "https://www.googleapis.com/auth/classroom.profile.emails",
] as const;

export const GOOGLE_CLASSROOM_READONLY_SCOPES = GOOGLE_CLASSROOM_TEACHER_SCOPES;
export type ClassroomAuthorizedRole = "teacher" | "student" | "admin";

function grantedScopes(scope?: string | null) {
  return new Set((scope || "").split(/\s+/).filter(Boolean));
}

export function hasClassroomReadonlyScope(scope?: string | null) {
  return Boolean(scope && [...GOOGLE_CLASSROOM_TEACHER_SCOPES, ...GOOGLE_CLASSROOM_STUDENT_SCOPES].some((required) => grantedScopes(scope).has(required)));
}

export function getClassroomAuthorizedRole(scope?: string | null): "teacher" | "student" | null {
  const granted = grantedScopes(scope);
  if (GOOGLE_CLASSROOM_TEACHER_SCOPES.every((required) => granted.has(required))) return "teacher";
  if (GOOGLE_CLASSROOM_STUDENT_SCOPES.every((required) => granted.has(required))) return "student";
  return null;
}

function encryptionKey() {
  return createHash("sha256")
    .update(`${getAuthSecret()}:google-classroom-token:v1`)
    .digest();
}

export function encryptClassroomToken(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${TOKEN_PREFIX}.${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptClassroomToken(value: string) {
  const [prefix, ivEncoded, tagEncoded, encryptedEncoded] = value.split(".");
  if (prefix !== TOKEN_PREFIX || !ivEncoded || !tagEncoded || !encryptedEncoded) {
    throw new Error("Formato de token Classroom inválido");
  }
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivEncoded, "base64url"));
  decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedEncoded, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
