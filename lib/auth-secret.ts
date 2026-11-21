const DEVELOPMENT_SECRET = "fallback-secret-for-development";

/**
 * Retorna o mesmo segredo para o cookie JWT e para o middleware.
 * NEXTAUTH_SECRET é o valor preferencial; JWT_SECRET mantém compatibilidade
 * com o ambiente legado do projeto durante o desenvolvimento local.
 */
export function getAuthSecret() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET or JWT_SECRET must be configured in production.");
  }
  return DEVELOPMENT_SECRET;
}
