import { readFile } from "node:fs/promises";
import path from "node:path";
import { BRAND_ASSETS } from "@/lib/brand-assets";

function getApplicationBaseUrl() {
  const configuredUrl = process.env.NEXTAUTH_URL?.trim();
  if (configuredUrl) return configuredUrl;

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;

  return `http://127.0.0.1:${process.env.PORT || "3000"}`;
}

/**
 * Busca a logo principal no armazenamento persistente usado pelo webdev.
 * O fallback local preserva a emissão caso o proxy de assets esteja indisponível
 * durante o desenvolvimento ou em uma execução offline.
 */
export async function loadOfficialPrincipalLogoBytes() {
  try {
    const response = await fetch(
      new URL(BRAND_ASSETS.principal, getApplicationBaseUrl()),
      { cache: "no-store" }
    );
    if (response.ok) {
      return new Uint8Array(await response.arrayBuffer());
    }
  } catch {
    // Usa o fallback local abaixo.
  }

  return readFile(path.join(process.cwd(), "public", "logo-principal.png"));
}
