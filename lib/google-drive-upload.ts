/**
 * Integração server-side com Google Drive para a conta dedicada de armazenamento.
 * O Neon recebe apenas metadados; os bytes permanecem no Drive/Supabase Storage.
 */

import { google } from "googleapis";

const DEFAULT_STORAGE_ACCOUNT = "andersonpalafoznupel@gmail.com";
const DEFAULT_MAX_RETRIES = 3;

function requiredCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google Drive não está configurado para upload real. Autorize a conta dedicada e configure GOOGLE_REFRESH_TOKEN.");
  }
  return { clientId, clientSecret, refreshToken };
}

export function getGoogleDriveStorageAccount() {
  return process.env.GOOGLE_STORAGE_ACCOUNT || DEFAULT_STORAGE_ACCOUNT;
}

function createDriveClient() {
  const credentials = requiredCredentials();
  const oauth2Client = new google.auth.OAuth2(credentials.clientId, credentials.clientSecret);
  oauth2Client.setCredentials({ refresh_token: credentials.refreshToken });
  return google.drive({ version: "v3", auth: oauth2Client });
}

function isRetryableDriveError(error: unknown) {
  const candidate = error as { code?: number | string; response?: { status?: number } };
  const status = Number(candidate?.response?.status ?? candidate?.code ?? 0);
  return status === 408 || status === 429 || status >= 500 || ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND"].includes(String(candidate?.code));
}

function retryDelay(attempt: number) {
  return Math.min(500 * 2 ** Math.max(0, attempt - 1), 4_000);
}

async function sleep(ms: number) {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function downloadFromGoogleDriveStorage(fileId: string): Promise<{ data: Uint8Array; name: string; mimeType: string }> {
  if (!fileId.trim()) throw new Error("ID do arquivo do Google Drive inválido.");
  const drive = createDriveClient();
  const metadata = await drive.files.get({ fileId, fields: "id,name,mimeType,trashed" });
  if (metadata.data.trashed) throw new Error("O arquivo de origem foi enviado para a lixeira do Google Drive.");
  const response = await drive.files.get({ fileId, alt: "media" }, { responseType: "arraybuffer" });
  return {
    data: new Uint8Array(response.data as ArrayBuffer),
    name: metadata.data.name || `material-${fileId}`,
    mimeType: metadata.data.mimeType || "application/octet-stream",
  };
}

export async function uploadToGoogleDrive(
  file: File,
  folderName = "Anderson Palafoz Platform",
  storageAccountEmail = getGoogleDriveStorageAccount(),
  maxRetries = DEFAULT_MAX_RETRIES,
): Promise<{ fileId: string; webViewLink: string; size: number; account: string; attempts: number; realUpload: boolean }> {
  if (!file || file.size <= 0) throw new Error("Não é possível enviar um arquivo vazio para o Google Drive.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const attemptsLimit = Math.max(1, Math.min(Number(maxRetries) || DEFAULT_MAX_RETRIES, 5));
  let lastError: Error | null = null;

  for (let attempts = 1; attempts <= attemptsLimit; attempts += 1) {
    try {
      const drive = createDriveClient();
      const folderQuery = `mimeType='application/vnd.google-apps.folder' and name='${folderName.replace(/'/g, "\\'")}' and trashed=false`;
      const folderRes = await drive.files.list({ q: folderQuery, spaces: "drive", fields: "files(id, name)" });
      let folderId = folderRes.data.files?.[0]?.id;

      if (!folderId) {
        const createdFolder = await drive.files.create({
          requestBody: { name: folderName, mimeType: "application/vnd.google-apps.folder" },
          fields: "id",
        });
        folderId = createdFolder.data.id;
      }
      if (!folderId) throw new Error("O Google Drive não retornou o ID da pasta de destino.");

      const response = await drive.files.create({
        requestBody: { name: file.name, parents: [folderId] },
        media: { mimeType: file.type || "application/octet-stream", body: buffer },
        fields: "id, webViewLink",
      });
      if (!response.data.id) throw new Error("O Google Drive não retornou o ID do arquivo enviado.");

      return {
        fileId: response.data.id,
        webViewLink: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
        size: buffer.length,
        account: storageAccountEmail,
        attempts,
        realUpload: true,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempts >= attemptsLimit || !isRetryableDriveError(error)) break;
      await sleep(retryDelay(attempts));
    }
  }

  throw new Error(`Falha no upload real para o Google Drive após ${attemptsLimit} tentativa(s). Último erro: ${lastError?.message || "Erro desconhecido"}`);
}
