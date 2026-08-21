import { createClient } from "@supabase/supabase-js";

export const LEARNING_AUDIO_BUCKET = "learning-audio";
export const CERTIFICATE_BUCKET = "certificates";
export const SIGNED_CERTIFICATE_BUCKET = "signed-certificates";
export const SIGNED_CERTIFICATE_MAX_BYTES = 5 * 1024 * 1024;
export const LEARNING_AUDIO_MAX_BYTES = 15 * 1024 * 1024;
export const LEARNING_AUDIO_MIME_TYPES = ["audio/webm", "audio/ogg", "audio/mpeg", "audio/wav", "audio/mp4"] as const;

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Storage educacional não está configurado no servidor.");
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function ensureBucket(bucket: string, options: { public: boolean; mimeTypes?: readonly string[]; fileSizeLimit?: number }) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.storage.getBucket(bucket);
  if (data) return supabase;
  const { error } = await supabase.storage.createBucket(bucket, {
    public: options.public,
    allowedMimeTypes: options.mimeTypes ? [...options.mimeTypes] : undefined,
    fileSizeLimit: options.fileSizeLimit ? `${options.fileSizeLimit}B` : undefined,
  });
  if (error && !/already exists|duplicate/i.test(error.message)) throw error;
  return supabase;
}

export function validateLearningAudio(input: { mimeType: string; size: number }) {
  if (!LEARNING_AUDIO_MIME_TYPES.includes(input.mimeType as (typeof LEARNING_AUDIO_MIME_TYPES)[number])) {
    return { valid: false as const, error: "Envie um áudio WebM, OGG, MP3, WAV ou MP4." };
  }
  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > LEARNING_AUDIO_MAX_BYTES) {
    return { valid: false as const, error: "O áudio deve ter no máximo 15 MB." };
  }
  return { valid: true as const };
}

export async function uploadLearningAudio(ownerId: number, file: File, kind: "student-attempt" | "teacher-feedback" | "teacher-listening") {
  const validation = validateLearningAudio({ mimeType: file.type, size: file.size });
  if (!validation.valid) throw new Error(validation.error);
  const supabase = await ensureBucket(LEARNING_AUDIO_BUCKET, {
    public: true,
    mimeTypes: LEARNING_AUDIO_MIME_TYPES,
    fileSizeLimit: LEARNING_AUDIO_MAX_BYTES,
  });
  const extension = file.type === "audio/mpeg" ? "mp3" : file.type.split("/")[1] || "bin";
  const objectPath = `${kind}/${ownerId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(LEARNING_AUDIO_BUCKET).upload(objectPath, new Uint8Array(await file.arrayBuffer()), {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(LEARNING_AUDIO_BUCKET).getPublicUrl(objectPath);
  return { objectPath, url: data.publicUrl };
}

export async function uploadCertificatePdf(userId: number, courseId: number, bytes: Uint8Array) {
  const supabase = await ensureBucket(CERTIFICATE_BUCKET, { public: true, mimeTypes: ["application/pdf"], fileSizeLimit: 5 * 1024 * 1024 });
  const objectPath = `users/${userId}/courses/${courseId}/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage.from(CERTIFICATE_BUCKET).upload(objectPath, bytes, {
    contentType: "application/pdf",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(CERTIFICATE_BUCKET).getPublicUrl(objectPath);
  return { objectPath, url: data.publicUrl };
}

export function validateSignedCertificate(input: { mimeType: string; size: number; fileName?: string }) {
  const fileName = input.fileName?.toLowerCase() ?? "";
  const isPdf = input.mimeType === "application/pdf" || (input.mimeType === "application/octet-stream" && fileName.endsWith(".pdf"));
  if (!isPdf) return { valid: false as const, error: "Envie um arquivo PDF assinado pelo gov.br ou assinado manualmente." };
  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > SIGNED_CERTIFICATE_MAX_BYTES) {
    return { valid: false as const, error: "O certificado assinado deve ter no máximo 5 MB." };
  }
  return { valid: true as const };
}

/**
 * Guarda o PDF assinado em bucket privado. O valor retornado em `objectPath`
 * deve ser persistido em certificates.signedPdfUrl; uma URL pública nunca é
 * criada para o documento assinado.
 */
export async function uploadSignedCertificatePdf(adminId: number, certificateId: number, file: File) {
  const validation = validateSignedCertificate({ mimeType: file.type, size: file.size, fileName: file.name });
  if (!validation.valid) throw new Error(validation.error);
  const supabase = await ensureBucket(SIGNED_CERTIFICATE_BUCKET, {
    public: false,
    mimeTypes: ["application/pdf"],
    fileSizeLimit: SIGNED_CERTIFICATE_MAX_BYTES,
  });
  const objectPath = `admin/${adminId}/certificates/${certificateId}/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage.from(SIGNED_CERTIFICATE_BUCKET).upload(objectPath, new Uint8Array(await file.arrayBuffer()), {
    contentType: "application/pdf",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  return { objectPath };
}

export async function createSignedCertificateUrl(objectPath: string, expiresIn = 300) {
  const supabase = await ensureBucket(SIGNED_CERTIFICATE_BUCKET, { public: false, mimeTypes: ["application/pdf"], fileSizeLimit: SIGNED_CERTIFICATE_MAX_BYTES });
  const { data, error } = await supabase.storage.from(SIGNED_CERTIFICATE_BUCKET).createSignedUrl(objectPath, expiresIn);
  if (error || !data?.signedUrl) throw error ?? new Error("Não foi possível gerar o link seguro do certificado.");
  return data.signedUrl;
}
