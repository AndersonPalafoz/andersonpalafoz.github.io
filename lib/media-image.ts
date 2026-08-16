import { createClient } from "@supabase/supabase-js";

export const MEDIA_IMAGE_BUCKET = "educational-images";
export const MEDIA_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const MEDIA_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

type MediaImageMimeType = (typeof MEDIA_IMAGE_MIME_TYPES)[number];

export function validateMediaImage(input: { mimeType: string; size: number }) {
  if (!MEDIA_IMAGE_MIME_TYPES.includes(input.mimeType as MediaImageMimeType)) return { valid: false as const, error: "Escolha uma imagem JPG, PNG, WebP ou GIF." };
  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > MEDIA_IMAGE_MAX_BYTES) return { valid: false as const, error: "A imagem deve ter no máximo 10 MB." };
  return { valid: true as const };
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Storage de imagens educacionais não está configurado no servidor.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function ensureBucket(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data } = await supabase.storage.getBucket(MEDIA_IMAGE_BUCKET);
  if (data) return;
  const { error } = await supabase.storage.createBucket(MEDIA_IMAGE_BUCKET, {
    public: true,
    allowedMimeTypes: [...MEDIA_IMAGE_MIME_TYPES],
    fileSizeLimit: `${MEDIA_IMAGE_MAX_BYTES}B`,
  });
  if (error && !/already exists|duplicate/i.test(error.message)) throw error;
}

export async function uploadEducationalImage(ownerId: number, file: File, context: "course" | "material" | "assessment") {
  const validation = validateMediaImage({ mimeType: file.type, size: file.size });
  if (!validation.valid) throw new Error(validation.error);
  const supabase = getSupabaseAdmin();
  await ensureBucket(supabase);
  const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1] || "bin";
  const objectPath = `${context}/${ownerId}/${crypto.randomUUID()}.${extension}`;
  const storage = supabase.storage.from(MEDIA_IMAGE_BUCKET);
  const { error } = await storage.upload(objectPath, new Uint8Array(await file.arrayBuffer()), { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) throw error;
  const { data } = storage.getPublicUrl(objectPath);
  return { objectPath, url: data.publicUrl };
}
