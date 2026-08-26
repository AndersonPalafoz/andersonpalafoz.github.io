export const SUPERADMIN_EMAIL = "palafozanderson@gmail.com";

export type StoredRole = "user" | "student" | "professor" | "admin" | "super_admin" | undefined | null;
export type EffectiveRole = "student" | "professor" | "admin" | "superadmin";

export function getEffectiveRole(input: { email?: string | null; role?: StoredRole }): EffectiveRole {
  const email = input.email?.trim().toLowerCase();
  if (email === SUPERADMIN_EMAIL || input.role === "super_admin") return "superadmin";
  if (input.role === "admin") return "admin";
  if (input.role === "professor") return "professor";
  return "student";
}

export function canAccessAdminPortal(input: { email?: string | null; role?: StoredRole }) {
  const role = getEffectiveRole(input);
  return role === "superadmin" || role === "admin";
}

export function canAccessProfessorPortal(input: { email?: string | null; role?: StoredRole }) {
  const role = getEffectiveRole(input);
  return role === "superadmin" || role === "admin" || role === "professor";
}

export function isSuperadmin(input: { email?: string | null; role?: StoredRole }) {
  return getEffectiveRole(input) === "superadmin";
}

export function roleLabel(role: EffectiveRole) {
  return {
    superadmin: "Superadministrador",
    admin: "Administrador",
    professor: "Professor",
    student: "Aluno",
  }[role];
}
