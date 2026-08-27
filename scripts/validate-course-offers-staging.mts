const baseUrl = process.env.STAGING_BASE_URL?.replace(/\/$/, "");
const cookie = process.env.STAGING_COOKIE;
const apply = process.argv.includes("--apply");
const courseId = Number(process.env.STAGING_COURSE_ID);
const ownerTeacherId = Number(process.env.STAGING_TEACHER_ID);
const userId = Number(process.env.STAGING_STUDENT_USER_ID);

function fail(message: string): never {
  throw new Error(message);
}

if (!baseUrl) {
  console.log(JSON.stringify({ status: "skipped", reason: "STAGING_BASE_URL não configurada" }));
  process.exit(0);
}

const url = new URL(baseUrl);
if (url.protocol !== "https:" && url.hostname !== "localhost") fail("STAGING_BASE_URL deve usar HTTPS, exceto localhost.");
if (url.hostname === "andersonpalafoz.vercel.app" && process.env.ALLOW_PRODUCTION_E2E !== "true") {
  fail("A validação E2E recusou o domínio de produção. Use uma URL de staging/preview.");
}
if (!cookie) fail("STAGING_COOKIE não configurada; login manual é necessário para a sessão de staging.");

const headers = { Cookie: cookie, "Content-Type": "application/json" };
async function request(path: string, init: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { ...headers, ...(init.headers ?? {}) } });
  const text = await response.text();
  let body: unknown;
  try { body = JSON.parse(text); } catch { body = text; }
  return { response, body };
}

async function main() {
  const list = await request("/api/course-offers");
  if (!list.response.ok) fail(`GET /api/course-offers falhou com ${list.response.status}`);
  const summary: Record<string, unknown> = { status: "passed", mode: apply ? "apply" : "read-only", listStatus: list.response.status };
  if (!apply) {
    console.log(JSON.stringify(summary));
    return;
  }
  if (![courseId, ownerTeacherId, userId].every(Number.isInteger) || [courseId, ownerTeacherId, userId].some((value) => value <= 0)) {
    fail("--apply exige STAGING_COURSE_ID, STAGING_TEACHER_ID e STAGING_STUDENT_USER_ID válidos.");
  }

  let offerId: number | null = null;
  let studentId: number | null = null;
  try {
    const created = await request("/api/course-offers", { method: "POST", body: JSON.stringify({ courseId, ownerTeacherId, offerName: `E2E temporária ${Date.now()}`, academicTerm: "E2E", gradingPolicy: "standard" }) });
    if (created.response.status !== 201) fail(`POST /api/course-offers falhou com ${created.response.status}`);
    offerId = Number((created.body as { offer?: { id?: number } }).offer?.id);
    if (!offerId) fail("A API não retornou o ID da oferta E2E.");

    const item = await request(`/api/course-offers/${offerId}`);
    if (!item.response.ok) fail(`GET /api/course-offers/${offerId} falhou com ${item.response.status}`);
    const updated = await request(`/api/course-offers/${offerId}`, { method: "PATCH", body: JSON.stringify({ description: "Oferta criada pelo teste E2E" }) });
    if (!updated.response.ok) fail(`PATCH /api/course-offers/${offerId} falhou com ${updated.response.status}`);
    const enrolled = await request(`/api/course-offers/${offerId}/students`, { method: "POST", body: JSON.stringify({ userId, name: "Aluno E2E temporário" }) });
    if (enrolled.response.status !== 201) fail(`POST students falhou com ${enrolled.response.status}`);
    studentId = Number((enrolled.body as { student?: { id?: number } }).student?.id);
    const students = await request(`/api/course-offers/${offerId}/students`);
    if (!students.response.ok) fail(`GET students falhou com ${students.response.status}`);
    summary.offerId = offerId;
    summary.studentId = studentId;
    summary.mutationChecks = "create, read, update, enroll, list";
  } finally {
    if (studentId) await request(`/api/course-offers/${offerId}/students`, { method: "DELETE", body: JSON.stringify({ studentId }) });
    if (offerId) {
      await request(`/api/course-offers/${offerId}`, { method: "DELETE" });
      await request(`/api/course-offers/${offerId}`, { method: "POST", body: JSON.stringify({ action: "restore" }) });
      await request(`/api/course-offers/${offerId}`, { method: "DELETE" });
    }
  }
  console.log(JSON.stringify(summary));
}

main().catch((error) => {
  console.error(JSON.stringify({ status: "failed", error: error instanceof Error ? error.message : String(error) }));
  process.exitCode = 1;
});
