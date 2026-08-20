import { parse as parseCookieHeader } from "cookie";
import { jwtVerify } from "jose";
import type { GetUserInfoWithJwtRequest, GetUserInfoWithJwtResponse } from "./types/manusTypes";
import { ENV } from "./env";

const SESSION_COOKIE = "app_session_id";
const CRON_OPEN_ID_PREFIX = "cron_";
const GET_USER_INFO_WITH_JWT_PATH = "/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt";

export type AuthenticatedUser = {
  id: number;
  openId: string;
  name: string;
  email: string | null;
  loginMethod: string | null;
  role: "user";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
  taskUid?: string;
  isCron?: boolean;
};

export class CronAuthenticationError extends Error {
  readonly status = 403;

  constructor(message: string) {
    super(message);
    this.name = "CronAuthenticationError";
  }
}

function getSecret() {
  if (!ENV.cookieSecret) throw new CronAuthenticationError("Sessão Heartbeat não configurada.");
  return new TextEncoder().encode(ENV.cookieSecret);
}

async function verifyCronSession(cookieValue: string) {
  try {
    const { payload } = await jwtVerify(cookieValue, getSecret(), { algorithms: ["HS256"] });
    const openId = typeof payload.openId === "string" ? payload.openId : "";
    if (!openId.startsWith(CRON_OPEN_ID_PREFIX)) throw new CronAuthenticationError("A rota aceita apenas sessões Heartbeat.");
    return { openId };
  } catch (error) {
    if (error instanceof CronAuthenticationError) throw error;
    throw new CronAuthenticationError("Sessão Heartbeat inválida ou expirada.");
  }
}

async function getUserInfoWithJwt(jwtToken: string): Promise<GetUserInfoWithJwtResponse> {
  if (!ENV.oAuthServerUrl || !ENV.appId) throw new CronAuthenticationError("Serviço de autenticação Heartbeat não configurado.");
  const baseUrl = ENV.oAuthServerUrl.endsWith("/") ? ENV.oAuthServerUrl : `${ENV.oAuthServerUrl}/`;
  const endpoint = new URL(GET_USER_INFO_WITH_JWT_PATH.slice(1), baseUrl).toString();
  const body: GetUserInfoWithJwtRequest = { jwtToken, projectId: ENV.appId };
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new CronAuthenticationError("Não foi possível validar a sessão Heartbeat.");
  }
  if (!response.ok) throw new CronAuthenticationError("A sessão Heartbeat não foi autorizada.");
  const data = await response.json().catch(() => null) as Partial<GetUserInfoWithJwtResponse> | null;
  if (!data || typeof data.openId !== "string") throw new CronAuthenticationError("Resposta inválida do serviço de autenticação.");
  return {
    openId: data.openId,
    projectId: data.projectId || ENV.appId,
    name: data.name || "Manus Scheduled Task",
    email: data.email ?? null,
    platform: data.platform ?? null,
    loginMethod: data.loginMethod ?? null,
    taskUid: data.taskUid ?? null,
  };
}

export const sdk = {
  async authenticateRequest(request: Request): Promise<AuthenticatedUser> {
    const cookies = parseCookieHeader(request.headers.get("cookie") || "");
    const sessionCookie = cookies[SESSION_COOKIE];
    if (!sessionCookie) throw new CronAuthenticationError("Sessão Heartbeat ausente.");

    const { openId } = await verifyCronSession(sessionCookie);
    const userInfo = await getUserInfoWithJwt(sessionCookie);
    if (userInfo.openId !== openId) throw new CronAuthenticationError("A identidade da sessão Heartbeat não corresponde.");
    if (!userInfo.taskUid) throw new CronAuthenticationError("Sessão Heartbeat sem identificador de tarefa.");

    const now = new Date();
    return {
      id: -1,
      openId: userInfo.openId,
      name: userInfo.name,
      email: null,
      loginMethod: null,
      role: "user",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
      taskUid: userInfo.taskUid,
      isCron: true,
    };
  },
};

export default sdk;
