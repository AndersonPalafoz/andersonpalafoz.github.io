const DEVELOPMENT_SECRET = "fallback-secret-for-development";

/**
 * Retorna o mesmo segredo para o cookie JWT e para o middleware.
 * NEXTAUTH_SECRET é o valor preferencial; JWT_SECRET mantém compatibilidade
 * com o ambiente legado do projeto durante o desenvolvimento local.
 */
export function getAuthSecret() {
  return process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || DEVELOPMENT_SECRET;
}
