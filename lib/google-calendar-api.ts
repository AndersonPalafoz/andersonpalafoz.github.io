import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

interface GoogleTokenPayload {
  provider?: string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  scope?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string | null;
  location?: string | null;
  source: "google";
}

export class GoogleCalendarError extends Error {
  code: "NOT_CONNECTED" | "INSUFFICIENT_SCOPE" | "API_ERROR";
  constructor(code: GoogleCalendarError["code"], message: string) {
    super(message);
    this.name = "GoogleCalendarError";
    this.code = code;
  }
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null) as { access_token?: string; expires_in?: number; error?: string } | null;
  if (!response.ok || !payload?.access_token) {
    throw new GoogleCalendarError("NOT_CONNECTED", "A autorização do Google Calendar expirou. Conecte a conta novamente.");
  }
  return { accessToken: payload.access_token, expiresIn: payload.expires_in ?? 3600 };
}

export async function getGoogleCalendarAccess(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }) as GoogleTokenPayload | null;
  if (!token || token.provider !== "google" || !token.accessToken) {
    throw new GoogleCalendarError("NOT_CONNECTED", "Nenhuma conta Google com acesso ao Calendar está conectada nesta sessão.");
  }

  if (token.scope && !token.scope.split(" ").includes("https://www.googleapis.com/auth/calendar.readonly")) {
    throw new GoogleCalendarError("INSUFFICIENT_SCOPE", "A sessão Google precisa ser autorizada novamente com acesso de leitura ao Calendar.");
  }

  const expiresSoon = !token.accessTokenExpires || token.accessTokenExpires < Date.now() + 60_000;
  if (!expiresSoon) return { accessToken: token.accessToken };
  if (!token.refreshToken) throw new GoogleCalendarError("NOT_CONNECTED", "A sessão Google não possui refresh token para atualizar o Calendar.");

  const refreshed = await refreshAccessToken(token.refreshToken);
  return { accessToken: refreshed.accessToken };
}

export async function fetchGoogleCalendarEvents(accessToken: string, timeMin: Date, timeMax: Date): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
  });
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as { items?: Array<Record<string, unknown>>; error?: { message?: string } } | null;
  if (!response.ok) {
    const errorMsg = payload?.error?.message || "";
    if (response.status === 403 && (errorMsg.includes("has not been used in project") || errorMsg.includes("disabled"))) {
      throw new GoogleCalendarError("INSUFFICIENT_SCOPE", "A Google Calendar API está desativada neste projeto do Google Cloud. Ative-a em https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview");
    }
    if (response.status === 401 || response.status === 403) {
      throw new GoogleCalendarError(response.status === 403 ? "INSUFFICIENT_SCOPE" : "NOT_CONNECTED", errorMsg || "O Google Calendar recusou a consulta.");
    }
    throw new GoogleCalendarError("API_ERROR", errorMsg || "Não foi possível consultar o Google Calendar.");
  }

  const rawEvents = (payload?.items || []).flatMap((item) => {
    const startData = (item.start || {}) as { dateTime?: string; date?: string };
    const endData = (item.end || {}) as { dateTime?: string; date?: string };
    const start = startData.dateTime || startData.date;
    const end = endData.dateTime || endData.date || start;
    const id = typeof item.id === "string" ? item.id : null;
    const title = typeof item.summary === "string" ? item.summary : "Sem título";
    if (!id || !start) return [];
    return [{
      id: `google-${id}`,
      title,
      start,
      end: end || start,
      description: typeof item.description === "string" ? item.description : null,
      location: typeof item.location === "string" ? item.location : null,
      source: "google" as const,
    }];
  });

  // Filtrar apenas eventos da plataforma Anderson Palafoz ou termos educacionais relevantes
  const platformKeywords = ["anderson", "palafoz", "inglês", "ingles", "aula", "curso", "tarefa", "quiz", "speaking", "simal", "ufba", "megaworks", "deadline", "prazo"];
  const filtered = rawEvents.filter((ev) => {
    const text = `${ev.title} ${ev.description || ""} ${ev.location || ""}`.toLowerCase();
    return platformKeywords.some((kw) => text.includes(kw)) || text.includes("[ap]") || text.includes("#andersonpalafoz");
  });

  return filtered;
}
