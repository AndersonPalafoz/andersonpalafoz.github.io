import { google } from "googleapis";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const DRIVE_FULL_SCOPE = "https://www.googleapis.com/auth/drive";
const PLATFORM_FOLDER_LABEL = "Anderson Palafoz Platform — Exportações do Professor";

interface GoogleTokenPayload {
  provider?: string;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  scope?: string;
}

export class TeacherGoogleDriveError extends Error {
  code: "NOT_CONNECTED" | "INSUFFICIENT_SCOPE" | "API_ERROR";

  constructor(code: TeacherGoogleDriveError["code"], message: string) {
    super(message);
    this.name = "TeacherGoogleDriveError";
    this.code = code;
  }
}

export interface TeacherDriveUploadInput {
  request: NextRequest;
  ownerEmail: string;
  fileName: string;
  mimeType: string;
  data: Uint8Array;
  exportKey: string;
}

export interface TeacherDriveUploadResult {
  fileId: string;
  fileName: string;
  webViewLink: string | null;
  size: number;
  reused: boolean;
  ownerEmail: string;
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
  const payload = await response.json().catch(() => null) as { access_token?: string; expires_in?: number } | null;
  if (!response.ok || !payload?.access_token) {
    throw new TeacherGoogleDriveError("NOT_CONNECTED", "A autorização do Google Drive expirou. Conecte o Drive novamente.");
  }
  return { accessToken: payload.access_token, expiresIn: payload.expires_in ?? 3600 };
}

async function getTeacherDriveAccess(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET }) as GoogleTokenPayload | null;
  if (!token || token.provider !== "google" || !token.accessToken) {
    throw new TeacherGoogleDriveError("NOT_CONNECTED", "Conecte sua conta Google para exportar materiais para o seu Drive particular.");
  }

  const scopes = (token.scope || "").split(/\s+/).filter(Boolean);
  if (!scopes.includes(DRIVE_FILE_SCOPE) && !scopes.includes(DRIVE_FULL_SCOPE)) {
    throw new TeacherGoogleDriveError(
      "INSUFFICIENT_SCOPE",
      "Sua sessão Google não possui o escopo mínimo drive.file. Autorize o Google Drive novamente para exportar materiais.",
    );
  }

  const expiresSoon = !token.accessTokenExpires || token.accessTokenExpires < Date.now() + 60_000;
  if (!expiresSoon) return { accessToken: token.accessToken };
  if (!token.refreshToken) {
    throw new TeacherGoogleDriveError("NOT_CONNECTED", "Sua sessão Google não possui refresh token para atualizar o acesso ao Drive.");
  }

  const refreshed = await refreshAccessToken(token.refreshToken);
  return { accessToken: refreshed.accessToken };
}

function escapeDriveQueryValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export async function uploadToTeacherGoogleDrive(input: TeacherDriveUploadInput): Promise<TeacherDriveUploadResult> {
  const { accessToken } = await getTeacherDriveAccess(input.request);
  const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials({ access_token: accessToken });
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const escapedOwner = escapeDriveQueryValue(input.ownerEmail);
    const escapedExportKey = escapeDriveQueryValue(input.exportKey);
    const existing = await drive.files.list({
      q: [
        "trashed = false",
        "appProperties has { key = 'andersonPlatform' and value = 'teacher-export' }",
        `appProperties has { key = 'ownerEmail' and value = '${escapedOwner}' }`,
        `appProperties has { key = 'exportKey' and value = '${escapedExportKey}' }`,
      ].join(" and "),
      spaces: "drive",
      pageSize: 1,
      fields: "files(id,name,webViewLink,size,appProperties)",
    });

    const existingFile = existing.data.files?.[0];
    if (existingFile?.id) {
      return {
        fileId: existingFile.id,
        fileName: existingFile.name || input.fileName,
        webViewLink: existingFile.webViewLink || null,
        size: Number(existingFile.size || input.data.byteLength),
        reused: true,
        ownerEmail: input.ownerEmail,
      };
    }

    const folderQuery = [
      "mimeType = 'application/vnd.google-apps.folder'",
      "trashed = false",
      "appProperties has { key = 'andersonPlatform' and value = 'teacher-export' }",
      `appProperties has { key = 'ownerEmail' and value = '${escapedOwner}' }`,
    ].join(" and ");
    const folderResponse = await drive.files.list({
      q: folderQuery,
      spaces: "drive",
      pageSize: 1,
      fields: "files(id,name)",
    });

    let folderId = folderResponse.data.files?.[0]?.id;
    if (!folderId) {
      const folder = await drive.files.create({
        requestBody: {
          name: PLATFORM_FOLDER_LABEL,
          mimeType: "application/vnd.google-apps.folder",
          appProperties: {
            andersonPlatform: "teacher-export",
            ownerEmail: input.ownerEmail,
          },
        },
        fields: "id",
      });
      folderId = folder.data.id || undefined;
    }

    if (!folderId) {
      throw new TeacherGoogleDriveError("API_ERROR", "O Google Drive não retornou uma pasta de exportação válida.");
    }

    const uploaded = await drive.files.create({
      requestBody: {
        name: input.fileName,
        parents: [folderId],
        appProperties: {
          andersonPlatform: "teacher-export",
          ownerEmail: input.ownerEmail,
          exportKey: input.exportKey,
        },
      },
      media: {
        mimeType: input.mimeType,
        body: Buffer.from(input.data),
      },
      fields: "id,name,webViewLink,size",
    });

    if (!uploaded.data.id) {
      throw new TeacherGoogleDriveError("API_ERROR", "O Google Drive não retornou o identificador do arquivo exportado.");
    }

    return {
      fileId: uploaded.data.id,
      fileName: uploaded.data.name || input.fileName,
      webViewLink: uploaded.data.webViewLink || null,
      size: Number(uploaded.data.size || input.data.byteLength),
      reused: false,
      ownerEmail: input.ownerEmail,
    };
  } catch (error) {
    if (error instanceof TeacherGoogleDriveError) throw error;
    const message = error instanceof Error ? error.message : "Erro desconhecido do Google Drive.";
    throw new TeacherGoogleDriveError("API_ERROR", `Não foi possível exportar o ZIP para o seu Google Drive: ${message}`);
  }
}

export async function downloadTeacherGoogleDriveFile(request: NextRequest, fileId: string) {
  const { accessToken } = await getTeacherDriveAccess(request);
  const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials({ access_token: accessToken });
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const metadata = await drive.files.get({
      fileId,
      fields: "id,name,mimeType,size,trashed,appProperties",
    });
    const appProperties = metadata.data.appProperties || {};
    if (appProperties.andersonPlatform !== "teacher-export") {
      throw new TeacherGoogleDriveError("API_ERROR", "O arquivo não está vinculado a uma exportação autorizada da plataforma.");
    }

    const response = await drive.files.get({ fileId, alt: "media" }, { responseType: "arraybuffer" });
    return {
      name: metadata.data.name || "material",
      mimeType: metadata.data.mimeType || "application/octet-stream",
      data: new Uint8Array(response.data as ArrayBuffer),
    };
  } catch (error) {
    if (error instanceof TeacherGoogleDriveError) throw error;
    const message = error instanceof Error ? error.message : "Erro desconhecido do Google Drive.";
    throw new TeacherGoogleDriveError("API_ERROR", `Não foi possível baixar o material autorizado do Google Drive: ${message}`);
  }
}

export const teacherGoogleDriveConstants = {
  driveFileScope: DRIVE_FILE_SCOPE,
  platformFolderLabel: PLATFORM_FOLDER_LABEL,
};
