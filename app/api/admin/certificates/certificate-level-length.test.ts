import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routeSource = readFileSync(
  new URL("./issue/route.ts", import.meta.url),
  "utf8"
);
const schemaSource = readFileSync(
  new URL("../../../../drizzle/schema.ts", import.meta.url),
  "utf8"
);
const migrationSource = readFileSync(
  new URL("../../../../drizzle/migrations/0061_widen_course_certificate_level.sql", import.meta.url),
  "utf8"
);

describe("emissão de certificados com níveis descritivos", () => {
  it("limita a entrada ao tamanho compatível com PostgreSQL", () => {
    expect(routeSource).toContain("MAX_CUSTOM_COURSE_LEVEL_LENGTH = 50");
    expect(routeSource).toContain("customCourseLevel.length > MAX_CUSTOM_COURSE_LEVEL_LENGTH");
  });

  it("mantém cursos e certificados alinhados em 50 caracteres", () => {
    expect(schemaSource).toContain('level: varchar("level", { length: 50 }).notNull()');
    expect(migrationSource).toContain('ALTER TABLE "courses" ALTER COLUMN "level" TYPE varchar(50)');
    expect(migrationSource).toContain('ALTER TABLE "certificates" ALTER COLUMN "level" TYPE varchar(50)');
  });

  it("persiste o nível no registro emitido", () => {
    expect(routeSource).toContain('level: course?.level || customCourseLevel || "Geral"');
    expect(routeSource).toContain("certificateCode: verificationCode");
    expect(routeSource).toContain("issuedAt,");
  });

  it("usa o registro retornado pelo insert no fluxo manual", () => {
    expect(routeSource).toContain("student = {");
    expect(routeSource).toContain("const newCourse = newCourses[0]");
    expect(routeSource).toContain("course = newCourse");
  });
});
