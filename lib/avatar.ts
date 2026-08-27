import { createClient } from "@supabase/supabase-js";

export const AVATAR_BUCKET = "profile-avatars";
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type AvatarMimeType = (typeof AVATAR_MIME_TYPES)[number];

export function validateAvatarInput(input: { mimeType: string; size: number }) {
  if (!AVATAR_MIME_TYPES.includes(input.mimeType as AvatarMimeType)) {
    return {
      valid: false as const,
      error: "Escolha uma imagem JPG, PNG ou WebP.",
    };
  }

  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > AVATAR_MAX_BYTES) {
    return {
      valid: false as const,
      error: "A foto deve ter no máximo 2 MB.",
    };
  }

  return { valid: true as const };
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Storage de avatares não está configurado no servidor.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function ensureAvatarBucket(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data: bucket } = await supabase.storage.getBucket(AVATAR_BUCKET);
  if (bucket) return;

  const { error } = await supabase.storage.createBucket(AVATAR_BUCKET, {
    public: true,
    allowedMimeTypes: [...AVATAR_MIME_TYPES],
    fileSizeLimit: `${AVATAR_MAX_BYTES}B`,
  });

  if (error && !/already exists|duplicate/i.test(error.message)) {
    throw error;
  }
}

export async function uploadAvatar(userId: number, file: File) {
  const validation = validateAvatarInput({ mimeType: file.type, size: file.size });
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const supabase = getSupabaseAdmin();
  await ensureAvatarBucket(supabase);

  const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const objectPath = `users/${userId}/${crypto.randomUUID()}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const storage = supabase.storage.from(AVATAR_BUCKET);

  const { error } = await storage.upload(objectPath, bytes, {
    contentType: file.type,
    // Cada upload recebe UUID próprio; a URL nunca é reutilizada ao trocar a foto.
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) throw error;

  const { data } = storage.getPublicUrl(objectPath);
  return { objectPath, url: data.publicUrl };
}
