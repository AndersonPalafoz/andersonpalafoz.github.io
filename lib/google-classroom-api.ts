import { db } from "@/lib/db";
import { googleClassroomConnections } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { decryptClassroomToken, encryptClassroomToken } from "@/lib/google-classroom-crypto";

const CLASSROOM_API = "https://classroom.googleapis.com/v1";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

type ClassroomCourse = {
  id?: string;
  name?: string;
  section?: string;
  description?: string;
  courseState?: string;
  ownerId?: string;
  enrollmentCode?: string;
};

export class GoogleClassroomApiError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_CONNECTED" | "TOKEN_EXPIRED" | "INSUFFICIENT_SCOPE" | "API_ERROR" | "CONFIGURATION_ERROR",
    readonly status = 502
  ) {
    super(message);
    this.name = "GoogleClassroomApiError";
  }
}

function requiredConfiguration() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new GoogleClassroomApiError("Google OAuth não está configurado no servidor.", "CONFIGURATION_ERROR", 500);
  }
  return { clientId, clientSecret };
}

async function getAccessToken(connection: typeof googleClassroomConnections.$inferSelect) {
  if (connection.tokenExpiresAt && connection.tokenExpiresAt.getTime() > Date.now() + 60_000 && connection.accessTokenEncrypted) {
    return decryptClassroomToken(connection.accessTokenEncrypted);
  }

  if (!connection.refreshTokenEncrypted) {
    throw new GoogleClassroomApiError("A conexão Classroom precisa ser autorizada novamente.", "TOKEN_EXPIRED", 401);
  }

  const { clientId, clientSecret } = requiredConfiguration();
  const refreshToken = decryptClassroomToken(connection.refreshTokenEncrypted);
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    await db.update(googleClassroomConnections)
      .set({ status: "reauthorization_required", lastError: "Falha ao renovar o token Google", updatedAt: new Date() })
      .where(eq(googleClassroomConnections.id, connection.id));
    throw new GoogleClassroomApiError("A autorização do Classroom expirou. Conecte a conta novamente.", "TOKEN_EXPIRED", 401);
  }

  const refreshed = await response.json() as { access_token?: string; expires_in?: number };
  if (!refreshed.access_token) throw new GoogleClassroomApiError("O Google não retornou um access token válido.", "TOKEN_EXPIRED", 401);

  await db.update(googleClassroomConnections)
    .set({
      accessTokenEncrypted: encryptClassroomToken(refreshed.access_token),
      tokenExpiresAt: new Date(Date.now() + (refreshed.expires_in || 3600) * 1000),
      status: "active",
      lastError: null,
      updatedAt: new Date(),
    })
    .where(eq(googleClassroomConnections.id, connection.id));

  return refreshed.access_token;
}

async function classroomRequest<T>(accessToken: string, path: string) {
  const response = await fetch(`${CLASSROOM_API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (response.ok) return await response.json() as T;

  const body = await response.text();
  if (response.status === 401) throw new GoogleClassroomApiError("A autorização do Classroom expirou.", "TOKEN_EXPIRED", 401);
  if (response.status === 403) throw new GoogleClassroomApiError("A conta não possui os escopos ou permissões necessários para ler o Classroom.", "INSUFFICIENT_SCOPE", 403);
  throw new GoogleClassroomApiError(`A API do Google Classroom retornou ${response.status}: ${body.slice(0, 240)}`, "API_ERROR", 502);
}

export async function listGoogleClassroomCourses(connection: typeof googleClassroomConnections.$inferSelect) {
  const accessToken = await getAccessToken(connection);
  const courses: ClassroomCourse[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ pageSize: "100", courseStates: "ACTIVE" });
    params.append("courseStates", "ARCHIVED");
    if (pageToken) params.set("pageToken", pageToken);
    const page = await classroomRequest<{ courses?: ClassroomCourse[]; nextPageToken?: string }>(accessToken, `/courses?${params.toString()}`);
    courses.push(...(page.courses || []));
    pageToken = page.nextPageToken;
  } while (pageToken);

  return courses.filter((course): course is ClassroomCourse & { id: string; name: string } => Boolean(course.id && course.name));
}

export async function markClassroomConnectionError(connectionId: number, error: unknown) {
  const message = error instanceof Error ? error.message : "Erro desconhecido na sincronização Classroom";
  await db.update(googleClassroomConnections)
    .set({ lastError: message.slice(0, 1000), status: "error", updatedAt: new Date() })
    .where(eq(googleClassroomConnections.id, connectionId));
}
