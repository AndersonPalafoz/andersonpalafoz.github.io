import { createClient } from "@supabase/supabase-js";

export const LEARNING_AUDIO_BUCKET = "learning-audio";
export const CERTIFICATE_BUCKET = "certificates";
export const SIGNED_CERTIFICATE_BUCKET = "signed-certificates";
export const SIGNED_CERTIFICATE_MAX_BYTES = 5 * 1024 * 1024;
export const CERTIFICATE_TEMPLATE_BUCKET = "certificate-templates";
export const CERTIFICATE_TEMPLATE_MAX_BYTES = 10 * 1024 * 1024;
export const CERTIFICATE_TEMPLATE_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
export const LEARNING_AUDIO_MAX_BYTES = 15 * 1024 * 1024;
export const LEARNING_AUDIO_MIME_TYPES = [
  "audio/webm",
  "audio/ogg",
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
] as const;

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey)
    throw new Error("Storage educacional não está configurado no servidor.");
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function ensureBucket(
  bucket: string,
  options: {
    public: boolean;
    mimeTypes?: readonly string[];
    fileSizeLimit?: number;
  }
) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.storage.getBucket(bucket);
  if (data) return supabase;
  const { error } = await supabase.storage.createBucket(bucket, {
    public: options.public,
    allowedMimeTypes: options.mimeTypes ? [...options.mimeTypes] : undefined,
    fileSizeLimit: options.fileSizeLimit
      ? `${options.fileSizeLimit}B`
      : undefined,
  });
  if (error && !/already exists|duplicate/i.test(error.message)) throw error;
  return supabase;
}

export function validateLearningAudio(input: {
  mimeType: string;
  size: number;
}) {
  if (
    !LEARNING_AUDIO_MIME_TYPES.includes(
      input.mimeType as (typeof LEARNING_AUDIO_MIME_TYPES)[number]
    )
  ) {
    return {
      valid: false as const,
      error: "Envie um áudio WebM, OGG, MP3, WAV ou MP4.",
    };
  }
  if (
    !Number.isFinite(input.size) ||
    input.size <= 0 ||
    input.size > LEARNING_AUDIO_MAX_BYTES
  ) {
    return {
      valid: false as const,
      error: "O áudio deve ter no máximo 15 MB.",
    };
  }
  return { valid: true as const };
}

export async function uploadLearningAudio(
  ownerId: number,
  file: File,
  kind: "student-attempt" | "teacher-feedback" | "teacher-listening"
) {
  const validation = validateLearningAudio({
    mimeType: file.type,
    size: file.size,
  });
  if (!validation.valid) throw new Error(validation.error);
  const supabase = await ensureBucket(LEARNING_AUDIO_BUCKET, {
    public: true,
    mimeTypes: LEARNING_AUDIO_MIME_TYPES,
    fileSizeLimit: LEARNING_AUDIO_MAX_BYTES,
  });
  const extension =
    file.type === "audio/mpeg" ? "mp3" : file.type.split("/")[1] || "bin";
  const objectPath = `${kind}/${ownerId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(LEARNING_AUDIO_BUCKET)
    .upload(objectPath, new Uint8Array(await file.arrayBuffer()), {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
  if (error) throw error;
  const { data } = supabase.storage
    .from(LEARNING_AUDIO_BUCKET)
    .getPublicUrl(objectPath);
  return { objectPath, url: data.publicUrl };
}

export async function uploadCertificatePdf(
  userId: number,
  courseId: number,
  bytes: Uint8Array
) {
  const supabase = await ensureBucket(CERTIFICATE_BUCKET, {
    public: true,
    mimeTypes: ["application/pdf"],
    fileSizeLimit: 5 * 1024 * 1024,
  });
  const objectPath = `users/${userId}/courses/${courseId}/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage
    .from(CERTIFICATE_BUCKET)
    .upload(objectPath, bytes, {
      contentType: "application/pdf",
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) throw error;
  const { data } = supabase.storage
    .from(CERTIFICATE_BUCKET)
    .getPublicUrl(objectPath);
  return { objectPath, url: data.publicUrl };
}

export function validateCertificateTemplate(input: {
  mimeType: string;
  size: number;
  fileName?: string;
}) {
  const fileName = input.fileName?.toLowerCase() ?? "";
  const isPdf =
    input.mimeType === "application/pdf" ||
    (input.mimeType === "application/octet-stream" &&
      fileName.endsWith(".pdf"));
  const isPng =
    input.mimeType === "image/png" ||
    (input.mimeType === "application/octet-stream" &&
      fileName.endsWith(".png"));
  const isDocx =
    input.mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    (input.mimeType === "application/octet-stream" &&
      fileName.endsWith(".docx"));
  if (!isPdf && !isPng && !isDocx)
    return {
      valid: false as const,
      error: "Envie um modelo de certificado em PDF, PNG ou DOCX.",
    };
  if (
    !Number.isFinite(input.size) ||
    input.size <= 0 ||
    input.size > CERTIFICATE_TEMPLATE_MAX_BYTES
  ) {
    return {
      valid: false as const,
      error: "O modelo de certificado deve ter no máximo 10 MB.",
    };
  }
  return { valid: true as const };
}

export async function uploadCertificateTemplate(adminId: number, file: File) {
  const validation = validateCertificateTemplate({
    mimeType: file.type,
    size: file.size,
    fileName: file.name,
  });
  if (!validation.valid) throw new Error(validation.error);
  const supabase = await ensureBucket(CERTIFICATE_TEMPLATE_BUCKET, {
    public: false,
    mimeTypes: CERTIFICATE_TEMPLATE_MIME_TYPES,
    fileSizeLimit: CERTIFICATE_TEMPLATE_MAX_BYTES,
  });
  const fileName = file.name.toLowerCase();
  const extension =
    file.type === "image/png" || fileName.endsWith(".png")
      ? "png"
      : file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          fileName.endsWith(".docx")
        ? "docx"
        : "pdf";
  const objectPath = `admin/${adminId}/templates/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(CERTIFICATE_TEMPLATE_BUCKET)
    .upload(objectPath, new Uint8Array(await file.arrayBuffer()), {
      contentType:
        file.type === "application/octet-stream"
          ? extension === "png"
            ? "image/png"
            : extension === "docx"
              ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              : "application/pdf"
          : file.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) throw error;
  return {
    objectPath,
    mimeType:
      extension === "png"
        ? "image/png"
        : extension === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/pdf",
  };
}

export async function downloadCertificateTemplate(objectPath: string) {
  if (objectPath.startsWith("/manus-storage/") || /^https?:\/\//i.test(objectPath)) {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const url = objectPath.startsWith("http") ? objectPath : `${baseUrl}${objectPath}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Não foi possível carregar o modelo de certificado (${response.status}).`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }
  const supabase = await ensureBucket(CERTIFICATE_TEMPLATE_BUCKET, {
    public: false,
    mimeTypes: CERTIFICATE_TEMPLATE_MIME_TYPES,
    fileSizeLimit: CERTIFICATE_TEMPLATE_MAX_BYTES,
  });
  const { data, error } = await supabase.storage
    .from(CERTIFICATE_TEMPLATE_BUCKET)
    .download(objectPath);
  if (error || !data)
    throw (
      error ?? new Error("Não foi possível carregar o modelo de certificado.")
    );
  return new Uint8Array(await data.arrayBuffer());
}

export function validateSignedCertificate(input: {
  mimeType: string;
  size: number;
  fileName?: string;
}) {
  const fileName = input.fileName?.toLowerCase() ?? "";
  const isPdf =
    input.mimeType === "application/pdf" ||
    (input.mimeType === "application/octet-stream" &&
      fileName.endsWith(".pdf"));
  if (!isPdf)
    return {
      valid: false as const,
      error:
        "Envie um arquivo PDF assinado pelo gov.br ou assinado manualmente.",
    };
  if (
    !Number.isFinite(input.size) ||
    input.size <= 0 ||
    input.size > SIGNED_CERTIFICATE_MAX_BYTES
  ) {
    return {
      valid: false as const,
      error: "O certificado assinado deve ter no máximo 5 MB.",
    };
  }
  return { valid: true as const };
}

/**
 * Guarda o PDF assinado em bucket privado. O valor retornado em `objectPath`
 * deve ser persistido em certificates.signedPdfUrl; uma URL pública nunca é
 * criada para o documento assinado.
 */
export async function uploadSignedCertificatePdf(
  adminId: number,
  certificateId: number,
  file: File
) {
  const validation = validateSignedCertificate({
    mimeType: file.type,
    size: file.size,
    fileName: file.name,
  });
  if (!validation.valid) throw new Error(validation.error);
  const supabase = await ensureBucket(SIGNED_CERTIFICATE_BUCKET, {
    public: false,
    mimeTypes: ["application/pdf"],
    fileSizeLimit: SIGNED_CERTIFICATE_MAX_BYTES,
  });
  const objectPath = `admin/${adminId}/certificates/${certificateId}/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage
    .from(SIGNED_CERTIFICATE_BUCKET)
    .upload(objectPath, new Uint8Array(await file.arrayBuffer()), {
      contentType: "application/pdf",
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) throw error;
  return { objectPath };
}

export async function createSignedCertificateUrl(
  objectPath: string,
  expiresIn = 300
) {
  const supabase = await ensureBucket(SIGNED_CERTIFICATE_BUCKET, {
    public: false,
    mimeTypes: ["application/pdf"],
    fileSizeLimit: SIGNED_CERTIFICATE_MAX_BYTES,
  });
  const { data, error } = await supabase.storage
    .from(SIGNED_CERTIFICATE_BUCKET)
    .createSignedUrl(objectPath, expiresIn);
  if (error || !data?.signedUrl)
    throw (
      error ?? new Error("Não foi possível gerar o link seguro do certificado.")
    );
  return data.signedUrl;
}
